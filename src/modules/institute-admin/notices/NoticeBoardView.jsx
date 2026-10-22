// src/modules/institute-admin/notices/NoticeBoardView.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { 
  Megaphone, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  Trash2, 
  Pin, 
  Bell, 
  Printer, 
  School, 
  Building2,
  GraduationCap,
  Layers,
  CheckCircle2, 
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Edit3,
  Download,
  Filter,
  List,
  LayoutGrid,
  Check,
  User,
  ShieldAlert
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { 
  ACADEMIC_TIERS, 
  TIER_CATEGORIES, 
  TIER_AUDIENCES, 
  NOTICE_PRIORITIES, 
  getStoredNotices, 
  saveStoredNotices, 
  formatDateDDMMYYYY, 
  exportNoticesCSV 
} from './noticeService'
import NoticeModal from './NoticeModal'

export const NoticeBoardView = ({ currentInstitute }) => {
  const { 
    notices = [], 
    addItem, 
    updateItem, 
    deleteItem, 
    logAuditEvent,
    activeProgramLevel = 'all' 
  } = useAppData()
  const { toast } = useToast()

  // Clean stale legacy demo keys on mount
  useEffect(() => {
    try {
      localStorage.removeItem('sms_notices_demo_seed')
    } catch (e) {}
  }, [])

  // Map activeProgramLevel to notice tiers ('school', 'college', 'university', 'all')
  const initialTier = useMemo(() => {
    if (activeProgramLevel === 'college' || activeProgramLevel === 'higher-secondary') return 'college'
    if (activeProgramLevel === 'university') return 'university'
    if (activeProgramLevel === 'elementary' || activeProgramLevel === 'secondary' || activeProgramLevel === 'preschool') return 'school'
    return 'all'
  }, [activeProgramLevel])

  // Active Tier Tab: 'all' | 'school' | 'college' | 'university'
  const [activeTier, setActiveTier] = useState(initialTier)

  // Layout View Mode: 'list' (matching user reference image 1) vs 'grid'
  const [viewMode, setViewMode] = useState('list')

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriority, setSelectedPriority] = useState('All')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState(null)
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState(null)

  // Filter notices by current campus
  const instNotices = useMemo(() => {
    return notices.filter(n => !n.instituteId || !currentInstitute?.id || n.instituteId === currentInstitute.id)
  }, [notices, currentInstitute])

  // Tier counts
  const tierCounts = useMemo(() => {
    return {
      all: instNotices.length,
      school: instNotices.filter(n => n.tier === 'school' || n.tier === 'all').length,
      college: instNotices.filter(n => n.tier === 'college' || n.tier === 'all').length,
      university: instNotices.filter(n => n.tier === 'university' || n.tier === 'all').length
    }
  }, [instNotices])

  // Filter notices based on tier, search, category, and priority
  const filteredNotices = useMemo(() => {
    const list = instNotices.filter(n => {
      // 1. Tier Filter
      const matchesTier = activeTier === 'all' || n.tier === activeTier || n.tier === 'all'

      // 2. Search
      const s = (searchTerm || '').toLowerCase()
      const matchesSearch = 
        (n.title || '').toLowerCase().includes(s) ||
        (n.content || '').toLowerCase().includes(s) ||
        (n.author || '').toLowerCase().includes(s) ||
        (n.category || '').toLowerCase().includes(s)

      // 3. Category
      const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory

      // 4. Priority
      const matchesPriority = selectedPriority === 'All' || n.priority === selectedPriority

      return matchesTier && matchesSearch && matchesCategory && matchesPriority
    })

    // Sort: Pinned first, then newest by date
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date || 0) - new Date(a.date || 0)
    })
  }, [instNotices, activeTier, searchTerm, selectedCategory, selectedPriority])

  // Categories available for currently active tier
  const activeCategories = useMemo(() => {
    return ['All', ...(TIER_CATEGORIES[activeTier] || TIER_CATEGORIES.all)]
  }, [activeTier])

  // Handle Save Notice (Create or Update)
  const handleSaveNotice = async (noticeData) => {
    if (noticeData.id && updateItem) {
      // Update existing
      await updateItem('notices', noticeData.id, noticeData)
      if (logAuditEvent) {
        logAuditEvent(`Updated notice circular: "${noticeData.title}"`, 'Notice Board Admin', 'Success')
      }
      toast.success('Notice circular updated!')
    } else {
      // Create new
      const newRecord = {
        ...noticeData,
        instituteId: currentInstitute?.id || 'inst-1'
      }
      await addItem('notices', newRecord)
      if (logAuditEvent) {
        logAuditEvent(`Published notice circular: "${noticeData.title}"`, 'Notice Board Admin', 'Success')
      }
      toast.success('Notice published to campus board!')
    }
    setEditingNotice(null)
  }

  // Handle Delete
  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete notice "${title}"?`)) {
      await deleteItem('notices', id)
      if (logAuditEvent) {
        logAuditEvent(`Removed notice: "${title}"`, 'Notice Board Admin', 'Success')
      }
      toast.success('Notice removed.')
    }
  }

  // Toggle Pin Status
  const togglePin = async (notice) => {
    const nextPinned = !notice.pinned
    if (updateItem) {
      await updateItem('notices', notice.id, { pinned: nextPinned })
    }
    if (logAuditEvent) {
      logAuditEvent(`${nextPinned ? 'Pinned' : 'Unpinned'} notice: "${notice.title}"`, 'Notice Board Admin', 'Success')
    }
    toast.success(nextPinned ? 'Circular pinned to top of notice board!' : 'Circular unpinned.')
  }

  // Helper for priority pill styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return { label: 'urgent', bg: 'bg-red-50 text-red-700 border-red-300 font-bold', icon: 'alert' }
      case 'high':
        return { label: 'high', bg: 'bg-rose-50 text-rose-700 border-rose-200 font-bold', icon: 'alert' }
      case 'medium':
        return { label: 'medium', bg: 'bg-amber-50 text-amber-800 border-amber-200 font-medium', icon: 'info' }
      default:
        return { label: 'low', bg: 'bg-slate-100 text-slate-700 border-slate-200 font-normal', icon: 'info' }
    }
  }

  // Helper for Tier badge
  const getTierBadge = (tier) => {
    switch (tier) {
      case 'school':
        return { label: 'School / K-12', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' }
      case 'college':
        return { label: 'College Wing', bg: 'bg-blue-50 text-blue-800 border-blue-200' }
      case 'university':
        return { label: 'University', bg: 'bg-purple-50 text-purple-800 border-purple-200' }
      default:
        return { label: 'Campus-Wide', bg: 'bg-slate-50 text-slate-700 border-slate-200' }
    }
  }

  return (
    <div className="p-3 sm:p-5 md:p-7 space-y-5 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Notice Board
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {instNotices.length} {instNotices.length === 1 ? 'announcement' : 'announcements'} posted.
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions: Export CSV & + New Notice button */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => exportNoticesCSV(filteredNotices, activeTier)}
            disabled={filteredNotices.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingNotice(null)
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Notice</span>
          </button>
        </div>
      </div>

      {/* TIER SELECTOR TABS (School/Students, College, University, All) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ACADEMIC_TIERS.map(tier => {
            const isSelected = activeTier === tier.id
            const count = tierCounts[tier.id] || 0
            return (
              <button
                key={tier.id}
                type="button"
                onClick={() => {
                  setActiveTier(tier.id)
                  setSelectedCategory('All')
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-orange-50 border-orange-500 text-orange-950 font-bold shadow-2xs'
                    : 'bg-white border-transparent hover:bg-slate-50 text-slate-600 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tier.id === 'school' && <School className="w-4 h-4" />}
                    {tier.id === 'college' && <Building2 className="w-4 h-4" />}
                    {tier.id === 'university' && <GraduationCap className="w-4 h-4" />}
                    {tier.id === 'all' && <Layers className="w-4 h-4" />}
                  </div>
                  <div>
                    <span className="block text-xs font-bold">{tier.label}</span>
                    <span className="text-[10px] text-slate-400 block font-normal hidden sm:block truncate max-w-[140px]">
                      {tier.description}
                    </span>
                  </div>
                </div>

                <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isSelected 
                    ? 'bg-white text-orange-900 border border-orange-200' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Search, Categories, Priority & View Mode Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search students, classes, notices, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          {/* Priority filter & View Mode toggles */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Priority:</span>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="All">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* List vs Grid Layout Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list' ? 'bg-white text-orange-900 shadow-2xs font-bold' : 'text-slate-500'
                }`}
                title="List View (Reference Standard)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-orange-900 shadow-2xs font-bold' : 'text-slate-500'
                }`}
                title="Grid View (Card Tiles)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 font-semibold mr-1 shrink-0 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Categories:
          </span>
          {activeCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* NOTICES LIST / GRID */}
      {filteredNotices.length > 0 ? (
        viewMode === 'list' ? (
          /* LIST VIEW: EXACT CLEAN STRUCTURE AS CIRCLED IN USER'S IMAGE 1 */
          <div className="space-y-3">
            {filteredNotices.map((notice) => {
              const priorityObj = getPriorityBadge(notice.priority)
              const tierObj = getTierBadge(notice.tier)
              return (
                <div 
                  key={notice.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 relative ${
                    notice.pinned 
                      ? 'border-amber-300 shadow-sm bg-gradient-to-r from-amber-50/20 via-white to-white ring-1 ring-amber-300' 
                      : 'border-slate-200 hover:border-slate-300 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Left Side: Icon, Title, Priority Pill, Description, Meta */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    {/* Severity / Info Icon */}
                    <div className="mt-0.5 shrink-0">
                      {priorityObj.icon === 'alert' ? (
                        <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                          <Info className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      {/* Notice Title & Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                          {notice.title}
                        </h3>

                        {/* Priority Pill (high, medium, low, urgent) */}
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityObj.bg}`}>
                          {priorityObj.label}
                        </span>

                        {/* Academic Tier Badge */}
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierObj.bg}`}>
                          {tierObj.label}
                        </span>

                        {/* Pinned Badge */}
                        {notice.pinned && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
                            <Pin className="w-2.5 h-2.5 fill-current" />
                            <span>Pinned</span>
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {notice.content}
                      </p>

                      {/* Meta Footer: Date, Author & Audience */}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1 font-sans">
                        <span className="flex items-center gap-1 font-mono text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDateDDMMYYYY(notice.date)}
                        </span>

                        <span className="text-slate-500 font-medium">
                          By <strong className="text-slate-700">{notice.author || 'Office of Administration'}</strong>
                        </span>

                        <span className="text-slate-400">
                          • Audience: <strong className="text-slate-600">{notice.audience || 'All'}</strong>
                        </span>

                        {notice.category && (
                          <span className="text-slate-400">
                            • Category: <strong className="text-slate-600">{notice.category}</strong>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Action Buttons: Pin, Print, Edit, Delete (as in user's image 1) */}
                  <div className="flex items-center gap-1 self-end sm:self-start pt-2 sm:pt-0 shrink-0">
                    {/* Pin Toggle */}
                    <button
                      type="button"
                      onClick={() => togglePin(notice)}
                      className={`p-2 rounded-lg transition-colors cursor-pointer ${
                        notice.pinned 
                          ? 'text-amber-600 hover:text-amber-700 bg-amber-50' 
                          : 'text-slate-400 hover:text-amber-600 hover:bg-slate-100'
                      }`}
                      title={notice.pinned ? 'Unpin Circular' : 'Pin to Top'}
                    >
                      <Pin className={`w-4 h-4 ${notice.pinned ? 'fill-current' : ''}`} />
                    </button>

                    {/* Official Gazette Print */}
                    <button
                      type="button"
                      onClick={() => setSelectedNoticeForPrint(notice)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Print Official Gazette Circular (PDF)"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Edit Notice (Pencil icon as in image 1) */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotice(notice)
                        setIsModalOpen(true)
                      }}
                      className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Notice Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Notice (Trash icon as in image 1) */}
                    <button
                      type="button"
                      onClick={() => handleDelete(notice.id, notice.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* GRID VIEW: CARD TILES */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredNotices.map((notice) => {
              const priorityObj = getPriorityBadge(notice.priority)
              const tierObj = getTierBadge(notice.tier)
              return (
                <div 
                  key={notice.id} 
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between relative ${
                    notice.pinned 
                      ? 'border-amber-300 shadow-md ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/20 to-white' 
                      : 'border-slate-200 shadow-2xs hover:shadow-sm'
                  }`}
                >
                  {notice.pinned && (
                    <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                      <Pin className="w-3 h-3 fill-current" />
                      <span>PINNED CIRCULAR</span>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${priorityObj.bg}`}>
                          {priorityObj.label}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${tierObj.bg}`}>
                          {tierObj.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePin(notice)}
                          className={`p-1 rounded cursor-pointer ${
                            notice.pinned ? 'text-amber-600 bg-amber-50' : 'text-slate-400 hover:text-amber-600'
                          }`}
                          title="Pin Notice"
                        >
                          <Pin className={`w-3.5 h-3.5 ${notice.pinned ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedNoticeForPrint(notice)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                          title="Print Notice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNotice(notice)
                            setIsModalOpen(true)
                          }}
                          className="p-1 text-slate-400 hover:text-orange-600 rounded cursor-pointer"
                          title="Edit Notice"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(notice.id, notice.title)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                          title="Delete Notice"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug mt-1">{notice.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-4 leading-relaxed whitespace-pre-line">{notice.content}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-mono">{formatDateDDMMYYYY(notice.date)}</span>
                    <span className="font-medium text-slate-600 truncate max-w-[150px]">By {notice.author}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Circulars Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {activeTier === 'all' 
              ? 'No announcements posted yet. Click "+ New Notice" to broadcast your first campus circular.'
              : `No announcements posted in the ${activeTier.toUpperCase()} wing. Click "+ New Notice" to publish a directive.`}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingNotice(null)
              setIsModalOpen(true)
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Notice</span>
          </button>
        </div>
      )}

      {/* CREATE / EDIT NOTICE MODAL */}
      <NoticeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingNotice(null)
        }}
        initialData={editingNotice}
        onSaveNotice={handleSaveNotice}
        activeTier={activeTier}
      />

      {/* OFFICIAL PRINTABLE GAZETTE CIRCULAR MODAL */}
      {selectedNoticeForPrint && (
        <Modal
          isOpen={Boolean(selectedNoticeForPrint)}
          onClose={() => setSelectedNoticeForPrint(null)}
          title="Official Campus Circular & Gazette Notification"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-notice-circular, #printable-notice-circular * { visibility: visible !important; }
                #printable-notice-circular {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 10mm !important;
                  background: white !important;
                }
                @page { size: A4 portrait; margin: 8mm; }
              }
            `}</style>
            <div id="printable-notice-circular" className="p-8 bg-white border-2 border-slate-900 rounded-xl space-y-6 font-serif text-slate-900">
              {/* Header Letterhead Adapted by Academic Tier */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center mb-2">
                  <School className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL & COLLEGE SYSTEM'}
                </h2>
                <p className="text-xs uppercase tracking-widest text-slate-600 font-sans font-semibold">
                  {selectedNoticeForPrint.tier === 'university'
                    ? 'OFFICE OF THE REGISTRAR & VICE CHANCELLOR'
                    : selectedNoticeForPrint.tier === 'college'
                    ? 'OFFICE OF THE PRINCIPAL & DIRECTOR OF COLLEGIATE STUDIES'
                    : 'OFFICE OF THE PRINCIPAL & ADMINISTRATIVE REGISTRAR'}
                </p>
                <p className="text-[10px] text-slate-500 font-mono font-sans">
                  Campus Code: {currentInstitute?.code || 'CAMPUS-01'} • Government of the Punjab Registered
                </p>
              </div>

              {/* Reference & Dispatch Header */}
              <div className="flex justify-between items-center text-xs font-sans border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">DISPATCH REFERENCE</span>
                  <strong className="font-mono text-slate-800">
                    REF: CIR/{selectedNoticeForPrint.tier?.toUpperCase() || 'GEN'}/{new Date().getFullYear()}/{selectedNoticeForPrint.id?.slice(-4).toUpperCase() || '001'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">DATE OF ISSUANCE</span>
                  <strong className="font-mono text-slate-800">{formatDateDDMMYYYY(selectedNoticeForPrint.date)}</strong>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1 font-sans">
                <div className="flex justify-between text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  <span>CIRCULATION TARGET: {selectedNoticeForPrint.audience?.toUpperCase() || 'ALL'}</span>
                  <span>TIER: {selectedNoticeForPrint.tier?.toUpperCase() || 'ALL'}</span>
                </div>
                <h3 className="text-sm font-black uppercase tracking-wide bg-slate-100 p-2.5 rounded border border-slate-200">
                  SUBJECT: {selectedNoticeForPrint.title}
                </h3>
              </div>

              {/* Main Circular Body */}
              <div className="text-xs leading-relaxed font-sans text-slate-700 whitespace-pre-line py-2">
                {selectedNoticeForPrint.content}
              </div>

              {/* Distribution & Compliance */}
              <div className="pt-4 border-t border-slate-200 text-[10px] font-sans text-slate-500 space-y-1">
                <span className="font-bold uppercase text-slate-700">Circulation For Immediate Compliance:</span>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Notice Boards across designated academic wings ({selectedNoticeForPrint.tier?.toUpperCase() || 'ALL'}).</li>
                  <li>Faculty Common Room & Department Notice Registers.</li>
                  <li>Official Parent & Student Digital Notification Archive.</li>
                  <li>Office of the Chief Proctor & Examination Controller.</li>
                </ol>
              </div>

              {/* Signatures & Institutional Seal */}
              <div className="flex justify-between items-end pt-8 font-sans text-xs">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="font-semibold text-slate-700">{selectedNoticeForPrint.author || 'Authorizing Officer'}</span>
                  <span className="block text-[10px] text-slate-400">Records & Circulars</span>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 uppercase font-bold text-center">
                  OFFICIAL SEAL
                </div>

                <div className="text-center">
                  <div className="w-36 border-b-2 border-slate-900 mb-1"></div>
                  <span className="font-black text-slate-900">
                    {selectedNoticeForPrint.tier === 'university' ? 'Registrar / Vice Chancellor' : 'Principal / Campus Head'}
                  </span>
                  <span className="block text-[10px] text-slate-500">Chief Executive Authority</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNoticeForPrint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Circular (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NoticeBoardView
