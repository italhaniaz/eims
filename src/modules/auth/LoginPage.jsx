import React, { useState, useEffect } from 'react'
import { SchoolLoginPage } from './SchoolLoginPage'
import { CollegeLoginPage } from './CollegeLoginPage'
import { UniversityLoginPage } from './UniversityLoginPage'
import { SuperadminLoginPage } from './SuperadminLoginPage'
import { PlatformService } from '../../services/platformService'

const ALL_PORTAL_TIERS = ['school', 'college', 'university', 'superadmin']

export const LoginPage = ({ onBackToLanding, onOpenTrial, defaultTier }) => {
  // 1. Load persisted portal filter preferences from localStorage
  const [selectedTiers, setSelectedTiers] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('sms_login_portal_filters')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const filtered = parsed.filter(t => ALL_PORTAL_TIERS.includes(t))
            if (filtered.length > 0) return filtered
          }
        }
      }
    } catch {
      // Fallback
    }
    return ALL_PORTAL_TIERS
  })

  // 2. Determine initial tier based on URL pathname (with hash & query fallback)
  const getInitialTier = () => {
    if (defaultTier && defaultTier !== 'school') return defaultTier
    if (typeof window !== 'undefined') {
      const fullUrl = (window.location.pathname + window.location.hash + window.location.search).toLowerCase()
      if (fullUrl.includes('superadmin') || fullUrl.includes('admin-login')) {
        return 'superadmin'
      }
      if (fullUrl.includes('college')) {
        return 'college'
      }
      if (fullUrl.includes('uni')) {
        return 'university'
      }
      return 'school'
    }
    return 'school'
  }

  const [portalTier, setPortalTier] = useState(getInitialTier)
  const [showPortalSwitcher, setShowPortalSwitcher] = useState(() => PlatformService.isPortalSwitcherEnabled())

  // Listen to popstate and hashchange dynamically
  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const fullUrl = (window.location.pathname + window.location.hash + window.location.search).toLowerCase()
        if (fullUrl.includes('superadmin') || fullUrl.includes('admin-login')) {
          setPortalTier('superadmin')
        } else if (fullUrl.includes('college')) {
          setPortalTier('college')
        } else if (fullUrl.includes('uni')) {
          setPortalTier('university')
        } else {
          setPortalTier('school')
        }
        setShowPortalSwitcher(PlatformService.isPortalSwitcherEnabled())
      }
    }

    const handleSettingsUpdated = () => {
      setShowPortalSwitcher(PlatformService.isPortalSwitcherEnabled())
    }

    window.addEventListener('popstate', handleLocationChange)
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('sms_platform_settings_updated', handleSettingsUpdated)
    window.addEventListener('storage', handleSettingsUpdated)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('sms_platform_settings_updated', handleSettingsUpdated)
      window.removeEventListener('storage', handleSettingsUpdated)
    }
  }, [])

  // Auto-align active portal with selectedTiers if current tier is filtered out
  useEffect(() => {
    if (selectedTiers.length > 0 && !selectedTiers.includes(portalTier)) {
      handleSwitchTier(selectedTiers[0])
    }
  }, [selectedTiers, portalTier])

  // Save selected tiers and update state
  const handleSetTiers = (newTiers) => {
    if (!Array.isArray(newTiers) || newTiers.length === 0) return
    setSelectedTiers(newTiers)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('sms_login_portal_filters', JSON.stringify(newTiers))
      }
    } catch (e) {
      console.warn('Could not persist portal filter settings:', e)
    }

    if (!newTiers.includes(portalTier)) {
      handleSwitchTier(newTiers[0])
    }
  }

  // Switch tier using clean HTML5 history (NO hashes!)
  const handleSwitchTier = (targetTier) => {
    setPortalTier(targetTier)
    const targetPath = targetTier === 'superadmin'
      ? '/superadmin'
      : targetTier === 'college'
        ? '/college-login'
        : targetTier === 'university'
          ? '/university-login'
          : '/school-login'

    if (typeof window !== 'undefined') {
      try {
        if (window.location.pathname !== targetPath) {
          window.history.pushState(null, '', targetPath)
          window.dispatchEvent(new PopStateEvent('popstate'))
        }
      } catch (e) {
        window.location.hash = `#${targetTier}-login`
      }
    }
  }

  const commonProps = {
    onBackToLanding,
    onOpenTrial,
    onSwitchTier: handleSwitchTier,
    selectedTiers,
    onSetTiers: handleSetTiers,
    showPortalSwitcher
  }

  if (portalTier === 'college') {
    return <CollegeLoginPage {...commonProps} />
  }

  if (portalTier === 'university') {
    return <UniversityLoginPage {...commonProps} />
  }

  if (portalTier === 'superadmin') {
    return <SuperadminLoginPage {...commonProps} />
  }

  return <SchoolLoginPage {...commonProps} />
}

export default LoginPage;
