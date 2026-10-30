import React, { useState, useEffect, useMemo } from 'react'
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Trash2,
  Send,
  School,
  CheckCircle2,
  Globe,
  Eye,
  Sliders,
  AlertTriangle,
  Pin,
  ExternalLink,
  Edit3,
  X,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  RefreshCw,
  Bell,
  Layers,
  Building2,
  GraduationCap
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'
import AnnouncementService, {
  DEFAULT_LANDING_BANNER
} from '../../services/announcementService'

/**
 * Extract normalized educational wings for an institute
 * Supports: 'school', 'college', 'university'
 */
export const getInstituteWings = (inst) => {
  if (!inst) return []
  const resolved = new Set()

  // 1. Explicit enabledTiers array
  if (Array.isArray(inst.enabledTiers) && inst.enabledTiers.length > 0) {
    inst.enabledTiers.forEach((tier) => {
      const t = String(tier).toLowerCase().trim()
      if (t === 'school') resolved.add('school')
      if (t === 'college') resolved.add('college')
      if (t === 'undergraduate' || t === 'university') resolved.add('university')
    })
  }

  // 2. Fallback heuristic from type, planType, planTier, or name
  if (resolved.size === 0) {
    const combined = [
      inst.type || '',
      inst.planType || '',
      inst.planTier || '',
      inst.name || ''
    ]
      .join(' ')
      .toLowerCase()

    if (combined.includes('school')) resolved.add('school')
    if (combined.includes('college')) resolved.add('college')
    if (
      combined.includes('undergrad') ||
      combined.includes('universit') ||
      combined.includes('higher ed')
    ) {
      resolved.add('university')
    }
  }

  // 3. Fallback default to 'school' if completely unspecified
  if (resolved.size === 0) {
    resolved.add('school')
  }

  return Array.from(resolved)
}

/**
 * Human-readable display label for educational wings
 */
export const getWingDisplayName = (wingKey) => {
  switch (wingKey) {
    case 'school':
      return 'School Wing'
    case 'college':
      return 'College Wing'
    case 'university':
      return 'University Wing'
    case 'all':
    default:
      return 'All Wings'
  }
}

export const NoticeBroadcasterView = () => {
  const { institutes = [] } = useAppData()
  const { toast } = useToast()

  // Live state
  const [announcements, setAnnouncements] = useState([])
  const [landingBanner, setLandingBanner] = useState(DEFAULT_LANDING_BANNER)
  const [activeTab, setActiveTab] = useState('all') // 'all', 'landing', 'campus', 'active'
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [wingFilter, setWingFilter] = useState('all')

  // Modals & Forms
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    target: 'institute_admin', // 'landing_page', 'institute_admin', 'all'
    targetCampus: 'All Registered Campuses',
    wing: 'all',
    category: 'Academic Directive',
    title: '',
    message: '',
    ctaText: '',
    ctaAction: 'trial_modal',
    ctaLink: '',
    priority: 'Normal',
    isActive: true,
    theme: 'purple',
    badgeText: '',
    pinned: false
  })

  // Quick Landing Banner Edit Form State
  const [bannerForm, setBannerForm] = useState(DEFAULT_LANDING_BANNER)
  const [isBannerSaving, setIsBannerSaving] = useState(false)

  // Filtered campuses based on selected Target Wing for Modal
  const availableCampusesForModal = useMemo(() => {
    if (!formData.wing || formData.wing === 'all') {
      return institutes
    }
    return institutes.filter((inst) => {
      const wings = getInstituteWings(inst)
      return wings.includes(formData.wing)
    })
  }, [institutes, formData.wing])

  // Currently selected campus object and its detected wings
  const selectedCampusInst = useMemo(() => {
    if (!formData.targetCampus || formData.targetCampus === 'All Registered Campuses') {
      return null
    }
    return (
      institutes.find(
        (i) => i.name === formData.targetCampus || i.id === formData.targetCampus
      ) || null
    )
  }, [institutes, formData.targetCampus])

  const detectedWingsForSelectedCampus = useMemo(() => {
    if (!selectedCampusInst) return []
    return getInstituteWings(selectedCampusInst)
  }, [selectedCampusInst])

  // Bidirectional Handler: When user selects a Campus -> Auto-detect its wing
  const handleCampusChange = (e) => {
    const selectedName = e.target.value

    if (selectedName === 'All Registered Campuses') {
      setFormData((prev) => ({
        ...prev,
        targetCampus: selectedName
      }))
      return
    }

    const foundInst = institutes.find(
      (i) => i.name === selectedName || i.id === selectedName
    )
    if (foundInst) {
      const wings = getInstituteWings(foundInst)
      let nextWing = formData.wing

      if (wings.length === 1) {
        // Single wing campus -> auto-select that wing
        nextWing = wings[0]
      } else if (wings.length > 1) {
        // Multi-wing / Hybrid campus -> if current wing is not supported, default to primary
        if (formData.wing !== 'all' && !wings.includes(formData.wing)) {
          nextWing = wings[0]
        }
      }

      setFormData((prev) => ({
        ...prev,
        targetCampus: selectedName,
        wing: nextWing
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        targetCampus: selectedName
      }))
    }
  }

  // Bidirectional Handler: When user selects a Wing -> Filter campuses and auto-reset incompatible campus
  const handleWingChange = (e) => {
    const newWing = e.target.value

    setFormData((prev) => {
      let nextCampus = prev.targetCampus

      if (nextCampus && nextCampus !== 'All Registered Campuses') {
        const currentInst = institutes.find(
          (i) => i.name === nextCampus || i.id === nextCampus
        )
        if (currentInst) {
          const wings = getInstituteWings(currentInst)
          // If the new wing is specific and this campus doesn't have it, reset to All Registered Campuses
          if (newWing !== 'all' && !wings.includes(newWing)) {
            nextCampus = 'All Registered Campuses'
          }
        }
      }

      return {
        ...prev,
        wing: newWing,
        targetCampus: nextCampus
      }
    })
  }

  // Load announcements & banner config
  const reloadData = () => {
    const list = AnnouncementService.getAllAnnouncements()
    const banner = AnnouncementService.getLandingBannerConfig()
    setAnnouncements(list)
    setLandingBanner(banner)
    setBannerForm(banner)
  }

  useEffect(() => {
    reloadData()
    const handleUpdate = () => reloadData()
    window.addEventListener('sms_announcements_updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
    return () => {
      window.removeEventListener('sms_announcements_updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  // Quick 1-Click Toggle for Landing Page Banner
  const handleToggleLandingBanner = () => {
    const updated = AnnouncementService.toggleLandingBanner()
    setLandingBanner(updated)
    setBannerForm(updated)
    toast.success(
      updated.isActive
        ? 'Public Landing Page banner activated!'
        : 'Public Landing Page banner paused.'
    )
  }

  // Save customized Landing Page Banner configuration
  const handleSaveLandingBanner = (e) => {
    e.preventDefault()
    setIsBannerSaving(true)
    setTimeout(() => {
      const updated = AnnouncementService.saveLandingBannerConfig(bannerForm)
      setLandingBanner(updated)
      setIsBannerSaving(false)
      toast.success('Landing Page Announcement Banner published successfully!')
    }, 350)
  }

  // Open Modal for Create or Edit
  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      let initialWing = item.wing || 'all'
      
      // Auto-detect wing if campus is specified but wing was all
      if (
        item.targetCampus &&
        item.targetCampus !== 'All Registered Campuses' &&
        (!item.wing || item.wing === 'all')
      ) {
        const found = institutes.find(
          (i) => i.name === item.targetCampus || i.id === item.targetCampus
        )
        if (found) {
          const wings = getInstituteWings(found)
          if (wings.length === 1) initialWing = wings[0]
        }
      }

      setFormData({
        target: item.target || 'institute_admin',
        targetCampus: item.targetCampus || 'All Registered Campuses',
        wing: initialWing,
        category: item.category || 'General',
        title: item.title || '',
        message: item.message || '',
        ctaText: item.ctaText || '',
        ctaAction: item.ctaAction || 'none',
        ctaLink: item.ctaLink || '',
        priority: item.priority || 'Normal',
        isActive: item.isActive !== undefined ? item.isActive : true,
        theme: item.theme || 'purple',
        badgeText: item.badgeText || '',
        pinned: Boolean(item.pinned)
      })
    } else {
      setEditingItem(null)
      setFormData({
        target: 'institute_admin',
        targetCampus: 'All Registered Campuses',
        wing: 'all',
        category: 'Academic Directive',
        title: '',
        message: '',
        ctaText: '',
        ctaAction: 'trial_modal',
        ctaLink: '',
        priority: 'Normal',
        isActive: true,
        theme: 'purple',
        badgeText: '',
        pinned: false
      })
    }
    setIsModalOpen(true)
  }

  // Submit Announcement Form
  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please enter both title and message.')
      return
    }

    if (editingItem) {
      AnnouncementService.updateAnnouncement(editingItem.id, formData)
      toast.success('Announcement updated successfully!')
    } else {
      AnnouncementService.addAnnouncement(formData)
      toast.success('New announcement broadcasted successfully!')
    }

    setIsModalOpen(false)
    reloadData()
  }

  // Toggle active status of an announcement
  const handleToggleActive = (id) => {
    const updated = AnnouncementService.toggleAnnouncementActive(id)
    if (updated) {
      toast.info(
        updated.isActive
          ? `"${updated.title}" is now active.`
          : `"${updated.title}" has been paused.`
      )
      reloadData()
    }
  }

  // Delete announcement
  const handleDelete = (id, title) => {
    if (window.confirm(`Delete broadcast "${title}"?`)) {
      AnnouncementService.deleteAnnouncement(id)
      toast.success('Announcement deleted.')
      reloadData()
    }
  }

  // Filtered list
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((item) => {
      // Tab filter
      if (activeTab === 'landing' && item.target !== 'landing_page' && item.target !== 'all') {
        return false
      }
      if (activeTab === 'campus' && item.target !== 'institute_admin' && item.target !== 'all') {
        return false
      }
      if (activeTab === 'active' && !item.isActive) {
        return false
      }

      // Priority filter
      if (priorityFilter !== 'all' && item.priority.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false
      }

      // Wing filter
      if (wingFilter !== 'all' && item.wing !== 'all' && item.wing !== wingFilter) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = (item.title || '').toLowerCase().includes(q)
        const matchMsg = (item.message || '').toLowerCase().includes(q)
        const matchCategory = (item.category || '').toLowerCase().includes(q)
        const matchCampus = (item.targetCampus || '').toLowerCase().includes(q)
        if (!matchTitle && !matchMsg && !matchCategory && !matchCampus) {
          return false
        }
      }

      return true
    })
  }, [announcements, activeTab, priorityFilter, wingFilter, searchQuery])

  // Count summaries
  const activeCount = announcements.filter((a) => a.isActive).length
  const landingCount = announcements.filter(
    (a) => a.target === 'landing_page' || a.target === 'all'
  ).length
  const campusCount = announcements.filter(
    (a) => a.target === 'institute_admin' || a.target === 'all'
  ).length
  const urgentCount = announcements.filter(
    (a) => a.priority === 'Urgent' || a.priority === 'High'
  ).length

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-20 space-y-6 max-w-[1400px] mx-auto font-sans">
      {/* 1. Header with Breadcrumb & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#f5eeff] text-purple-700 flex items-center justify-center font-bold">
              <Megaphone className="w-4 h-4 text-purple-600" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              Platform Announcements & Directives Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Control the public Landing Page top announcement banner and broadcast official circulars to Institute Admin dashboards.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => reloadData()}
            className="p-2.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Announcements"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer hover:shadow-md active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Announcement</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric & Channel Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Landing Page Banner */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Landing Page Banner
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${landingBanner.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                <span className="text-lg font-extrabold text-slate-900">
                  {landingBanner.isActive ? 'Live & Active' : 'Paused / Off'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                Badge: {landingBanner.badgeText || 'New Release'}
              </p>
            </div>
            <button
              onClick={handleToggleLandingBanner}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                landingBanner.isActive
                  ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              {landingBanner.isActive ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        </div>

        {/* Card 2: Institute Admin Directives */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Campus Directives
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{campusCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Broadcasted across all campus portals
            </p>
          </div>
        </div>

        {/* Card 3: Urgent Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Urgent / High Priority
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600">{urgentCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Prominently displayed in campus headers
            </p>
          </div>
        </div>

        {/* Card 4: Total Broadcasts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Active Broadcasts
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Out of {announcements.length} total entries
            </p>
          </div>
        </div>
      </div>

      {/* 3. Interactive Live Landing Page Banner Configurator Panel */}
      <div className="bg-white rounded-2xl border border-purple-200/70 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900">
                Live Public Landing Page Top Announcement Banner
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Visitors see this headline banner at the very top of your landing page. You can customize text, badge, button, and color theme.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs font-bold text-slate-700">Banner Enabled:</span>
              <button
                type="button"
                onClick={handleToggleLandingBanner}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  landingBanner.isActive ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    landingBanner.isActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>

        {/* Live Visual Preview of Landing Banner (Identical to Landing Page!) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Live Visitor Preview:</span>
            {landingBanner.isActive ? (
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Visible to Public Visitors
              </span>
            ) : (
              <span className="text-slate-400">Currently Hidden on Landing Page</span>
            )}
          </div>

          <div
            className={`border rounded-xl px-4 py-2.5 text-xs font-medium relative flex items-center justify-center transition-all ${
              bannerForm.theme === 'emerald'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                : bannerForm.theme === 'rose'
                ? 'bg-rose-50 text-rose-950 border-rose-300'
                : bannerForm.theme === 'amber'
                ? 'bg-amber-50 text-amber-950 border-amber-300'
                : bannerForm.theme === 'indigo'
                ? 'bg-indigo-50 text-indigo-950 border-indigo-300'
                : 'bg-[#f5eeff] text-purple-900 border-purple-300'
            }`}
          >
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center">
              <span
                className={`w-2 h-2 rounded-full animate-pulse shrink-0 ${
                  bannerForm.theme === 'emerald'
                    ? 'bg-emerald-600'
                    : bannerForm.theme === 'rose'
                    ? 'bg-rose-600'
                    : bannerForm.theme === 'amber'
                    ? 'bg-amber-600'
                    : bannerForm.theme === 'indigo'
                    ? 'bg-indigo-600'
                    : 'bg-purple-600'
                }`}
              ></span>
              <span>
                <strong>{bannerForm.badgeText || 'New Release'}:</strong>{' '}
                {bannerForm.message || '14-Day Free Evaluation Tier is now active for all educational institutions.'}
              </span>
              {bannerForm.ctaText && (
                <span className="ml-1 underline font-bold cursor-pointer inline-flex items-center gap-0.5 hover:opacity-80">
                  <span>{bannerForm.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              )}
            </div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 cursor-not-allowed">
              <X className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Quick Config Form for Landing Banner */}
        <form onSubmit={handleSaveLandingBanner} className="pt-2 grid grid-cols-1 md:grid-cols-12 gap-3.5 text-xs">
          <div className="md:col-span-3">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Badge / Prefix
            </label>
            <input
              type="text"
              value={bannerForm.badgeText}
              onChange={(e) => setBannerForm({ ...bannerForm, badgeText: e.target.value })}
              placeholder="e.g. New Release"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
            />
          </div>

          <div className="md:col-span-5">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Announcement Message
            </label>
            <input
              type="text"
              required
              value={bannerForm.message}
              onChange={(e) => setBannerForm({ ...bannerForm, message: e.target.value })}
              placeholder="e.g. 14-Day Free Evaluation Tier is now active..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              CTA Button Text
            </label>
            <input
              type="text"
              value={bannerForm.ctaText}
              onChange={(e) => setBannerForm({ ...bannerForm, ctaText: e.target.value })}
              placeholder="e.g. Claim Free Access"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Color Theme
            </label>
            <select
              value={bannerForm.theme}
              onChange={(e) => setBannerForm({ ...bannerForm, theme: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-purple-500 bg-white outline-none font-medium"
            >
              <option value="purple">🟣 Purple Elegance</option>
              <option value="emerald">🟢 Emerald Growth</option>
              <option value="indigo">🔵 Royal Indigo</option>
              <option value="amber">🟡 Golden Alert</option>
              <option value="rose">🔴 Coral Rose</option>
            </select>
          </div>

          <div className="md:col-span-12 flex justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setBannerForm(DEFAULT_LANDING_BANNER)}
              className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Reset to Default
            </button>
            <button
              type="submit"
              disabled={isBannerSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs hover:shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isBannerSaving ? 'Saving...' : 'Update Landing Banner'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 4. Filter Tabs & Search Bar for Announcements */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Channel Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Broadcasts ({announcements.length})
            </button>

            <button
              onClick={() => setActiveTab('landing')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'landing'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Landing Page ({landingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('campus')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'campus'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <School className="w-3.5 h-3.5" />
              <span>Campus Directives ({campusCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'active'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Active Only ({activeCount})
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search announcements..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:border-purple-400"
              />
            </div>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
            </select>

            <select
              value={wingFilter}
              onChange={(e) => setWingFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 outline-none"
            >
              <option value="all">All Wings</option>
              <option value="school">School Wing</option>
              <option value="college">College Wing</option>
              <option value="university">University Wing</option>
            </select>
          </div>
        </div>

        {/* 5. Announcements List */}
        <div className="space-y-3.5">
          {filteredAnnouncements.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center space-y-2">
              <Megaphone className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Announcements Found</h3>
              <p className="text-xs text-slate-400">
                No circulars or announcements match the current filters.
              </p>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-1.5 px-4 py-2 mt-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create an Announcement</span>
              </button>
            </div>
          ) : (
            filteredAnnouncements.map((item) => {
              const isLanding = item.target === 'landing_page' || item.target === 'all'
              const isCampus = item.target === 'institute_admin' || item.target === 'all'

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-2xs hover:shadow-sm space-y-3 ${
                    item.isActive ? 'border-slate-100' : 'border-slate-200 opacity-75 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      {/* Badges Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Target Channel Badge */}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          {isLanding && isCampus ? (
                            <>
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              <span>Universal Broadcast (Landing + Campuses)</span>
                            </>
                          ) : isLanding ? (
                            <>
                              <Globe className="w-3 h-3 text-purple-600" />
                              <span>Public Landing Page</span>
                            </>
                          ) : (
                            <>
                              <School className="w-3 h-3 text-indigo-600" />
                              <span>Campus Directives ({item.targetCampus})</span>
                            </>
                          )}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            item.priority === 'Urgent'
                              ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                              : item.priority === 'High'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {item.priority} Priority
                        </span>

                        {/* Category Badge */}
                        {item.category && (
                          <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                            {item.category}
                          </span>
                        )}

                        {/* Wing Badge */}
                        {item.wing && item.wing !== 'all' && (
                          <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                            {item.wing} Wing
                          </span>
                        )}

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          ></span>
                          <span>{item.isActive ? 'Active' : 'Paused'}</span>
                        </span>
                      </div>

                      {/* Title & Message */}
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
                        {item.message}
                      </p>

                      {/* Action CTA info if available */}
                      {item.ctaText && (
                        <div className="pt-1 flex items-center gap-2 text-xs">
                          <span className="font-bold text-purple-700 flex items-center gap-1 bg-[#f5eeff] px-2.5 py-1 rounded-lg border border-purple-200">
                            <span>Button CTA: {item.ctaText}</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          item.isActive
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}
                        title={item.isActive ? 'Pause broadcast' : 'Activate broadcast'}
                      >
                        {item.isActive ? 'Pause' : 'Activate'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Announcement"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Delete Announcement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Published: {new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                    <span>Target: {item.targetCampus}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* 6. Create / Edit Announcement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Announcement' : 'Broadcast New Announcement'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs font-sans">
          {/* Target Channel */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Target Audience & Broadcast Channel
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  formData.target === 'landing_page'
                    ? 'border-purple-500 bg-[#f5eeff] text-purple-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  value="landing_page"
                  checked={formData.target === 'landing_page'}
                  onChange={() => setFormData({ ...formData, target: 'landing_page' })}
                  className="hidden"
                />
                <div className="flex items-center gap-1.5 font-bold">
                  <Globe className="w-3.5 h-3.5 text-purple-600" />
                  <span>Landing Page</span>
                </div>
                <span className="text-[10px] text-slate-500">Public top banner for all website visitors</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  formData.target === 'institute_admin'
                    ? 'border-purple-500 bg-[#f5eeff] text-purple-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  value="institute_admin"
                  checked={formData.target === 'institute_admin'}
                  onChange={() => setFormData({ ...formData, target: 'institute_admin' })}
                  className="hidden"
                />
                <div className="flex items-center gap-1.5 font-bold">
                  <School className="w-3.5 h-3.5 text-purple-600" />
                  <span>Campus Admins</span>
                </div>
                <span className="text-[10px] text-slate-500">Directives shown inside campus portals</span>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all ${
                  formData.target === 'all'
                    ? 'border-purple-500 bg-[#f5eeff] text-purple-900 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="target"
                  value="all"
                  checked={formData.target === 'all'}
                  onChange={() => setFormData({ ...formData, target: 'all' })}
                  className="hidden"
                />
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Universal</span>
                </div>
                <span className="text-[10px] text-slate-500">Both landing banner & campus dashboards</span>
              </label>
            </div>
          </div>

          {/* Dynamic Campus Target Options if Institute Admin - 2-Way Reactive Sync */}
          {(formData.target === 'institute_admin' || formData.target === 'all') && (
            <div className="p-3.5 bg-gradient-to-br from-purple-50/40 via-slate-50 to-slate-50 rounded-xl border border-purple-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>Target Scope & Educational Wing Sync</span>
                </span>
                <span className="text-[10px] font-semibold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>2-Way Auto Sync</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Target Campus */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase">
                      Target Campus
                    </label>
                    {formData.wing !== 'all' && (
                      <span className="text-[10px] text-purple-600 font-semibold">
                        Filtered ({availableCampusesForModal.length})
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.targetCampus}
                    onChange={handleCampusChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer text-xs"
                  >
                    <option value="All Registered Campuses">
                      {formData.wing === 'all'
                        ? `All Registered Campuses (${institutes.length})`
                        : `All Campuses with ${getWingDisplayName(formData.wing)} (${availableCampusesForModal.length})`}
                    </option>
                    {availableCampusesForModal.map((inst) => {
                      const wings = getInstituteWings(inst)
                      const wingsLabel = wings
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' & ')
                      return (
                        <option key={inst.id} value={inst.name}>
                          {inst.name} {wingsLabel ? `— [${wingsLabel}]` : ''}
                        </option>
                      )
                    })}
                  </select>

                  {/* Context status under Campus */}
                  {selectedCampusInst ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-600">
                      <span className="font-semibold text-purple-700">
                        {selectedCampusInst.name}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500">
                        {selectedCampusInst.city || 'Campus'}
                      </span>
                    </div>
                  ) : formData.wing !== 'all' ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-purple-700 font-medium">
                      <Filter className="w-3 h-3 text-purple-500" />
                      <span>
                        Showing only institutes with {getWingDisplayName(formData.wing)}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[11px] text-slate-400">
                      Select a specific campus or broadcast to all
                    </div>
                  )}
                </div>

                {/* Target Wing */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-slate-700 uppercase">
                      Target Wing
                    </label>
                    {selectedCampusInst && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Auto-Detected
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.wing}
                    onChange={handleWingChange}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all cursor-pointer text-xs"
                  >
                    <option value="all">All Wings (School, College, Uni)</option>
                    <option value="school">School Wing Only</option>
                    <option value="college">College Wing Only</option>
                    <option value="university">University Wing Only</option>
                  </select>

                  {/* Context status under Wing */}
                  {selectedCampusInst ? (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md w-fit border border-emerald-200/50">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>
                        Detected: {detectedWingsForSelectedCampus.map((w) => getWingDisplayName(w)).join(' & ') || 'School Wing'}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1.5 text-[11px] text-slate-400">
                      Selecting a wing filters institutes on the left
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Announcement Headline / Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Schedule for Board Examination Enrolment"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Academic Directive">Academic Directive</option>
                <option value="New Release">New Release</option>
                <option value="Policy & Timings">Policy & Timings</option>
                <option value="Fee Directive">Fee Directive</option>
                <option value="Examination (BISE)">Examination (BISE)</option>
                <option value="Holiday / Vacation">Holiday / Vacation</option>
                <option value="Emergency Alert">Emergency Alert</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          {/* Priority & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Priority & Urgency
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High (Highlighted)</option>
                <option value="Urgent">Urgent Emergency (Causes Red Header Banner)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Color Accent
              </label>
              <select
                value={formData.theme}
                onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="purple">🟣 Purple Elegance</option>
                <option value="emerald">🟢 Emerald Growth</option>
                <option value="indigo">🔵 Royal Indigo</option>
                <option value="amber">🟡 Golden Alert</option>
                <option value="rose">🔴 Coral Rose</option>
              </select>
            </div>
          </div>

          {/* Full Message */}
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Announcement Message Body *
            </label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter official circular message or landing banner announcement..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-slate-900"
            />
          </div>

          {/* Optional Action CTA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                Call-to-Action Button Label (Optional)
              </label>
              <input
                type="text"
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="e.g. Claim Free Access, View Directive"
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">
                CTA Action Type
              </label>
              <select
                value={formData.ctaAction}
                onChange={(e) => setFormData({ ...formData, ctaAction: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="trial_modal">Open 14-Day Free Trial Modal</option>
                <option value="pricing">Scroll to Pricing Packages</option>
                <option value="login">Open Portal Sign In</option>
                <option value="link">Custom URL / Anchor</option>
                <option value="none">No Action</option>
              </select>
            </div>
          </div>

          {/* Pinned & Active Toggles */}
          <div className="flex items-center gap-6 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-700">Publish Immediately (Active)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-semibold text-slate-700">Pin to Top</span>
            </label>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{editingItem ? 'Save Updates' : 'Broadcast Announcement'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NoticeBroadcasterView
