import React, { useState, useEffect } from 'react'
import { Clock, Plus, Search, Calendar, BookOpen, User, DoorOpen, Printer, Save } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const TimetableView = ({ currentInstitute }) => {
  const { saveTimetable, getTimetable } = useAppData()
  const { toast } = useToast()

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

  const defaultSchedule = {
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
  }

  const [schedule, setSchedule] = useState(defaultSchedule)

  // Load saved timetable for the class
  useEffect(() => {
    const saved = getTimetable(selectedClass)
    if (saved && Object.keys(saved).length > 0) {
      setSchedule(saved)
    } else {
      setSchedule(defaultSchedule)
    }
  }, [selectedClass])

  const [slotData, setSlotData] = useState({
    day: 'Monday',
    periodNum: 'P1',
    subject: '',
    teacher: '',
    room: 'Room 101'
  })

  const handleSaveSlot = (e) => {
    e.preventDefault()
    if (!slotData.subject || !slotData.teacher) {
      toast.error('Subject and Teacher are required.')
      return
    }

    const key = `${slotData.day}-${slotData.periodNum}`
    const updated = {
      ...schedule,
      [key]: {
        subject: slotData.subject,
        teacher: slotData.teacher,
        room: slotData.room
      }
    }
    setSchedule(updated)
    saveTimetable(selectedClass, updated)
    toast.success(`Period slot for ${slotData.day} (${slotData.periodNum}) saved!`)
    setIsModalOpen(false)
    setSlotData({ day: 'Monday', periodNum: 'P1', subject: '', teacher: '', room: 'Room 101' })
  }

  const openSlotModal = (day, periodNum) => {
    const existing = schedule[`${day}-${periodNum}`]
    setSlotData({
      day,
      periodNum,
      subject: existing?.subject || '',
      teacher: existing?.teacher || '',
      room: existing?.room || 'Room 101'
    })
    setIsModalOpen(true)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academic Timetable & Schedule</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Class schedule routine, teacher period allocations, and room occupancy</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Print weekly schedule"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Timetable</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Period Slot</span>
          </button>
        </div>
      </div>

      {/* Class Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase">Select Grade / Routine:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
          >
            <option value="10th Grade">10th Grade (Matric Science)</option>
            <option value="9th Grade">9th Grade</option>
            <option value="11th Grade (ICS)">11th Grade (ICS)</option>
            <option value="12th Grade (Pre-Engineering)">12th Grade (Pre-Engineering)</option>
          </select>
        </div>
        <span className="text-xs text-slate-400 font-mono">Routine for {selectedClass}</span>
      </div>

      {/* Timetable Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b">
            <tr>
              <th className="p-3.5 text-slate-400 border-r w-28">Period</th>
              {days.map(d => (
                <th key={d} className="p-3.5 text-center border-r last:border-r-0">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {periods.map(p => {
              if (p.isBreak) {
                return (
                  <tr key={p.num} className="bg-amber-50/60 font-bold text-center text-amber-800">
                    <td className="p-2.5 font-mono text-xs border-r">{p.time}</td>
                    <td colSpan={5} className="p-2.5 uppercase tracking-widest text-[11px]">
                      ☕ Morning Recess & Prayer Break (30 Minutes)
                    </td>
                  </tr>
                )
              }

              return (
                <tr key={p.num} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-3 border-r bg-slate-50/80 font-mono">
                    <div className="font-bold text-slate-800">{p.num}</div>
                    <div className="text-[10px] text-slate-400">{p.time}</div>
                  </td>
                  {days.map(day => {
                    const slot = schedule[`${day}-${p.num}`]
                    return (
                      <td 
                        key={day}
                        onClick={() => openSlotModal(day, p.num)}
                        className="p-2.5 border-r last:border-r-0 cursor-pointer hover:bg-emerald-50/40 transition-colors"
                      >
                        {slot ? (
                          <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-900 space-y-0.5">
                            <div className="font-bold text-xs truncate">{slot.subject}</div>
                            <div className="text-[10px] text-emerald-700 flex items-center gap-1 truncate">
                              <User className="w-2.5 h-2.5" />
                              <span>{slot.teacher}</span>
                            </div>
                            <div className="text-[9px] font-mono text-emerald-600 truncate">{slot.room}</div>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg border border-dashed border-slate-200 text-center text-[10px] text-slate-400 hover:border-emerald-400">
                            + Free Slot
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Configure Period Slot (${slotData.day} - ${slotData.periodNum})`}
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Day</label>
              <select
                value={slotData.day}
                onChange={(e) => setSlotData({ ...slotData, day: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-200"
              >
                {days.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Period</label>
              <select
                value={slotData.periodNum}
                onChange={(e) => setSlotData({ ...slotData, periodNum: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-200"
              >
                {periods.filter(p => !p.isBreak).map(p => <option key={p.num} value={p.num}>{p.num} ({p.time})</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Name *</label>
            <input
              type="text"
              required
              value={slotData.subject}
              onChange={(e) => setSlotData({ ...slotData, subject: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Computer Science"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Teacher *</label>
              <input
                type="text"
                required
                value={slotData.teacher}
                onChange={(e) => setSlotData({ ...slotData, teacher: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Engr. Imran"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Room / Lab Number</label>
              <input
                type="text"
                value={slotData.room}
                onChange={(e) => setSlotData({ ...slotData, room: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Room 101 / Comp Lab"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow"
            >
              Save Schedule Slot
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default TimetableView
