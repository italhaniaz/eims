import React, { useState, useEffect, useRef } from 'react'
import { 
  School, 
  Building2, 
  GraduationCap, 
  Lock, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  X, 
  Sparkles,
  Layers
} from 'lucide-react'

export const PORTAL_DEFINITIONS = [
  {
    id: 'school',
    title: 'School Portal Login',
    shortTitle: 'School Portal',
    scope: 'K-10 Scope',
    subtitle: 'City School Model Town • Grades 1-10',
    icon: School,
    emoji: '🏫',
    accentColor: 'emerald',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'college',
    title: 'College Portal Login',
    shortTitle: 'College Portal',
    scope: '11-12 & ADP',
    subtitle: 'Roots International College • Intermediate',
    icon: Building2,
    emoji: '🏛️',
    accentColor: 'emerald',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'university',
    title: 'University Portal Login',
    shortTitle: 'University Portal',
    scope: 'HEC BS/MS',
    subtitle: 'Institute of Applied Sciences • Undergrad/Grad',
    icon: GraduationCap,
    emoji: '🎓',
    accentColor: 'emerald',
    activeBg: 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-500/40',
    badgeClass: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    iconColor: 'text-emerald-600'
  },
  {
    id: 'superadmin',
    title: 'Super Admin',
    shortTitle: 'Super Admin',
    scope: 'HQ Control',
    subtitle: 'Master Multi-Tenant Platform Dashboard',
    icon: Lock,
    emoji: '🔒',
    accentColor: 'slate',
    activeBg: 'bg-slate-900 text-white shadow-slate-900/30 ring-2 ring-emerald-500/40',
    badgeClass: 'bg-slate-100 text-slate-800 border border-slate-300',
    iconColor: 'text-slate-600'
  }
]

export const PortalFilterBar = ({
  activeTier = 'school',
  onSwitchTier,
  selectedTiers = ['school', 'college', 'university', 'superadmin'],
  onToggleTier,
  onSetTiers,
  isDark = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // Toggle individual tier checkbox with minimum 1 selection guard
  const handleCheckboxToggle = (tierId) => {
    if (selectedTiers.includes(tierId)) {
      if (selectedTiers.length <= 1) return // Keep at least 1 active
      const next = selectedTiers.filter(t => t !== tierId)
      onSetTiers?.(next)
      // If currently active tier is being unchecked, switch to first remaining
      if (activeTier === tierId && next.length > 0) {
        onSwitchTier?.(next[0])
      }
    } else {
      const next = [...selectedTiers, tierId]
      onSetTiers?.(next)
    }
  }

  // Quick preset handlers
  const handleSelectOnly = (tierId) => {
    onSetTiers?.([tierId])
    onSwitchTier?.(tierId)
    setIsOpen(false)
  }

  const handleSelectAll = () => {
    const all = ['school', 'college', 'university', 'superadmin']
    onSetTiers?.(all)
  }

  return (
    <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-4 sm:mb-5 relative z-40">
      {/* 1. FILTER BUTTON & DROPDOWN POPOVER */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer border ${
            isOpen
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-emerald-600/30 ring-2 ring-emerald-500/40'
              : isDark
              ? 'bg-slate-900/90 text-slate-200 border-slate-700 hover:border-emerald-500 hover:text-white'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40'
          }`}
          title="Filter visible login portals using checkboxes"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Filter Portals</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
            isOpen
              ? 'bg-white/20 text-white'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {selectedTiers.length}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* POPOVER CARD */}
        {isOpen && (
          <div className="absolute top-full mt-2 left-0 sm:left-auto sm:-translate-x-1/4 w-[310px] sm:w-[350px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 z-50 animate-in fade-in zoom-in-95 text-slate-900 text-left">
            {/* Popover Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Portal Display Filters</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Select which portals appear on the login screen
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets Bar */}
            <div className="flex items-center gap-1.5 py-2.5 border-b border-slate-100 overflow-x-auto text-[11px] scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-0.5">Preset:</span>
              <button
                type="button"
                onClick={() => handleSelectOnly('school')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedTiers.length === 1 && selectedTiers[0] === 'school'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Only School
              </button>
              <button
                type="button"
                onClick={() => handleSelectOnly('college')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedTiers.length === 1 && selectedTiers[0] === 'college'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Only College
              </button>
              <button
                type="button"
                onClick={() => handleSelectOnly('university')}
                className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                  selectedTiers.length === 1 && selectedTiers[0] === 'university'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                Only Uni
              </button>
              <button
                type="button"
                onClick={handleSelectAll}
                className="px-2 py-0.5 rounded-md font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 cursor-pointer"
              >
                All (4)
              </button>
            </div>

            {/* Checkbox Options List */}
            <div className="space-y-1.5 pt-2.5">
              {PORTAL_DEFINITIONS.map(item => {
                const isChecked = selectedTiers.includes(item.id)
                const IconComponent = item.icon
                return (
                  <label
                    key={item.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border transition-all cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-50/50 border-emerald-300 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 opacity-65'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCheckboxToggle(item.id)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 truncate flex items-center gap-1.5">
                          <span>{item.emoji}</span>
                          <span>{item.shortTitle}</span>
                        </span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded ${item.badgeClass}`}>
                          {item.scope}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            {/* Footer Hint */}
            <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <span>Multiple can be selected</span>
              <span className="text-emerald-700 font-bold">{selectedTiers.length} of 4 visible</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. ONLY RENDER PORTALS THAT ARE CHECKED */}
      {PORTAL_DEFINITIONS.filter(def => selectedTiers.includes(def.id)).map(portal => {
        const isActive = activeTier === portal.id
        const Icon = portal.icon
        return (
          <button
            key={portal.id}
            type="button"
            onClick={() => onSwitchTier?.(portal.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer border ${
              isActive
                ? portal.activeBg
                : isDark
                ? 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-emerald-600 hover:text-white'
                : 'bg-white hover:bg-emerald-50/60 text-slate-700 border-slate-200 hover:border-emerald-300'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : portal.iconColor}`} />
            <span>{portal.emoji} {portal.title}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
              isActive
                ? 'bg-white/20 text-white'
                : portal.badgeClass
            }`}>
              {portal.scope}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default PortalFilterBar
