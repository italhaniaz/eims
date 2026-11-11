import React, { useState, useMemo, useEffect } from 'react'
import {
  Building2,
  BedDouble,
  Plus,
  Search,
  Trash2,
  UserPlus,
  UserMinus,
  Phone,
  CheckCircle2,
  Users,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const getStorageKey = (instId) => `eims_school_hostels_${instId || 'default'}`

const loadHostelsState = (instId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(instId))
    if (raw) {
      const parsed = JSON.parse(raw)
      return {
        rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
        allocations: Array.isArray(parsed.allocations) ? parsed.allocations : []
      }
    }
  } catch (_) {}
  return { rooms: [], allocations: [] }
}

export const HostelsView = ({ currentInstitute }) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'default'

  const [hostelState, setHostelState] = useState(() => loadHostelsState(instId))
  const [activeTab, setActiveTab] = useState('rooms')
  const [searchQuery, setSearchQuery] = useState('')
  const [wingFilter, setWingFilter] = useState('All')

  const [showRoomModal, setShowRoomModal] = useState(false)
  const [roomForm, setRoomForm] = useState({
    hostelName: 'Main Boys Hostel',
    roomNumber: '',
    floor: 'Ground Floor',
    capacity: 4,
    monthlyFee: 6000,
    wardenName: '',
    wardenPhone: ''
  })

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignForm, setAssignForm] = useState({
    roomId: '',
    studentId: '',
    guardianPhone: '',
    checkInDate: new Date().toISOString().split('T')[0],
    messPlan: 'Standard 3 Meals'
  })

  useEffect(() => {
    setHostelState(loadHostelsState(instId))
  }, [instId])

  const persistState = (next) => {
    setHostelState(next)
    try {
      localStorage.setItem(getStorageKey(instId), JSON.stringify(next))
    } catch (_) {}
  }

  const instituteStudents = useMemo(
    () => students.filter(s => !s.instituteId || s.instituteId === instId),
    [students, instId]
  )

  const allocatedStudentIds = useMemo(
    () => new Set(hostelState.allocations.filter(a => a.status === 'Active').map(a => a.studentId)),
    [hostelState.allocations]
  )

  const availableStudents = useMemo(
    () => instituteStudents.filter(s => !allocatedStudentIds.has(s.id)),
    [instituteStudents, allocatedStudentIds]
  )

  const roomOccupancyMap = useMemo(() => {
    const map = {}
    hostelState.allocations.forEach(a => {
      if (a.status === 'Active') {
        map[a.roomId] = (map[a.roomId] || 0) + 1
      }
    })
    return map
  }, [hostelState.allocations])

  const stats = useMemo(() => {
    const totalRooms = hostelState.rooms.length
    const totalBeds = hostelState.rooms.reduce((sum, r) => sum + Number(r.capacity || 0), 0)
    const occupiedBeds = hostelState.allocations.filter(a => a.status === 'Active').length
    const vacantBeds = Math.max(0, totalBeds - occupiedBeds)
    return { totalRooms, totalBeds, occupiedBeds, vacantBeds }
  }, [hostelState])

  const hostelWings = useMemo(() => {
    const names = Array.from(new Set(hostelState.rooms.map(r => r.hostelName).filter(Boolean)))
    return ['All', ...names]
  }, [hostelState.rooms])

  const filteredRooms = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return hostelState.rooms.filter(r => {
      if (wingFilter !== 'All' && r.hostelName !== wingFilter) return false
      if (!q) return true
      return (
        r.roomNumber.toLowerCase().includes(q) ||
        r.hostelName.toLowerCase().includes(q) ||
        (r.wardenName || '').toLowerCase().includes(q)
      )
    })
  }, [hostelState.rooms, wingFilter, searchQuery])

  const filteredAllocations = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return hostelState.allocations.filter(a => {
      if (!q) return true
      return (
        (a.studentName || '').toLowerCase().includes(q) ||
        (a.roomNumber || '').toLowerCase().includes(q) ||
        (a.hostelName || '').toLowerCase().includes(q)
      )
    })
  }, [hostelState.allocations, searchQuery])

  const handleCreateRoom = (e) => {
    e.preventDefault()
    if (!roomForm.roomNumber.trim() || !roomForm.hostelName.trim()) {
      toast.error('Please enter hostel wing name and room number.')
      return
    }
    const newRoom = {
      id: `hroom-${Date.now()}`,
      hostelName: roomForm.hostelName.trim(),
      roomNumber: roomForm.roomNumber.trim(),
      floor: roomForm.floor.trim() || 'Ground Floor',
      capacity: Math.max(1, Number(roomForm.capacity) || 1),
      monthlyFee: Math.max(0, Number(roomForm.monthlyFee) || 0),
      wardenName: roomForm.wardenName.trim(),
      wardenPhone: roomForm.wardenPhone.trim(),
      createdAt: new Date().toISOString()
    }
    persistState({ ...hostelState, rooms: [newRoom, ...hostelState.rooms] })
    toast.success(`Hostel room ${newRoom.roomNumber} created successfully.`)
    setRoomForm({
      hostelName: newRoom.hostelName,
      roomNumber: '',
      floor: 'Ground Floor',
      capacity: 4,
      monthlyFee: 6000,
      wardenName: '',
      wardenPhone: ''
    })
    setShowRoomModal(false)
  }

  const handleDeleteRoom = (roomId) => {
    const hasActive = (roomOccupancyMap[roomId] || 0) > 0
    if (hasActive) {
      toast.error('Check out active residents from this room before deleting it.')
      return
    }
    persistState({
      ...hostelState,
      rooms: hostelState.rooms.filter(r => r.id !== roomId)
    })
    toast.success('Hostel room removed.')
  }

  const handleAssignStudent = (e) => {
    e.preventDefault()
    const room = hostelState.rooms.find(r => r.id === assignForm.roomId)
    const student = instituteStudents.find(s => s.id === assignForm.studentId)
    if (!room || !student) {
      toast.error('Please select both a valid room and an enrolled student.')
      return
    }
    const occupied = roomOccupancyMap[room.id] || 0
    if (occupied >= Number(room.capacity || 1)) {
      toast.error(`Room ${room.roomNumber} is already at full capacity.`)
      return
    }
    const allocation = {
      id: `halloc-${Date.now()}`,
      roomId: room.id,
      roomNumber: room.roomNumber,
      hostelName: room.hostelName,
      monthlyFee: room.monthlyFee,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber || student.id,
      className: student.className || 'Enrolled',
      guardianPhone: assignForm.guardianPhone.trim() || student.phone || 'Not provided',
      messPlan: assignForm.messPlan,
      checkInDate: assignForm.checkInDate,
      status: 'Active'
    }
    persistState({
      ...hostelState,
      allocations: [allocation, ...hostelState.allocations]
    })
    toast.success(`${student.name} assigned to ${room.hostelName} • Room ${room.roomNumber}.`)
    setAssignForm({
      roomId: '',
      studentId: '',
      guardianPhone: '',
      checkInDate: new Date().toISOString().split('T')[0],
      messPlan: 'Standard 3 Meals'
    })
    setShowAssignModal(false)
  }

  const handleCheckoutResident = (allocId) => {
    persistState({
      ...hostelState,
      allocations: hostelState.allocations.map(a =>
        a.id === allocId ? { ...a, status: 'Checked Out', checkOutDate: new Date().toISOString().split('T')[0] } : a
      )
    })
    toast.success('Resident checked out and bed released.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-600" />
            <span>Hostels &amp; Boarding Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Manage hostel rooms, bed capacity, warden contacts, and student boarding allocations for {currentInstitute?.name || 'this school'}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRoomModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hostel Room</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAssignModal(true)}
            disabled={hostelState.rooms.length === 0}
            className="px-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>Assign Resident</span>
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rooms', value: stats.totalRooms, icon: Building2, tone: 'text-emerald-600 bg-emerald-50' },
          { label: 'Total Bed Capacity', value: stats.totalBeds, icon: BedDouble, tone: 'text-indigo-600 bg-indigo-50' },
          { label: 'Active Residents', value: stats.occupiedBeds, icon: Users, tone: 'text-amber-600 bg-amber-50' },
          { label: 'Available Beds', value: stats.vacantBeds, icon: CheckCircle2, tone: 'text-teal-600 bg-teal-50' }
        ].map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--text-muted)]">{card.label}</span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text)] mt-2">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Filter & Tabs */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'rooms', label: `Rooms (${hostelState.rooms.length})` },
            { id: 'residents', label: `Residents (${hostelState.allocations.filter(a => a.status === 'Active').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-[var(--text-muted)] hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'rooms' && hostelWings.length > 1 && (
            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs font-medium text-[var(--text)]"
            >
              {hostelWings.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room, hostel, student..."
              className="pl-9 pr-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>
      </div>

      {/* Rooms View */}
      {activeTab === 'rooms' && (
        filteredRooms.length === 0 ? (
          <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
            <BedDouble className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[var(--text)]">No Hostel Rooms Added Yet</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
              Create your hostel wings and rooms to start assigning student beds, tracking wardens, and managing monthly boarding fees.
            </p>
            <button
              type="button"
              onClick={() => setShowRoomModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              + Create First Hostel Room
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map(room => {
              const occupied = roomOccupancyMap[room.id] || 0
              const capacity = Number(room.capacity || 1)
              const pct = Math.min(100, Math.round((occupied / capacity) * 100))
              return (
                <div key={room.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
                          {room.hostelName}
                        </span>
                        <h3 className="text-base font-bold text-[var(--text)] mt-0.5">
                          Room {room.roomNumber}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">{room.floor}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete room"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)]">Bed Occupancy</span>
                        <span className="font-semibold text-[var(--text)]">{occupied} / {capacity} Beds</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${occupied >= capacity ? 'bg-amber-500' : 'bg-emerald-600'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-muted)]">Monthly Fee</span>
                      <span className="font-bold text-[var(--text)]">PKR {Number(room.monthlyFee || 0).toLocaleString()}</span>
                    </div>
                    {room.wardenName && (
                      <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--text-muted)]">
                        <span>Warden: {room.wardenName}</span>
                        {room.wardenPhone && <span className="font-mono">{room.wardenPhone}</span>}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={occupied >= capacity}
                    onClick={() => {
                      setAssignForm(prev => ({ ...prev, roomId: room.id }))
                      setShowAssignModal(true)
                    }}
                    className="w-full py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {occupied >= capacity ? 'Room Full' : 'Assign Student Bed'}
                  </button>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Residents View */}
      {activeTab === 'residents' && (
        filteredAllocations.length === 0 ? (
          <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-[var(--text)]">No Resident Allocations Recorded</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Assign enrolled students to available hostel rooms to track boarding and mess plans.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-[var(--border)] text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Hostel &amp; Room</th>
                    <th className="px-4 py-3">Mess Plan</th>
                    <th className="px-4 py-3">Monthly Fee</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {filteredAllocations.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-[var(--text)]">{a.studentName}</div>
                        <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                          <span>{a.className}</span>
                          <span>•</span>
                          <Phone className="w-3 h-3" />
                          <span>{a.guardianPhone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[var(--text)]">Room {a.roomNumber}</div>
                        <div className="text-[11px] text-[var(--text-muted)]">{a.hostelName}</div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text)]">{a.messPlan}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--text)]">PKR {Number(a.monthlyFee || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          a.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {a.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {a.status === 'Active' && (
                          <button
                            type="button"
                            onClick={() => handleCheckoutResident(a.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                            <span>Check Out</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Create Room Modal */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">Add Hostel Room</h2>
              <button type="button" onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateRoom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Hostel / Wing Name *</label>
                <input
                  type="text"
                  required
                  value={roomForm.hostelName}
                  onChange={(e) => setRoomForm({ ...roomForm, hostelName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Room Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 104"
                    value={roomForm.roomNumber}
                    onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Floor</label>
                  <input
                    type="text"
                    value={roomForm.floor}
                    onChange={(e) => setRoomForm({ ...roomForm, floor: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Bed Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={roomForm.capacity}
                    onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Monthly Fee (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={roomForm.monthlyFee}
                    onChange={(e) => setRoomForm({ ...roomForm, monthlyFee: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Warden Name</label>
                  <input
                    type="text"
                    value={roomForm.wardenName}
                    onChange={(e) => setRoomForm({ ...roomForm, wardenName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Warden Phone</label>
                  <input
                    type="text"
                    value={roomForm.wardenPhone}
                    onChange={(e) => setRoomForm({ ...roomForm, wardenPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowRoomModal(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer">
                  Save Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Student Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">Assign Student Resident</h2>
              <button type="button" onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            {availableStudents.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] py-4">
                No unassigned students found in this school. Enroll students under <strong>Students Directory</strong> first.
              </div>
            ) : (
              <form onSubmit={handleAssignStudent} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Hostel Room *</label>
                  <select
                    required
                    value={assignForm.roomId}
                    onChange={(e) => setAssignForm({ ...assignForm, roomId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  >
                    <option value="">Select Room</option>
                    {hostelState.rooms.map(r => {
                      const occ = roomOccupancyMap[r.id] || 0
                      return (
                        <option key={r.id} value={r.id} disabled={occ >= Number(r.capacity)}>
                          {r.hostelName} — Room {r.roomNumber} ({occ}/{r.capacity} beds)
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Student *</label>
                  <select
                    required
                    value={assignForm.studentId}
                    onChange={(e) => setAssignForm({ ...assignForm, studentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  >
                    <option value="">Select Student</option>
                    {availableStudents.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.className || 'Student'})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">Mess Plan</label>
                    <select
                      value={assignForm.messPlan}
                      onChange={(e) => setAssignForm({ ...assignForm, messPlan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                    >
                      <option>Standard 3 Meals</option>
                      <option>Room Only (No Mess)</option>
                      <option>Special Diet Plan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1">Check-In Date</label>
                    <input
                      type="date"
                      value={assignForm.checkInDate}
                      onChange={(e) => setAssignForm({ ...assignForm, checkInDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Guardian Emergency Phone</label>
                  <input
                    type="text"
                    placeholder="0300-0000000"
                    value={assignForm.guardianPhone}
                    onChange={(e) => setAssignForm({ ...assignForm, guardianPhone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer">
                    Confirm Allocation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default HostelsView
