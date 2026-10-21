import React, { useState } from 'react'
import { Megaphone, Plus, Search, Calendar, Tag, Trash2, Pin, Bell } from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const NoticeBoardView = ({ currentInstitute }) => {
  const [notices, setNotices] = useState([
    {
      id: 'not-1',
      title: 'Upcoming Midterm Examination Schedule Announcement',
      category: 'Exam',
      date: '2026-10-20',
      audience: 'All Students & Parents',
      pinned: true,
      content: 'Midterm examinations for classes 9, 10, 11 and 12 will commence from next Monday. Roll number slips and date sheets are issued to all students.'
    },
    {
      id: 'not-2',
      title: 'Parent-Teacher Conference (PTC) Meeting',
      category: 'General',
      date: '2026-10-24',
      audience: 'Parents',
      pinned: false,
      content: 'Parent-Teacher meeting is scheduled for Saturday between 09:00 AM to 01:00 PM. Parents are encouraged to discuss their child academic performance and attendance.'
    },
    {
      id: 'not-3',
      title: 'Fall Semester Fee Submission Reminder',
      category: 'Urgent',
      date: '2026-10-28',
      audience: 'Students',
      pinned: false,
      content: 'All parents and guardians are requested to clear pending tuition fee dues on or before the due date to avoid late fee surcharges.'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    audience: 'All Students & Parents',
    content: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) return

    const newNotice = {
      id: `not-${Date.now()}`,
      title: formData.title,
      category: formData.category,
      audience: formData.audience,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      pinned: false
    }

    setNotices([newNotice, ...notices])
    setIsModalOpen(false)
    setFormData({ title: '', category: 'General', audience: 'All Students & Parents', content: '' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this circular notification?')) {
      setNotices(notices.filter(n => n.id !== id))
    }
  }

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Exam': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Holiday': return 'bg-amber-50 text-amber-700 border-amber-200'
      default: return 'bg-blue-50 text-blue-700 border-blue-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus Notice Board & Circulars</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Publish campus circulars, holiday notices, and parent-teacher meeting alerts</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Notice Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {notices.map((n) => (
          <div key={n.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getCategoryBadge(n.category)}`}>
                    {n.category}
                  </span>
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {n.date}
                  </span>
                </div>
                {n.pinned && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Pin className="w-3 h-3" /> Pinned
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">{n.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{n.content}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Target Audience: <strong className="text-slate-700">{n.audience}</strong></span>
              <button
                onClick={() => handleDelete(n.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Campus Circular Notice"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notice Title / Subject</label>
            <input
              type="text"
              required
              placeholder="e.g. Winter Break Holidays Announcement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notice Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="General">General Circular</option>
                <option value="Exam">Examination Schedule</option>
                <option value="Holiday">Holidays & Vacations</option>
                <option value="Urgent">Urgent Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="All Students & Parents">All Students & Parents</option>
                <option value="Parents Only">Parents Only</option>
                <option value="Teaching Faculty">Teaching Faculty</option>
                <option value="High School Classes">High School Classes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notice Description / Content</label>
            <textarea
              rows={4}
              required
              placeholder="Enter circular details and instructions..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold">Publish Notice</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NoticeBoardView
