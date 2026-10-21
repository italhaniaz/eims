import React, { useState, useMemo } from 'react'
import { Megaphone, Plus, Search, Calendar, Tag, Trash2, Pin, Bell } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const NoticeBoardView = ({ currentInstitute }) => {
  const { notices = [], addItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    audience: 'All Students & Parents',
    content: ''
  })

  const instNotices = notices.filter(n => !n.instituteId || n.instituteId === currentInstitute?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('Title and message content are required.')
      return
    }

    const newNotice = {
      title: formData.title,
      category: formData.category,
      audience: formData.audience,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    await addItem('notices', newNotice)
    toast.success('Notice published to campus board!')
    setIsModalOpen(false)
    setFormData({ title: '', category: 'General', audience: 'All Students & Parents', content: '' })
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete notice "${title}"?`)) {
      await deleteItem('notices', id)
      toast.success('Notice removed.')
    }
  }

  const filteredNotices = useMemo(() => {
    return instNotices.filter(n => {
      const matchesSearch = 
        (n.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.content || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCat = selectedCategory === 'All' || n.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [instNotices, searchTerm, selectedCategory])

  const getBadgeColor = (category) => {
    switch (category) {
      case 'Exam': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Academic': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus Digital Notice Board</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Publish circulars, exam dates, fee deadlines, and administrative notifications</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, subject, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'General', 'Exam', 'Urgent', 'Academic'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((n) => (
            <div key={n.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(n.category)}`}>
                    {n.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {n.date}
                    </span>
                    <button
                      onClick={() => handleDelete(n.id, n.title)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-1"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-4 leading-relaxed">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Audience: <strong className="text-slate-700">{n.audience}</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Broadcasted
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Circulars Found</h3>
          <p className="text-xs text-slate-400 mt-1">Publish an announcement or clear search filters.</p>
        </div>
      )}

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Campus Circular / Notice"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Winter Break Schedule Announcement"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All Students & Parents">All Students & Parents</option>
                <option value="Students Only">Students Only</option>
                <option value="Parents Only">Parents Only</option>
                <option value="Faculty & Staff">Faculty & Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Circular Message *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Enter full notice text..."
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow"
            >
              Publish Notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NoticeBoardView
