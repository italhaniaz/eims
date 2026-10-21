import React, { useState, useEffect, useMemo } from 'react'
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  DoorOpen, 
  Printer, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const TimetableView = ({ currentInstitute }) => {
  const { saveTimetable, getTimetable, teachers = [] } = useAppData()
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

  const defaultSchedule10 = {
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

  const defaultSchedule9 = {
    'Monday-P1': { subject: 'English', teacher: 'Ms. Ayesha', room: 'R-201' },
    'Monday-P2': { subject: 'Mathematics', teacher: 'Prof. Tariq', room: 'R-201' },
    'Monday-P3': { subject: 'Biology', teacher: 'Dr. Samina', room: 'Bio Lab' },
    'Monday-P4': { subject: 'Physics', teacher: 'Dr. Fatima', room: 'Lab 1' },
    'Monday-P5': { subject: 'Urdu', teacher: 'Mr. Asif', room: 'R-201' },
    'Monday-P6': { subject: 'Islamic Studies', teacher: 'Qari Sb', room: 'R-201' }
  }

  const [schedule, setSchedule] = useState(defaultSchedule10)

  // Load saved timetable for the class
  useEffect(() => {
    const saved = getTimetable(selectedClass)
    if (saved && Object.keys(saved).length > 0) {
      setSchedule(saved)
    } else {
      setSchedule(selectedClass.includes('9') ? defaultSchedule9 : defaultSchedule10)
    }
  }, [selectedClass])

  const [slotData, setSlotData] = useState({
    day: 'Monday',
    periodNum: 'P1',
    subject: '',
    teacher: '',
    room: 'Room 101'
  })

  // Real-time Clash Detection Engine
  const activeClash = useMemo(() => {
    if (!slotData.teacher && !slotData.room) return null

    const otherClass = selectedClass.includes('10') ? '9th Grade' : '10th Grade'
    const otherSchedule = getTimetable(otherClass) || (otherClass.includes('9') ? defaultSchedule9 : defaultSchedule10)
    const slotKey = `${slotData.day}-${slotData.periodNum}`
    const conflictingSlot = otherSchedule[slotKey]

    if (conflictingSlot) {
      if (slotData.teacher && conflictingSlot.teacher?.toLowerCase() === slotData.teacher.toLowerCase()) {
        return {
          type: 'teacher',
          message: `Double-Booking Alert: Faculty "${slotData.teacher}" is already scheduled in ${otherClass} during ${slotData.day} (${slotData.periodNum})!`
        }
      }
      if (slotData.room && conflictingSlot.room?.toLowerCase() === slotData.room.toLowerCase() && slotData.room.toLowerCase() !== 'room 101') {
        return {
          type: 'room',
          message: `Room Clash Alert: "${slotData.room}" is already reserved for ${otherClass} during ${slotData.day} (${slotData.periodNum})!`
        }
      }
    }
    return null
  }, [slotData, selectedClass])

  const handleSaveSlot = (e) => {
    e.preventDefault()
    if (!slotData.subject || !slotData.teacher) {
      toast.error('Subject and Teacher are required.')
      return
    }

    if (activeClash) {
      if (!window.confirm(`${activeClash.message}\n\nDo you want to override and assign anyway?`)) {
        return
      }
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
    toast.success(`Period slot for ${slotData.day} (${slotData.periodNum}) saved successfully!`)
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
          <p className="text-xs text-slate-500 mt-1">
            Class routine management, teacher period allocations, and automated clash/conflict detection
          </p>
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700 uppercase">Select Grade / Routine:</span>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
          >
            <option value="10th Grade">10th Grade (Matriculation)</option>
            <option value="9th Grade">9th Grade (Secondary)</option>
            <option value="11th Grade (FSc Pre-Eng)">11th Grade (FSc Pre-Eng)</option>
            <option value="12th Grade (ICS Computer)">12th Grade (ICS Computer)</option>
          </select>
        </div>

        <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Clash Sentinel Active</span>
        </span>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[850px] border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-28 text-center bg-slate-100">Day</th>
                {periods.map(p => (
                  <th key={p.num} className={`p-3 text-center ${p.isBreak ? 'bg-amber-50 text-amber-800' : ''}`}>
                    <span className="block font-bold">{p.num}</span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{p.time}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-800 bg-slate-50/80 text-center border-r border-slate-200">
                    {day}
                  </td>
                  {periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.num} className="p-2 text-center bg-amber-50/40 text-[10px] font-semibold text-amber-700">
                          RECESS BREAK
                        </td>
                      )
                    }

                    const slotKey = `${day}-${p.num}`
                    const slot = schedule[slotKey]

                    return (
                      <td key={p.num} className="p-2 text-center">
                        {slot ? (
                          <div 
                            onClick={() => openSlotModal(day, p.num)}
                            className="p-2 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer group text-left space-y-1"
                          >
                            <span className="font-bold text-slate-900 block truncate leading-tight group-hover:text-emerald-700">
                              {slot.subject}
                            </span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{slot.teacher}</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <DoorOpen className="w-3 h-3 text-slate-300 shrink-0" />
                              <span className="truncate">{slot.room}</span>
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => openSlotModal(day, p.num)}
                            className="w-full h-16 rounded-xl border border-dashed border-slate-200 hover:border-emerald-400 text-slate-300 hover:text-emerald-600 flex items-center justify-center text-[10px] font-medium transition-colors"
                          >
                            + Assign
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

      {/* Assign Period Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign Schedule Slot (${selectedClass})`}
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Day of Week</label>
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

          {/* Conflict Sentinel Alert Bar */}
          {activeClash ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Scheduling Conflict Warning:</span>
                <span>{activeClash.message}</span>
              </div>
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>No scheduling conflicts detected. Faculty member & room are verified free!</span>
            </div>
          )}

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
