import React, { useState } from 'react'
import { CalendarCheck, Check, X, Clock, Users, Calendar } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'

export const AttendanceView = ({ currentInstitute }) => {
  const { students } = useAppData()
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('10th Grade')
  
  // Attendance state map: studentId -> 'present' | 'absent' | 'leave'
  const [attendanceMap, setAttendanceMap] = useState(() => {
    const map = {}
    instStudents.forEach(s => {
      map[s.id] = 'present'
    })
    return map
  })

  const [savedSuccess, setSavedSuccess] = useState(false)

  const toggleStatus = (id, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: status
    }))
  }

  const markAllPresent = () => {
    const updated = {}
    instStudents.forEach(s => {
      updated[s.id] = 'present'
    })
    setAttendanceMap(updated)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const presentCount = Object.values(attendanceMap).filter(v => v === 'present').length
  const absentCount = Object.values(attendanceMap).filter(v => v === 'absent').length
  const leaveCount = Object.values(attendanceMap).filter(v => v === 'leave').length

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Track student roll-call, absentees, and generate attendance logs</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={markAllPresent}
            className="px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            Save Attendance Sheet
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          Attendance records for {date} stored successfully!
        </div>
      )}

      {/* Date & Filter selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-white"
          >
            <option value="10th Grade">10th Grade</option>
            <option value="11th Grade (ICS)">11th Grade (ICS)</option>
            <option value="11th Grade (Pre-Med)">11th Grade (Pre-Med)</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-emerald-600">Present: {presentCount}</span>
          <span className="text-rose-600">Absent: {absentCount}</span>
          <span className="text-amber-600">Leave: {leaveCount}</span>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
            <tr>
              <th className="px-6 py-4">Roll Number</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Grade</th>
              <th className="px-6 py-4 text-center">Status Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {instStudents.map(std => {
              const currentStatus = attendanceMap[std.id] || 'present'
              return (
                <tr key={std.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{std.rollNumber}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{std.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-600">{std.className} ({std.section})</td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                      <button
                        onClick={() => toggleStatus(std.id, 'present')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-emerald-600'
                        }`}
                      >
                        Present
                      </button>
                      <button
                        onClick={() => toggleStatus(std.id, 'absent')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          currentStatus === 'absent' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-rose-600'
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => toggleStatus(std.id, 'leave')}
                        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                          currentStatus === 'leave' ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-600 hover:text-amber-600'
                        }`}
                      >
                        Leave
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceView
