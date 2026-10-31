import React, { useState, useMemo, useEffect } from 'react'
import {
  Bookmark,
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  Copy,
  Download,
  Printer,
  Sparkles,
  Layers,
  GraduationCap,
  School,
  CheckCircle2,
  Filter,
  LayoutGrid,
  List,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  Award,
  Building2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'
import { getInstituteTierConfig } from '../../../utils/tierGating'
import {
  ACADEMIC_TIERS,
  SUBJECT_TYPES,
  CURRICULUM_PRESETS,
  exportSubjectsToCSV
} from './subjectService'
import PrintableSyllabusModal from './PrintableSyllabusModal'

export const SubjectsView = ({ currentInstitute = null }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { 
    subjects = [], 
    programs = [], 
    departments = [], 
    activeProgramLevel, 
    addItem, 
    updateItem, 
    deleteItem 
  } = useAppData()

  // State Management
  const defaultTier = tierConfig.isSchoolOnly ? 'school' : tierConfig.isCollegeOnly ? 'college' : tierConfig.isUniversityOnly ? 'university' : 'all'
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTier, setActiveTier] = useState(defaultTier)

  const allowedAcademicTiers = useMemo(() => {
    return ACADEMIC_TIERS.filter(tier => {
      if (tier.id === 'all') return tierConfig.isMultiTier
      if (tier.id === 'school') return tierConfig.hasSchool
      if (tier.id === 'college') return tierConfig.hasCollege
      if (tier.id === 'university') return tierConfig.hasUniversity
      return false
    })
  }, [tierConfig])
  const [selectedProgram, setSelectedProgram] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'cards'

  // Sync default tier with navbar's activeProgramLevel (when changed by user)
  useEffect(() => {
    if (activeProgramLevel && activeProgramLevel !== 'all') {
      if (['preschool', 'elementary', 'secondary'].includes(activeProgramLevel)) {
        setActiveTier('school')
      } else if (activeProgramLevel === 'college' || activeProgramLevel === 'higher-secondary') {
        setActiveTier('college')
      } else if (activeProgramLevel === 'university') {
        setActiveTier('university')
      }
    }
  }, [activeProgramLevel])

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPresetsOpen, setIsPresetsOpen] = useState(false)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [editingSub, setEditingSub] = useState(null)

  // Form State
  const initialForm = {
    name: '',
    code: '',
    tier: 'school',
    type: 'core',
    credits: 4,
    theoryHours: 3,
    labHours: 0,
    totalMarks: 100,
    passingMarks: 33,
    programId: '',
    departmentId: '',
    description: '',
    status: 'Active'
  }
  const [formData, setFormData] = useState(initialForm)

  // Open Add Modal
  const openAddModal = (tierDefault = activeTier !== 'all' ? activeTier : 'school') => {
    setEditingSub(null)
    setFormData({
      ...initialForm,
      tier: tierDefault,
      programId: programs[0]?.id || '',
      departmentId: departments[0]?.id || ''
    })
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const openEditModal = (s) => {
    setEditingSub(s)
    setFormData({
      name: s.name || '',
      code: s.code || '',
      tier: s.tier || 'school',
      type: s.type || 'core',
      credits: s.credits ?? 4,
      theoryHours: s.theoryHours ?? 3,
      labHours: s.labHours ?? 0,
      totalMarks: s.totalMarks ?? 100,
      passingMarks: s.passingMarks ?? 33,
      programId: s.programId || '',
      departmentId: s.departmentId || '',
      description: s.description || '',
      status: s.status || 'Active'
    })
    setIsModalOpen(true)
  }

  // Duplicate Subject
  const handleDuplicate = (s) => {
    setEditingSub(null)
    setFormData({
      ...s,
      id: undefined,
      name: `${s.name} (Part II)`,
      code: s.code ? `${s.code}-2` : ''
    })
    setIsModalOpen(true)
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) return

    const payload = {
      ...formData,
      instituteId: currentInstitute?.id || null,
      name: formData.name.trim(),
      code: formData.code.trim().toUpperCase(),
      credits: Number(formData.credits) || 1,
      theoryHours: Number(formData.theoryHours) || 0,
      labHours: Number(formData.labHours) || 0,
      totalMarks: Number(formData.totalMarks) || 100,
      passingMarks: Number(formData.passingMarks) || 33
    }

    if (editingSub) {
      await updateItem('subjects', editingSub.id, payload)
    } else {
      await addItem('subjects', payload)
    }
    setIsModalOpen(false)
  }

  // Delete Handler
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the curriculum directory?`)) {
      await deleteItem('subjects', id)
    }
  }

  // Apply Preset Package
  const handleApplyPreset = async (preset) => {
    if (preset.subjects && preset.subjects.length > 0) {
      for (const item of preset.subjects) {
        // avoid exact code duplicate
        const exists = subjects.some(s => s.code?.toUpperCase() === item.code?.toUpperCase())
        if (!exists) {
          await addItem('subjects', {
            ...item,
            instituteId: currentInstitute?.id || null,
            programId: programs[0]?.id || '',
            departmentId: departments[0]?.id || '',
            status: 'Active'
          })
        }
      }
      setIsPresetsOpen(false)
    }
  }

  // Filtered Subjects (Campus-scoped and multi-tier filtered)
  const filtered = useMemo(() => {
    return subjects.filter(s => {
      // Institute scope (if subjects contain instituteId, show matching or global ones)
      if (currentInstitute?.id && s.instituteId && s.instituteId !== currentInstitute.id) {
        return false
      }
      // Tier match
      if (activeTier !== 'all' && (s.tier || 'school') !== activeTier) {
        return false
      }
      // Program match
      if (selectedProgram !== 'all' && s.programId !== selectedProgram) {
        return false
      }
      // Type match
      if (selectedType !== 'all' && (s.type || 'core') !== selectedType) {
        return false
      }
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase()
        const nameMatch = (s.name || '').toLowerCase().includes(query)
        const codeMatch = (s.code || '').toLowerCase().includes(query)
        const descMatch = (s.description || '').toLowerCase().includes(query)
        return nameMatch || codeMatch || descMatch
      }
      return true
    })
  }, [subjects, currentInstitute, activeTier, selectedProgram, selectedType, searchTerm])

  // Aggregate KPI stats
  const stats = useMemo(() => {
    const total = filtered.length
    const core = filtered.filter(s => (s.type || 'core').toLowerCase() === 'core').length
    const elective = filtered.filter(s => (s.type || '').toLowerCase() === 'elective').length
    const practical = filtered.filter(s => (s.type || '').toLowerCase() === 'practical' || (Number(s.labHours) || 0) > 0).length
    const totalCredits = filtered.reduce((sum, s) => sum + (Number(s.credits) || 0), 0)
    return { total, core, elective, practical, totalCredits }
  }, [filtered])

  // Counts by Tier
  const tierCounts = useMemo(() => {
    const list = currentInstitute?.id 
      ? subjects.filter(s => !s.instituteId || s.instituteId === currentInstitute.id)
      : subjects

    return {
      all: list.length,
      school: list.filter(s => (s.tier || 'school') === 'school').length,
      college: list.filter(s => s.tier === 'college').length,
      university: list.filter(s => s.tier === 'university').length
    }
  }, [subjects, currentInstitute])

  // Maps for lookups
  const progMap = useMemo(() => new Map((programs || []).map(p => [p.id, p])), [programs])
  const deptMap = useMemo(() => new Map((departments || []).map(d => [d.id, d])), [departments])

  const campusDisplayName = currentInstitute?.name || 'Main Campus'

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-2xs border border-blue-100">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Academic Curriculum & Subjects</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Building2 className="w-3 h-3 text-emerald-600" />
                  <span>{campusDisplayName}</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Campus Course Directory, Credit Hours, Theory/Lab Specifications & Board Syllabus
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPresetsOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Curriculum Presets</span>
          </button>

          <button
            type="button"
            onClick={() => exportSubjectsToCSV(filtered, programs, departments, campusDisplayName)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Print Gazette</span>
          </button>

          <button
            type="button"
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Subject</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Subjects</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{stats.total}</div>
          <span className="text-[10px] text-slate-400">In campus directory</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Core Courses</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-2">{stats.core}</div>
          <span className="text-[10px] text-slate-400">Compulsory units</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Electives</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">{stats.elective}</div>
          <span className="text-[10px] text-slate-400">Optional choices</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Lab & Practicals</span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-600 mt-2">{stats.practical}</div>
          <span className="text-[10px] text-slate-400">Practical modules</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Credits</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-2">{stats.totalCredits} <span className="text-xs font-normal text-slate-400">Cr.</span></div>
          <span className="text-[10px] text-slate-400">Across curriculum</span>
        </div>
      </div>

      {/* Tier Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {allowedAcademicTiers.map(tier => {
          const isActive = activeTier === tier.id
          const count = tierCounts[tier.id] ?? 0
          return (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tier.id === 'school' && <School className="w-3.5 h-3.5" />}
              {tier.id === 'college' && <Layers className="w-3.5 h-3.5" />}
              {tier.id === 'university' && <GraduationCap className="w-3.5 h-3.5" />}
              {tier.id === 'all' && <Bookmark className="w-3.5 h-3.5" />}
              <span>{tier.label}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, code (e.g. PHY-101), or topic keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-slate-50/50"
          />
        </div>

        {/* Filters and View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Program filter */}
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Academic Programs</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">All Course Types</option>
            {SUBJECT_TYPES.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'cards' ? 'bg-white shadow-2xs text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {filtered.length === 0 ? (
        /* Clean Zero State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100 shadow-2xs">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              {searchTerm || selectedProgram !== 'all' || selectedType !== 'all' || activeTier !== 'all'
                ? 'No subjects match your filter criteria'
                : `No Subjects Registered for ${campusDisplayName}`}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm || selectedProgram !== 'all' || selectedType !== 'all' || activeTier !== 'all'
                ? 'Try adjusting your search query, tier filter, or clear filters to view all courses.'
                : 'Your campus curriculum directory starts clean with 0 dummy records. Add your first academic subject or load a certified curriculum package.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => openAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Subject</span>
            </button>
            <button
              type="button"
              onClick={() => setIsPresetsOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Load Curriculum Package</span>
            </button>
            {(searchTerm || selectedProgram !== 'all' || selectedType !== 'all' || activeTier !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedProgram('all')
                  setSelectedType('all')
                  setActiveTier('all')
                }}
                className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 uppercase font-bold border-b border-slate-200 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Subject / Course Title</th>
                  <th className="px-5 py-3.5">Tier & Type</th>
                  <th className="px-5 py-3.5 text-center">Credits</th>
                  <th className="px-5 py-3.5 text-center">Hours (T+L)</th>
                  <th className="px-5 py-3.5 text-center">Marks (Pass)</th>
                  <th className="px-5 py-3.5">Program & Dept</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => {
                  const prog = progMap.get(s.programId)
                  const dept = deptMap.get(s.departmentId)
                  const isCore = (s.type || 'core').toLowerCase() === 'core'
                  const isLab = (s.type || '').toLowerCase() === 'practical' || (Number(s.labHours) || 0) > 0

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Code */}
                      <td className="px-5 py-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/60">
                          {s.code || 'N/A'}
                        </span>
                      </td>

                      {/* Name & Description */}
                      <td className="px-5 py-4 min-w-[200px]">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{s.name}</span>
                          {s.status === 'Inactive' && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-rose-50 text-rose-600 rounded">Inactive</span>
                          )}
                        </div>
                        {s.description && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{s.description}</div>
                        )}
                      </td>

                      {/* Tier & Type */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.tier === 'school' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            s.tier === 'college' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            s.tier === 'university' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {(s.tier || 'school').toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            isCore ? 'bg-indigo-50 text-indigo-700' :
                            isLab ? 'bg-purple-50 text-purple-700' :
                            'bg-amber-50 text-amber-700'
                          }`}>
                            {SUBJECT_TYPES.find(t => t.id === s.type)?.label || 'General'}
                          </span>
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="font-extrabold text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg border border-blue-100">
                          {s.credits || 4} Cr.
                        </span>
                      </td>

                      {/* Hours */}
                      <td className="px-5 py-4 text-center text-slate-600 whitespace-nowrap font-mono text-[11px]">
                        <span>{s.theoryHours ?? 3} Th</span>
                        <span className="mx-1 text-slate-300">/</span>
                        <span>{s.labHours ?? 0} Lab</span>
                      </td>

                      {/* Marks */}
                      <td className="px-5 py-4 text-center whitespace-nowrap font-medium text-slate-700">
                        <span className="font-bold">{s.totalMarks || 100}</span>
                        <span className="text-[10px] text-emerald-600 block">Pass: {s.passingMarks || 33}</span>
                      </td>

                      {/* Program & Dept */}
                      <td className="px-5 py-4 min-w-[150px]">
                        <div className="font-medium text-slate-800 line-clamp-1">{prog?.name || 'All Programs'}</div>
                        <div className="text-[10px] text-slate-400 line-clamp-1">{dept?.name || 'General Faculty'}</div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(s)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Duplicate Course"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(s => {
            const prog = progMap.get(s.programId)
            const dept = deptMap.get(s.departmentId)
            const isCore = (s.type || 'core').toLowerCase() === 'core'
            const isLab = (s.type || '').toLowerCase() === 'practical' || (Number(s.labHours) || 0) > 0

            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200/80">
                      {s.code || 'NO-CODE'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      s.tier === 'school' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      s.tier === 'college' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      s.tier === 'university' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {(s.tier || 'school').toUpperCase()}
                    </span>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    {s.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{s.description}</p>
                    )}
                  </div>

                  {/* Badges strip */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      isCore ? 'bg-indigo-50 text-indigo-700' :
                      isLab ? 'bg-purple-50 text-purple-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {SUBJECT_TYPES.find(t => t.id === s.type)?.label || 'General'}
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                      {s.credits || 4} Credits
                    </span>
                    <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {s.totalMarks || 100} Marks
                    </span>
                  </div>
                </div>

                {/* Footer Metadata & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="line-clamp-1 pr-2">
                    <span className="text-slate-700 font-medium">{prog?.name || 'All Programs'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(s)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(s)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSub ? 'Edit Academic Subject Specification' : 'Add New Academic Subject'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quick Subject Suggestions (When adding new) */}
          {!editingSub && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Quick Subject Auto-Fill
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Mathematics', code: 'MATH-101', tier: 'school', type: 'core', credits: 4 },
                  { name: 'English Language', code: 'ENG-101', tier: 'school', type: 'core', credits: 4 },
                  { name: 'Physics (Mechanics)', code: 'PHY-101', tier: 'college', type: 'core', credits: 4 },
                  { name: 'Chemistry', code: 'CHM-101', tier: 'college', type: 'core', credits: 4 },
                  { name: 'Biology & Zoology', code: 'BIO-101', tier: 'college', type: 'core', credits: 4 },
                  { name: 'Computer Programming', code: 'CS-101', tier: 'college', type: 'practical', credits: 4 },
                  { name: 'Pakistan Studies', code: 'PKS-101', tier: 'school', type: 'core', credits: 3 },
                  { name: 'Islamic Studies', code: 'ISL-101', tier: 'school', type: 'core', credits: 3 }
                ].map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        name: sug.name,
                        code: sug.code,
                        tier: sug.tier,
                        type: sug.type,
                        credits: sug.credits
                      })
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 rounded-lg text-xs font-medium transition-colors border border-slate-200/60"
                  >
                    + {sug.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Title & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mathematics Part I"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. MTH-101"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Tier & Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Tier</label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="school">School (K-12 / Primary / Secondary)</option>
                <option value="college">College (Intermediate / FA / FSc / ICS)</option>
                <option value="university">University (Degree / BS / MS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Course Classification</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {SUBJECT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credits, Theory, Lab Hours */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Credit Hours</label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Theory Hrs/Wk</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.theoryHours}
                onChange={(e) => setFormData({ ...formData, theoryHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lab/Practical Hrs</label>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.labHours}
                onChange={(e) => setFormData({ ...formData, labHours: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Total & Passing Marks */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Marks</label>
              <input
                type="number"
                min="10"
                max="500"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Passing Marks</label>
              <input
                type="number"
                min="1"
                max="500"
                value={formData.passingMarks}
                onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Parent Program & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Program</label>
              <select
                value={formData.programId}
                onChange={(e) => setFormData({ ...formData, programId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">General / All Programs</option>
                {programs.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Faculty / Department</label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="">General Academic Faculty</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Syllabus / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Syllabus Overview & Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of course learning outcomes, prescribed textbooks, and exam scope..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>

          {/* Status & Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={formData.status === 'Active'}
                onChange={(e) => setFormData({ ...formData, status: e.target.checked ? 'Active' : 'Inactive' })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
              />
              <span>Course is Active</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
              >
                {editingSub ? 'Update Subject' : 'Save Subject'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Curriculum Presets Modal */}
      <Modal
        isOpen={isPresetsOpen}
        onClose={() => setIsPresetsOpen(false)}
        title="Accredited Curriculum Packages"
        maxWidth="max-w-3xl"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Quickly populate your academic curriculum with official board-aligned subject bundles for {campusDisplayName}. Clicking a bundle injects all its subjects into your course directory instantly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {CURRICULUM_PRESETS.map(preset => (
              <div
                key={preset.id}
                className="bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-200 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-xs">{preset.title}</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-white border border-slate-200 text-slate-700 uppercase">
                      {preset.tier}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{preset.description}</p>

                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {preset.subjects.map((sub, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white text-slate-700 border border-slate-200/60">
                        {sub.name} ({sub.code})
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-400">
                    {preset.subjects.length} Subjects included
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Apply Package</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPresetsOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Official Printable Syllabus Gazette Modal */}
      <PrintableSyllabusModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        subjects={filtered}
        programs={programs}
        departments={departments}
        activeTier={activeTier}
        currentInstitute={currentInstitute}
      />
    </div>
  )
}

export default SubjectsView
