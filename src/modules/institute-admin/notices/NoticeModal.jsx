// src/modules/institute-admin/notices/NoticeModal.jsx
import React, { useState, useEffect } from 'react'
import { 
  Megaphone, 
  X, 
  School, 
  Building2, 
  GraduationCap, 
  Layers, 
  Pin, 
  AlertTriangle, 
  Info, 
  Check, 
  Calendar, 
  User 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { 
  ACADEMIC_TIERS, 
  TIER_CATEGORIES, 
  TIER_AUDIENCES, 
  NOTICE_PRIORITIES 
} from './noticeService'

export const NoticeModal = ({
  isOpen,
  onClose,
  initialData = null,
  onSaveNotice,
  activeTier = 'all'
}) => {
  const isEditing = Boolean(initialData?.id)

  const [formData, setFormData] = useState({
    title: '',
    tier: activeTier !== 'all' ? activeTier : 'all',
    category: 'General',
    audience: 'All Students & Parents',
    priority: 'medium',
    author: '',
    content: '',
    pinned: false,
    date: new Date().toISOString().split('T')[0]
  })

  // Synchronize when initialData or activeTier changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        tier: initialData.tier || (activeTier !== 'all' ? activeTier : 'all'),
        category: initialData.category || 'General',
        audience: initialData.audience || 'All Students & Parents',
        priority: initialData.priority || 'medium',
        author: initialData.author || '',
        content: initialData.content || '',
        pinned: Boolean(initialData.pinned),
        date: initialData.date || new Date().toISOString().split('T')[0]
      })
    } else {
      const defaultTier = activeTier !== 'all' ? activeTier : 'school'
      setFormData({
        title: '',
        tier: defaultTier,
        category: TIER_CATEGORIES[defaultTier]?.[0] || 'General',
        audience: TIER_AUDIENCES[defaultTier]?.[0] || 'All Students & Parents',
        priority: 'medium',
        author: defaultTier === 'university' ? 'Office of the Registrar' : defaultTier === 'college' ? 'Office of the Principal' : 'School Administration',
        content: '',
        pinned: false,
        date: new Date().toISOString().split('T')[0]
      })
    }
  }, [initialData, activeTier, isOpen])

  // Handle tier change -> update categories and audiences accordingly
  const handleTierChange = (newTier) => {
    const categories = TIER_CATEGORIES[newTier] || TIER_CATEGORIES.all
    const audiences = TIER_AUDIENCES[newTier] || TIER_AUDIENCES.all
    setFormData(prev => ({
      ...prev,
      tier: newTier,
      category: categories[0] || 'General',
      audience: audiences[0] || 'All',
      author: prev.author || (newTier === 'university' ? 'Office of the Registrar' : newTier === 'college' ? 'Office of the Principal' : 'School Administration')
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in both the notice title and description.')
      return
    }

    onSaveNotice({
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
      author: formData.author.trim() || 'Campus Administration'
    })
    onClose()
  }

  const categories = TIER_CATEGORIES[formData.tier] || TIER_CATEGORIES.all
  const audiences = TIER_AUDIENCES[formData.tier] || TIER_AUDIENCES.all

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Campus Notice' : 'Create New Notice'}
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans text-slate-800">
        {/* Academic Tier Selection Tabs */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1.5">
            Select Academic Tier / Wing *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {ACADEMIC_TIERS.map(t => {
              const isSelected = formData.tier === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTierChange(t.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-bold">{t.label.split('/')[0].trim()}</span>
                  <span className="text-[10px] text-slate-400 block font-normal mt-0.5 truncate">{t.description.split('&')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Notice Title */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Notice Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Change in School Timings / Examination Schedule / Convocation Directive"
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
          />
        </div>

        {/* Description / Content Textarea */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Description *
          </label>
          <textarea
            required
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Write notice details and comprehensive directives..."
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 bg-white"
          />
        </div>

        {/* Priority & Author (as in user's modal reference image 2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent / Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Author
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              placeholder="e.g. Samar Ali / Principal Office"
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        </div>

        {/* Category & Target Audience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Target Audience
            </label>
            <select
              value={formData.audience}
              onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium"
            >
              {audiences.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pin to Top & Publication Date */}
        <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">Pin to Top of Notice Board</span>
              <span className="text-[10px] text-amber-700">Display this circular highlighted at the top of the feed</span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={formData.pinned}
            onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-sm transition-all cursor-pointer"
          >
            {isEditing ? 'Update Notice' : 'Publish Notice'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NoticeModal
