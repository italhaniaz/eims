import React, { useState } from 'react'
import { Clock, Plus, Search, Calendar, BookOpen, User, DoorOpen } from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const TimetableView = ({ currentInstitute }) => {
  const [selectedClass, setSelectedClass] = useState('10th Grade')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const periods = [
    { num: 'P1', time: '08:00 - 08:45 AM' },
    { num: 'P2', time: '08:45 - 09:30 AM' },
    { num: 'P3', time: '09:30 - 10:15 AM' },
    { num: 'BREAK', time: '10:15 - 10:45 AM', isBreak: true },
    { num: 'P4', time: '10:45 - 11:30 AM' },
    { num: 'P5', time: '11:30 - 12:15 PM' },
    { num: 'P6', time: '12:15 - 01:00 PM' }
  ]

  // Default sample routine
  const [schedule, setSchedule] = useState({
    'Monday-P1': { subject: 'Mathematics', teacher: 'Prof. Tariq', room: 'R-101' },
    'Monday-P2': { subject: 'Physics', teacher: 'Dr. Fatima', room: 'Lab 1' },
    'Monday-P3': { subject: 'English', teacher: 'Ms. Ayesha', room: 'R-101' },
    'Monday-P4': { subject: 'Chemistry', teacher: 'Dr. Rashid', room: 'Lab 2' },
    'Monday-P5': { subject: 'Computer Sc.', teacher: 'Engr. Imran', room: 'Comp Lab' },
    'Monday-P6': { subject: 'Pakistan Studies', teacher: 'Mr. Asif', room: 'R-101' },

    'Tuesday-P1': { subject: 'Physics', teacher: 'Dr. Fatima', room: 'Lab 1' },
    'Tuesday-P2': { subject: 'Mathematics', teacher: 'Prof. Tariq', room: 'R-101' },
    'Tuesday-P3': { subject: 'Chemistry', teacher: 'Dr. Rashid', room: 'Lab 2' },
    'Tuesday-P4': { subject: 'Computer Sc.', teacher: 'Engr. Imran', room: 'Comp Lab' },
    'Tuesday-P5': { subject: 'English', teacher: 'Ms. Ayesha', room: 'R-101' },
    'Tuesday-P6': { subject: 'Islamic Studies', teacher: 'Qari Sb', room: 'R-101' },

    'Wednesday-P1': { subject: 'Mathematics', teacher: 'Prof. Tariq', room: 'R-101' },
    'Wednesday-P2': { subject: 'Computer Sc.', teacher: 'Engr. Imran', room: 'Comp Lab' },
    'Wednesday-P3': { subject: 'English', teacher: 'Ms. Ayesha', room: 'R-101' },
    'Wednesday-P4': { subject: 'Physics Lab', teacher: 'Dr. Fatima', room: 'Physics Lab' },
    'Wednesday-P5': { subject: 'Chemistry', teacher: 'Dr. Rashid', room: 'Lab 2' },
    'Wednesday-P6': { subject: 'Library / Reading', teacher: 'Staff', room: 'Library' }
  })

  const [slotData, setSlotData] = useState({
    day: 'Monday',
    periodNum: 'P1',
    subject: '',
    teacher: '',
    room: 'Room 101'
  })

  const handleSaveSlot = (e) => {
    e.preventDefault()
    if (!slotData.subject || !slotData.teacher) return

    const key = `${slotData.day}-${slotData.periodNum}`
    setSchedule(prev => ({
      ...prev,
      [key]: {
        subject: slotData.subject,
        teacher: slotData.teacher,
        room: slotData.room
      }
    }))
    setIsModalOpen(false)
    setSlotData({ day: 'Monday', periodNum: 'P1', subject: '', teacher: '', room: 'Room 101' })
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Class Timetable & Period Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage weekly periods, teacher assignments, and classroom schedules</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 bg-white"
          >
            <option value="9th Grade">9th Grade (Matric)</option>
            <option value="10th Grade">10th Grade (Matric)</option>
            <option value="11th Grade (ICS)">11th Grade (ICS)</option>
            <option value="11th Grade (Pre-Med)">11th Grade (Pre-Med)</option>
            <option value="12th Grade">12th Grade</option>
          </select>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Period Slot</span>
          </button>
        </div>
      </div>

      {/* Routine Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-28">Weekday</th>
                {periods.map(p => (
                  <th key={p.num} className={`p-3 text-center border-l border-slate-200 ${p.isBreak ? 'bg-amber-50/60 text-amber-800' : ''}`}>
                    <span className="block font-bold">{p.num}</span>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">{p.time}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/60">
                  <td className="p-3.5 font-bold text-slate-800 bg-slate-50/30">{day}</td>
                  {periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.num} className="p-3 text-center bg-amber-50/40 border-l border-slate-100 font-bold text-[11px] text-amber-700">
                          Recess Break
                        </td>
                      )
                    }

                    const slotKey = `${day}-${p.num}`
                    const slot = schedule[slotKey]

                    return (
                      <td key={p.num} className="p-2 border-l border-slate-100 text-center">
                        {slot ? (
                          <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100/80 hover:bg-emerald-100/70 transition-colors">
                            <span className="font-bold text-slate-900 block leading-tight">{slot.subject}</span>
                            <span className="text-[10px] text-emerald-700 block mt-0.5">{slot.teacher}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{slot.room}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSlotData({ day, periodNum: p.num, subject: '', teacher: '', room: 'Room 101' })
                              setIsModalOpen(true)
                            }}
                            className="w-full py-4 text-[10px] text-slate-300 hover:text-emerald-600 hover:bg-slate-50 rounded border border-dashed border-transparent hover:border-emerald-200 transition-all"
                          >
                            + Slot
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal to assign or edit period */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Class Period Slot"
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Day of Week</label>
              <select
                value={slotData.day}
                onChange={(e) => setSlotData({ ...slotData, day: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {days.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Period</label>
              <select
                value={slotData.periodNum}
                onChange={(e) => setSlotData({ ...slotData, periodNum: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="P1">Period 1 (08:00 AM)</option>
                <option value="P2">Period 2 (08:45 AM)</option>
                <option value="P3">Period 3 (09:30 AM)</option>
                <option value="P4">Period 4 (10:45 AM)</option>
                <option value="P5">Period 5 (11:30 AM)</option>
                <option value="P6">Period 6 (12:15 PM)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Physics / Mathematics / English"
              value={slotData.subject}
              onChange={(e) => setSlotData({ ...slotData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Teacher</label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. Tariq Mehmood"
                value={slotData.teacher}
                onChange={(e) => setSlotData({ ...slotData, teacher: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Room / Lab No</label>
              <input
                type="text"
                value={slotData.room}
                onChange={(e) => setSlotData({ ...slotData, room: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="Room 101"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold">Assign Slot</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TimetableView
