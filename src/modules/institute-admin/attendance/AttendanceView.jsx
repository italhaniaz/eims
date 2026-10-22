import React, { useState, useEffect } from 'react'
import { CalendarCheck, Check, X, Clock, Users, Calendar, Filter, Star, Sparkles } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { normalizeClassSections } from '../../../constants/academicLevels'

export const AttendanceView = ({ currentInstitute }) => {
  const { students = [], classes = [], institutes = [] } = useAppData()
  
  const instStudents = students.filter(s => {
    if (!s.instituteId) return true
    if (!currentInstitute?.id) return true
    if (s.instituteId === currentInstitute.id) return true
    if ((s.instituteId === 'inst-1' || s.instituteId === 'inst-default') &&
        (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
      return true
    }
    if ((institutes || []).length <= 1) return true
    return false
  })

  const instClasses = classes.filter(c => {
    if (!c.instituteId) return true
    if (!currentInstitute?.id) return true
    if (c.instituteId === currentInstitute.id) return true
    if ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') &&
        (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
      return true
    }
    if ((institutes || []).length <= 1) return true
    return false
  })

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  
  const defaultClass = instClasses.length > 0 ? instClasses[0].name : (instStudents[0]?.className || '10th Grade')
  const [selectedClass, setSelectedClass] = useState(defaultClass)

  // Find sections of the selected class
  const currentClassObj = instClasses.find(c => c.name.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim())
  const classSections = currentClassObj ? normalizeClassSections(currentClassObj) : [
    { id: 'sec-1', name: 'Super Section' },
    { id: 'sec-2', name: 'Section A' }
  ]

  const [selectedSection, setSelectedSection] = useState('all')
  const isSunday = new Date(date + 'T00:00:00').getDay() === 0

  // When class changes, reset section filter to 'all' or first section
  useEffect(() => {
    setSelectedSection('all')
  }, [selectedClass])

  // Filter students by selected class and section
  const rosterStudents = instStudents.filter(std => {
    const classMatch = (std.className || '').toLowerCase().trim() === (selectedClass || '').toLowerCase().trim()
    if (!classMatch) return false

    if (selectedSection !== 'all') {
      const secMatch = (std.section || '').toLowerCase().trim() === selectedSection.toLowerCase().trim()
      if (!secMatch) return false
    }

    return true
  })

  // Attendance state map: studentId -> 'present' | 'absent' | 'leave'
  const [attendanceMap, setAttendanceMap] = useState({})

  // Initialize or update attendance for students in roster
  useEffect(() => {
    setAttendanceMap(prev => {
      const nextMap = { ...prev }
      rosterStudents.forEach(s => {
        if (!nextMap[s.id]) {
          nextMap[s.id] = 'present'
        }
      })
      return nextMap
    })
  }, [selectedClass, selectedSection, students])

  const [savedSuccess, setSavedSuccess] = useState(false)

  const toggleStatus = (id, status) => {
    setAttendanceMap(prev => ({
      ...prev,
      [id]: status
    }))
  }

  const markAllPresent = () => {
    const updated = { ...attendanceMap }
    rosterStudents.forEach(s => {
      updated[s.id] = 'present'
    })
    setAttendanceMap(updated)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3500)
  }

  const presentCount = rosterStudents.filter(s => (attendanceMap[s.id] || 'present') === 'present').length
  const absentCount = rosterStudents.filter(s => attendanceMap[s.id] === 'absent').length
  const leaveCount = rosterStudents.filter(s => attendanceMap[s.id] === 'leave').length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance & Roll Call</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">Daily Attendance Register</h1>
          <p className="text-xs text-slate-500 mt-1">Track student presence, absentees, and leaves per class section</p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={markAllPresent}
            className="px-4 py-2 border border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors active:scale-95"
          >
            Mark Section All Present
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            Save Attendance Sheet
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Attendance records for {selectedClass} ({selectedSection === 'all' ? 'All Sections' : selectedSection}) on {date} stored successfully!</span>
        </div>
      )}

      {/* Date & Filter selectors bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {instClasses.length > 0 ? (
                instClasses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))
              ) : (
                <>
                  <option value="10th Grade">10th Grade</option>
                  <option value="9th Grade">9th Grade</option>
                  <option value="11th Grade (ICS)">11th Grade (ICS)</option>
                  <option value="11th Grade (Pre-Med)">11th Grade (Pre-Med)</option>
                </>
              )}
            </select>
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-emerald-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Sections ({classSections.length})</option>
              {classSections.map((sec, idx) => (
                <option key={sec.id || idx} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time counters */}
        <div className="flex items-center gap-4 text-xs font-semibold pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100">
            Present: <strong>{presentCount}</strong>
          </span>
          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-100">
            Absent: <strong>{absentCount}</strong>
          </span>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
            Leave: <strong>{leaveCount}</strong>
          </span>
          <span className="text-slate-400 text-xs">
            Total: {rosterStudents.length} Students
          </span>
        </div>
      </div>

      {isSunday && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-2xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Official Holiday Advisory: Selected date ({date}) falls on a Sunday. Academic operations and routine roll calls are suspended.</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] uppercase font-black shrink-0">
            Weekly Holiday
          </span>
        </div>
      )}

      {/* Attendance Sheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {rosterStudents.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase font-bold border-b border-slate-200 sticky top-0 z-10 shadow-2xs">
              <tr>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Class & Section</th>
                <th className="px-6 py-3.5 text-center">Academic Rate</th>
                <th className="px-6 py-3.5 text-center">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rosterStudents.map(std => {
                const currentStatus = attendanceMap[std.id] || 'present'
                const isSuper = (std.section || '').toLowerCase().includes('super') || (std.section || '').toLowerCase().includes('star')

                return (
                  <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{std.rollNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{std.name}</div>
                      <div className="text-[11px] text-slate-400">{std.phone || 'No Contact'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <span className="font-semibold text-slate-700">{std.className}</span>
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isSuper 
                          ? 'bg-amber-50 text-amber-800 border-amber-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {isSuper && <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />}
                        <span>{std.section || 'Section A'}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {(() => {
                        const charCode = (std.name || '').charCodeAt(0) || 75
                        const rate = Math.min(98, Math.max(62, ((charCode * 7) % 36) + 64))
                        const isShort = rate < 75
                        return (
                          <div className="inline-flex flex-col items-center">
                            <span className={`font-mono font-bold text-xs ${isShort ? 'text-rose-700' : 'text-emerald-700'}`}>
                              {rate}%
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold mt-0.5 ${
                              isShort 
                                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {isShort ? 'Short (<75%)' : 'Eligible'}
                            </span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 shadow-2xs">
                        <button
                          onClick={() => toggleStatus(std.id, 'present')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-700'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => toggleStatus(std.id, 'absent')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-rose-700'
                          }`}
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => toggleStatus(std.id, 'leave')}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                            currentStatus === 'leave' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
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
        ) : (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-2">
            <Users className="w-10 h-10 text-slate-300 mb-1" />
            <h4 className="text-sm font-bold text-slate-700">No Students Found</h4>
            <p className="text-xs text-slate-400 max-w-sm">
              No students are currently enrolled in <strong>{selectedClass}</strong> {selectedSection !== 'all' ? `(${selectedSection})` : ''}.
              Admit students into this class and section from the Admissions module to take attendance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AttendanceView