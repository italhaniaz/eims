import React, { useState, useMemo } from 'react'
import {
  BookMarked,
  Paperclip,
  GraduationCap,
  Bookmark,
  Plus,
  Eye,
  Edit2,
  Trash2,
  MessageSquare,
  FileText,
  Calendar,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Sparkles,
  Info
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherAssignmentsView({
  onBack,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Selected class filter
  const [selectedClassFilter, setSelectedClassFilter] = useState('All classes')

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewingAssignment, setViewingAssignment] = useState(null)
  const [editingAssignment, setEditingAssignment] = useState(null)
  const [smsModalAssignment, setSmsModalAssignment] = useState(null)

  // Assignments State (Initialized with demo entries from screenshot, persisted in localStorage)
  const [assignments, setAssignments] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_assignments')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return [
      {
        id: 'asg-1',
        sn: 1,
        title: 'module intro',
        hasImage: true,
        subject: 'English',
        className: 'Nursery',
        date: '21 May 2026',
        description: 'Read the introductory module and complete the tracing exercises on pages 4-6.',
        smsStatus: 'Never'
      },
      {
        id: 'asg-2',
        sn: 2,
        title: 'First Assignment',
        hasImage: true,
        subject: 'English',
        className: 'Nursery',
        date: '19 May 2026',
        description: 'Write alphabets A through H in your four-line English practice notebook.',
        smsStatus: 'Never'
      },
      {
        id: 'asg-3',
        sn: 3,
        title: 'Daily HomeWork',
        hasImage: false,
        subject: 'English',
        className: 'Nursery',
        date: '15 Jan 2026',
        description: 'Daily phonics practice and coloring sheet for fruits and vegetables.',
        smsStatus: 'Never'
      }
    ]
  })

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    className: 'Nursery',
    subject: 'English',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    hasImage: true,
    description: '',
    sendSms: false
  })

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    if (selectedClassFilter === 'All classes') return assignments
    return assignments.filter((a) => a.className === selectedClassFilter)
  }, [assignments, selectedClassFilter])

  // KPIs
  const stats = useMemo(() => {
    const total = assignments.length
    const withAttachments = assignments.filter((a) => a.hasImage).length
    const classesCount = new Set(assignments.map((a) => a.className)).size || 1
    const subjectsCount = new Set(assignments.map((a) => a.subject)).size || 1
    return {
      total,
      withAttachments,
      classesCount,
      subjectsCount
    }
  }, [assignments])

  // Save new assignment
  const handleSaveAssignment = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast?.error?.('Please enter an assignment title.')
      return
    }

    if (editingAssignment) {
      const updated = assignments.map((item) =>
        item.id === editingAssignment.id
          ? {
              ...item,
              title: formData.title.trim(),
              className: formData.className,
              subject: formData.subject,
              hasImage: formData.hasImage,
              description: formData.description
            }
          : item
      )
      setAssignments(updated)
      try {
        localStorage.setItem('teacher_portal_assignments', JSON.stringify(updated))
      } catch {}
      toast?.success?.('Assignment updated successfully!')
      setEditingAssignment(null)
    } else {
      const newEntry = {
        id: `asg-${Date.now()}`,
        sn: assignments.length + 1,
        title: formData.title.trim(),
        hasImage: formData.hasImage,
        subject: formData.subject,
        className: formData.className,
        date: formData.date,
        description: formData.description || 'Complete the assigned exercises in class notebook.',
        smsStatus: formData.sendSms ? 'Sent' : 'Never'
      }
      const updated = [newEntry, ...assignments]
      setAssignments(updated)
      try {
        localStorage.setItem('teacher_portal_assignments', JSON.stringify(updated))
      } catch {}
      toast?.success?.('New assignment posted successfully!')
      setIsCreateModalOpen(false)
    }

    setFormData({
      title: '',
      className: 'Nursery',
      subject: 'English',
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      hasImage: true,
      description: '',
      sendSms: false
    })
  }

  // Delete Assignment
  const handleDelete = (id) => {
    const updated = assignments.filter((a) => a.id !== id)
    setAssignments(updated)
    try {
      localStorage.setItem('teacher_portal_assignments', JSON.stringify(updated))
    } catch {}
    toast?.success?.('Assignment deleted.')
  }

  // Open Edit Modal
  const handleStartEdit = (item) => {
    setEditingAssignment(item)
    setFormData({
      title: item.title,
      className: item.className,
      subject: item.subject,
      date: item.date,
      hasImage: item.hasImage,
      description: item.description || '',
      sendSms: false
    })
    setIsCreateModalOpen(true)
  }

  // Send SMS
  const handleSendSms = (e) => {
    e.preventDefault()
    if (!smsModalAssignment) return
    const updated = assignments.map((a) =>
      a.id === smsModalAssignment.id ? { ...a, smsStatus: 'Sent' } : a
    )
    setAssignments(updated)
    try {
      localStorage.setItem('teacher_portal_assignments', JSON.stringify(updated))
    } catch {}
    toast?.success?.(`SMS dispatched to ${smsModalAssignment.className} parents!`)
    setSmsModalAssignment(null)
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Assignments</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar (Assignments Active) */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-3 py-1.5 rounded-xl border border-sky-200 dark:border-sky-800 font-bold shadow-2xs">
            <BookMarked className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span>Assignments</span>
          </div>
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
        {/* ROW 1: 4 KPI CARDS (Matching Screenshot 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Assignments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-black text-sm shadow-sm shadow-sky-500/30">
              MM
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Assignments
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.total}
              </h3>
            </div>
          </div>

          {/* Card 2: With attachments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500 text-white flex items-center justify-center font-bold shadow-sm shadow-teal-500/30">
              <Paperclip className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                With attachments
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.withAttachments}
              </h3>
            </div>
          </div>

          {/* Card 3: Classes */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Classes
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.classesCount}
              </h3>
            </div>
          </div>

          {/* Card 4: Subjects */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-sm shadow-orange-500/30">
              <Bookmark className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Subjects
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {stats.subjectsCount}
              </h3>
            </div>
          </div>
        </div>

        {/* ROW 2: MAIN CARD WITH TABLE (Matching Screenshot 3) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-slate-500" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Assignments
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Share and manage classwork, handouts, notes or study material for your classes.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingAssignment(null)
                setIsCreateModalOpen(true)
              }}
              className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Assignment / Handout</span>
            </button>
          </div>

          {/* Filter Bar Row */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Class</span>
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500 cursor-pointer"
              >
                <option value="All classes">All classes</option>
                <option value="Nursery">Nursery</option>
                <option value="Prep">Prep</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 ml-auto sm:ml-0">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Select a class to filter by subject and send SMS.</span>
            </div>
          </div>

          {/* TABLE MATCHING SCREENSHOT 3 */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">S/N</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 w-32 text-center">Actions</th>
                  <th className="py-3 px-4 w-20 text-center">SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">
                      No assignments found for {selectedClassFilter}.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      {/* S/N */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Title + Thumbnail Badge */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span>{item.title}</span>
                          {item.hasImage && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-white shadow-2xs">
                              <ImageIcon className="w-2.5 h-2.5" />
                              <span>has image</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.subject}
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4 font-semibold text-slate-600 dark:text-slate-400">
                        {item.className}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                        {item.date}
                      </td>

                      {/* 3 Action Buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* 1. View Button (Blue square) */}
                          <button
                            type="button"
                            onClick={() => setViewingAssignment(item)}
                            title="View Assignment"
                            className="w-7 h-7 rounded-lg bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* 2. Edit Button (Orange square) */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            title="Edit Assignment"
                            className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Delete Button (Red square) */}
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            title="Delete Assignment"
                            className="w-7 h-7 rounded-lg bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* SMS Button (Green square with speech bubble) */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSmsModalAssignment(item)}
                          className="inline-flex flex-col items-center justify-center group cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-500 group-hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xs transition-colors">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[10px] text-slate-400 group-hover:text-emerald-600 font-semibold mt-0.5">
                            {item.smsStatus || 'Never'}
                          </span>
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
      {/* 3. CREATE / EDIT ASSIGNMENT MODAL */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-sky-600" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {editingAssignment ? 'Edit Assignment' : 'New Assignment / Handout'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignment} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Module Intro, Chapter 2 Practice..."
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
                    <option value="General Science">General Science</option>
                    <option value="Play Activity">Play Activity</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Description / Homework Instructions
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed instructions for students and parents..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="has-img"
                    checked={formData.hasImage}
                    onChange={(e) => setFormData({ ...formData, hasImage: e.target.checked })}
                    className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="has-img" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                    Attach Image / Handout
                  </label>
                </div>

                {!editingAssignment && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="sms-notif"
                      checked={formData.sendSms}
                      onChange={(e) => setFormData({ ...formData, sendSms: e.target.checked })}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="sms-notif" className="text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer select-none">
                      Send SMS to parents
                    </label>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  {editingAssignment ? 'Update Assignment' : 'Post Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. VIEW ASSIGNMENT DETAILS MODAL */}
      {/* ========================================================= */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                Assignment Details
              </span>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {viewingAssignment.title}
                </h3>
                {viewingAssignment.hasImage && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold bg-cyan-500 text-white">
                    <ImageIcon className="w-3 h-3" />
                    <span>has image</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAssignment.className}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Subject</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAssignment.subject}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Posted Date</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">{viewingAssignment.date}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                  Instructions & Homework
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
                  {viewingAssignment.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. SMS BROADCAST MODAL */}
      {/* ========================================================= */}
      {smsModalAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Send Assignment SMS Alert
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSmsModalAssignment(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSms} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Broadcast an instant SMS alert to all registered parents of <strong>{smsModalAssignment.className}</strong> for <strong>"{smsModalAssignment.title}"</strong>.
              </p>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <p className="font-bold text-sky-600">Sample SMS Preview:</p>
                <p className="italic text-slate-600 dark:text-slate-400">
                  "Dear Parent, a new {smsModalAssignment.subject} assignment '{smsModalAssignment.title}' has been uploaded for {smsModalAssignment.className}. Please check the student portal."
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSmsModalAssignment(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send SMS Now</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
