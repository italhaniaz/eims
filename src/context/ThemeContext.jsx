import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

/**
 * Enterprise Multi-Campus Theme System
 * Supports:
 * - Light / Dark / System mode
 * - Presets: School (#0EA5E9 + #F97316), College (#4F46E5 + #14B8A6), University (#1E3A8A + #D4AF37), Custom
 * - Auto-generated color shades & CSS variables
 * - Hero Gradients, Navy Sidebar tokens, Status tokens, Charts palette
 * - RTL / Urdu readiness with persistent direction & locale
 */

export const THEME_PRESETS = {
  school: {
    id: 'school',
    name: 'School Portal',
    badge: 'K-10 / Matric',
    primary: '#0EA5E9',
    secondary: '#F97316',
    accent: '#F59E0B',
    heroGradient: 'linear-gradient(135deg, #0EA5E9, #38BDF8 55%, #F97316)',
    description: 'Energetic sky blue & sunset orange for high engagement in primary & secondary schools'
  },
  college: {
    id: 'college',
    name: 'College & Higher Secondary',
    badge: 'Intermediate / F.Sc / A-Levels',
    primary: '#4F46E5',
    secondary: '#14B8A6',
    accent: '#F59E0B',
    heroGradient: 'linear-gradient(135deg, #4F46E5, #7C3AED 55%, #06B6D4)',
    description: 'Sophisticated indigo & teal for modern intermediate colleges and academies'
  },
  university: {
    id: 'university',
    name: 'University & Research',
    badge: 'HEC / Undergraduate & Postgrad',
    primary: '#1E3A8A',
    secondary: '#D4AF37',
    accent: '#B45309',
    heroGradient: 'linear-gradient(135deg, #1E3A8A, #312E81 55%, #D4AF37)',
    description: 'Prestigious deep royal navy & academic gold for universities and degree awarding institutes'
  },
  custom: {
    id: 'custom',
    name: 'Custom Brand',
    badge: 'Custom Palette',
    primary: '#059669',
    secondary: '#10B981',
    accent: '#F59E0B',
    heroGradient: 'linear-gradient(135deg, #059669, #10B981 55%, #06B6D4)',
    description: 'Pick custom brand colors with auto-generated shades, hover states and hero gradients'
  }
}

export const CHART_PALETTE = ['#4F46E5', '#14B8A6', '#F59E0B', '#EC4899', '#0EA5E9', '#8B5CF6']

const THEME_STORAGE_KEY = 'sms_theme_config'

// Helper: Hex to RGB
function hexToRgb(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map(x => x + x).join('')
  }
  const num = parseInt(c, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

// Helper: RGB to Hex
function rgbToHex(r, g, b) {
  const clamp = v => Math.min(255, Math.max(0, Math.round(v)))
  return '#' + [clamp(r), clamp(g), clamp(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}

// Generate shades from primary color
export function generateColorShades(hexColor, isDark = false) {
  try {
    const { r, g, b } = hexToRgb(hexColor)
    // Darker hover
    const hoverHex = rgbToHex(r * 0.86, g * 0.86, b * 0.86)
    
    // Soft tint
    const softRgba = isDark 
      ? `rgba(${r}, ${g}, ${b}, 0.18)` 
      : `rgba(${r}, ${g}, ${b}, 0.08)`
    
    const borderRgba = `rgba(${r}, ${g}, ${b}, 0.25)`

    // Hero gradient with shifted hue
    const midR = Math.min(255, r * 0.9 + 60)
    const midG = Math.max(0, g * 0.8 - 20)
    const midB = Math.min(255, b * 1.1 + 40)
    const midHex = rgbToHex(midR, midG, midB)

    const heroGradient = `linear-gradient(135deg, ${hexColor}, ${midHex} 55%, #06B6D4)`
    const heroGradientHover = `linear-gradient(135deg, ${hoverHex}, ${rgbToHex(midR * 0.85, midG * 0.85, midB * 0.85)} 55%, #0891B2)`

    return {
      primary: hexColor,
      primaryHover: hoverHex,
      primarySoft: softRgba,
      primaryBorder: borderRgba,
      heroGradient,
      heroGradientHover
    }
  } catch {
    return {
      primary: hexColor,
      primaryHover: hexColor,
      primarySoft: 'rgba(79, 70, 229, 0.1)',
      primaryBorder: 'rgba(79, 70, 229, 0.25)',
      heroGradient: 'linear-gradient(135deg, #4F46E5, #7C3AED 55%, #06B6D4)',
      heroGradientHover: 'linear-gradient(135deg, #4338CA, #6D28D9 55%, #0891B2)'
    }
  }
}

const ThemeContext = createContext(null)

export const ThemeProvider = ({ children }) => {
  // Load initial theme from localStorage
  const [themeMode, setThemeMode] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.mode) return parsed.mode
      }
    } catch {}
    return 'light'
  })

  const [preset, setPresetState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.preset && THEME_PRESETS[parsed.preset]) return parsed.preset
      }
    } catch {}
    return 'college' // Default SaaS preset is College (#4F46E5 + #14B8A6)
  })

  const [customPrimary, setCustomPrimaryState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.customPrimary) return parsed.customPrimary
      }
    } catch {}
    return '#4F46E5'
  })

  const [dir, setDirState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.dir) return parsed.dir
      }
    } catch {}
    return 'ltr'
  })

  const [locale, setLocaleState] = useState(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.locale) return parsed.locale
      }
    } catch {}
    return 'en'
  })

  // Detect system dark mode preference if themeMode === 'system'
  const isDark = useMemo(() => {
    if (themeMode === 'dark') return true
    if (themeMode === 'light') return false
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  }, [themeMode])

  // Apply CSS variables & attributes to Document
  useEffect(() => {
    const root = document.documentElement

    // 1. Theme Mode (Dark/Light)
    if (isDark) {
      root.setAttribute('data-theme', 'dark')
      root.classList.add('dark')
    } else {
      root.setAttribute('data-theme', 'light')
      root.classList.remove('dark')
    }

    // 2. Preset Attribute
    root.setAttribute('data-preset', preset)

    // 3. Direction & Locale
    root.setAttribute('dir', dir)
    root.setAttribute('lang', locale)

    // 4. Forcefully apply CSS variables to root element so they take instant effect
    let primary, primaryHover, primarySoft, primaryBorder, secondary, secondaryHover, secondarySoft, heroGradient, heroGradientHover

    if (preset === 'custom') {
      const shades = generateColorShades(customPrimary, isDark)
      primary = shades.primary
      primaryHover = shades.primaryHover
      primarySoft = shades.primarySoft
      primaryBorder = shades.primaryBorder
      secondary = isDark ? '#2DD4BF' : '#14B8A6'
      secondaryHover = isDark ? '#14B8A6' : '#0D9488'
      secondarySoft = isDark ? 'rgba(45, 212, 191, 0.18)' : '#CCFBF1'
      heroGradient = shades.heroGradient
      heroGradientHover = shades.heroGradientHover
    } else if (preset === 'school') {
      primary = isDark ? '#38BDF8' : '#0EA5E9'
      primaryHover = isDark ? '#0EA5E9' : '#0284C7'
      primarySoft = isDark ? 'rgba(56, 189, 248, 0.18)' : '#F0F9FF'
      primaryBorder = isDark ? 'rgba(56, 189, 248, 0.35)' : 'rgba(14, 165, 233, 0.25)'
      secondary = isDark ? '#FB923C' : '#F97316'
      secondaryHover = isDark ? '#F97316' : '#EA580C'
      secondarySoft = isDark ? 'rgba(251, 146, 60, 0.18)' : '#FFF7ED'
      heroGradient = isDark 
        ? 'linear-gradient(135deg, #0284C7, #0EA5E9 55%, #EA580C)' 
        : 'linear-gradient(135deg, #0EA5E9, #38BDF8 55%, #F97316)'
      heroGradientHover = 'linear-gradient(135deg, #0284C7, #0EA5E9 55%, #EA580C)'
    } else if (preset === 'university') {
      primary = isDark ? '#60A5FA' : '#1E3A8A'
      primaryHover = isDark ? '#3B82F6' : '#172554'
      primarySoft = isDark ? 'rgba(96, 165, 250, 0.18)' : '#EFF6FF'
      primaryBorder = isDark ? 'rgba(96, 165, 250, 0.35)' : 'rgba(30, 58, 138, 0.25)'
      secondary = isDark ? '#FACC15' : '#D4AF37'
      secondaryHover = isDark ? '#EAB308' : '#B89628'
      secondarySoft = isDark ? 'rgba(250, 204, 21, 0.18)' : '#FEFCE8'
      heroGradient = isDark
        ? 'linear-gradient(135deg, #1E40AF, #3730A3 55%, #EAB308)'
        : 'linear-gradient(135deg, #1E3A8A, #312E81 55%, #D4AF37)'
      heroGradientHover = 'linear-gradient(135deg, #172554, #1E1B4B 55%, #B89628)'
    } else {
      // College (Default SaaS: #4F46E5 + #14B8A6)
      primary = isDark ? '#818CF8' : '#4F46E5'
      primaryHover = isDark ? '#6366F1' : '#4338CA'
      primarySoft = isDark ? 'rgba(129, 140, 248, 0.18)' : '#EEF2FF'
      primaryBorder = isDark ? 'rgba(129, 140, 248, 0.35)' : 'rgba(79, 70, 229, 0.25)'
      secondary = isDark ? '#2DD4BF' : '#14B8A6'
      secondaryHover = isDark ? '#14B8A6' : '#0D9488'
      secondarySoft = isDark ? 'rgba(45, 212, 191, 0.18)' : '#CCFBF1'
      heroGradient = isDark
        ? 'linear-gradient(135deg, #6366F1, #8B5CF6 55%, #06B6D4)'
        : 'linear-gradient(135deg, #4F46E5, #7C3AED 55%, #06B6D4)'
      heroGradientHover = 'linear-gradient(135deg, #4338CA, #6D28D9 55%, #0891B2)'
    }

    // Set Brand Tokens on root
    root.style.setProperty('--primary', primary)
    root.style.setProperty('--primary-hover', primaryHover)
    root.style.setProperty('--primary-soft', primarySoft)
    root.style.setProperty('--primary-border', primaryBorder)
    root.style.setProperty('--secondary', secondary)
    root.style.setProperty('--secondary-hover', secondaryHover)
    root.style.setProperty('--secondary-soft', secondarySoft)
    root.style.setProperty('--accent', '#F59E0B')
    root.style.setProperty('--hero-gradient', heroGradient)
    root.style.setProperty('--hero-gradient-text', heroGradient)
    root.style.setProperty('--hero-gradient-hover', heroGradientHover)

    // Base background and surface tokens
    const bg = isDark ? '#0B1020' : '#F8FAFC'
    const surface = isDark ? '#131A2E' : '#FFFFFF'
    const surfaceRaised = isDark ? '#1A233D' : '#FFFFFF'
    const border = isDark ? '#243049' : '#E2E8F0'
    const borderSubtle = isDark ? '#1C263D' : '#F1F5F9'
    const text = isDark ? '#E6EAF5' : '#0F172A'
    const textMuted = isDark ? '#94A3B8' : '#64748B'
    const textSubtle = isDark ? '#64748B' : '#94A3B8'

    root.style.setProperty('--bg', bg)
    root.style.setProperty('--surface', surface)
    root.style.setProperty('--surface-raised', surfaceRaised)
    root.style.setProperty('--border', border)
    root.style.setProperty('--border-subtle', borderSubtle)
    root.style.setProperty('--text', text)
    root.style.setProperty('--text-muted', textMuted)
    root.style.setProperty('--text-subtle', textSubtle)

    // Status colors
    root.style.setProperty('--success', '#22C55E')
    root.style.setProperty('--warning', '#F59E0B')
    root.style.setProperty('--error', '#EF4444')
    root.style.setProperty('--info', isDark ? '#38BDF8' : '#0EA5E9')

    // Chart palette tokens
    root.style.setProperty('--chart-1', '#4F46E5')
    root.style.setProperty('--chart-2', '#14B8A6')
    root.style.setProperty('--chart-3', '#F59E0B')
    root.style.setProperty('--chart-4', '#EC4899')
    root.style.setProperty('--chart-5', '#0EA5E9')
    root.style.setProperty('--chart-6', '#8B5CF6')

    // 5. Update browser meta theme-color
    const activePrimary = preset === 'custom' 
      ? customPrimary 
      : (THEME_PRESETS[preset]?.primary || '#4F46E5')
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0B1020' : activePrimary)
    }

    // 6. Persist to localStorage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({
        mode: themeMode,
        preset,
        customPrimary,
        dir,
        locale
      }))
    } catch {}
  }, [themeMode, preset, customPrimary, dir, locale, isDark])

  // Handlers
  const toggleThemeMode = useCallback(() => {
    setThemeMode(prev => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  const setPreset = useCallback((presetId) => {
    if (THEME_PRESETS[presetId]) {
      setPresetState(presetId)
    }
  }, [])

  const setCustomPrimary = useCallback((hex) => {
    setCustomPrimaryState(hex)
    setPresetState('custom')
  }, [])

  const toggleDir = useCallback(() => {
    setDirState(prev => {
      const nextDir = prev === 'ltr' ? 'rtl' : 'ltr'
      setLocaleState(nextDir === 'rtl' ? 'ur' : 'en')
      return nextDir
    })
  }, [])

  const setLocale = useCallback((newLocale) => {
    setLocaleState(newLocale)
    setDirState(newLocale === 'ur' ? 'rtl' : 'ltr')
  }, [])

  const activeThemeConfig = useMemo(() => {
    const base = THEME_PRESETS[preset] || THEME_PRESETS.college
    if (preset === 'custom') {
      const shades = generateColorShades(customPrimary, isDark)
      return {
        ...base,
        primary: shades.primary,
        primaryHover: shades.primaryHover,
        primarySoft: shades.primarySoft,
        heroGradient: shades.heroGradient
      }
    }
    return base
  }, [preset, customPrimary, isDark])

  const contextValue = useMemo(() => ({
    themeMode,
    setThemeMode,
    toggleThemeMode,
    isDark,
    preset,
    setPreset,
    customPrimary,
    setCustomPrimary,
    dir,
    setDir: setDirState,
    toggleDir,
    locale,
    setLocale,
    activeThemeConfig,
    presets: THEME_PRESETS,
    chartPalette: CHART_PALETTE
  }), [themeMode, toggleThemeMode, isDark, preset, setPreset, customPrimary, setCustomPrimary, dir, toggleDir, locale, setLocale, activeThemeConfig])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeContext
