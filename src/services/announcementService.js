/**
 * Central Platform Announcements & Broadcast Service
 * Manages public landing page announcement banner and campus admin directives
 */

const STORAGE_KEY_LANDING_BANNER = 'sms_landing_banner'
const STORAGE_KEY_ANNOUNCEMENTS = 'sms_platform_announcements'
const STORAGE_KEY_CAMPUS_NOTICES = 'sms_campus_notices'

// Default Landing Page Banner matching current production configuration
export const DEFAULT_LANDING_BANNER = {
  isActive: true,
  badgeText: 'New Release',
  message: '14-Day Free Evaluation Tier is now active for all educational institutions.',
  ctaText: 'Claim Free Access',
  ctaAction: 'trial_modal', // 'trial_modal' | 'login' | 'pricing' | 'link'
  ctaLink: '#trial',
  theme: 'purple', // 'purple' | 'emerald' | 'indigo' | 'amber' | 'rose'
  dismissible: true,
  updatedAt: new Date().toISOString()
}

// Preloaded Platform Announcements
export const DEFAULT_ANNOUNCEMENTS = [
  {
    id: 'ann-1',
    target: 'landing_page', // 'landing_page' | 'institute_admin' | 'all'
    targetCampus: 'All Visitors',
    wing: 'all',
    category: 'New Release',
    title: '14-Day Free Evaluation Tier Active',
    message: '14-Day Free Evaluation Tier is now active for all educational institutions.',
    ctaText: 'Claim Free Access',
    ctaAction: 'trial_modal',
    ctaLink: '#trial',
    priority: 'Normal',
    isActive: true,
    showInLandingBanner: true,
    theme: 'purple',
    badgeText: 'New Release',
    pinned: true,
    createdAt: new Date().toISOString(),
    expiresAt: null
  },
  {
    id: 'ann-2',
    target: 'institute_admin',
    targetCampus: 'All Registered Campuses',
    wing: 'all',
    category: 'Academic Directive',
    title: 'Annual Board Registration Deadlines 2026-27',
    message: 'All affiliated institutes must submit student registration lists for secondary examinations before the upcoming BISE deadline.',
    priority: 'High',
    isActive: true,
    showInLandingBanner: false,
    theme: 'rose',
    badgeText: 'Important Directive',
    pinned: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    expiresAt: null
  },
  {
    id: 'ann-3',
    target: 'institute_admin',
    targetCampus: 'All Registered Campuses',
    wing: 'school',
    category: 'Policy & Timings',
    title: 'Winter Timing & Uniform Advisory',
    message: 'Official guidelines regarding winter dress code and school timing adjustments issued by the Education Directorate.',
    priority: 'Normal',
    isActive: true,
    showInLandingBanner: false,
    theme: 'purple',
    badgeText: 'Administrative',
    pinned: false,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    expiresAt: null
  }
]

/**
 * Dispatch real-time cross-tab and cross-component update events
 */
const notifyChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('sms_announcements_updated'))
    window.dispatchEvent(new Event('storage'))
  }
}

export const AnnouncementService = {
  /**
   * Get Landing Page Banner Configuration
   */
  getLandingBannerConfig() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_LANDING_BANNER)
        if (raw) {
          return { ...DEFAULT_LANDING_BANNER, ...JSON.parse(raw) }
        }
      }
    } catch (e) {
      console.error('Failed reading landing banner config:', e)
    }
    return { ...DEFAULT_LANDING_BANNER }
  },

  /**
   * Save Landing Page Banner Configuration
   */
  saveLandingBannerConfig(config) {
    try {
      const merged = {
        ...DEFAULT_LANDING_BANNER,
        ...config,
        updatedAt: new Date().toISOString()
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_LANDING_BANNER, JSON.stringify(merged))
      }
      notifyChange()
      return merged
    } catch (e) {
      console.error('Failed saving landing banner config:', e)
      return config
    }
  },

  /**
   * Quick toggle landing banner active state
   */
  toggleLandingBanner(activeState = null) {
    const current = this.getLandingBannerConfig()
    const nextState = activeState !== null ? Boolean(activeState) : !current.isActive
    return this.saveLandingBannerConfig({ ...current, isActive: nextState })
  },

  /**
   * Get all announcements (landing, institute admin, public)
   */
  getAllAnnouncements() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed
          }
        }
      }
    } catch (e) {
      console.error('Failed reading announcements:', e)
    }
    // Initialize with defaults if empty
    this.saveAllAnnouncements(DEFAULT_ANNOUNCEMENTS)
    return [...DEFAULT_ANNOUNCEMENTS]
  },

  /**
   * Save all announcements
   */
  saveAllAnnouncements(list) {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(list))
      }
      notifyChange()
      return list
    } catch (e) {
      console.error('Failed saving announcements:', e)
      return list
    }
  },

  /**
   * Add a new announcement
   */
  addAnnouncement(data) {
    const all = this.getAllAnnouncements()
    const newEntry = {
      id: `ann-${Date.now()}`,
      target: data.target || 'institute_admin', // 'landing_page', 'institute_admin', 'all'
      targetCampus: data.targetCampus || 'All Registered Campuses',
      wing: data.wing || 'all',
      category: data.category || 'General',
      title: data.title || 'Untitled Announcement',
      message: data.message || '',
      ctaText: data.ctaText || '',
      ctaAction: data.ctaAction || 'none',
      ctaLink: data.ctaLink || '',
      priority: data.priority || 'Normal',
      isActive: data.isActive !== undefined ? data.isActive : true,
      showInLandingBanner: data.showInLandingBanner || (data.target === 'landing_page' || data.target === 'all'),
      showInDashboardAlert: data.priority === 'Urgent' || data.priority === 'High',
      theme: data.theme || 'purple',
      badgeText: data.badgeText || (data.category || 'Announcement'),
      pinned: Boolean(data.pinned),
      createdAt: new Date().toISOString(),
      expiresAt: data.expiresAt || null
    }

    const updated = [newEntry, ...all]
    this.saveAllAnnouncements(updated)

    // If targeted to landing page and active, sync with landing banner
    if (newEntry.showInLandingBanner && newEntry.isActive) {
      this.saveLandingBannerConfig({
        isActive: true,
        badgeText: newEntry.badgeText,
        message: newEntry.message,
        ctaText: newEntry.ctaText || 'Learn More',
        ctaAction: newEntry.ctaAction || 'trial_modal',
        ctaLink: newEntry.ctaLink || '#trial',
        theme: newEntry.theme || 'purple',
        dismissible: true
      })
    }

    // If targeted to institute admins, sync into campus notices
    if (newEntry.target === 'institute_admin' || newEntry.target === 'all') {
      try {
        const rawNotices = localStorage.getItem(STORAGE_KEY_CAMPUS_NOTICES)
        const campusNotices = rawNotices ? JSON.parse(rawNotices) : []
        const campusNoticeItem = {
          id: `notice-from-${newEntry.id}`,
          title: newEntry.title,
          category: newEntry.category,
          tier: newEntry.wing || 'all',
          priority: newEntry.priority.toLowerCase(),
          audience: newEntry.targetCampus,
          author: 'Super Administrator Headquarters',
          date: new Date().toISOString().split('T')[0],
          pinned: newEntry.pinned,
          content: newEntry.message,
          source: 'superadmin_broadcast'
        }
        localStorage.setItem(STORAGE_KEY_CAMPUS_NOTICES, JSON.stringify([campusNoticeItem, ...campusNotices]))
      } catch (err) {
        console.warn('Campus notice sync error:', err)
      }
    }

    return newEntry
  },

  /**
   * Update an existing announcement
   */
  updateAnnouncement(id, updates) {
    const all = this.getAllAnnouncements()
    const index = all.findIndex(a => a.id === id)
    if (index === -1) return null

    const updatedEntry = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    all[index] = updatedEntry
    this.saveAllAnnouncements(all)

    // Sync with landing banner if it was the active landing announcement
    if (updatedEntry.showInLandingBanner && updatedEntry.isActive) {
      this.saveLandingBannerConfig({
        isActive: true,
        badgeText: updatedEntry.badgeText,
        message: updatedEntry.message,
        ctaText: updatedEntry.ctaText || 'Learn More',
        ctaAction: updatedEntry.ctaAction || 'trial_modal',
        ctaLink: updatedEntry.ctaLink || '#trial',
        theme: updatedEntry.theme || 'purple',
        dismissible: true
      })
    }

    return updatedEntry
  },

  /**
   * Delete an announcement
   */
  deleteAnnouncement(id) {
    const all = this.getAllAnnouncements()
    const target = all.find(a => a.id === id)
    const filtered = all.filter(a => a.id !== id)
    this.saveAllAnnouncements(filtered)

    // Also remove from campus notices if synced
    try {
      const rawNotices = localStorage.getItem(STORAGE_KEY_CAMPUS_NOTICES)
      if (rawNotices) {
        const notices = JSON.parse(rawNotices)
        const updatedNotices = notices.filter(n => n.id !== `notice-from-${id}`)
        localStorage.setItem(STORAGE_KEY_CAMPUS_NOTICES, JSON.stringify(updatedNotices))
      }
    } catch {}

    return filtered
  },

  /**
   * Toggle announcement active state
   */
  toggleAnnouncementActive(id) {
    const all = this.getAllAnnouncements()
    const entry = all.find(a => a.id === id)
    if (!entry) return null
    return this.updateAnnouncement(id, { isActive: !entry.isActive })
  }
}

export default AnnouncementService
