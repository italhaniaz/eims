import React, { useState, useEffect } from 'react'
import { SchoolLoginPage } from './SchoolLoginPage'
import { CollegeLoginPage } from './CollegeLoginPage'
import { UniversityLoginPage } from './UniversityLoginPage'
import { SuperadminLoginPage } from './SuperadminLoginPage'
import { DemoPitchPill } from '../../components/common/DemoPitchPill'

export const LoginPage = ({ onBackToLanding, onOpenTrial, defaultTier }) => {
  // Determine initial tier based on URL hash or defaultTier prop
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
    onSwitchTier: handleSwitchTier
  }

  return (
    <>
      {portalTier === 'college' && <CollegeLoginPage {...commonProps} />}
      {portalTier === 'university' && <UniversityLoginPage {...commonProps} />}
      {portalTier === 'superadmin' && <SuperadminLoginPage {...commonProps} />}
      {portalTier !== 'college' && portalTier !== 'university' && portalTier !== 'superadmin' && (
        <SchoolLoginPage {...commonProps} />
      )}

      {/* Discreet Demo & Pitch Switcher (Floating at bottom-right for sales & testing) */}
      <DemoPitchPill
        activeTier={portalTier}
        onSwitchTier={handleSwitchTier}
      />
    </>
  )
}

export default LoginPage
