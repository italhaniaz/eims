import React, { useState, useEffect } from 'react'
import { SchoolLoginPage } from './SchoolLoginPage'
import { CollegeLoginPage } from './CollegeLoginPage'
import { UniversityLoginPage } from './UniversityLoginPage'
import { SuperadminLoginPage } from './SuperadminLoginPage'
import { DemoPitchPill } from '../../components/common/DemoPitchPill'
import { useTheme } from '../../context/ThemeContext'
import ThemeCustomizerModal from '../../components/common/ThemeCustomizerModal'
import { Moon, Sun, Palette } from 'lucide-react'

export const LoginPage = ({ onBackToLanding, onOpenTrial, defaultTier }) => {
  const { isDark, toggleThemeMode, preset, setPreset, activeThemeConfig } = useTheme()
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false)

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

  // Listen to hash changes dynamically and sync preset if desired
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash.toLowerCase()
        if (hash.includes('superadmin') || hash.includes('admin-login')) {
          setPortalTier('superadmin')
        } else if (hash.includes('college')) {
          setPortalTier('college')
          setPreset('college')
        } else if (hash.includes('uni')) {
          setPortalTier('university')
          setPreset('university')
        } else {
          setPortalTier('school')
          setPreset('school')
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [setPreset])

  // Switch tier and update URL hash & theme preset cleanly
  const handleSwitchTier = (targetTier) => {
    setPortalTier(targetTier)
    if (targetTier === 'school') {
      setPreset('school')
    } else if (targetTier === 'college') {
      setPreset('college')
    } else if (targetTier === 'university') {
      setPreset('university')
    }
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
      {/* Top-Right Ambient Theme & Dark Mode Controls */}
      <div className="fixed top-4 right-4 z-40 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsThemeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          title="Theme Studio: Customize Design Tokens & Presets"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block shadow-2xs"
            style={{ backgroundColor: activeThemeConfig?.primary || 'var(--primary)' }}
          />
          <Palette className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span className="capitalize hidden sm:inline">{preset}</span>
        </button>

        <button
          type="button"
          onClick={toggleThemeMode}
          className="p-2 rounded-xl text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow transition-all backdrop-blur-md cursor-pointer hover:scale-105 active:scale-95"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>

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

      <ThemeCustomizerModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </>
  )
}

export default LoginPage
