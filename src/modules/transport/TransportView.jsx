import React, { useState } from 'react'
import { 
  Bus, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MapPin, 
  Phone, 
  Users, 
  CheckCircle2, 
  Printer, 
  UserCheck, 
  UserMinus, 
  QrCode, 
  ShieldCheck, 
  School,
  X
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const TransportView = () => {
  const { transport = [], students = [], institutes = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBus, setEditingBus] = useState(null)

  // Passenger management modal state
  const [activeBusForPassengers, setActiveBusForPassengers] = useState(null)
  const [selectedStudentForPass, setSelectedStudentForPass] = useState(null)

  // New passenger assignment form state
  const [passengerForm, setPassengerForm] = useState({
    studentId: '',
    pickupStop: 'Model Town C Block',
    emergencyContact: '+92 300 1234567'
  })

  const [formData, setFormData] = useState({
    vehicleNo: '',
    busName: '',
    driverName: '',
    driverPhone: '',
    capacity: 35,
    assignedStudents: 0,
    routePath: '',
    status: 'Active',
    passengers: []
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
      status: 'Active',
      passengers: []
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
      assignedStudents: b.assignedStudents || (b.passengers ? b.passengers.length : 0),
      routePath: b.routePath || '',
      status: b.status || 'Active',
      passengers: b.passengers || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.vehicleNo || !formData.driverName) return

    if (editingBus) {
      await updateItem('transport', editingBus.id, formData)
      toast.success('Transport vehicle updated successfully!')
    } else {
      await addItem('transport', formData)
      toast.success('New transport vehicle registered!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transport vehicle record?')) {
      await deleteItem('transport', id)
      toast.success('Vehicle record deleted.')
    }
  }

  // Open Passenger Roster Modal for a bus
  const openPassengerModal = (bus) => {
    // If bus has no passengers array yet, initialize with demo passengers from existing students
    let passengers = bus.passengers || []
    if (passengers.length === 0 && students.length > 0) {
      passengers = students.slice(0, Math.min(2, students.length)).map(std => ({
        studentId: std.id,
        name: std.name,
        rollNumber: std.rollNumber,
        className: std.className,
        pickupStop: 'Central Chowk Stop #2',
        emergencyContact: std.phone || '+92 300 9876543'
      }))
    }

    const updatedBus = { ...bus, passengers, assignedStudents: passengers.length }
    setActiveBusForPassengers(updatedBus)
    setPassengerForm({
      studentId: students[0]?.id || '',
      pickupStop: 'Model Town C Block',
      emergencyContact: students[0]?.phone || '+92 300 1234567'
    })
  }

  // Add passenger to bus
  const handleAddPassenger = async (e) => {
    e.preventDefault()
    if (!activeBusForPassengers) return

    const student = students.find(s => s.id === passengerForm.studentId)
    if (!student) {
      toast.error('Please select an enrolled student.')
      return
    }

    const currentPassengers = activeBusForPassengers.passengers || []
    if (currentPassengers.some(p => p.studentId === student.id)) {
      toast.warning('This student is already assigned to this vehicle route.')
      return
    }

    if (currentPassengers.length >= (activeBusForPassengers.capacity || 35)) {
      toast.error('Vehicle seating capacity reached! Cannot assign more passengers.')
      return
    }

    const newPassenger = {
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      pickupStop: passengerForm.pickupStop,
      emergencyContact: passengerForm.emergencyContact || student.phone || '—'
    }

    const updatedPassengers = [...currentPassengers, newPassenger]
    const updatedBus = {
      ...activeBusForPassengers,
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    }

    await updateItem('transport', activeBusForPassengers.id, updatedBus)
    setActiveBusForPassengers(updatedBus)
    toast.success(`${student.name} assigned to ${activeBusForPassengers.vehicleNo} route!`)
  }

  // Remove passenger from bus
  const handleRemovePassenger = async (studentId) => {
    if (!activeBusForPassengers) return

    const updatedPassengers = (activeBusForPassengers.passengers || []).filter(p => p.studentId !== studentId)
    const updatedBus = {
      ...activeBusForPassengers,
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    }

    await updateItem('transport', activeBusForPassengers.id, updatedBus)
    setActiveBusForPassengers(updatedBus)
    toast.info('Student unassigned from transport route.')
  }

  // Generate Bus Pass View
  const handleOpenBusPass = (passenger) => {
    setSelectedStudentForPass({
      passenger,
      bus: activeBusForPassengers
    })
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
          <p className="text-xs text-slate-500 mt-1">
            Manage school vans, bus routes, driver contacts, student seat rosters, and printable Digital Bus Passes
          </p>
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
          {filtered.map(b => {
            const passengersCount = (b.passengers && b.passengers.length) || b.assignedStudents || 0
            const capacity = b.capacity || 35
            const loadPercent = Math.min(100, Math.round((passengersCount / capacity) * 100))

            return (
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
                      <span className="font-semibold text-slate-700">{passengersCount} / {capacity} Seats</span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${loadPercent >= 90 ? 'bg-rose-500' : 'bg-amber-500'}`} 
                      style={{ width: `${loadPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openPassengerModal(b)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Passengers & Passes ({passengersCount})</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded" title="Edit Vehicle">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded" title="Delete Vehicle">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
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

      {/* Add / Edit Vehicle Modal */}
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
                min="10"
                max="80"
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

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs text-slate-950 font-bold bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm">Save Vehicle</button>
          </div>
        </form>
      </Modal>

      {/* Passengers & Bus Pass Allocation Modal */}
      {activeBusForPassengers && (
        <Modal
          isOpen={Boolean(activeBusForPassengers)}
          onClose={() => setActiveBusForPassengers(null)}
          title={`Route Passengers: ${activeBusForPassengers.vehicleNo} - ${activeBusForPassengers.busName}`}
        >
          <div className="space-y-5">
            {/* Bus Summary Banner */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-amber-900">
              <div>
                <span className="font-bold">{activeBusForPassengers.busName}</span>
                <span className="block text-[11px] text-amber-700 mt-0.5">
                  Driver: {activeBusForPassengers.driverName} • Phone: {activeBusForPassengers.driverPhone || 'N/A'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-950">
                  {(activeBusForPassengers.passengers || []).length} / {activeBusForPassengers.capacity || 35} Seats
                </span>
                <span className="block text-[10px] text-amber-700">Seating Capacity</span>
              </div>
            </div>

            {/* Section: Assign New Student */}
            <form onSubmit={handleAddPassenger} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Assign Enrolled Student to Route
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Select Student *</label>
                  <select
                    value={passengerForm.studentId}
                    onChange={(e) => {
                      const std = students.find(s => s.id === e.target.value)
                      setPassengerForm({
                        ...passengerForm,
                        studentId: e.target.value,
                        emergencyContact: std?.phone || passengerForm.emergencyContact
                      })
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Pickup / Drop Stop</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Model Town C Block"
                    value={passengerForm.pickupStop}
                    onChange={(e) => setPassengerForm({ ...passengerForm, pickupStop: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emergency Parent Contact</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={passengerForm.emergencyContact}
                    onChange={(e) => setPassengerForm({ ...passengerForm, emergencyContact: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-xs flex items-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign to Bus</span>
                </button>
              </div>
            </form>

            {/* Section: Passengers Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Assigned Passenger Roster ({ (activeBusForPassengers.passengers || []).length })
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-semibold">
                    <tr>
                      <th className="p-2.5">Roll No</th>
                      <th className="p-2.5">Student Name</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Pickup Stop</th>
                      <th className="p-2.5">Emergency Contact</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {(activeBusForPassengers.passengers || []).length > 0 ? (
                      activeBusForPassengers.passengers.map(p => (
                        <tr key={p.studentId} className="hover:bg-slate-50">
                          <td className="p-2.5 font-mono font-bold text-slate-700">{p.rollNumber}</td>
                          <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                          <td className="p-2.5 text-slate-600">{p.className || 'General'}</td>
                          <td className="p-2.5 text-slate-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{p.pickupStop}</span>
                          </td>
                          <td className="p-2.5 font-mono text-slate-600">{p.emergencyContact}</td>
                          <td className="p-2.5 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => handleOpenBusPass(p)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded font-bold text-[10px] inline-flex items-center gap-1"
                              title="Generate Official Digital Bus Pass"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Bus Pass</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePassenger(p.studentId)}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded text-[10px] inline-flex items-center"
                              title="Unassign Student"
                            >
                              <UserMinus className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          No students assigned to this route yet. Select a student above and assign.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveBusForPassengers(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Digital Bus Pass Modal (Print-Ready) */}
      {selectedStudentForPass && (
        <Modal
          isOpen={Boolean(selectedStudentForPass)}
          onClose={() => setSelectedStudentForPass(null)}
          title="Official Student Transport Pass / Bus Badge"
        >
          <div className="space-y-4">
            <div 
              id="printable-bus-pass"
              className="p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-slate-950 rounded-2xl shadow-xl relative overflow-hidden border-2 border-amber-400 print:text-black print:bg-white print:border-black"
            >
              {/* Background watermark badge */}
              <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                <Bus className="w-48 h-48 text-black" />
              </div>

              {/* Pass Header */}
              <div className="bg-slate-950/90 text-white p-3 rounded-xl flex items-center justify-between mb-4 border border-amber-400/30">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                      OFFICIAL STUDENT TRANSPORT PASS
                    </h4>
                    <p className="text-[10px] text-slate-300">
                      {institutes[0]?.name || 'Educational Institute Management System'}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold px-2 py-0.5 bg-amber-400 text-slate-950 rounded">
                  2026-2027
                </span>
              </div>

              {/* Student Details Card */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-slate-900 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Student Name</span>
                    <h3 className="text-base font-black text-slate-900 leading-tight">
                      {selectedStudentForPass.passenger.name}
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Roll No: {selectedStudentForPass.passenger.rollNumber} • Class: {selectedStudentForPass.passenger.className || '10th'}
                    </span>
                  </div>

                  <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-amber-400 flex flex-col items-center justify-center text-slate-400 text-[9px] font-bold">
                    <QrCode className="w-7 h-7 text-slate-700" />
                    <span>VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vehicle Reg. No</span>
                    <strong className="font-mono text-slate-800">{selectedStudentForPass.bus.vehicleNo}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Route Name</span>
                    <strong className="text-slate-800 truncate block">{selectedStudentForPass.bus.busName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Designated Stop</span>
                    <strong className="text-amber-800 flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{selectedStudentForPass.passenger.pickupStop}</span>
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Driver & Emergency Phone</span>
                    <strong className="font-mono text-slate-800 text-[11px]">
                      {selectedStudentForPass.bus.driverName} ({selectedStudentForPass.bus.driverPhone || '—'})
                    </strong>
                  </div>
                </div>
              </div>

              {/* Pass Footer */}
              <div className="mt-3 flex items-center justify-between text-[10px] text-slate-900 font-semibold px-1">
                <span>Pass Status: <strong className="text-emerald-950 font-bold">ACTIVE & VALIDATED</strong></span>
                <span>Security Officer / Transport Incharge Seal</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedStudentForPass(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Bus Pass (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default TransportView
