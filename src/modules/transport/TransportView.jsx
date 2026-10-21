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
  X,
  FileCheck,
  AlertTriangle,
  Building,
  Award,
  Calendar
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const TransportView = () => {
  const { transport = [], students = [], institutes = [], addItem, updateItem, deleteItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBus, setEditingBus] = useState(null)
  const [selectedBusForAudit, setSelectedBusForAudit] = useState(null)

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
    fitnessCertExpiry: '2027-04-15',
    tokenTaxExpiry: '2027-06-30',
    routePermitNo: 'PTA-LHR-8492',
    driverLicenseNo: 'HTV-09182374',
    emergencyKitStatus: 'Certified & Sealed',
    passengers: []
  })

  const openAddModal = () => {
    setEditingBus(null)
    const vNo = `LEA-${Math.floor(1000 + Math.random() * 9000)}`
    setFormData({
      vehicleNo: vNo,
      busName: `Bus #${transport.length + 1} (Main Campus Route)`,
      driverName: '',
      driverPhone: '',
      capacity: 35,
      assignedStudents: 0,
      routePath: 'Campus -> Model Town -> Gulberg',
      status: 'Active',
      fitnessCertExpiry: '2027-04-15',
      tokenTaxExpiry: '2027-06-30',
      routePermitNo: `PTA-LHR-${vNo.replace('LEA-', '')}`,
      driverLicenseNo: `HTV-${Math.floor(10000000 + Math.random() * 90000000)}`,
      emergencyKitStatus: 'Certified & Sealed',
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
      fitnessCertExpiry: b.fitnessCertExpiry || '2027-04-15',
      tokenTaxExpiry: b.tokenTaxExpiry || '2027-06-30',
      routePermitNo: b.routePermitNo || `PTA-LHR-${b.vehicleNo?.replace('LEA-', '') || '8492'}`,
      driverLicenseNo: b.driverLicenseNo || 'HTV-09182374',
      emergencyKitStatus: b.emergencyKitStatus || 'Certified & Sealed',
      passengers: b.passengers || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.vehicleNo || !formData.driverName) return

    if (editingBus) {
      await updateItem('transport', editingBus.id, formData)
      if (logAuditEvent) {
        logAuditEvent(`Updated transport vehicle: ${formData.vehicleNo} (${formData.busName})`, 'Transport Manager', 'Success')
      }
      toast.success('Transport vehicle updated successfully!')
    } else {
      await addItem('transport', formData)
      if (logAuditEvent) {
        logAuditEvent(`Registered new transport vehicle: ${formData.vehicleNo}`, 'Transport Manager', 'Success')
      }
      toast.success('New transport vehicle registered!')
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transport vehicle record?')) {
      await deleteItem('transport', id)
      if (logAuditEvent) {
        logAuditEvent(`Removed transport vehicle ID: ${id}`, 'Transport Manager', 'Success')
      }
      toast.success('Vehicle record deleted.')
    }
  }

  // Open Passenger Roster Modal for a bus
  const openPassengerModal = (bus) => {
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

    setActiveBusForPassengers({
      ...bus,
      passengers
    })

    setPassengerForm({
      studentId: students[0]?.id || '',
      pickupStop: 'Main Boulevard Stop',
      emergencyContact: students[0]?.phone || '+92 300 1234567'
    })
  }

  // Assign new student passenger
  const handleAddPassenger = async (e) => {
    e.preventDefault()
    if (!passengerForm.studentId || !activeBusForPassengers) return

    const student = students.find(s => s.id === passengerForm.studentId)
    if (!student) return

    const currentPassengers = activeBusForPassengers.passengers || []
    if (currentPassengers.some(p => p.studentId === student.id)) {
      toast.warning(`${student.name} is already assigned to this bus route.`)
      return
    }

    const newPassenger = {
      studentId: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      className: student.className,
      pickupStop: passengerForm.pickupStop,
      emergencyContact: passengerForm.emergencyContact || student.phone || 'N/A'
    }

    const updatedPassengers = [...currentPassengers, newPassenger]

    await updateItem('transport', activeBusForPassengers.id, {
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    })

    setActiveBusForPassengers(prev => ({
      ...prev,
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    }))

    toast.success(`${student.name} allocated to ${activeBusForPassengers.busName}!`)
  }

  // Remove passenger from route
  const handleRemovePassenger = async (studentId, studentName) => {
    if (!activeBusForPassengers) return

    const updatedPassengers = (activeBusForPassengers.passengers || []).filter(p => p.studentId !== studentId)

    await updateItem('transport', activeBusForPassengers.id, {
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    })

    setActiveBusForPassengers(prev => ({
      ...prev,
      passengers: updatedPassengers,
      assignedStudents: updatedPassengers.length
    }))

    toast.info(`${studentName} removed from route.`)
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
            Manage school vans, bus routes, driver contacts, vehicle fitness audits, and printable Digital Bus Passes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all cursor-pointer"
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
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <span className="text-slate-400">PTA Fitness Validity:</span>
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> Valid ({b.fitnessCertExpiry || '2027-04-15'})
                      </span>
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openPassengerModal(b)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Roster ({passengersCount})</span>
                    </button>

                    <button
                      onClick={() => setSelectedBusForAudit(b)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Print Vehicle Safety & Compliance Certificate"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded cursor-pointer" title="Edit Vehicle">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer" title="Delete Vehicle">
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
            className="mt-4 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer"
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
        maxWidth="max-w-xl"
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
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm font-mono uppercase"
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
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
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
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Driver Mobile Phone</label>
              <input
                type="text"
                placeholder="+92 301 5566778"
                value={formData.driverPhone}
                onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
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
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Operating Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Active">Active / On Duty</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Compliance & Regulatory Credentials */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Government Regulatory Compliance & Inspections
            </span>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fitness Certificate Expiry</label>
                <input
                  type="date"
                  value={formData.fitnessCertExpiry}
                  onChange={(e) => setFormData({ ...formData, fitnessCertExpiry: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Token Tax Paid Validity</label>
                <input
                  type="date"
                  value={formData.tokenTaxExpiry}
                  onChange={(e) => setFormData({ ...formData, tokenTaxExpiry: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Route Permit Number</label>
                <input
                  type="text"
                  value={formData.routePermitNo}
                  onChange={(e) => setFormData({ ...formData, routePermitNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Driver Commercial License (HTV)</label>
                <input
                  type="text"
                  value={formData.driverLicenseNo}
                  onChange={(e) => setFormData({ ...formData, driverLicenseNo: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Route Path & Stops</label>
            <input
              type="text"
              placeholder="e.g. Main Campus -> Gulberg III -> Model Town Block C"
              value={formData.routePath}
              onChange={(e) => setFormData({ ...formData, routePath: e.target.value })}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">Cancel</button>
            <button type="submit" className="px-5 py-2 text-xs text-slate-950 font-bold bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm cursor-pointer">Save Vehicle</button>
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
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emergency Contact</label>
                  <input
                    type="text"
                    placeholder="+92 300 1234567"
                    value={passengerForm.emergencyContact}
                    onChange={(e) => setPassengerForm({ ...passengerForm, emergencyContact: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Allocate Student Seat</span>
                </button>
              </div>
            </form>

            {/* Current Passengers Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enrolled Passengers Roster ({(activeBusForPassengers.passengers || []).length})
                </h4>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                    <tr>
                      <th className="p-2.5">Student</th>
                      <th className="p-2.5">Class</th>
                      <th className="p-2.5">Pickup Stop</th>
                      <th className="p-2.5">Emergency No</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(activeBusForPassengers.passengers || []).map((p, idx) => (
                      <tr key={p.studentId || idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-800">{p.name}</td>
                        <td className="p-2.5 text-slate-500">{p.className}</td>
                        <td className="p-2.5 text-slate-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            {p.pickupStop}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">{p.emergencyContact}</td>
                        <td className="p-2.5 text-right space-x-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedStudentForPass({ passenger: p, bus: activeBusForPassengers })}
                            className="px-2 py-1 text-[11px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-900 rounded inline-flex items-center gap-1 cursor-pointer"
                            title="Generate & Print Bus Pass"
                          >
                            <QrCode className="w-3 h-3" />
                            <span>Pass</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePassenger(p.studentId, p.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                            title="Remove from Route"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveBusForPassengers(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official Fleet Regulatory Audit & Safety Certificate Modal */}
      {selectedBusForAudit && (
        <Modal
          isOpen={Boolean(selectedBusForAudit)}
          onClose={() => setSelectedBusForAudit(null)}
          title="Punjab Transport Authority (PTA) Vehicle Fitness & Safety Certificate"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-8 bg-white border-2 border-slate-900 rounded-xl space-y-5 text-slate-900 font-sans print:border-black print:p-8">
              {/* Official Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center mb-1">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  GOVERNMENT OF THE PUNJAB • TRANSPORT WING
                </h3>
                <p className="text-xs uppercase tracking-widest text-slate-600 font-bold">
                  SCHOOL VEHICLE STATUTORY SAFETY & FITNESS INSPECTION CERTIFICATE
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Under Motor Vehicles Ordinance 1965 & Punjab Educational Institutions Transport Guidelines
                </p>
              </div>

              {/* Vehicle & Institution Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration / Plate No</span>
                  <strong className="text-base font-black font-mono text-slate-900">{selectedBusForAudit.vehicleNo}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Route & Bus Identifier</span>
                  <strong className="text-slate-900">{selectedBusForAudit.busName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Commercial Driver</span>
                  <strong className="text-slate-800">{selectedBusForAudit.driverName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver License No (HTV)</span>
                  <strong className="font-mono text-slate-800">{selectedBusForAudit.driverLicenseNo || 'HTV-09182374'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Seating Capacity</span>
                  <strong className="text-slate-800">{selectedBusForAudit.capacity} Registered Passenger Seats</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Route Permit Clearance</span>
                  <strong className="font-mono text-indigo-700">{selectedBusForAudit.routePermitNo || 'PTA-LHR-8492'}</strong>
                </div>
              </div>

              {/* Safety Checklist Inspection Grid */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 block">
                  Mechanical, Safety & Structural Inspection Parameters
                </span>
                <table className="w-full text-left text-xs border border-slate-200">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-2">Inspection Item</th>
                      <th className="p-2">Regulatory Standard</th>
                      <th className="p-2">Validity Date</th>
                      <th className="p-2 text-right">MVE Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    <tr>
                      <td className="p-2 font-bold">Vehicle Fitness Certificate</td>
                      <td className="p-2 text-slate-500">MVE Technical Standards</td>
                      <td className="p-2 font-mono">{selectedBusForAudit.fitnessCertExpiry || '2027-04-15'}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">✓ PASSED / CERTIFIED</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold">Motor Vehicle Token Tax</td>
                      <td className="p-2 text-slate-500">Excise & Taxation Punjab</td>
                      <td className="p-2 font-mono">{selectedBusForAudit.tokenTaxExpiry || '2027-06-30'}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">✓ PAID IN FULL</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold">Emergency First Aid Kit & Extinguisher</td>
                      <td className="p-2 text-slate-500">Civil Defence & Safety Audit</td>
                      <td className="p-2 font-mono">Quarterly Inspection</td>
                      <td className="p-2 text-right font-bold text-emerald-700">✓ SEALED & OPERATIONAL</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold">Speed Governor & Emergency Exit</td>
                      <td className="p-2 text-slate-500">Max 50 km/h Campus Lock</td>
                      <td className="p-2 font-mono">Calibrated</td>
                      <td className="p-2 text-right font-bold text-emerald-700">✓ COMPLIANT</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signatures */}
              <div className="flex justify-between items-end pt-6 text-xs text-slate-700 border-t border-slate-200">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="font-bold">Transport Fleet Officer</span>
                  <span className="block text-[10px] text-slate-400">Campus Logistics Wing</span>
                </div>

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center text-[9px] text-slate-400 font-bold uppercase text-center">
                    MVE VERIFIED
                  </div>
                </div>

                <div className="text-center">
                  <div className="w-36 border-b-2 border-slate-900 mb-1"></div>
                  <span className="font-black text-slate-900">Motor Vehicle Examiner (MVE)</span>
                  <span className="block text-[10px] text-slate-500">Authority Approval Stamp</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedBusForAudit(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Compliance Certificate (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Digital Bus Pass Modal */}
      {selectedStudentForPass && (
        <Modal
          isOpen={Boolean(selectedStudentForPass)}
          onClose={() => setSelectedStudentForPass(null)}
          title="Printable Student Digital Bus Pass"
        >
          <div className="space-y-4">
            <div className="max-w-sm mx-auto p-5 bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-400 border-2 border-slate-900 rounded-2xl shadow-xl text-slate-950 font-sans print:shadow-none print:border-black">
              {/* Pass Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 text-amber-400 flex items-center justify-center font-black">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">OFFICIAL STUDENT BUS PASS</h4>
                    <span className="text-[10px] font-semibold text-slate-800">ACADEMIC SESSION 2026</span>
                  </div>
                </div>
                <QrCode className="w-9 h-9 text-slate-950 shrink-0" />
              </div>

              {/* Student Details */}
              <div className="mt-3.5 bg-white/95 rounded-xl p-3 border border-slate-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold block">Student Full Name</span>
                    <strong className="text-sm font-black text-slate-900">{selectedStudentForPass.passenger.name}</strong>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-950 px-2 py-0.5 rounded border border-amber-300">
                    {selectedStudentForPass.passenger.rollNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Grade & Class</span>
                    <strong className="text-slate-800">{selectedStudentForPass.passenger.className}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Vehicle Plate No</span>
                    <strong className="font-mono text-slate-900 font-bold">{selectedStudentForPass.bus.vehicleNo}</strong>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 space-y-1 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Designated Bus Route</span>
                    <strong className="text-slate-800 text-[11px] block truncate">{selectedStudentForPass.bus.busName}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Pickup / Drop Stop</span>
                    <strong className="text-slate-900 flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>{selectedStudentForPass.passenger.pickupStop}</span>
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Driver & Emergency Phone</span>
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
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