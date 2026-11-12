import React, { useState, useMemo } from 'react'
import {
  Calendar,
  Clock,
  Printer,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  FileText,
  User,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  CalendarDays,
  Sparkles,
  Award
} from 'lucide-react'

export default function TeacherTimetableView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const [activeTab, setActiveTab] = useState('weekly') // 'weekly' | 'exam'
  const [selectedClass, setSelectedClass] = useState('Nursery')

  // Dynamic today name and date
  const todayInfo = useMemo(() => {
    const now = new Date()
    const dayName = now.toLocaleDateString('en-GB', { weekday: 'long' })
    const formatted = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
    return {
      dayName,
      dateString: `${dayName}, ${formatted}`,
      simpleDay: dayName // e.g. "Thursday"
    }
  }, [])

  // Weekly Schedule Data matching screenshot
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const periods = [
    {
      time: '8:00 AM - 8:30 AM',
      name: '8:00 AM\n8:30 AM',
      type: 'other',
      subject: 'English',
      teacher: 'Other Teacher'
    },
    {
      time: '8:30 AM - 9:00 AM',
      name: '8:30 AM\n9:00 AM',
      type: 'mine',
      subject: 'Math',
      teacher: teacherName
    },
    {
      time: '10:30 AM - 11:00 AM',
      name: '10:30 AM\n11:00 AM',
      type: 'mine',
      subject: 'Play Activity',
      teacher: teacherName
    }
  ]

  // Your periods list on the right panel
  const myPeriodsList = useMemo(() => {
    const list = []
    daysOfWeek.forEach((day) => {
      list.push({
        day,
        subject: 'Math',
        time: '8:30 AM - 9:00 AM'
      })
      list.push({
        day,
        subject: 'Play Activity',
        time: '10:30 AM - 11:00 AM'
      })
    })
    return list
  }, [daysOfWeek])

  // Exam Datesheet Data
  const examDatesheet = [
    {
      date: '15 Nov 2026',
      day: 'Monday',
      time: '09:00 AM - 11:00 AM',
      subject: 'English',
      room: 'Room 101',
      invigilator: 'Assigned (You)'
    },
    {
      date: '17 Nov 2026',
      day: 'Wednesday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Mathematics',
      room: 'Room 101',
      invigilator: 'Assigned (You)'
    },
    {
      date: '19 Nov 2026',
      day: 'Friday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Play Activity & Arts',
      room: 'Activity Hall',
      invigilator: 'Assigned (You)'
    }
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>My Timetable</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (Timetables & Exam Schedules Active) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Timetables & Exam Schedules</span>
          </div>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        {/* Title and Subtitle matching screenshot */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-500" />
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
              My timetable
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            See when you teach each class. Your subjects are highlighted in blue.
          </p>
        </div>

        {/* TODAY'S CLASSES CARD (Matching screenshot 1) */}
        <div className="bg-slate-100/80 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Today - {todayInfo.dateString}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Today's classes
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                2 periods scheduled
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('timetable-grid')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Full timetable</span>
            </button>
          </div>

          {/* Schedule Chips Row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-slate-700 dark:text-slate-300 font-medium shadow-2xs">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>8:30 AM - 9:00 AM</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">Math</span>
              <span className="text-slate-400 text-[11px]">(Nursery)</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-full text-xs text-slate-700 dark:text-slate-300 font-medium shadow-2xs">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>10:30 AM - 11:00 AM</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">Play Activity</span>
              <span className="text-slate-400 text-[11px]">(Nursery)</span>
            </div>
          </div>
        </div>

        {/* CLASS SELECTION & SUBJECT BADGES */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-4 py-1.5 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs"
            >
              {selectedClass}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              You teach in {selectedClass.toLowerCase()}:
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500 text-white shadow-2xs">
              Math
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500 text-white shadow-2xs">
              Pak Study
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-sky-500 text-white shadow-2xs">
              Play Activity
            </span>
          </div>
        </div>

        {/* TIMETABLE TABS ROW (Weekly Schedule vs Exam Datesheet) */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border-b-2 -mb-1 ${
              activeTab === 'weekly'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Weekly schedule</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
              1
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('exam')}
            className={`px-3.5 py-2 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer border-b-2 -mb-1 ${
              activeTab === 'exam'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Exam datesheet</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
              1
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: WEEKLY SCHEDULE MATRIX + PERIODS SIDE PANEL */}
        {/* ========================================================= */}
        {activeTab === 'weekly' ? (
          <div id="timetable-grid" className="space-y-3">
            {/* Header & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {selectedClass} Class Schedule 2026-2027
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/40"></span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">Your subject</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-slate-200 dark:bg-slate-700"></span>
                  <span>Other teacher</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-amber-400"></span>
                  <span className="text-amber-700 dark:text-amber-400 font-bold">Today ({todayInfo.simpleDay})</span>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1 rounded-xl border border-rose-400 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ml-auto"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* SPLIT LAYOUT: TIMETABLE TABLE + RIGHT PERIODS PANEL */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: Weekly Grid (lg:col-span-9) */}
              <div className="lg:col-span-9 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-32 font-black">Day</th>
                        <th className="py-3 px-4 text-center border-l border-slate-200/70 dark:border-slate-800">
                          <span className="block font-black text-slate-700 dark:text-slate-300">8:00 AM</span>
                          <span className="text-[10px] text-slate-400 font-normal">8:30 AM</span>
                        </th>
                        <th className="py-3 px-4 text-center border-l border-slate-200/70 dark:border-slate-800 bg-sky-50/40 dark:bg-sky-950/20">
                          <span className="block font-black text-sky-700 dark:text-sky-300">8:30 AM</span>
                          <span className="text-[10px] text-sky-500 font-normal">9:00 AM</span>
                        </th>
                        <th className="py-3 px-4 text-center border-l border-slate-200/70 dark:border-slate-800 bg-sky-50/40 dark:bg-sky-950/20">
                          <span className="block font-black text-sky-700 dark:text-sky-300">10:30 AM</span>
                          <span className="text-[10px] text-sky-500 font-normal">11:00 AM</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {daysOfWeek.map((day) => {
                        const isToday = day.toLowerCase() === todayInfo.simpleDay.toLowerCase()

                        return (
                          <tr
                            key={day}
                            className={`transition-colors ${
                              isToday
                                ? 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500 font-semibold'
                                : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                            }`}
                          >
                            {/* Day Column */}
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {day}
                              {isToday && (
                                <span className="ml-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
                                  Today
                                </span>
                              )}
                            </td>

                            {/* 8:00 AM - 8:30 AM: English (Other teacher) */}
                            <td className="py-3.5 px-4 text-center border-l border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-600 dark:text-slate-300">English</span>
                            </td>

                            {/* 8:30 AM - 9:00 AM: Math (Your subject) */}
                            <td className="py-3.5 px-4 text-center border-l border-slate-100 dark:border-slate-800/80 bg-sky-50/30 dark:bg-sky-950/10">
                              <span className="font-extrabold text-blue-600 dark:text-blue-400 block">
                                Math
                              </span>
                              <span className="inline-flex items-center justify-center text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">
                                <User className="w-3 h-3 inline mr-0.5" />
                              </span>
                            </td>

                            {/* 10:30 AM - 11:00 AM: Play Activity (Your subject) */}
                            <td className="py-3.5 px-4 text-center border-l border-slate-100 dark:border-slate-800/80 bg-sky-50/30 dark:bg-sky-950/10">
                              <span className="font-extrabold text-blue-600 dark:text-blue-400 block">
                                Play Activity
                              </span>
                              <span className="inline-flex items-center justify-center text-[10px] text-sky-600 dark:text-sky-400 mt-0.5">
                                <User className="w-3 h-3 inline mr-0.5" />
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: "Your periods (this timetable)" (lg:col-span-3) */}
              <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col max-h-[460px]">
                <div className="px-4 py-3 bg-slate-50/90 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-white">
                    <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                    <span>Your periods (this timetable)</span>
                  </div>
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 p-2 space-y-1">
                  {myPeriodsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl hover:bg-sky-50/60 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-blue-600 dark:text-blue-400">
                          {item.time}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          {item.day}
                        </span>
                      </div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white mt-0.5">
                        {item.subject}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/40 dark:bg-slate-800/40">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* TAB 2: EXAM DATESHEET */
          /* ========================================================= */
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Exam Datesheet — Mid-Term Examination 2026
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Class: {selectedClass} • Session 2026-2027
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Datesheet</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Day</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Room</th>
                    <th className="py-3 px-4 text-right">Invigilation Duty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {examDatesheet.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{exam.date}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{exam.day}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-sky-600 dark:text-sky-400">{exam.time}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{exam.subject}</td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">{exam.room}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {exam.invigilator}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
