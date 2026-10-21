import React, { useState, useEffect, useMemo } from 'react'
import { 
  CalendarCheck, 
  Check, 
  X, 
  Clock, 
  Users, 
  Calendar, 
  Save, 
  Download, 
  AlertTriangle, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Filter 
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

export const AttendanceView = ({ currentInstitute }) => {
  const { students = [], saveAttendance, getAttendance, sendCommunicationBlast } = useAppData()
  const { toast } = useToast()

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('10th Grade')
  const [filterAtRiskOnly, setFilterAtRiskOnly] = useState(false)
  
  // Filter students by campus and class
  const classStudents = useMemo(() => {
    return students.filter(s => 
      (!s.instituteId || s.instituteId === currentInstitute?.id) &&
      (!selectedClass || selectedClass === 'All Classes' || s.className?.toLowerCase().includes(selectedClass.toLowerCase()))
    )
  }, [students, currentInstitute?.id, selectedClass])

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

  // Helper to check if student is at risk of board exam ineligibility (<75% attendance)
  const getAttendanceRateNum = (rateStr) => {
    if (!rateStr) return 92
    return parseInt(rateStr.replace('%', ''), 10) || 92
  }

  const atRiskCount = classStudents.filter(s => getAttendanceRateNum(s.attendanceRate) < 75).length

  // Send single parent absence warning
  const handleSendAttendanceWarning = (student) => {
    sendCommunicationBlast({
      channel: 'SMS',
      recipientGroup: `Parent of ${student.name}`,
      message: `Urgent Attendance Alert: Your ward ${student.name}'s attendance has fallen below 75% (${student.attendanceRate}). Mandatory 75% is required for Board Examination eligibility.`
    })
    toast.success(`Absence warning SMS dispatched to ${student.name}'s guardian!`)
  }

  // Export today's roll-call register
  const exportDailyRegisterCSV = () => {
    if (classStudents.length === 0) {
      toast.warning('No students in this class to export.')
      return
    }

    const headers = ['Date', 'Class', 'Roll Number', 'Student Name', 'Status', 'Cumulative Rate', 'Board Eligibility']
    const rows = classStudents.map(s => {
      const rate = getAttendanceRateNum(s.attendanceRate)
      return [
        `"${date}"`,
        `"${selectedClass}"`,
        `"${s.rollNumber}"`,
        `"${s.name}"`,
        `"${(attendanceMap[s.id] || 'present').toUpperCase()}"`,
        `"${s.attendanceRate || '95%'}"`,
        `"${rate < 75 ? 'AT-RISK (<75%)' : 'Eligible'}"`
      ]
    })

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

  const displayedStudents = filterAtRiskOnly 
    ? classStudents.filter(s => getAttendanceRateNum(s.attendanceRate) < 75)
    : classStudents

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Daily Attendance Register</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Roll-call tracking, persistent registers, and Chronic Absenteeism Sentinel (&lt;75% Board Threshold Alert)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setFilterAtRiskOnly(!filterAtRiskOnly)}
            className={`px-3 py-2 border rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              filterAtRiskOnly 
                ? 'bg-rose-600 text-white border-rose-600 shadow-sm' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{filterAtRiskOnly ? 'Show All Students' : `At-Risk Students (${atRiskCount})`}</span>
          </button>

          <button
            onClick={() => markAll('present')}
            className="px-3 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Mark All Present
          </button>
          <button
            onClick={exportDailyRegisterCSV}
            className="px-3 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download CSV register"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Register</span>
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow flex items-center gap-1.5 transition-all cursor-pointer"
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
            <option value="11th Grade">11th Grade</option>
            <option value="12th Grade">12th Grade</option>
            <option value="All Classes">All Classes</option>
          </select>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold flex-wrap">
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

      {/* Chronic Absenteeism Warning Banner */}
      {atRiskCount > 0 && !filterAtRiskOnly && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Chronic Absenteeism Alert:</strong> {atRiskCount} student(s) in this class currently have cumulative attendance below 75% (at risk of board exam ineligibility).
            </span>
          </div>
          <button
            onClick={() => setFilterAtRiskOnly(true)}
            className="text-xs font-bold text-amber-950 underline shrink-0"
          >
            Filter At-Risk Students
          </button>
        </div>
      )}

      {/* Attendance Sheet */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm min-w-[650px]">
          <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Roll Number</th>
              <th className="px-6 py-3.5">Student Name</th>
              <th className="px-6 py-3.5">Cumulative Attendance</th>
              <th className="px-6 py-3.5 text-center">Daily Roll-Call Status</th>
              <th className="px-6 py-3.5 text-right">Intervention</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedStudents.length > 0 ? (
              displayedStudents.map(std => {
                const currentStatus = attendanceMap[std.id] || 'present'
                const rate = getAttendanceRateNum(std.attendanceRate)
                const isAtRisk = rate < 75

                return (
                  <tr key={std.id} className={`hover:bg-slate-50/70 transition-colors ${isAtRisk ? 'bg-rose-50/30' : ''}`}>
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-slate-700">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {std.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">
                      <div>{std.name}</div>
                      <span className="text-[11px] text-slate-400 font-normal">{std.className}</span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold text-xs ${isAtRisk ? 'text-rose-700' : 'text-slate-700'}`}>
                          {std.attendanceRate || '95%'}
                        </span>
                        {isAtRisk ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>&lt;75% At-Risk</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">Board Eligible</span>
                        )}
                      </div>
                    </td>
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
                    <td className="px-6 py-3.5 text-right">
                      {isAtRisk ? (
                        <button
                          onClick={() => handleSendAttendanceWarning(std)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded text-xs font-bold inline-flex items-center gap-1 border border-rose-200 cursor-pointer"
                          title="Dispatch Warning SMS to Parent"
                        >
                          <Send className="w-3 h-3 text-rose-600" />
                          <span>SMS Warning</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Regular</span>
                      )}
                    </td>
                  </tr>
                )
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No Students Found for this Selection</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {filterAtRiskOnly 
                      ? 'No students currently fall below the 75% attendance threshold in this class!'
                      : 'Enroll students in this class via the Students module.'}
                  </p>
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
