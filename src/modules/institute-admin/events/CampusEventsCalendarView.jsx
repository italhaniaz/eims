import React, { useState, useMemo } from 'react'
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Download, 
  CheckCircle2, 
  CalendarCheck, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  AlertCircle, 
  Tag, 
  X, 
  Trash2, 
  Edit2 
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

const INITIAL_EVENTS = [
  { id: 'EVT-101', title: 'Mid-Term Assessment Examinations', category: 'Academic & Exams', date: '2026-11-10', endDate: '2026-11-20', time: '08:30 AM - 12:30 PM', location: 'Examination Halls & Classrooms', audience: 'All Students (Grades 1-12)', description: 'First term comprehensive written examinations across all departments.' },
  { id: 'EVT-102', title: 'Iqbal Day Public Holiday', category: 'Holidays & Gazetted', date: '2026-11-09', endDate: '2026-11-09', time: 'Full Day', location: 'Campus Closed', audience: 'All Campus Staff & Students', description: 'National gazetted holiday commemorated with digital student project tributes.' },
  { id: 'EVT-103', title: 'Annual Parent-Teacher Conference (PTM)', category: 'Parent-Teacher Meeting (PTM)', date: '2026-11-28', endDate: '2026-11-28', time: '09:00 AM - 02:00 PM', location: 'Central Auditorium & Classrooms', audience: 'Parents & Teachers', description: 'One-on-one progress review between subject teachers and student guardians.' },
  { id: 'EVT-104', title: 'Inter-House Annual Sports Gala 2026', category: 'Sports & Co-Curricular', date: '2026-12-05', endDate: '2026-12-07', time: '09:00 AM - 03:00 PM', location: 'Main Sports Complex Ground', audience: 'All Campus Houses & Parents', description: 'Track events, football, cricket, tug of war, and prize distribution ceremony.' },
  { id: 'EVT-105', title: 'Science & Robotics Innovation Fair', category: 'Academic & Exams', date: '2026-12-15', endDate: '2026-12-16', time: '10:00 AM - 02:30 PM', location: 'Science Labs Courtyard', audience: 'Secondary School Students', description: 'Student exhibits featuring STEM models, automated robotics, and chemistry demos.' },
  { id: 'EVT-106', title: 'Faculty Pedagogical Workshop: AI in Teaching', category: 'Staff Workshop', date: '2026-11-22', endDate: '2026-11-22', time: '02:00 PM - 04:30 PM', location: 'Staff Multimedia Room', audience: 'Teaching Faculty Only', description: 'Professional development session on leveraging AI tools for personalized homework grading.' }
]

export const CampusEventsCalendarView = ({ currentInstitute }) => {
  const { toast } = useToast()
  const instituteId = currentInstitute?.id || 'inst-1'
  const storageKey = `sms_campus_events_${instituteId}`

  const [events, setEvents] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : INITIAL_EVENTS
    } catch {
      return INITIAL_EVENTS
    }
  })

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('agenda') // 'agenda' | 'month'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)

  // Current Calendar Month & Year
  const [currentDate, setCurrentDate] = useState(new Date(2026, 10, 1)) // Nov 2026

  const [formData, setFormData] = useState({
    title: '',
    category: 'Academic & Exams',
    date: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    time: '09:00 AM - 01:00 PM',
    location: 'Main Auditorium',
    audience: 'All Students & Faculty',
    description: ''
  })

  const saveEvents = (newEvents) => {
    setEvents(newEvents)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newEvents))
    } catch (e) {
      console.error(e)
    }
  }

  const categories = [
    'All',
    'Academic & Exams',
    'Holidays & Gazetted',
    'Parent-Teacher Meeting (PTM)',
    'Sports & Co-Curricular',
    'Staff Workshop'
  ]

  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesSearch = 
        evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.audience.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat = selectedCategory === 'All' || evt.category === selectedCategory
      return matchesSearch && matchesCat
    }).sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events, searchQuery, selectedCategory])

  // Calendar Grid Computations
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthName = currentDate.toLocaleString('default', { month: 'long' })
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarDays = useMemo(() => {
    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const dayEvents = events.filter(e => e.date === dateStr || (e.date <= dateStr && e.endDate >= dateStr))
      days.push({ dayNumber: d, dateStr, isCurrentMonth: true, events: dayEvents })
    }
    return days
  }, [year, month, firstDayOfMonth, daysInMonth, events])

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const handleOpenAdd = () => {
    setEditingEvent(null)
    setFormData({
      title: '',
      category: 'Academic & Exams',
      date: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      time: '09:00 AM - 01:00 PM',
      location: 'Main Auditorium',
      audience: 'All Students & Faculty',
      description: ''
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (evt) => {
    setEditingEvent(evt)
    setFormData({
      title: evt.title,
      category: evt.category,
      date: evt.date,
      endDate: evt.endDate || evt.date,
      time: evt.time,
      location: evt.location,
      audience: evt.audience,
      description: evt.description
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this event from the academic calendar?')) {
      const updated = events.filter(e => e.id !== id)
      saveEvents(updated)
      toast?.success?.('Calendar event removed.')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast?.error?.('Please enter an event title.')
      return
    }

    if (editingEvent) {
      const updated = events.map(e => e.id === editingEvent.id ? { ...e, ...formData } : e)
      saveEvents(updated)
      toast?.success?.(`Event "${formData.title}" updated successfully.`)
    } else {
      const newEvent = {
        id: `EVT-${Math.floor(100 + Math.random() * 900)}`,
        ...formData
      }
      saveEvents([newEvent, ...events])
      toast?.success?.(`Event "${formData.title}" scheduled on campus calendar.`)
    }
    setIsModalOpen(false)
  }

  const getCategoryBadgeColor = (cat) => {
    switch (cat) {
      case 'Academic & Exams': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Holidays & Gazetted': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Parent-Teacher Meeting (PTM)': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Sports & Co-Curricular': return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Staff Workshop': return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <CalendarCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Institutional Almanac • Academic Year Planning</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Events & Academic Calendar
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Master schedule for term examinations, gazetted holidays, parent-teacher conferences, and sports galas.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap no-print">
            <button
              onClick={() => {
                window.print()
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Calendar</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-academic-calendar, #printable-academic-calendar * { visibility: visible !important; }
          #printable-academic-calendar {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 8mm !important;
            background: white !important;
          }
          .no-print { display: none !important; }
          @page { size: A4 landscape; margin: 8mm; }
        }
      `}</style>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 no-print">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Events</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{events.length}</h3>
            <span className="text-[11px] text-purple-600 font-medium">Academic term calendar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Holidays & Breaks</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {events.filter(e => e.category === 'Holidays & Gazetted').length}
            </h3>
            <span className="text-[11px] text-emerald-600 font-medium">Gazetted off days</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Exams & Assessments</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {events.filter(e => e.category === 'Academic & Exams').length}
            </h3>
            <span className="text-[11px] text-blue-600 font-medium">Mid-term & finals</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PTMs & Meetings</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {events.filter(e => e.category === 'Parent-Teacher Meeting (PTM)').length}
            </h3>
            <span className="text-[11px] text-purple-600 font-medium">Guardian conferences</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Strip & View Toggle */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3 no-print">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event title, venue, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/70">
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'agenda' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda List
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'month' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month Grid
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div id="printable-academic-calendar">
        {/* Printable Header Letterhead */}
        <div className="hidden print:block text-center border-b-2 border-slate-900 pb-3 mb-4">
          <h2 className="text-lg font-black uppercase text-slate-900 tracking-wider">
            {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
          </h2>
          <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            OFFICIAL ACADEMIC ALMANAC & EVENTS CALENDAR • {year}
          </p>
        </div>

      {/* View Mode: Month Grid */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              {monthName} {year}
            </h2>
            <div className="flex items-center gap-1.5">
              <button
                onClick={prevMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => (
              <div
                key={idx}
                className={`min-h-[95px] p-2 rounded-xl border flex flex-col justify-between transition-colors ${
                  cell.isCurrentMonth 
                    ? 'border-slate-200/80 bg-white hover:border-purple-300' 
                    : 'border-transparent bg-slate-50/40 text-slate-300'
                }`}
              >
                <div className="text-right">
                  <span className={`text-xs font-bold ${cell.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}`}>
                    {cell.dayNumber || ''}
                  </span>
                </div>
                <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] scrollbar-none">
                  {cell.events?.map(ev => (
                    <div
                      key={ev.id}
                      onClick={() => handleOpenEdit(ev)}
                      className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800 truncate text-left cursor-pointer hover:bg-purple-200"
                      title={ev.title}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View Mode: Agenda List */}
      {viewMode === 'agenda' && (
        <div className="space-y-3.5">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800">No Scheduled Events Found</h3>
              <p className="text-xs text-slate-500 mt-1">Try modifying your filter or click "Schedule New Event".</p>
            </div>
          ) : (
            filteredEvents.map((evt) => (
              <div 
                key={evt.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f5eeff] text-purple-700 border border-purple-200 flex flex-col items-center justify-center font-bold shrink-0">
                    <span className="text-[10px] uppercase tracking-wider text-purple-500">
                      {new Date(evt.date).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-xl leading-none text-purple-900 font-black">
                      {new Date(evt.date).getDate()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryBadgeColor(evt.category)}`}>
                        {evt.category}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{evt.title}</h3>
                    </div>

                    <p className="text-xs text-slate-500 max-w-2xl">{evt.description}</p>

                    <div className="flex items-center gap-3 sm:gap-4 text-[11px] text-slate-500 flex-wrap pt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.time}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{evt.location}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-purple-700 font-semibold">{evt.audience}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <button
                    onClick={() => handleOpenEdit(evt)}
                    className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(evt.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      </div>

      {/* Modal: Schedule / Edit Event */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingEvent ? 'Edit Calendar Event' : 'Schedule New Event'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mid-Term Written Exams"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Event Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Audience</label>
                  <input
                    type="text"
                    placeholder="e.g. Grades 9-10 & Parents"
                    value={formData.audience}
                    onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM - 01:00 PM"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Venue</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Auditorium"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Notes</label>
                <textarea
                  rows="3"
                  placeholder="Outline event agenda, guidelines, or instructions for attendees..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  {editingEvent ? 'Save Changes' : 'Confirm & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusEventsCalendarView
