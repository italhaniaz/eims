import React, { useState, useEffect } from 'react'
import { SchoolLoginPage } from './SchoolLoginPage'
import { CollegeLoginPage } from './CollegeLoginPage'
import { UniversityLoginPage } from './UniversityLoginPage'
import { SuperadminLoginPage } from './SuperadminLoginPage'

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
            // Keep only valid recognized portal tiers
            const filtered = parsed.filter(t => ALL_PORTAL_TIERS.includes(t))
            if (filtered.length > 0) return filtered
          }
        }
      }
    } catch {
      // Fallback on parse failure
    }
    return ALL_PORTAL_TIERS
  })

  // 2. Determine initial tier based on URL hash, defaultTier prop, or first selected tier
  const getInitialTier = () => {
    if (defaultTier && defaultTier !== 'school') return defaultTier
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase()
      const search = window.location.search.toLowerCase()
      if (hash.includes('superadmin') || hash.includes('admin-login') || search.includes('superadmin')) {
        return 'superadmin'
      }
      if (hash.includes('college') || search.includes('college')) {
        return 'college'
      }
      if (hash.includes('uni') || search.includes('uni')) {
        return 'university'
      }
      return 'school'
    }
    return 'school'
  }

  const [portalTier, setPortalTier] = useState(getInitialTier)

  // Listen to hash changes dynamically
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase()
        if (hash.includes('superadmin') || hash.includes('admin-login')) {
          setPortalTier('superadmin')
        } else if (hash.includes('college')) {
          setPortalTier('college')
        } else if (hash.includes('uni')) {
          setPortalTier('university')
        } else {
          setPortalTier('school')
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
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

    // If currently active tier was unchecked, immediately switch to the first remaining
    if (!newTiers.includes(portalTier)) {
      handleSwitchTier(newTiers[0])
    }
  }

  // Switch tier and update URL hash cleanly
  const handleSwitchTier = (targetTier) => {
    setPortalTier(targetTier)
    if (typeof window !== 'undefined') {
      if (targetTier === 'superadmin') {
        window.location.hash = '#superadmin'
      } else if (targetTier === 'college') {
        window.location.hash = '#college-login'
      } else if (targetTier === 'university') {
        window.location.hash = '#university-login'
      } else {
        window.location.hash = '#school-login'
      }
    }
  }

  // Common props passed to each dedicated login page
  const commonProps = {
    onBackToLanding,
    onOpenTrial,
    onSwitchTier: handleSwitchTier,
    selectedTiers,
    onSetTiers: handleSetTiers
  }

  // Render dedicated isolated login page
  if (portalTier === 'college') {
    return <CollegeLoginPage {...commonProps} />
  }

  if (portalTier === 'university') {
    return <UniversityLoginPage {...commonProps} />
  }

  if (portalTier === 'superadmin') {
    return <SuperadminLoginPage {...commonProps} />
  }

  // Primary Default: Dedicated School Login Page (City School Model Town Campus K-10)
  return <SchoolLoginPage {...commonProps} />
}

export default LoginPage
