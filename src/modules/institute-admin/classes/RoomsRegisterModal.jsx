import React, { useState, useMemo } from 'react'
import { 
  X, 
  DoorOpen, 
  Plus, 
  Trash2, 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { getCampusRooms } from '../../../constants/campusRooms'

export const RoomsRegisterModal = ({
  isOpen,
  onClose,
  classes = []
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFloor, setSelectedFloor] = useState('all')

  const campusRooms = useMemo(() => getCampusRooms(), [])

  // Map room usage across classes: roomName -> { morning: { className, sectionName }, evening: { className, sectionName } }
  const roomOccupancyMap = useMemo(() => {
    const map = new Map()
    classes.forEach(c => {
      const secs = Array.isArray(c.sections) ? c.sections : []
      secs.forEach(s => {
        if (s.roomNo) {
          const key = s.roomNo.trim().toLowerCase()
          const current = map.get(key) || { morning: null, evening: null }
          const shiftKey = (s.shift || 'Morning').toLowerCase().includes('even') ? 'evening' : 'morning'
          current[shiftKey] = {
            className: c.name,
            sectionName: s.name,
            capacity: s.capacity || 40
          }
          map.set(key, current)
        }
      })
    })
    return map
  }, [classes])

  // Distinct floors
  const floors = useMemo(() => {
    const set = new Set(campusRooms.map(r => r.floor).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [campusRooms])

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return campusRooms.filter(r => {
      if (selectedFloor !== 'all' && r.floor !== selectedFloor) return false
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const matchName = r.name.toLowerCase().includes(term)
        const matchType = (r.type || '').toLowerCase().includes(term)
        const matchFloor = (r.floor || '').toLowerCase().includes(term)
        if (!matchName && !matchType && !matchFloor) return false
      }
      return true
    })
  }, [campusRooms, selectedFloor, searchTerm])

  // Metrics
  const totalRooms = campusRooms.length
  let morningOccupied = 0
  let eveningOccupied = 0
  campusRooms.forEach(r => {
    const occ = roomOccupancyMap.get(r.name.trim().toLowerCase())
    if (occ?.morning) morningOccupied++
    if (occ?.evening) eveningOccupied++
  })

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Classrooms & Laboratories Campus Space Register"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">
          Campus physical space catalog showing classroom wings, science labs, computer suites, and real-time shift occupancy.
        </p>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px] font-semibold">Total Campus Spaces</span>
            <strong className="text-base font-bold text-slate-800">{totalRooms} Spaces</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px] font-semibold">Morning Occupancy</span>
            <strong className="text-base font-bold text-emerald-700">
              {morningOccupied} / {totalRooms} ({totalRooms > 0 ? Math.round((morningOccupied / totalRooms) * 100) : 0}%)
            </strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px] font-semibold">Evening Occupancy</span>
            <strong className="text-base font-bold text-blue-700">
              {eveningOccupied} / {totalRooms} ({totalRooms > 0 ? Math.round((eveningOccupied / totalRooms) * 100) : 0}%)
            </strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px] font-semibold">Vacant Morning Spaces</span>
            <strong className="text-base font-bold text-slate-700">
              {totalRooms - morningOccupied} Available
            </strong>
          </div>
        </div>

        {/* Search & Floor Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search space or lab..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            <span className="text-[11px] text-slate-400 font-bold uppercase shrink-0">Floor:</span>
            {floors.map(fl => (
              <button
                key={fl}
                type="button"
                onClick={() => setSelectedFloor(fl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedFloor === fl 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {fl === 'all' ? 'All Floors' : fl}
              </button>
            ))}
          </div>
        </div>

        {/* Rooms Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10">
              <tr>
                <th className="p-2.5">Room & Space Type</th>
                <th className="p-2.5">Floor</th>
                <th className="p-2.5 text-center">Max Capacity</th>
                <th className="p-2.5">Morning Shift Allocation</th>
                <th className="p-2.5">Evening Shift Allocation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.map((room) => {
                const occ = roomOccupancyMap.get(room.name.trim().toLowerCase())
                const morningOcc = occ?.morning
                const eveningOcc = occ?.evening

                return (
                  <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <DoorOpen className="w-4 h-4 text-slate-400 shrink-0" />
                        <div>
                          <strong className="text-slate-900 font-mono block">{room.name}</strong>
                          <span className="text-[10px] text-slate-500">{room.type}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-2.5 text-slate-600">{room.floor}</td>
                    <td className="p-2.5 text-center font-mono font-bold text-slate-700">
                      {room.capacity} Desks
                    </td>
                    <td className="p-2.5">
                      {morningOcc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{morningOcc.className} ({morningOcc.sectionName})</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Vacant
                        </span>
                      )}
                    </td>
                    <td className="p-2.5">
                      {eveningOcc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[11px] bg-blue-50 text-blue-800 border border-blue-200">
                          <CheckCircle2 className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{eveningOcc.className} ({eveningOcc.sectionName})</span>
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                          Vacant
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default RoomsRegisterModal
