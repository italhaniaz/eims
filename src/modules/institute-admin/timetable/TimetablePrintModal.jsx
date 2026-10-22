import React, { useState, useMemo } from 'react'
import { 
  X, 
  Printer, 
  Download, 
  FileSpreadsheet, 
  School, 
  Clock, 
  User, 
  BookOpen, 
  Calendar 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { getAllTimetables } from './timetableService'

export const TimetablePrintModal = ({
  isOpen,
  onClose,
  currentInstitute,
  session = '2026-2027',
  className = '',
  sectionName = '',
  currentClassObj = null,
  currentSectionObj = null,
  workingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  periods = [],
  currentScheduleSlots = {},
  teachers = []
}) => {
  const [printTarget, setPrintTarget] = useState('class') // 'class' | 'teacher' | 'school'
  const [selectedTeacherId, setSelectedTeacherId] = useState(teachers[0]?.id || '')

  if (!isOpen) return null

  const allTimetables = useMemo(() => getAllTimetables(), [])

  // Teacher Schedule computation
  const selectedTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0]
  const teacherSlots = useMemo(() => {
    if (!selectedTeacher) return {}
    const map = {}
    allTimetables.forEach(t => {
      if ((t.session || '').toLowerCase().trim() !== session.toLowerCase().trim()) return
      const slots = t.slots || {}
      Object.entries(slots).forEach(([key, slot]) => {
        if (slot.teacherId === selectedTeacher.id || slot.teacherName?.toLowerCase().trim() === selectedTeacher.name.toLowerCase().trim()) {
          map[key] = {
            ...slot,
            className: t.className,
            sectionName: t.sectionName
          }
        }
      })
    })
    return map
  }, [allTimetables, selectedTeacher, session])

  // Trigger browser print
  const handlePrint = () => {
    window.print()
  }

  // Export CSV
  const handleExportCsv = () => {
    let csvRows = []

    if (printTarget === 'class') {
      csvRows.push([`Class Timetable: ${className} - ${sectionName}`])
      csvRows.push([`Session: ${session}`, `Institute: ${currentInstitute?.name || 'School'}`])
      csvRows.push([])
      
      const header = ['Weekday', ...periods.map(p => p.isBreak ? `${p.num} (${p.label})` : `${p.num} (${p.startTime}-${p.endTime})`)]
      csvRows.push(header)

      workingDays.forEach(day => {
        const row = [day]
        periods.forEach(p => {
          if (p.isBreak) {
            row.push(p.breakName || p.label)
          } else {
            const key = `${day}-${p.num}`
            const slot = currentScheduleSlots[key]
            row.push(slot ? `${slot.subjectName} (${slot.teacherName})` : '-')
          }
        })
        csvRows.push(row)
      })
    } else if (printTarget === 'teacher') {
      csvRows.push([`Faculty Schedule: ${selectedTeacher?.name || 'Teacher'}`])
      csvRows.push([`Employee ID: ${selectedTeacher?.empId || '-'}`, `Department: ${selectedTeacher?.department || '-'}`])
      csvRows.push([])

      const header = ['Weekday', ...periods.map(p => `${p.num} (${p.startTime}-${p.endTime})`)]
      csvRows.push(header)

      workingDays.forEach(day => {
        const row = [day]
        periods.forEach(p => {
          if (p.isBreak) {
            row.push(p.label)
          } else {
            const key = `${day}-${p.num}`
            const slot = teacherSlots[key]
            row.push(slot ? `${slot.className} ${slot.sectionName}: ${slot.subjectName}` : '-')
          }
        })
        csvRows.push(row)
      })
    } else {
      // Whole School
      csvRows.push([`Whole School Master Schedule: ${session}`])
      csvRows.push([])
      const header = ['Class & Section', 'Weekday', ...periods.filter(p => !p.isBreak).map(p => p.num)]
      csvRows.push(header)

      allTimetables.forEach(t => {
        if ((t.session || '').toLowerCase().trim() !== session.toLowerCase().trim()) return
        workingDays.forEach(day => {
          const row = [`${t.className} - ${t.sectionName}`, day]
          periods.filter(p => !p.isBreak).forEach(p => {
            const slot = (t.slots || {})[`${day}-${p.num}`]
            row.push(slot ? `${slot.subjectName} (${slot.teacherName})` : '-')
          })
          csvRows.push(row)
        })
      })
    }

    const csvContent = csvRows.map(r => r.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${printTarget}_timetable_${session}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Print & Export Institutional Timetables"
      maxWidth="max-w-4xl"
    >
      {/* Print Specific CSS to format printable area for A4 */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-timetable-sheet, #printable-timetable-sheet * {
            visibility: visible !important;
          }
          #printable-timetable-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-4 text-xs">
        {/* Document Selection Controls (no-print) */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <span className="font-bold text-slate-500 uppercase text-[10px] mr-1">Target:</span>
            <button
              type="button"
              onClick={() => setPrintTarget('class')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                printTarget === 'class' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white border text-slate-700'
              }`}
            >
              Class Timetable ({className || 'Select Class'})
            </button>
            <button
              type="button"
              onClick={() => setPrintTarget('teacher')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                printTarget === 'teacher' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white border text-slate-700'
              }`}
            >
              Faculty Weekly Schedule
            </button>
            <button
              type="button"
              onClick={() => setPrintTarget('school')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                printTarget === 'school' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white border text-slate-700'
              }`}
            >
              Whole-School Master
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
          </div>
        </div>

        {/* Teacher Selector if target is Teacher */}
        {printTarget === 'teacher' && (
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3 no-print">
            <label className="font-bold text-slate-700 shrink-0">Select Faculty Member:</label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs"
            >
              {teachers.map(t => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.empId} • {t.department || 'Faculty'})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* PRINTABLE PREVIEW SHEET (This is printed on A4) */}
        <div 
          id="printable-timetable-sheet"
          className="border border-slate-200 rounded-2xl p-6 bg-white shadow-xs space-y-4"
        >
          {/* Institutional Header */}
          <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold uppercase tracking-tight text-slate-900">
                {currentInstitute?.name || 'Beaconhouse Central High School'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {currentInstitute?.address || 'Main Campus, Lahore, Pakistan'} • Session: <strong>{session}</strong>
              </p>
            </div>
            <div className="text-right font-mono text-xs">
              <span className="font-bold text-slate-800 block uppercase">
                {printTarget === 'class' ? 'Class Timetable' : printTarget === 'teacher' ? 'Faculty Routine' : 'Master Overview'}
              </span>
              <span className="text-[10px] text-slate-400">
                Generated: {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Subheader Metadata */}
          {printTarget === 'class' && (
            <div className="grid grid-cols-4 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Class & Section:</span>
                <strong className="text-slate-900">{className} - {sectionName}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Class Teacher:</span>
                <span className="font-medium text-slate-800">{currentSectionObj?.classTeacherName || currentClassObj?.classTeacher || 'Teacher In-Charge'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Classroom / Wing:</span>
                <span className="font-mono text-slate-800">{currentSectionObj?.roomNo || 'Room 101'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Medium / Shift:</span>
                <span className="font-medium text-slate-800">{currentSectionObj?.medium || 'English'} ({currentClassObj?.shift || 'Morning'})</span>
              </div>
            </div>
          )}

          {printTarget === 'teacher' && selectedTeacher && (
            <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Faculty Member:</span>
                <strong className="text-slate-900">{selectedTeacher.name} ({selectedTeacher.empId})</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Designation & Department:</span>
                <span className="font-medium text-slate-800">{selectedTeacher.designation || 'Faculty'} ({selectedTeacher.department || 'General'})</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Weekly Workload:</span>
                <span className="font-mono font-bold text-slate-900">{Object.keys(teacherSlots).length} Scheduled Periods</span>
              </div>
            </div>
          )}

          {/* Routine Table Grid */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-800 border-b border-slate-200 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-r border-slate-200 w-24">Weekday</th>
                  {periods.map(p => (
                    <th key={p.num} className={`p-2 text-center border-r border-slate-200 ${p.isBreak ? 'bg-amber-100/60' : ''}`}>
                      <span className="block font-bold">{p.num}</span>
                      <span className="text-[9px] font-normal text-slate-500 font-mono block">{p.startTime}-{p.endTime}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {workingDays.map(day => (
                  <tr key={day}>
                    <td className="p-2 font-bold bg-slate-50/60 border-r border-slate-200">{day}</td>
                    {periods.map(p => {
                      if (p.isBreak) {
                        return (
                          <td key={p.num} className="p-2 text-center bg-amber-50/60 border-r border-slate-200 font-bold text-[10px] text-amber-800">
                            {p.breakName || p.label}
                          </td>
                        )
                      }

                      const slotKey = `${day}-${p.num}`
                      let cellContent = null

                      if (printTarget === 'class') {
                        const slot = currentScheduleSlots[slotKey]
                        if (slot) {
                          cellContent = (
                            <div className="p-1">
                              <strong className="block text-slate-900 text-[11px] leading-tight">{slot.subjectName}</strong>
                              <span className="text-[9px] text-slate-500 block">{slot.teacherName}</span>
                              <span className="text-[8px] text-slate-400 font-mono block">{slot.roomName}</span>
                            </div>
                          )
                        }
                      } else if (printTarget === 'teacher') {
                        const slot = teacherSlots[slotKey]
                        if (slot) {
                          cellContent = (
                            <div className="p-1">
                              <strong className="block text-slate-900 text-[11px] leading-tight">{slot.subjectName}</strong>
                              <span className="text-[10px] text-emerald-700 font-bold block">{slot.className} ({slot.sectionName})</span>
                              <span className="text-[8px] text-slate-400 font-mono block">{slot.roomName}</span>
                            </div>
                          )
                        }
                      }

                      return (
                        <td key={p.num} className="p-1.5 border-r border-slate-200 text-center align-top min-w-[90px]">
                          {cellContent || <span className="text-slate-300 font-mono text-[10px]">—</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Signatures & Footer Note */}
          <div className="pt-8 grid grid-cols-3 gap-8 text-center text-xs">
            <div className="border-t border-slate-400 pt-1.5">
              <span className="text-slate-600 block">Class In-Charge</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <span className="text-slate-600 block">Academic Coordinator</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <span className="text-slate-600 block">Principal / Head of Institution</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default TimetablePrintModal
