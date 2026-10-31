import React, { useState, useRef, useEffect } from 'react'
import { 
  Bell, 
  Settings, 
  User, 
  School, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Menu, 
  LogOut, 
  ShieldCheck, 
  GraduationCap, 
  BookOpen, 
  Award, 
  Building2, 
  Layers, 
  Check, 
  X, 
  Filter, 
  Search,
  ExternalLink,
  Key
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import ChangePasswordModal from '../common/ChangePasswordModal'
import CloudSyncBadge from '../common/CloudSyncBadge'

export const InstituteAdminNavbar = ({ 
  currentRoute, 
  selectedInstitute, 
  onSelectInstitute, 
  onOpenSettings,
  onOpenMobileMenu,
  onOpenCommandPalette,
  onRouteChange
}) => {
  const { user, logout } = useAuth()
  const { 
    institutes, 
    activeProgramLevel, 
    setActiveProgramLevel, 
    activeWing = 'all',
    setActiveWing,
    programLevels = [] 
  } = useAppData()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [levelSearchTerm, setLevelSearchTerm] = useState('')

  // Expandable state for each level's categories
  const [expandedLevels, setExpandedLevels] = useState({
    elementary: true,
    secondary: false,
    'higher-secondary': false,
    college: false,
    university: false
  })

  const profileRef = useRef(null)
  const campusRef = useRef(null)
  const levelRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false)
      }
      if (campusRef.current && !campusRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
      if (levelRef.current && !levelRef.current.contains(e.target)) {
        setLevelDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLevelObj = programLevels.find(l => l.id === activeProgramLevel) || programLevels[0]

  const enabledTiers = selectedInstitute?.enabledTiers || (
    selectedInstitute?.type === 'School' ? ['school'] :
    selectedInstitute?.type === 'College' ? ['college'] :
    selectedInstitute?.type === 'University' ? ['undergraduate'] :
    ['school', 'college']
  )

  const availableWings = [
    { id: 'all', label: 'All Wings', icon: Layers, badge: 'Overview' },
    ...(enabledTiers.includes('school') ? [{ id: 'school', label: 'School Wing', icon: School, badge: 'K-10' }] : []),
    ...(enabledTiers.includes('college') ? [{ id: 'college', label: 'College Wing', icon: Building2, badge: '11-12' }] : []),
    ...(enabledTiers.includes('undergraduate') ? [{ id: 'undergraduate', label: 'Undergraduates', icon: GraduationCap, badge: 'BS' }] : [])
  ]

  const getLevelIcon = (id, className = "w-4 h-4") => {
    switch (id) {
      case 'preschool':
        return <Sparkles className={className} />
      case 'elementary':
        return <BookOpen className={className} />
      case 'secondary':
        return <Award className={className} />
      case 'higher-secondary':
        return <GraduationCap className={className} />
      case 'college':
        return <Building2 className={className} />
      case 'university':
        return <Sparkles className={className} />
      default:
        return <Layers className={className} />
    }
  }

  const getLevelColorBadge = (id) => {
    switch (id) {
      case 'preschool':
        return 'bg-pink-50 text-pink-700 border-pink-200'
      case 'elementary':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'secondary':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'higher-secondary':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'college':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'university':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  const toggleExpandLevel = (e, levelId) => {
    e.stopPropagation()
    setExpandedLevels(prev => ({
      ...prev,
      [levelId]: !prev[levelId]
    }))
  }

  const selectLevel = (levelId) => {
    setActiveProgramLevel(levelId)
    setLevelDropdownOpen(false)
    setLevelSearchTerm('')
  }

  const toggleExpandAll = () => {
    const allExpanded = Object.values(expandedLevels).every(Boolean)
    const nextState = {}
    programLevels.forEach(lvl => {
      if (lvl.id !== 'all') nextState[lvl.id] = !allExpanded
    })
    setExpandedLevels(nextState)
  }

  const filteredLevels = programLevels.filter(lvl => {
    if (!levelSearchTerm) return true
    const term = levelSearchTerm.toLowerCase()
    return (
      lvl.title.toLowerCase().includes(term) ||
      lvl.grades.toLowerCase().includes(term) ||
      lvl.code.toLowerCase().includes(term) ||
      lvl.categories.some(cat => 
        cat.name.toLowerCase().includes(term) || 
        cat.span.toLowerCase().includes(term) ||
        (cat.subjects && cat.subjects.some(s => s.toLowerCase().includes(term)))
      )
    )
  })

  const getRouteTitle = () => {
    switch (currentRoute) {
      case 'inst-dashboard': return 'Campus Overview'
      case 'inst-students': return 'Students & Admissions'
      case 'inst-teachers': return 'Faculty & Staff'
      case 'inst-classes': return 'Classes & Sections'
      case 'inst-timetable': return 'Class Timetable Schedule'
      case 'inst-attendance': return 'Daily Attendance'
      case 'inst-fees': return 'Fee Invoices & Payments'
      case 'inst-exams': return 'Examinations & Marks'
      case 'inst-subjects': return 'Academic Curriculum & Subjects'
      case 'inst-notices': return 'Campus Notice Board'
      case 'inst-admissions': return 'Inquiries & Leads'
      case 'inst-transport': return 'Campus Transport & Vans'
      case 'inst-library': return 'Campus Library & Book Issues'
      case 'inst-program-levels': return 'Academic Program Levels'
      default: return 'Campus Portal'
    }
  }

  return (
    <header className="h-16 sm:h-20 min-h-[64px] sm:min-h-[80px] bg-white border-b border-slate-100 px-3.5 sm:px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Mobile Hamburger, Campus Switcher, & Program Levels Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 -ml-1 sm:p-2 sm:-ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Campus Switcher (Only visible to Superadmin scoping/impersonating campuses) */}
        {user?.role === 'superadmin' && (
          <>
            <div className="relative" ref={campusRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 sm:gap-2 bg-[#f5eeff] text-purple-800 border border-purple-200/80 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-purple-100 transition-colors"
              >
                <School className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span className="max-w-[100px] sm:max-w-[150px] truncate">{selectedInstitute?.name || 'Main Campus'}</span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Select Active Campus
                  </div>
                  {institutes && institutes.length > 0 ? (
                    institutes.map((inst) => (
                      <button
                        key={inst.id}
                        onClick={() => {
                          onSelectInstitute(inst)
                          setDropdownOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                          selectedInstitute?.id === inst.id ? 'bg-[#f5eeff] text-purple-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <span className="truncate">{inst.name}</span>
                        <span className="font-mono text-[10px] text-slate-400">{inst.code}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-slate-400">No other institutes found</div>
                  )}
                </div>
              )}
            </div>
            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200 shrink-0" />
          </>
        )}

        {/* Program Levels Selector Dropdown (Interactive K-12 to University Scope) */}
        <div className="relative" ref={levelRef}>
          <button
            type="button"
            onClick={() => setLevelDropdownOpen(!levelDropdownOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 border ${
              activeProgramLevel !== 'all'
                ? 'bg-[#f5eeff] text-purple-800 border-purple-300 ring-2 ring-purple-100 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
            title="Expand Academic Program Levels"
          >
            {getLevelIcon(activeProgramLevel, activeProgramLevel !== 'all' ? 'w-3.5 h-3.5 text-purple-600 shrink-0' : 'w-3.5 h-3.5 text-slate-500 shrink-0')}
            <span className="hidden md:inline font-medium text-slate-400">Level:</span>
            <span className="max-w-[90px] sm:max-w-[130px] truncate font-bold">
              {currentLevelObj?.shortTitle || 'All Levels'}
            </span>
            {activeProgramLevel !== 'all' && (
              <span className="hidden sm:inline-block w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
            )}
            <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5 shrink-0" />
          </button>

          {/* Program Levels Expandable Popover Menu */}
          {levelDropdownOpen && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 max-h-[85vh] overflow-y-auto divide-y divide-slate-100">
              {/* Dropdown Header with Quick Actions */}
              <div className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-600" />
                      <span>Academic Program Levels</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">K-12 to University Educational Hierarchy</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={toggleExpandAll}
                      className="text-[10px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Toggle All
                    </button>
                    {activeProgramLevel !== 'all' && (
                      <button
                        onClick={() => selectLevel('all')}
                        className="text-[10px] font-semibold text-purple-600 hover:underline px-2 py-0.5 rounded bg-[#f5eeff] border border-purple-200"
                      >
                        Reset All
                      </button>
                    )}
                  </div>
                </div>

                {/* Instant Search / Filter Input */}
                <div className="mt-2.5 relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search level or stream (e.g. FSc, Matric, Grade 5)..."
                    value={levelSearchTerm}
                    onChange={(e) => setLevelSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                  {levelSearchTerm && (
                    <button
                      onClick={() => setLevelSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* All Levels Option (Shown when not searching or matches) */}
              {(!levelSearchTerm || 'all levels'.includes(levelSearchTerm.toLowerCase())) && (
                <div className="p-2">
                  <button
                    type="button"
                    onClick={() => selectLevel('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      activeProgramLevel === 'all' 
                        ? 'bg-[#f5eeff] text-purple-800 font-bold border border-purple-200' 
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <School className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">All Program Levels</div>
                        <div className="text-[10px] text-slate-400 font-normal">Campus-wide aggregated view</div>
                      </div>
                    </div>
                    {activeProgramLevel === 'all' && (
                      <Check className="w-4 h-4 text-purple-600 shrink-0" />
                    )}
                  </button>
                </div>
              )}

              {/* 5 Levels with In-line Expandable Categories */}
              <div className="p-2 space-y-1.5">
                {filteredLevels.filter(lvl => lvl.id !== 'all').map((lvl) => {
                  const isSelected = activeProgramLevel === lvl.id
                  const isExpanded = levelSearchTerm ? true : !!expandedLevels[lvl.id]

                  return (
                    <div 
                      key={lvl.id}
                      className={`rounded-xl border transition-all duration-150 overflow-hidden ${
                        isSelected 
                          ? 'bg-[#f5eeff]/40 border-purple-200 shadow-2xs' 
                          : 'border-slate-100 hover:border-slate-200 bg-white'
                      }`}
                    >
                      {/* Level Item Row */}
                      <div className="flex items-center justify-between p-2.5 gap-2">
                        {/* Select Level Trigger */}
                        <button
                          type="button"
                          onClick={() => selectLevel(lvl.id)}
                          className="flex items-center gap-2.5 flex-1 text-left min-w-0"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {getLevelIcon(lvl.id, "w-4 h-4")}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-800 truncate">{lvl.title}</span>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full border ${getLevelColorBadge(lvl.id)}`}>
                                {lvl.badge}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 truncate">
                              <span>{lvl.grades}</span>
                              <span>•</span>
                              <span className="font-medium text-slate-500">{lvl.categories.length} Streams</span>
                            </div>
                          </div>
                        </button>

                        {/* Expand / Collapse Category Arrow Button */}
                        <button
                          type="button"
                          onClick={(e) => toggleExpandLevel(e, lvl.id)}
                          title={isExpanded ? "Collapse categories" : "Expand categories"}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-700" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Expandable Categories Section */}
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100/90 bg-slate-50/70 animate-in fade-in duration-150">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-0.5 flex items-center justify-between">
                            <span>Categories & Curriculum Streams</span>
                            <span className="text-[9px] font-mono text-slate-400">{lvl.typicalAge}</span>
                          </div>
                          <div className="space-y-1">
                            {lvl.categories.map((cat, idx) => (
                              <div 
                                key={idx}
                                className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200/60 flex items-center justify-between text-[11px] hover:border-slate-300 transition-colors"
                              >
                                <div className="flex flex-col pr-2">
                                  <span className="font-semibold text-slate-700">{cat.name}</span>
                                  <span className="text-[10px] text-slate-400">{cat.board}</span>
                                </div>
                                <span className="text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                                  {cat.span}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Bottom Footer Info & Dedicated Page Link */}
              <div className="px-4 py-2.5 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
                <button
                  onClick={() => {
                    setLevelDropdownOpen(false)
                    if (onRouteChange) onRouteChange('inst-program-levels')
                  }}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 group"
                >
                  <span>Open Full Program Matrix</span>
                  <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
                {activeProgramLevel !== 'all' && (
                  <button
                    onClick={() => selectLevel('all')}
                    className="text-slate-500 hover:text-slate-800 text-[10px] font-semibold underline"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <ChevronRight className="hidden sm:inline-block w-3.5 h-3.5 text-slate-300 shrink-0" />
        <h1 className="text-sm font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-none">
          {getRouteTitle()}
        </h1>
      </div>

      {/* Center: Academic Wing Switcher (Multi-Tier Option A Architecture) */}
      {availableWings.length > 2 && (
        <div className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-2xs gap-1">
          {availableWings.map(wing => {
            const Icon = wing.icon
            const isActive = activeWing === wing.id
            return (
              <button
                key={wing.id}
                type="button"
                onClick={() => setActiveWing && setActiveWing(wing.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-purple-700 shadow-xs border border-purple-200/70 ring-1 ring-purple-500/10' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title={`Switch active view to ${wing.label}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-purple-600' : 'text-slate-500'}`} />
                <span>{wing.label}</span>
                {wing.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive ? 'bg-[#f5eeff] text-purple-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {wing.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Single Tier Campus Badge (when institute only has 1 tier enabled) */}
      {availableWings.length <= 2 && (
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs font-semibold">
          {enabledTiers[0] === 'school' && <School className="w-4 h-4 text-purple-600" />}
          {enabledTiers[0] === 'college' && <Building2 className="w-4 h-4 text-purple-600" />}
          {enabledTiers[0] === 'undergraduate' && <GraduationCap className="w-4 h-4 text-purple-600" />}
          <span>{enabledTiers[0] === 'undergraduate' ? 'Undergraduates / University' : (enabledTiers[0] || 'Campus').toUpperCase()} Portal</span>
        </div>
      )}

      {/* Right: Settings and User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">


        {/* Cloud & Offline Synchronization Status Badge */}
        <CloudSyncBadge onOpenSettings={onOpenSettings} />

        <button 
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          title="System Settings"
        >
          <Settings className="w-5 h-5 text-slate-400" />
        </button>

        {/* User Profile Avatar with Popover */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white cursor-pointer hover:ring-2 hover:ring-purple-300 transition-all shadow-sm focus:outline-none"
            title="Institute Admin Profile"
          >
            <User className="w-4 h-4 text-white" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || 'Campus Administrator'}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 truncate">{user?.email || 'admin@campus.edu'}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#f5eeff] text-purple-700 border border-purple-200">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Campus Administrator</span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    setShowPasswordModal(true)
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                >
                  <Key className="w-3.5 h-3.5 text-purple-600" />
                  <span>Change Password & Security</span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    onOpenSettings()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false)
                    logout()
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </header>
  )
}

export default InstituteAdminNavbar
