import React, { useState, useMemo } from 'react'
import {
  FileText,
  Video,
  Search,
  Filter,
  RotateCcw,
  Plus,
  Download,
  Eye,
  Trash2,
  Paperclip,
  Calendar,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  Play,
  Upload,
  FolderOpen
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherClassResourcesView({
  onBack,
  onOpenModal,
  resourceType = 'handouts', // 'handouts' | 'recorded-lectures'
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('All')
  const [selectedSubject, setSelectedSubject] = useState('All')

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    className: 'All',
    subject: 'All'
  })

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [viewingResource, setViewingResource] = useState(null)

  // Handouts storage
  const [handouts, setHandouts] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_handouts')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Recorded lectures storage
  const [lectures, setLectures] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_lectures')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Form State for Handout / Lecture
  const [formData, setFormData] = useState({
    title: '',
    className: 'Nursery',
    subject: 'English',
    lecturer: teacherName,
    attachmentName: '',
    videoUrl: '',
    notes: ''
  })

  // Apply filter
  const handleApplyFilter = (e) => {
    e.preventDefault()
    setAppliedFilters({
      search: searchTerm.trim().toLowerCase(),
      className: selectedClass,
      subject: selectedSubject
    })
    toast?.success?.('Filters applied.')
  }

  // Reset filter
  const handleResetFilter = () => {
    setSearchTerm('')
    setSelectedClass('All')
    setSelectedSubject('All')
    setAppliedFilters({
      search: '',
      className: 'All',
      subject: 'All'
    })
    toast?.info?.('Filters reset.')
  }

  // Current list based on type
  const isHandout = resourceType === 'handouts'
  const currentList = isHandout ? handouts : lectures

  // Filtered items
  const filteredItems = useMemo(() => {
    return currentList.filter((item) => {
      const matchSearch =
        !appliedFilters.search ||
        item.title?.toLowerCase().includes(appliedFilters.search) ||
        item.lecturer?.toLowerCase().includes(appliedFilters.search) ||
        item.notes?.toLowerCase().includes(appliedFilters.search)

      const matchClass =
        appliedFilters.className === 'All' || item.className === appliedFilters.className

      const matchSubject =
        appliedFilters.subject === 'All' || item.subject === appliedFilters.subject

      return matchSearch && matchClass && matchSubject
    })
  }, [currentList, appliedFilters])

  // Save new resource
  const handleSaveResource = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast?.error?.('Please enter a title.')
      return
    }

    const todayDate = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })

    if (isHandout) {
      const newHandout = {
        id: `hnd-${Date.now()}`,
        title: formData.title.trim(),
        className: formData.className,
        subject: formData.subject,
        lecturer: formData.lecturer || teacherName,
        attachment: formData.attachmentName || 'handout_worksheet.pdf',
        updated: todayDate,
        notes: formData.notes
      }
      const updated = [newHandout, ...handouts]
      setHandouts(updated)
      try {
        localStorage.setItem('teacher_portal_handouts', JSON.stringify(updated))
      } catch {}
      toast?.success?.('Handout uploaded successfully!')
    } else {
      const newLecture = {
        id: `lec-${Date.now()}`,
        title: formData.title.trim(),
        className: formData.className,
        subject: formData.subject,
        lecturer: formData.lecturer || teacherName,
        videoUrl: formData.videoUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        updated: todayDate,
        notes: formData.notes
      }
      const updated = [newLecture, ...lectures]
      setLectures(updated)
      try {
        localStorage.setItem('teacher_portal_lectures', JSON.stringify(updated))
      } catch {}
      toast?.success?.('Recorded lecture added successfully!')
    }

    setIsAddModalOpen(false)
    setFormData({
      title: '',
      className: 'Nursery',
      subject: 'English',
      lecturer: teacherName,
      attachmentName: '',
      videoUrl: '',
      notes: ''
    })
  }

  // Delete item
  const handleDeleteItem = (id) => {
    if (isHandout) {
      const updated = handouts.filter((h) => h.id !== id)
      setHandouts(updated)
      try {
        localStorage.setItem('teacher_portal_handouts', JSON.stringify(updated))
      } catch {}
      toast?.success?.('Handout removed.')
    } else {
      const updated = lectures.filter((l) => l.id !== id)
      setLectures(updated)
      try {
        localStorage.setItem('teacher_portal_lectures', JSON.stringify(updated))
      } catch {}
      toast?.success?.('Recorded lecture removed.')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            {isHandout ? (
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : (
              <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span>{isHandout ? 'Handouts' : 'Recorded Lectures'}</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header Row matching screenshots 1 & 2 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                {isHandout ? (
                  <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                ) : (
                  <Video className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                )}
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {isHandout ? 'Handouts' : 'Recorded Lectures'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isHandout
                  ? 'Learning handouts for your classes'
                  : 'Recorded lectures for your classes'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isHandout ? 'Upload Handout' : 'Add Recorded Lecture'}</span>
            </button>
          </div>

          {/* Filter Bar Row matching screenshots 1 & 2 */}
          <form
            onSubmit={handleApplyFilter}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            {/* Search */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isHandout
                      ? 'Title, description or lecturer'
                      : 'Title, notes or lecturer'
                  }
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Class */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
              </select>
            </div>

            {/* Subject */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="All">All</option>
                <option value="English">English</option>
                <option value="Math">Math</option>
                <option value="Play Activity">Play Activity</option>
                <option value="General Science">General Science</option>
              </select>
            </div>

            {/* Actions: Apply & Reset */}
            <div className="lg:col-span-2 flex items-center gap-2">
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Filter className="w-3.5 h-3.5" />
                <span>Apply</span>
              </button>
              <button
                type="button"
                onClick={handleResetFilter}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 px-2.5 py-2 cursor-pointer transition-colors"
              >
                Reset
              </button>
            </div>
          </form>

          {/* TABLE MATCHING SCREENSHOTS 1 & 2 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Lecturer</th>
                  {isHandout && <th className="py-3 px-4">Attachment</th>}
                  <th className="py-3 px-4">Updated</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isHandout ? 7 : 6}
                      className="py-12 text-center text-slate-400 text-xs"
                    >
                      {isHandout
                        ? 'No handouts found.'
                        : 'No recorded lectures found.'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        {item.title}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                        {item.className}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-300">
                        {item.subject}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                        {item.lecturer}
                      </td>
                      {isHandout && (
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-sky-600 hover:underline cursor-pointer">
                            <Paperclip className="w-3 h-3" />
                            <span>{item.attachment}</span>
                          </span>
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-slate-500">{item.updated}</td>
                      <td className="py-3.5 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingResource(item)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 hover:bg-sky-100 transition-colors cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. UPLOAD / ADD MODAL */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isHandout ? 'Upload New Handout' : 'Add Recorded Lecture'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder={
                    isHandout
                      ? 'e.g. Chapter 4 Practice Handout'
                      : 'e.g. Phonics & Pronunciation Video'
                  }
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Class
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Nursery">Nursery</option>
                    <option value="Prep">Prep</option>
                    <option value="Class 1">Class 1</option>
                    <option value="Class 2">Class 2</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="English">English</option>
                    <option value="Math">Math</option>
                    <option value="Play Activity">Play Activity</option>
                    <option value="General Science">General Science</option>
                  </select>
                </div>
              </div>

              {isHandout ? (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Attachment File Name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.attachmentName}
                      onChange={(e) =>
                        setFormData({ ...formData, attachmentName: e.target.value })
                      }
                      placeholder="e.g. alphabet_worksheet.pdf"
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Video URL / Link
                  </label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="e.g. https://www.youtube.com/watch?v=..."
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Description / Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes for students or teaching instructions..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  {isHandout ? 'Save Handout' : 'Save Lecture'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW RESOURCE MODAL */}
      {/* ========================================================= */}
      {viewingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                {isHandout ? 'Handout Preview' : 'Recorded Lecture Preview'}
              </span>
              <button
                type="button"
                onClick={() => setViewingResource(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {viewingResource.title}
              </h3>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingResource.className}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingResource.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Lecturer</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingResource.lecturer}</span>
                </div>
              </div>

              {isHandout ? (
                <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-sky-800 dark:text-sky-200">
                    <Paperclip className="w-4 h-4 text-sky-600" />
                    <span>{viewingResource.attachment}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast?.success?.(`Downloading ${viewingResource.attachment}...`)}
                    className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-bold flex items-center gap-1 hover:bg-sky-700 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ) : (
                <div className="aspect-video w-full rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 relative overflow-hidden">
                  <div className="flex flex-col items-center gap-2">
                    <Play className="w-12 h-12 text-white/80 hover:text-white hover:scale-110 transition-all cursor-pointer" />
                    <span className="text-xs text-slate-300">Click to Play Video Lecture</span>
                  </div>
                </div>
              )}

              {viewingResource.notes && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Notes & Instructions
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    {viewingResource.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewingResource(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
