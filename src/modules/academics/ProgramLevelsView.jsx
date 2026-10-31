import React, { useState } from 'react'
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Building2, 
  Sparkles, 
  Layers, 
  Check, 
  ChevronRight, 
  Info, 
  Plus, 
  CheckCircle2, 
  School,
  FileCheck,
  Search,
  Download,
  BookMarked,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'
import { getInstituteTierConfig } from '../../utils/tierGating'

export const ProgramLevelsView = ({ currentInstitute }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { 
    programLevels = [], 
    activeProgramLevel, 
    setActiveProgramLevel,
    addItem
  } = useAppData()

  const [toastMessage, setToastMessage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'school' | 'college' | 'university'
  const [isAddStreamModalOpen, setIsAddStreamModalOpen] = useState(false)
  const [expandedCurriculum, setExpandedCurriculum] = useState({})

  // Custom streams added by user
  const [customStreams, setCustomStreams] = useState([])
  const [newStreamData, setNewStreamData] = useState({
    levelId: 'elementary',
    name: '',
    span: '',
    board: '',
    subjects: ''
  })

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSelectLevel = (levelId, levelTitle) => {
    setActiveProgramLevel(levelId)
    triggerToast(`Active academic filter set to: ${levelTitle}`)
  }

  const toggleCurriculum = (key) => {
    setExpandedCurriculum(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleAddStream = (e) => {
    e.preventDefault()
    if (!newStreamData.name || !newStreamData.span) return

    const newStream = {
      levelId: newStreamData.levelId,
      name: newStreamData.name,
      span: newStreamData.span,
      board: newStreamData.board || 'Campus Curriculum Board',
      subjects: newStreamData.subjects 
        ? newStreamData.subjects.split(',').map(s => s.trim()) 
        : ['Core Foundations', 'Elective Lab']
    }

    setCustomStreams(prev => [...prev, newStream])
    addItem('recentActivity', {
      text: `Added new academic stream "${newStream.name}" to ${newStreamData.levelId} level`,
      time: 'Just now'
    })

    setIsAddStreamModalOpen(false)
    setNewStreamData({
      levelId: 'elementary',
      name: '',
      span: '',
      board: '',
      subjects: ''
    })
    triggerToast(`Stream "${newStream.name}" added to academic structure!`)
  }

  // Export Academic Prospectus CSV
  const handleExportProspectus = () => {
    const rows = [
      ['Campus Academic Structure & Prospectus Directory'],
      ['Institute:', currentInstitute?.name || 'Primary Campus'],
      ['Generated At:', new Date().toLocaleString()],
      [''],
      ['Tier Code', 'Program Level', 'Grade Span', 'Stream Name', 'Affiliated Board', 'Curriculum Subjects']
    ]

    programLevels.filter(lvl => lvl.id !== 'all').forEach(lvl => {
      const allStreams = [
        ...lvl.categories,
        ...customStreams.filter(cs => cs.levelId === lvl.id)
      ]

      allStreams.forEach(stream => {
        rows.push([
          lvl.code,
          lvl.title,
          stream.span,
          stream.name,
          stream.board,
          (stream.subjects || []).join('; ')
        ])
      })
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Academic_Prospectus_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    triggerToast('Academic Prospectus CSV downloaded successfully!')
  }

  const getLevelIcon = (id) => {
    switch (id) {
      case 'elementary':
        return <BookOpen className="w-5 h-5 text-emerald-600" />
      case 'secondary':
        return <Award className="w-5 h-5 text-blue-600" />
      case 'higher-secondary':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />
      case 'college':
        return <Building2 className="w-5 h-5 text-amber-600" />
      case 'university':
        return <Sparkles className="w-5 h-5 text-purple-600" />
      default:
        return <Layers className="w-5 h-5 text-slate-600" />
    }
  }

  const getLevelAccent = (id) => {
    switch (id) {
      case 'elementary':
        return {
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-800',
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white'
        }
      case 'secondary':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-800',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white'
        }
      case 'higher-secondary':
        return {
          bg: 'bg-indigo-50',
          border: 'border-indigo-200',
          badge: 'bg-indigo-100 text-indigo-800',
          btn: 'bg-indigo-600 hover:bg-indigo-700 text-white'
        }
      case 'college':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          badge: 'bg-amber-100 text-amber-800',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white'
        }
      case 'university':
        return {
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-800',
          btn: 'bg-purple-600 hover:bg-purple-700 text-white'
        }
      default:
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badge: 'bg-slate-100 text-slate-800',
          btn: 'bg-slate-800 hover:bg-slate-900 text-white'
        }
    }
  }

  const activeLevelObj = programLevels.find(l => l.id === activeProgramLevel) || programLevels[0]

  // Filter levels based on tab and search
  const visibleLevels = programLevels.filter(lvl => {
    if (lvl.id === 'all') return false

    // Tier Gating: Hide tiers outside of current institute authority
    if (!tierConfig.isLevelAllowed(lvl.id)) return false

    // Tab filter
    if (activeTab === 'school' && !['preschool', 'elementary', 'secondary'].includes(lvl.id)) return false
    if (activeTab === 'higher-secondary' && lvl.id !== 'higher-secondary') return false
    if (activeTab === 'university' && lvl.id !== 'university') return false

    // Search filter
    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const allStreams = [
      ...lvl.categories,
      ...customStreams.filter(cs => cs.levelId === lvl.id)
    ]

    return (
      lvl.title.toLowerCase().includes(term) ||
      lvl.grades.toLowerCase().includes(term) ||
      lvl.bracket.toLowerCase().includes(term) ||
      allStreams.some(s => 
        s.name.toLowerCase().includes(term) || 
        s.span.toLowerCase().includes(term) ||
        (s.subjects && s.subjects.some(sub => sub.toLowerCase().includes(term)))
      )
    )
  })

  // Calculate statistics
  const totalStreamsCount = programLevels.filter(l => l.id !== 'all').reduce((sum, l) => sum + l.categories.length, 0) + customStreams.length

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-700 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Academic Architecture & Levels</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            {tierConfig.isUniversityOnly 
              ? 'University Faculties & Degree Programs Matrix' 
              : tierConfig.isCollegeOnly 
              ? 'College Academic Streams & Intermediate Disciplines' 
              : 'Academic Program Levels & Curriculum Streams'}
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {tierConfig.isUniversityOnly 
              ? 'Higher Education Framework spanning 4-Year BS Honors programs, 8 Academic Semesters, credit hours & HEC guidelines.'
              : tierConfig.isCollegeOnly 
              ? 'Intermediate framework spanning Higher Secondary (HSSC: FSc Pre-Med, Pre-Engg, ICS, I.Com) & Associate Degrees (ADP).'
              : 'Modular educational framework spanning from Pre-School & Elementary Education (Grades 1-8) to Secondary High School (Grades 9-10).'}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
          <button
            onClick={() => setIsAddStreamModalOpen(true)}
            className="flex-1 lg:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Stream</span>
          </button>
          <button
            onClick={handleExportProspectus}
            className="flex-1 lg:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Prospectus</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Educational Tiers</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">5 Levels</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">K - 16</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Total Curriculum Streams</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalStreamsCount} Streams</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Structured</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Affiliated Authorities</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">4 Boards</span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Certified</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Current Campus Scope</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold text-slate-900 truncate max-w-[130px]">{activeLevelObj.shortTitle}</span>
            {activeProgramLevel !== 'all' ? (
              <button 
                onClick={() => handleSelectLevel('all', 'All Program Levels')}
                className="text-[10px] text-blue-600 hover:underline font-semibold"
              >
                Reset
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Full Campus</span>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            ...(tierConfig.isMultiTier ? [{ id: 'all', label: 'All Tiers' }] : []),
            ...(tierConfig.hasSchool ? [{ id: 'school', label: 'School (Grades 1-10)' }] : []),
            ...(tierConfig.hasCollege ? [{ id: 'higher-secondary', label: 'Higher Secondary / College (11-12)' }] : []),
            ...(tierConfig.hasUniversity ? [{ id: 'university', label: 'Undergraduates (BS)' }] : [])
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search streams or subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of the Program Levels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleLevels.map((lvl) => {
          const accent = getLevelAccent(lvl.id)
          const isSelected = activeProgramLevel === lvl.id
          const allStreams = [
            ...lvl.categories,
            ...customStreams.filter(cs => cs.levelId === lvl.id)
          ]

          return (
            <div 
              key={lvl.id}
              className={`bg-white rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between shadow-xs ${
                isSelected 
                  ? 'border-blue-400 ring-2 ring-blue-100 shadow-md' 
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <div>
                {/* Card Top: Icon, Code Badge & Active Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl ${accent.bg} border ${accent.border} flex items-center justify-center shadow-2xs`}>
                    {getLevelIcon(lvl.id)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${accent.badge}`}>
                      {lvl.badge}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                        Active Tier
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Title, Bracket & Age */}
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{lvl.title}</h3>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
                  <span>{lvl.grades}</span>
                  <span>•</span>
                  <span>Age: {lvl.typicalAge}</span>
                </div>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">{lvl.description}</p>

                {/* Categories & Tracks Section */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Curriculum Tracks ({allStreams.length})</span>
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{lvl.bracket}</span>
                  </div>

                  <div className="space-y-2.5">
                    {allStreams.map((cat, idx) => {
                      const curKey = `${lvl.id}-${idx}`
                      const isCurExpanded = !!expandedCurriculum[curKey]

                      return (
                        <div 
                          key={idx}
                          className="bg-slate-50/80 rounded-xl border border-slate-200/60 p-2.5 hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-slate-800 text-xs">{cat.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{cat.board}</p>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md shrink-0">
                              {cat.span}
                            </span>
                          </div>

                          {/* Subjects preview & toggle */}
                          {cat.subjects && cat.subjects.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200/50">
                              <button
                                type="button"
                                onClick={() => toggleCurriculum(curKey)}
                                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                              >
                                <span>{isCurExpanded ? 'Hide Core Subjects' : `View ${cat.subjects.length} Core Subjects`}</span>
                                {isCurExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              </button>

                              {isCurExpanded && (
                                <div className="mt-2 flex flex-wrap gap-1 animate-in fade-in">
                                  {cat.subjects.map((sub, sIdx) => (
                                    <span 
                                      key={sIdx}
                                      className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                                    >
                                      {sub}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button: Set as active context */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleSelectLevel(lvl.id, lvl.title)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.98] ${
                    isSelected 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Active Filter for Campus</span>
                    </>
                  ) : (
                    <>
                      <span>Filter Campus by This Tier</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Comparison Reference Table for Viva / Teacher Presentation */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Educational Tier Architecture Matrix</h2>
            <p className="text-xs text-slate-400 mt-0.5">Comprehensive reference summary of academic spans, age groups, and regulatory boards</p>
          </div>
          <button
            onClick={handleExportProspectus}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Matrix CSV</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Tier #</th>
                <th className="py-3 px-4">Program Level</th>
                <th className="py-3 px-4">Grade Span</th>
                <th className="py-3 px-4">Age Bracket</th>
                <th className="py-3 px-4">Curriculum Streams</th>
                <th className="py-3 px-4">Certifying Authority</th>
                <th className="py-3 px-4 text-right">Campus Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {programLevels.filter(lvl => lvl.id !== 'all').map((lvl, index) => {
                const isSelected = activeProgramLevel === lvl.id
                return (
                  <tr key={lvl.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-400">0{index + 1}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                      {getLevelIcon(lvl.id)}
                      <span>{lvl.title}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{lvl.grades}</td>
                    <td className="py-3.5 px-4 text-slate-500">{lvl.typicalAge}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {lvl.categories.map(c => c.name).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {lvl.categories[0]?.board || 'Educational Board'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleSelectLevel(lvl.id, lvl.title)}
                        className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-2xs' 
                            : 'text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-200'
                        }`}
                      >
                        {isSelected ? 'Active' : 'Apply Filter'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Custom Stream */}
      <Modal
        isOpen={isAddStreamModalOpen}
        onClose={() => setIsAddStreamModalOpen(false)}
        title="Add Custom Academic Stream / Program"
      >
        <form onSubmit={handleAddStream} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Educational Tier</label>
            <select
              value={newStreamData.levelId}
              onChange={(e) => setNewStreamData({ ...newStreamData, levelId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
            >
              <option value="elementary">Elementary Level (Grade 1 - 8)</option>
              <option value="secondary">Secondary Level (Grade 9 - 10)</option>
              <option value="higher-secondary">Higher Secondary Level (Grade 11 - 12)</option>
              <option value="university">Undergraduate Level (BS Honors)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Stream / Program Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Artificial Intelligence & Robotics STEM Wing"
              value={newStreamData.name}
              onChange={(e) => setNewStreamData({ ...newStreamData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Grade / Term Span</label>
              <input
                type="text"
                required
                placeholder="e.g. Grade 6 - 8 or 4 Semesters"
                value={newStreamData.span}
                onChange={(e) => setNewStreamData({ ...newStreamData, span: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Board</label>
              <input
                type="text"
                placeholder="e.g. BISE / Cambridge / HEC"
                value={newStreamData.board}
                onChange={(e) => setNewStreamData({ ...newStreamData, board: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Core Subjects (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Python Programming, Machine Learning, Robotics Lab"
              value={newStreamData.subjects}
              onChange={(e) => setNewStreamData({ ...newStreamData, subjects: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddStreamModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Add Stream
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProgramLevelsView
