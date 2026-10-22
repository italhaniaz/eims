import React, { useState, useEffect } from 'react'
import { 
  Clock, 
  Plus, 
  Search, 
  Calendar, 
  BookOpen, 
  User, 
  DoorOpen, 
  Printer, 
  CheckCircle2, 
  Layers, 
  Star,
  Users
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const TimetableView = ({ currentInstitute }) => {
  const { classes = [], teachers = [], institutes = [] } = useAppData()

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

  const instTeachers = teachers.filter(t => {
    if (!t.instituteId) return true
    if (!currentInstitute?.id) return true
    if (t.instituteId === currentInstitute.id) return true
    if ((t.instituteId === 'inst-1' || t.instituteId === 'inst-default') &&
        (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
      return true
    }
    if ((institutes || []).length <= 1) return true
    return false
  })

  const defaultClassName = instClasses.length > 0 ? instClasses[0].name : '10th Grade'
  const [selectedClass, setSelectedClass] = useState(defaultClassName)
  
  // Find current class object and its sections
  const currentClassObj = instClasses.find(c => c.name.toLowerCase().trim() === (selectedClass || '').toLowerCase().trim())
  const classSections = currentClassObj ? normalizeClassSections(currentClassObj) : [
    { id: 'sec-1', name: 'Super Section', roomNo: 'Room 101' },
    { id: 'sec-2', name: 'Section A', roomNo: 'Room 102' }
  ]

  const [selectedSection, setSelectedSection] = useState(() => classSections[0]?.name || 'Super Section')

  // When selected class changes, default to its first section
  useEffect(() => {
    if (classSections.length > 0 && !classSections.some(s => s.name === selectedSection)) {
      setSelectedSection(classSections[0].name)
    }
  }, [selectedClass, classSections])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

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

  // Default sample routine keyed by `class__section__day-period`
  const [scheduleStore, setScheduleStore] = useState({
    default: {
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
  })

  const currentSectionObj = classSections.find(s => s.name === selectedSection)
  const scheduleScopeKey = `${selectedClass}__${selectedSection}`
  const currentSchedule = scheduleStore[scheduleScopeKey] || scheduleStore['default'] || {}

  const [slotData, setSlotData] = useState({
    day: 'Monday',
    periodNum: 'P1',
    subject: '',
    teacher: instTeachers[0]?.name || '',
    room: currentSectionObj?.roomNo || 'Room 101'
  })

  const handleOpenAssignModal = (day = 'Monday', periodNum = 'P1') => {
    setSlotData({
      day,
      periodNum,
      subject: '',
      teacher: instTeachers[0]?.name || '',
      room: currentSectionObj?.roomNo || 'Room 101'
    })
    setIsModalOpen(true)
  }

  const handleSaveSlot = (e) => {
    e.preventDefault()
    if (!slotData.subject || !slotData.teacher) return

    const slotKey = `${slotData.day}-${slotData.periodNum}`
    setScheduleStore(prev => ({
      ...prev,
      [scheduleScopeKey]: {
        ...(prev[scheduleScopeKey] || prev['default'] || {}),
        [slotKey]: {
          subject: slotData.subject,
          teacher: slotData.teacher,
          room: slotData.room || currentSectionObj?.roomNo || 'Room 101'
        }
      }
    }))
    setIsModalOpen(false)
    triggerToast(`Scheduled ${slotData.subject} (${slotData.day} ${slotData.periodNum}) for ${selectedClass} - ${selectedSection}`)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-700 underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Academic Routine & Timetable</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Class & Section Period Schedule
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage weekly schedules, subject allocations, and classroom assignments per specific section.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          {/* Class Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
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
                  <option value="9th Grade">9th Grade (Matric)</option>
                  <option value="10th Grade">10th Grade (Matric)</option>
                  <option value="11th Grade (ICS)">11th Grade (ICS)</option>
                  <option value="11th Grade (Pre-Med)">11th Grade (Pre-Med)</option>
                </>
              )}
            </select>
          </div>

          {/* Section Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 font-semibold uppercase text-[10px]">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent font-bold text-emerald-700 focus:outline-none cursor-pointer"
            >
              {classSections.map((sec, idx) => (
                <option key={sec.id || idx} value={sec.name}>{sec.name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleOpenAssignModal('Monday', 'P1')}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Period</span>
          </button>

          <button
            onClick={handlePrint}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
            title="Print Schedule"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Print Specific CSS Rules */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-timetable-root, #printable-timetable-root * {
            visibility: visible !important;
          }
          #printable-timetable-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
        }
      `}</style>

      {/* Printable Wrapper */}
      <div id="printable-timetable-root" className="space-y-4">
        {/* Printable Official Header */}
        <div className="hidden print:block text-center border-b pb-3 mb-2">
          <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">{currentInstitute?.name || 'CENTRAL INSTITUTE OF LEARNING'}</h2>
          <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">Official Academic Routine & Master Timetable</p>
          <p className="text-xs text-slate-500 font-medium mt-1">Class: <strong className="text-slate-800">{selectedClass}</strong> | Section: <strong className="text-slate-800">{selectedSection}</strong> {currentSectionObj?.roomNo ? '| Room: ' + currentSectionObj.roomNo : ''}</p>
        </div>

        {/* Routine Banner Info */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Active Routine: {selectedClass}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">
            {selectedSection}
          </span>
          {currentSectionObj?.roomNo && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500 font-mono text-[11px]">Room: {currentSectionObj.roomNo}</span>
            </>
          )}
        </div>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Click any "+ Slot" to schedule a period
        </span>
      </div>

      {/* Routine Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-28">Weekday</th>
                {periods.map(p => (
                  <th key={p.num} className={`p-3 text-center border-l border-slate-200 ${p.isBreak ? 'bg-amber-50/70 text-amber-800' : ''}`}>
                    <span className="block font-bold">{p.num}</span>
                    <span className="text-[10px] font-normal text-slate-400 font-mono">{p.time}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {days.map(day => (
                <tr key={day} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3.5 font-bold text-slate-800 bg-slate-50/40">{day}</td>
                  {periods.map(p => {
                    if (p.isBreak) {
                      return (
                        <td key={p.num} className="p-3 text-center bg-amber-50/40 border-l border-slate-100 font-bold text-[11px] text-amber-700">
                          Recess Break
                        </td>
                      )
                    }

                    const slotKey = `${day}-${p.num}`
                    const slot = currentSchedule[slotKey]

                    return (
                      <td key={p.num} className="p-2 border-l border-slate-100 text-center">
                        {slot ? (
                          <div 
                            onClick={() => handleOpenAssignModal(day, p.num)}
                            className="p-2 rounded-xl bg-emerald-50/80 border border-emerald-200/60 hover:bg-emerald-100/70 transition-all cursor-pointer shadow-2xs group"
                          >
                            <span className="font-bold text-slate-900 block leading-tight">{slot.subject}</span>
                            <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">{slot.teacher}</span>
                            <span className="text-[9px] text-slate-400 font-mono block mt-0.5">{slot.room}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenAssignModal(day, p.num)}
                            className="w-full py-4 text-[10px] text-slate-400 hover:text-emerald-700 hover:bg-slate-50 rounded-lg border border-dashed border-slate-200 hover:border-emerald-300 transition-all"
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
      </div>

      {/* Faculty list datalist */}
      <datalist id="timetable-teachers-list">
        {instTeachers.map((t, idx) => (
          <option key={t.id || idx} value={t.name}>
            {t.designation ? `${t.designation} (${t.department || 'Academic'})` : 'Faculty'}
          </option>
        ))}
      </datalist>

      {/* Modal to assign or edit period */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign Period Slot: ${selectedClass} (${selectedSection})`}
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
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Period Slot</label>
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
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Physics / Mathematics / English Literature"
              value={slotData.subject}
              onChange={(e) => setSlotData({ ...slotData, subject: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teacher In-Charge</label>
              <input
                type="text"
                required
                list="timetable-teachers-list"
                placeholder="Select or enter teacher name..."
                value={slotData.teacher}
                onChange={(e) => setSlotData({ ...slotData, teacher: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Classroom / Lab</label>
              <input
                type="text"
                value={slotData.room}
                onChange={(e) => setSlotData({ ...slotData, room: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                placeholder={currentSectionObj?.roomNo || 'Room 101'}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg font-semibold shadow-xs transition-colors"
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