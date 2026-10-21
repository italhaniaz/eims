import React, { useState, useEffect } from 'react'
import { CalendarCheck, Check, X, Clock, Users, Calendar, Save, Download } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

export const AttendanceView = ({ currentInstitute }) => {
  const { students, saveAttendance, getAttendance } = useAppData()
  const { toast } = useToast()

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('10th Grade')
  
  // Filter students by campus and class
  const classStudents = students.filter(s => 
    (!s.instituteId || s.instituteId === currentInstitute?.id) &&
    (!selectedClass || selectedClass === 'All Classes' || s.className?.toLowerCase().includes(selectedClass.toLowerCase()))
  )

  // Attendance state map: studentId -> 'present' | 'absent' | 'leave'
  const [attendanceMap, setAttendanceMap] = useState({})

  // Load saved attendance for the chosen date and class, or initialize
  useEffect(() => {
    const existing = getAttendance(date, selectedClass)
    if (existing && Object.keys(existing).length > 0) {
      setAttendanceMap(existing)
    } else {
      const initial = {}
      classStudents.forEach(s => {
        initial[s.id] = 'present'
      })
      setAttendanceMap(initial)
    }
  }, [date, selectedClass, students.length])

  const toggleStatus = (id, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: status
    }))
  }

  const markAll = (status) => {
    const updated = {}
    classStudents.forEach(s => {
      updated[s.id] = status
    })
    setAttendanceMap(updated)
    toast.info(`Marked all ${status}. Click 'Save Attendance' to persist.`)
  }

  const handleSave = () => {
    saveAttendance(date, selectedClass, attendanceMap)
    toast.success(`Attendance register for ${date} (${selectedClass}) saved successfully!`)
  }

  const presentCount = classStudents.filter(s => (attendanceMap[s.id] || 'present') === 'present').length
  const absentCount = classStudents.filter(s => attendanceMap[s.id] === 'absent').length
  const leaveCount = classStudents.filter(s => attendanceMap[s.id] === 'leave').length

  // Export today's roll-call register
  const exportDailyRegisterCSV = () => {
    if (classStudents.length === 0) {
      toast.warning('No students in this class to export.')
      return
    }

    const headers = ['Date', 'Class', 'Roll Number', 'Student Name', 'Status']
    const rows = classStudents.map(s => [
      `"${date}"`,
      `"${selectedClass}"`,
      `"${s.rollNumber}"`,
      `"${s.name}"`,
      `"${(attendanceMap[s.id] || 'present').toUpperCase()}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `attendance_${selectedClass.replace(/\s+/g, '_')}_${date}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Downloaded attendance register.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Roll-call tracking, historical attendance lookup, and persistent registers</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => markAll('present')}
            className="px-3 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors"
          >
            Mark All Present
          </button>
          <button
            onClick={exportDailyRegisterCSV}
            className="px-3 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download CSV register"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Date & Filter selectors */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
            />
          </div>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="text-xs font-medium px-3 py-2 border border-slate-200 rounded-lg focus:outline-none bg-slate-50"
          >
            <option value="10th Grade">10th Grade</option>
            <option value="9th Grade">9th Grade</option>
            <option value="11th Grade">11th Grade (ICS)</option>
            <option value="12th Grade">12th Grade (Pre-Med)</option>
            <option value="All Classes">All Classes</option>
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            Present: {presentCount}
          </span>
          <span className="text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            Absent: {absentCount}
          </span>
          <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
            Leave: {leaveCount}
          </span>
          <span className="text-slate-500 font-normal">
            Total: {classStudents.length} Students
          </span>
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Roll Number</th>
              <th className="px-6 py-3.5">Student Name</th>
              <th className="px-6 py-3.5">Grade & Section</th>
              <th className="px-6 py-3.5 text-center">Attendance Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classStudents.length > 0 ? (
              classStudents.map(std => {
                const currentStatus = attendanceMap[std.id] || 'present'
                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {std.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{std.name}</td>
                    <td className="px-6 py-3.5 text-xs text-slate-600">{std.className} ({std.section || 'A'})</td>
                    <td className="px-6 py-3.5 text-center">
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
              })
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No Students Found</p>
                  <p className="text-xs text-slate-400 mt-1">Enroll students in this class via the Students Admissions module.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceView
