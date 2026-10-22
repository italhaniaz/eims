import React, { useState, useMemo } from 'react'
import { 
  X, 
  DoorOpen, 
  Plus, 
  Trash2, 
  Building2, 
  Layers, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const RoomsRegisterModal = ({
  isOpen,
  onClose,
  classes = []
}) => {
  // Collect all distinct rooms assigned across sections
  const assignedRooms = useMemo(() => {
    const list = []
    classes.forEach(c => {
      const secs = Array.isArray(c.sections) ? c.sections : []
      secs.forEach(s => {
        if (s.roomNo) {
          list.push({
            roomNo: s.roomNo,
            className: c.name,
            sectionName: s.name,
            shift: s.shift || 'Morning',
            capacity: s.capacity || 40
          })
        }
      })
    })
    return list
  }, [classes])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Classrooms & Laboratories Space Register"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 text-xs">
        <p className="text-slate-500">
          Overview of physical classrooms, science laboratories, computer suites, and their shift allocations.
        </p>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px]">Allocated Spaces</span>
            <strong className="text-base font-bold text-slate-800">{assignedRooms.length} Rooms</strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px]">Morning Shift</span>
            <strong className="text-base font-bold text-emerald-700">
              {assignedRooms.filter(r => r.shift === 'Morning').length}
            </strong>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <span className="text-slate-400 block text-[11px]">Evening Shift</span>
            <strong className="text-base font-bold text-blue-700">
              {assignedRooms.filter(r => r.shift === 'Evening').length}
            </strong>
          </div>
        </div>

        {assignedRooms.length > 0 ? (
          <div className="border border-slate-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Room Identifier</th>
                  <th className="p-2.5">Class / Section Assigned</th>
                  <th className="p-2.5">Shift</th>
                  <th className="p-2.5 text-center">Desk Capacity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assignedRooms.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold font-mono text-slate-800">{r.roomNo}</td>
                    <td className="p-2.5 text-slate-700">{r.className} ({r.sectionName})</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded font-medium text-[10px] bg-slate-100 text-slate-700">
                        {r.shift}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono">{r.capacity} Seats</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 border border-dashed rounded-xl bg-slate-50">
            No rooms allocated yet. Configure rooms when adding sections.
          </div>
        )}

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
