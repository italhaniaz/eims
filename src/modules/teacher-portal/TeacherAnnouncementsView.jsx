import React, { useState, useMemo } from 'react'
import {
  Megaphone,
  Plus,
  Filter,
  Eye,
  Trash2,
  Calendar,
  BookMarked,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  Send,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherAnnouncementsView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('All classes')
  const [selectedStatus, setSelectedStatus] = useState('All')

  // Applied Filters
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    className: 'All classes',
    status: 'All'
  })

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [viewingNotice, setViewingNotice] = useState(null)

  // Announcements Storage (Initialized with the exact 2 records from screenshot 3)
  const [notices, setNotices] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_notices')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return [
      {
        id: 'not-1',
        title: 'Summer Holidays',
        isAdmin: true,
        className: 'Institute-wide',
        date: '13 Jun 2026',
        status: 'Published',
        content: 'Summer vacation for all students will commence from June 15, 2026. School will reopen on August 15, 2026. Holiday homework has been dispatched.'
      },
      {
        id: 'not-2',
        title: '25 December Holiday!',
        isAdmin: true,
        className: 'Institute-wide',
        date: '15 Dec 2025',
        status: 'Published',
        content: 'The institute will remain closed on December 25 in observance of Quaid-e-Azam Day and Christmas. Regular classes will resume on the next working day.'
      }
    ]
  })

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    className: 'All classes',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status: 'Published',
    content: '',
    sendSms: false
  })

  // Apply Filter
  const handleApplyFilter = (e) => {
    e.preventDefault()
    setAppliedFilters({
      search: searchTerm.trim().toLowerCase(),
      className: selectedClass,
      status: selectedStatus
    })
    toast?.success?.('Filters applied.')
  }

  // Reset Filter
  const handleResetFilter = () => {
    setSearchTerm('')
    setSelectedClass('All classes')
    setSelectedStatus('All')
    setAppliedFilters({
      search: '',
      className: 'All classes',
      status: 'All'
    })
    toast?.info?.('Filters reset.')
  }

  // Filtered Notices
  const filteredNotices = useMemo(() => {
    return notices.filter((item) => {
      const matchSearch =
        !appliedFilters.search ||
        item.title?.toLowerCase().includes(appliedFilters.search) ||
        item.content?.toLowerCase().includes(appliedFilters.search)

      const matchClass =
        appliedFilters.className === 'All classes' ||
        item.className === appliedFilters.className ||
        item.className === 'Institute-wide'

      const matchStatus =
        appliedFilters.status === 'All' || item.status === appliedFilters.status

      return matchSearch && matchClass && matchStatus
    })
  }, [notices, appliedFilters])

  // Save New Notice
  const handleSaveNotice = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast?.error?.('Please enter a notice title.')
      return
    }

    const newNotice = {
      id: `not-${Date.now()}`,
      title: formData.title.trim(),
      isAdmin: false,
      className: formData.className,
      date: formData.date,
      status: formData.status,
      content: formData.content || 'Class announcement for students and parents.'
    }

    const updated = [newNotice, ...notices]
    setNotices(updated)
    try {
      localStorage.setItem('teacher_portal_notices', JSON.stringify(updated))
    } catch {}

    toast?.success?.('Announcement published successfully!')
    setIsNewModalOpen(false)
    setFormData({
      title: '',
      className: 'All classes',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'Published',
      content: '',
      sendSms: false
    })
  }

  // Delete Notice
  const handleDeleteNotice = (id) => {
    const updated = notices.filter((n) => n.id !== id)
    setNotices(updated)
    try {
      localStorage.setItem('teacher_portal_notices', JSON.stringify(updated))
    } catch {}
    toast?.success?.('Notice deleted.')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>My Announcements</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (Announcements Active) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <Megaphone className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Announcements</span>
          </div>
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
          <button
            onClick={() => onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer px-2 py-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          {/* Header Row matching Screenshot 3 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Announcements
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                View institute notices and create announcements for your classes
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Notice</span>
            </button>
          </div>

          {/* Filter Bar Row matching Screenshot 3 */}
          <form
            onSubmit={handleApplyFilter}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
          >
            {/* Search */}
            <div className="lg:col-span-4 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Title..."
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              />
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
                <option value="All classes">All classes</option>
                <option value="Institute-wide">Institute-wide</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
              </select>
            </div>

            {/* Status */}
            <div className="lg:col-span-3 space-y-1">
              <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value="All">All</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
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

          {/* TABLE MATCHING SCREENSHOT 3 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-center w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 text-xs">
                      No announcements found.
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* # */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Title + Admin Badge */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.isAdmin && (
                            <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500 text-white shadow-2xs">
                              Admin
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Class Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-sky-500 text-white shadow-2xs">
                          {item.className}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {item.date}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                          {item.status}
                        </span>
                      </td>

                      {/* Action Button: Blue Eye */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setViewingNotice(item)}
                          title="View Notice Details"
                          className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-600 text-white inline-flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
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
      {/* 3. NEW NOTICE MODAL */}
      {/* ========================================================= */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-600" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Publish New Notice
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sports Day Announcement, Class Test Notice..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Target Class / Audience
                  </label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="All classes">All classes</option>
                    <option value="Institute-wide">Institute-wide</option>
                    <option value="Nursery">Nursery</option>
                    <option value="Prep">Prep</option>
                    <option value="Class 1">Class 1</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                  >
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Notice Details / Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter the official notice body text..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="notice-sms"
                  checked={formData.sendSms}
                  onChange={(e) => setFormData({ ...formData, sendSms: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="notice-sms" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                  Send SMS notification to parents
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Publish Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW NOTICE DETAILS MODAL */}
      {/* ========================================================= */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-sky-600" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Official Announcement
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {viewingNotice.title}
                  </h3>
                  {viewingNotice.isAdmin && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-white">
                      Admin Notice
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold">
                  <span>Target: {viewingNotice.className}</span>
                  <span>•</span>
                  <span>Date: {viewingNotice.date}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-bold">{viewingNotice.status}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                {viewingNotice.content}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                {!viewingNotice.isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      handleDeleteNotice(viewingNotice.id)
                      setViewingNotice(null)
                    }}
                    className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Delete Notice
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setViewingNotice(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer ml-auto"
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
