import React, { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Users, 
  DoorOpen, 
  GraduationCap, 
  Star, 
  Sparkles, 
  Layers, 
  Award, 
  Building2, 
  Download, 
  CheckCircle2, 
  X, 
  ChevronRight,
  School,
  AlertCircle,
  Wand2,
  Check,
  UserCheck
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { 
  detectProgramLevel, 
  normalizeClassSections, 
  PROGRAM_LEVELS, 
  getDefaultClassesForTier 
} from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const ClassesView = ({ currentInstitute }) => {
  const { 
    classes = [], 
    students = [],
    teachers = [],
    institutes = [],
    addItem, 
    updateItem, 
    deleteItem,
    activeProgramLevel = 'all',
    setActiveProgramLevel
  } = useAppData()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevelTab, setSelectedLevelTab] = useState(activeProgramLevel || 'all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [validationError, setValidationError] = useState('')

  // Two-way synchronization with global navbar program level
  useEffect(() => {
    if (activeProgramLevel && activeProgramLevel !== selectedLevelTab) {
      setSelectedLevelTab(activeProgramLevel)
    }
  }, [activeProgramLevel])

  const handleTabChange = (tabId) => {
    setSelectedLevelTab(tabId)
    if (setActiveProgramLevel) {
      setActiveProgramLevel(tabId)
    }
  }

  // Quick Section Modal (to add a single section to an existing class)
  const [quickSectionClass, setQuickSectionClass] = useState(null)
  const [quickSectionData, setQuickSectionData] = useState({
    name: '',
    roomNo: '',
    capacity: 40,
    classTeacher: ''
  })

  // Class Form Data with multi-section list
  const [formData, setFormData] = useState({
    name: '',
    programLevel: 'secondary',
    sections: [
      { id: 'sec-1', name: 'Super Section', roomNo: 'Room 101', capacity: 35, enrolled: 0, classTeacher: '' },
      { id: 'sec-2', name: 'Section A', roomNo: 'Room 102', capacity: 40, enrolled: 0, classTeacher: '' }
    ]
  })

  const [customSectionInput, setCustomSectionInput] = useState('')

  // Registered faculty in current campus
  const instTeachers = teachers.filter(t => {
    if (!t.instituteId) return true
    if (!currentInstitute?.id) return true
    if (t.instituteId === currentInstitute.id) return true
    if ((t.instituteId === 'inst-1' || t.instituteId === 'inst-default') &&
        (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
      return true
    }
    if ((institutes || []).length <= 1) return true
    return false
  })

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const openAddModal = () => {
    setEditingClass(null)
    setValidationError('')
    const initialLevel = selectedLevelTab !== 'all' ? selectedLevelTab : (activeProgramLevel !== 'all' ? activeProgramLevel : 'secondary')
    setFormData({
      name: '',
      programLevel: initialLevel,
      sections: [
        { id: `sec-${Date.now()}-1`, name: 'Super Section', roomNo: 'Room 101', capacity: 35, enrolled: 0, classTeacher: '' },
        { id: `sec-${Date.now()}-2`, name: 'Section A', roomNo: 'Room 102', capacity: 40, enrolled: 0, classTeacher: '' }
      ]
    })
    setIsModalOpen(true)
  }

  const openEditModal = (c) => {
    setEditingClass(c)
    setValidationError('')
    const existingSections = normalizeClassSections(c)
    setFormData({
      name: c.name,
      programLevel: c.programLevel || detectProgramLevel(c.name),
      sections: existingSections.length > 0 ? existingSections : [
        { id: `sec-${Date.now()}`, name: 'Section A', roomNo: c.roomNo || 'Room 101', capacity: c.capacity || 40, enrolled: c.enrolled || 0, classTeacher: c.classTeacher || '' }
      ]
    })
    setIsModalOpen(true)
  }

  // Quick Preset adder for section builder
  const addSectionPreset = (presetName) => {
    setValidationError('')
    if (formData.sections.some(s => s.name.trim().toLowerCase() === presetName.trim().toLowerCase())) {
      triggerToast(`Section "${presetName}" is already in the list.`)
      return
    }

    const nextRoomNum = 100 + formData.sections.length + 1
    const newSec = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: presetName,
      roomNo: `Room ${nextRoomNum}`,
      capacity: 40,
      enrolled: 0,
      classTeacher: ''
    }

    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, newSec]
    }))
  }

  const addCustomSection = (e) => {
    if (e) e.preventDefault()
    if (!customSectionInput.trim()) return

    addSectionPreset(customSectionInput.trim())
    setCustomSectionInput('')
  }

  const removeSectionFromForm = (secId) => {
    if (formData.sections.length <= 1) {
      triggerToast('A class must have at least one section.')
      return
    }
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== secId)
    }))
  }

  const updateSectionInForm = (secId, field, val) => {
    setValidationError('')
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, [field]: val } : s)
    }))
  }

  // Calculate live enrolled count of students in a given class & section
  const getLiveEnrolledCount = (className, sectionName) => {
    return students.filter(s => {
      const matchInst = !s.instituteId || s.instituteId === currentInstitute?.id
      if (!matchInst) return false
      const matchClass = (s.className || '').toLowerCase().trim() === className.toLowerCase().trim()
      const matchSec = !sectionName || (s.section || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
      return matchClass && matchSec
    }).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    if (!formData.name.trim()) {
      setValidationError('Please provide a class name.')
      return
    }

    if (!formData.sections || formData.sections.length === 0) {
      setValidationError('At least one section must be configured.')
      return
    }

    // Duplicate section name check
    const sectionNames = formData.sections.map(s => s.name.trim().toLowerCase())
    const uniqueNames = new Set(sectionNames)
    if (uniqueNames.size !== sectionNames.length) {
      setValidationError('Section names within the same class must be unique (e.g. Super Section, Section A, Section B).')
      return
    }

    // Capacity validation
    for (const sec of formData.sections) {
      if (!sec.name.trim()) {
        setValidationError('All sections must have a valid name.')
        return
      }
      if (Number(sec.capacity) <= 0) {
        setValidationError(`Section "${sec.name}" capacity must be greater than zero.`)
        return
      }
    }

    const totalCapacity = formData.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
    const primarySectionName = formData.sections.map(s => s.name).join(', ')

    // Populate live enrolled counts
    const enrichedSections = formData.sections.map(s => ({
      ...s,
      capacity: Number(s.capacity || 40),
      enrolled: getLiveEnrolledCount(formData.name.trim(), s.name.trim())
    }))

    const totalEnrolled = enrichedSections.reduce((sum, s) => sum + Number(s.enrolled || 0), 0)

    const payload = {
      name: formData.name.trim(),
      programLevel: formData.programLevel,
      sections: enrichedSections,
      section: primarySectionName,
      capacity: totalCapacity,
      enrolled: totalEnrolled,
      roomNo: enrichedSections[0]?.roomNo || 'Room 101',
      classTeacher: enrichedSections[0]?.classTeacher || (instTeachers[0]?.name || 'Teacher In-Charge'),
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingClass) {
      await updateItem('classes', editingClass.id, payload)
      triggerToast(`Class "${payload.name}" updated successfully with ${formData.sections.length} sections!`)
    } else {
      await addItem('classes', payload)
      triggerToast(`Class "${payload.name}" created with ${formData.sections.length} sections!`)

      // Auto-switch view to the tier of the newly created class so it is immediately visible to user
      const targetTier = payload.programLevel || detectProgramLevel(payload.name)
      if (targetTier && targetTier !== 'all') {
        setSelectedLevelTab(targetTier)
        if (setActiveProgramLevel) {
          setActiveProgramLevel(targetTier)
        }
      } else {
        setSelectedLevelTab('all')
        if (setActiveProgramLevel) {
          setActiveProgramLevel('all')
        }
      }
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, className) => {
    if (window.confirm(`Delete class "${className}" and all its assigned sections?`)) {
      await deleteItem('classes', id)
      triggerToast(`Class "${className}" deleted.`)
    }
  }

  // Quick add section directly from a class card
  const handleQuickAddSectionSubmit = async (e) => {
    e.preventDefault()
    if (!quickSectionData.name.trim() || !quickSectionClass) return

    const currentSections = normalizeClassSections(quickSectionClass)
    
    // Duplicate check
    if (currentSections.some(s => s.name.toLowerCase().trim() === quickSectionData.name.toLowerCase().trim())) {
      triggerToast(`Section "${quickSectionData.name}" already exists in ${quickSectionClass.name}.`)
      return
    }

    const newSection = {
      id: `sec-${Date.now()}`,
      name: quickSectionData.name.trim(),
      roomNo: quickSectionData.roomNo || `Room ${100 + currentSections.length + 1}`,
      capacity: Number(quickSectionData.capacity || 40),
      enrolled: 0,
      classTeacher: quickSectionData.classTeacher || ''
    }

    const updatedSections = [...currentSections, newSection]
    const payload = {
      ...quickSectionClass,
      sections: updatedSections,
      section: updatedSections.map(s => s.name).join(', '),
      capacity: updatedSections.reduce((acc, s) => acc + Number(s.capacity || 0), 0)
    }

    await updateItem('classes', quickSectionClass.id, payload)
    triggerToast(`Added "${newSection.name}" to ${quickSectionClass.name}!`)
    setQuickSectionClass(null)
    setQuickSectionData({ name: '', roomNo: '', capacity: 40, classTeacher: '' })
  }

  // Delete an individual section directly from a class card
  const handleDeleteSection = async (classItem, secId, secName) => {
    const currentSections = normalizeClassSections(classItem)
    if (currentSections.length <= 1) {
      triggerToast('Cannot delete the last remaining section of this class.')
      return
    }

    if (window.confirm(`Remove section "${secName}" from ${classItem.name}?`)) {
      const updatedSections = currentSections.filter(s => s.id !== secId)
      const payload = {
        ...classItem,
        sections: updatedSections,
        section: updatedSections.map(s => s.name).join(', '),
        capacity: updatedSections.reduce((acc, s) => acc + Number(s.capacity || 0), 0)
      }
      await updateItem('classes', classItem.id, payload)
      triggerToast(`Section "${secName}" removed.`)
    }
  }

  // 1-Click Standard Classes Preset Generator
  const handleGeneratePresetClasses = async (targetTier) => {
    const tierToGenerate = targetTier === 'all' ? 'elementary' : targetTier
    const templates = getDefaultClassesForTier(tierToGenerate)

    if (!templates || templates.length === 0) {
      triggerToast(`No predefined template available for tier "${tierToGenerate}".`)
      return
    }

    if (!window.confirm(`Generate standard classes & custom sections for "${tierToGenerate.toUpperCase()}"? This will create ${templates.length} pre-configured classes.`)) {
      return
    }

    let createdCount = 0
    for (const tpl of templates) {
      // Check if class with this name already exists
      const exists = classes.some(c => 
        (!c.instituteId || c.instituteId === currentInstitute?.id) && 
        c.name.toLowerCase().trim() === tpl.name.toLowerCase().trim()
      )
      if (!exists) {
        const enriched = {
          ...tpl,
          instituteId: currentInstitute?.id || 'inst-1',
          section: tpl.sections.map(s => s.name).join(', '),
          capacity: tpl.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0),
          enrolled: 0,
          roomNo: tpl.sections[0]?.roomNo || 'Room 101',
          classTeacher: instTeachers[0]?.name || 'Teacher In-Charge'
        }
        await addItem('classes', enriched)
        createdCount++
      }
    }

    triggerToast(`Standard setup generated! ${createdCount} classes added to ${tierToGenerate.toUpperCase()}.`)
  }

  // Export Classes and Sections Directory
  const handleExportCSV = () => {
    const rows = [
      ['Classes & Custom Sections Directory'],
      ['Institute:', currentInstitute?.name || 'Main Campus'],
      ['Generated At:', new Date().toLocaleString()],
      [''],
      ['Program Level', 'Class Title', 'Section Name', 'Room No', 'Enrolled Students', 'Max Capacity', 'Teacher In-Charge']
    ]

    classes.forEach(c => {
      const lvl = c.programLevel || detectProgramLevel(c.name)
      const secList = normalizeClassSections(c)
      secList.forEach(s => {
        const liveEnrolled = getLiveEnrolledCount(c.name, s.name)
        rows.push([
          lvl.toUpperCase(),
          c.name,
          s.name,
          s.roomNo || 'Room 101',
          liveEnrolled,
          s.capacity || 40,
          s.classTeacher || 'Teacher In-Charge'
        ])
      })
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${cell}"`).join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Classes_and_Sections_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast('Classes & Sections CSV exported successfully!')
  }

  const getLevelBadgeStyle = (level) => {
    switch (level) {
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

  // Effective Active Filter Tier (Tab takes direct precedence and is 2-way synced)
  const effectiveFilterTier = selectedLevelTab

  // Filter classes cleanly and safely without dropping records due to ID naming differences
  const campusClasses = classes.filter(c => {
    if (!c.instituteId) return true
    if (!currentInstitute?.id) return true
    if (c.instituteId === currentInstitute.id) return true
    // Standard default campus fallbacks
    if ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') &&
        (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) {
      return true
    }
    // Single campus mode: if there's at most 1 institute in system, all classes belong to current view
    if ((institutes || []).length <= 1) return true
    return false
  })

  const filtered = campusClasses.filter(c => {
    const cLevel = c.programLevel || detectProgramLevel(c.name)

    // Tier filtering: if 'all', show everything
    if (effectiveFilterTier !== 'all') {
      const directMatch = c.programLevel === effectiveFilterTier
      const nameMatch = detectProgramLevel(c.name) === effectiveFilterTier
      if (!directMatch && !nameMatch && cLevel !== 'all') {
        return false
      }
    }

    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const secList = normalizeClassSections(c)
    return (
      c.name.toLowerCase().includes(term) ||
      (c.programLevel && c.programLevel.toLowerCase().includes(term)) ||
      cLevel.toLowerCase().includes(term) ||
      secList.some(s => s.name.toLowerCase().includes(term) || (s.classTeacher && s.classTeacher.toLowerCase().includes(term)))
    )
  })

  // Dynamic Tier-Aware Statistics
  const tierClassesCount = filtered.length
  const tierSectionsCount = filtered.reduce((sum, c) => sum + normalizeClassSections(c).length, 0)
  const tierCapacityCount = filtered.reduce((sum, c) => {
    const secs = normalizeClassSections(c)
    return sum + secs.reduce((acc, s) => acc + Number(s.capacity || 0), 0)
  }, 0)

  const totalCampusSectionsCount = campusClasses.reduce((sum, c) => sum + normalizeClassSections(c).length, 0)
  const totalCampusCapacityCount = campusClasses.reduce((sum, c) => sum + Number(c.capacity || 40), 0)

  const activeLevelMeta = PROGRAM_LEVELS.find(l => l.id === effectiveFilterTier) || PROGRAM_LEVELS[0]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-xs text-emerald-700 underline font-medium hover:text-emerald-900 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Classroom & Section Allocations</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{activeLevelMeta.title}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Classes & Custom Sections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure flexible class sections (e.g. Super Section, Star Section, Section A, Morning/Evening batches) tailored to each educational tier.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {effectiveFilterTier !== 'all' && (
            <button
              onClick={() => handleGeneratePresetClasses(effectiveFilterTier)}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95 border border-slate-200"
              title={`Auto-generate standard classes for ${activeLevelMeta.shortTitle}`}
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scaffold Tier</span>
            </button>
          )}
          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Class</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold shadow-xs transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Metrics - Aware of Tier Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Registered Classes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{tierClassesCount} Classes</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              {effectiveFilterTier === 'all' ? `${campusClasses.length} Total` : `${activeLevelMeta.shortTitle}`}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Configured Sections</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{tierSectionsCount} Sections</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {effectiveFilterTier === 'all' ? 'All Tiers' : `${tierSectionsCount} Active`}
            </span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Seating Capacity</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{tierCapacityCount} Seats</span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {effectiveFilterTier === 'all' ? `${totalCampusCapacityCount} Desks` : `${tierCapacityCount} Desks`}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tier Tabs (Two-way linked with global navbar) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'elementary', label: 'Elementary (1-8)' },
            { id: 'secondary', label: 'Secondary (9-10)' },
            { id: 'higher-secondary', label: 'HSSC (11-12)' },
            { id: 'college', label: 'College (ADP)' },
            { id: 'university', label: 'University (BS/MS)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                effectiveFilterTier === tab.id
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
            placeholder="Search class or section name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
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

      {/* Classes Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const cLevel = c.programLevel || detectProgramLevel(c.name)
            const secList = normalizeClassSections(c)
            
            // Calculate live totals across sections
            const totalEnrolled = secList.reduce((acc, s) => acc + getLiveEnrolledCount(c.name, s.name), 0)
            const totalCapacity = secList.reduce((acc, s) => acc + Number(s.capacity || 40), 0)
            const fillPct = Math.min(100, Math.round((totalEnrolled / Math.max(1, totalCapacity)) * 100))

            return (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Level Badge & Class Capacity */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getLevelBadgeStyle(cLevel)}`}>
                      {cLevel.replace('-', ' ')}
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-medium flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span>{totalEnrolled} / {totalCapacity} Seats</span>
                    </span>
                  </div>

                  {/* Class Name */}
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">{c.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <span>In-Charge:</span>
                    <strong className="text-slate-700 font-medium">{c.classTeacher || 'Teacher In-Charge'}</strong>
                  </p>

                  {/* Capacity Bar */}
                  <div className="mt-3.5">
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          fillPct > 90 ? 'bg-rose-500' : fillPct > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${fillPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Configured Sections List */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Assigned Sections ({secList.length})
                      </span>
                      <button
                        onClick={() => {
                          setQuickSectionClass(c)
                          setQuickSectionData({ 
                            name: '', 
                            roomNo: `Room ${100 + secList.length + 1}`, 
                            capacity: 40, 
                            classTeacher: instTeachers[0]?.name || '' 
                          })
                        }}
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 hover:underline"
                      >
                        <Plus className="w-3 h-3 stroke-[3]" />
                        <span>Add Section</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {secList.map((sec, sIdx) => {
                        const isSuper = sec.name.toLowerCase().includes('super') || sec.name.toLowerCase().includes('star')
                        const secEnrolled = getLiveEnrolledCount(c.name, sec.name)
                        const secCapacity = Number(sec.capacity || 40)
                        const isFull = secEnrolled >= secCapacity

                        return (
                          <div 
                            key={sec.id || sIdx}
                            className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                              isSuper 
                                ? 'bg-amber-50/60 border-amber-200/80 shadow-2xs' 
                                : 'bg-slate-50/80 border-slate-200/60 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {isSuper ? (
                                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                              )}
                              <div className="truncate">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-800">{sec.name}</span>
                                  {isFull && (
                                    <span className="text-[9px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                                      Full
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{sec.roomNo || 'Room 101'}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-600">{secEnrolled}/{secCapacity} Enrolled</span>
                                  {sec.classTeacher && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[100px] text-slate-500 font-medium">{sec.classTeacher}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Delete single section */}
                            {secList.length > 1 && (
                              <button
                                onClick={() => handleDeleteSection(c, sec.id, sec.name)}
                                title="Remove section"
                                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors shrink-0 ml-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button 
                    onClick={() => openEditModal(c)}
                    className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit Class</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(c.id, c.name)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Class"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-10 sm:p-14 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="max-w-md">
            <h3 className="text-lg font-bold text-slate-800">
              No Classes Configured for {activeLevelMeta.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {campusClasses.length > 0 
                ? `You have ${campusClasses.length} registered class(es) in other tiers. You can view all classes or scaffold standard classes for ${activeLevelMeta.shortTitle}.`
                : `You can instantly create standard classes with custom sections using the 1-click scaffold wizard, or configure custom classes from scratch.`
              }
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 flex-wrap justify-center">
            {campusClasses.length > 0 && effectiveFilterTier !== 'all' && (
              <button
                onClick={() => handleTabChange('all')}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-200"
              >
                <span>View All Campus Classes ({campusClasses.length})</span>
              </button>
            )}
            {effectiveFilterTier !== 'all' && (
              <button
                onClick={() => handleGeneratePresetClasses(effectiveFilterTier)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <Wand2 className="w-4 h-4" />
                <span>Auto-Scaffold {activeLevelMeta.shortTitle} Standard Classes</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Custom Class</span>
            </button>
          </div>
        </div>
      )}

      {/* Datalist for registered faculty members */}
      <datalist id="inst-faculty-list">
        {instTeachers.map((t, idx) => (
          <option key={t.id || idx} value={t.name}>
            {t.designation ? `${t.designation} (${t.department || 'Academic'})` : 'Faculty Member'}
          </option>
        ))}
      </datalist>

      {/* Modal 1: Create / Edit Class with Multi-Section Builder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class & Custom Sections'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Educational Tier</label>
              <select
                value={formData.programLevel}
                onChange={(e) => setFormData({ ...formData, programLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="elementary">Elementary Level (Grade 1 - 8)</option>
                <option value="secondary">Secondary Level (Grade 9 - 10 / Matric)</option>
                <option value="higher-secondary">Higher Secondary Level (Grade 11 - 12 / Inter)</option>
                <option value="college">College Level (Associate Degrees / ADP)</option>
                <option value="university">University Level (BS / MS)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class Title</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                placeholder="e.g. 10th Grade, Grade 5, F.Sc Pre-Med, BSCS"
              />
            </div>
          </div>

          {/* Custom Sections Builder Header */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Custom Class Sections ({formData.sections.length})
                </label>
                <p className="text-[11px] text-slate-400">Add, rename, or assign specific teachers & rooms to each section</p>
              </div>

              {/* Quick Presets Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-0.5">Quick Presets:</span>
                {['Super Section', 'Star Section', 'Section A', 'Section B', 'Section C', 'Morning Batch', 'Evening Batch'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => addSectionPreset(preset)}
                    className="text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded transition-colors"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Section Adder Input */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                placeholder="Or type custom section name (e.g. Section Rose, Boys Wing A)..."
                value={customSectionInput}
                onChange={(e) => setCustomSectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomSection()
                  }
                }}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={addCustomSection}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Add Custom
              </button>
            </div>

            {/* Configured Sections List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {formData.sections.map((sec, idx) => (
                <div 
                  key={sec.id || idx}
                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
                >
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Section Name</label>
                    <input
                      type="text"
                      required
                      value={sec.name}
                      onChange={(e) => updateSectionInForm(sec.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                      placeholder="e.g. Super Section"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Room</label>
                    <input
                      type="text"
                      value={sec.roomNo}
                      onChange={(e) => updateSectionInForm(sec.id, 'roomNo', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      placeholder="Room 101"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      value={sec.capacity}
                      onChange={(e) => updateSectionInForm(sec.id, 'capacity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Section Teacher</label>
                    <input
                      type="text"
                      list="inst-faculty-list"
                      value={sec.classTeacher}
                      onChange={(e) => updateSectionInForm(sec.id, 'classTeacher', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      placeholder="Select or enter teacher..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSectionFromForm(sec.id)}
                    title="Remove this section"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors self-end sm:self-center mt-2 sm:mt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              Save Class & Sections
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal 2: Quick Section Adder (To add a section to an existing class) */}
      {quickSectionClass && (
        <Modal
          isOpen={Boolean(quickSectionClass)}
          onClose={() => setQuickSectionClass(null)}
          title={`Add New Section to: ${quickSectionClass.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleQuickAddSectionSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Super Section, Section C, Morning Batch..."
                value={quickSectionData.name}
                onChange={(e) => setQuickSectionData({ ...quickSectionData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold">Presets:</span>
                {['Super Section', 'Section B', 'Section C', 'Evening Batch'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQuickSectionData({ ...quickSectionData, name: preset })}
                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Room / Hall</label>
                <input
                  type="text"
                  placeholder="e.g. Room 104"
                  value={quickSectionData.roomNo}
                  onChange={(e) => setQuickSectionData({ ...quickSectionData, roomNo: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Max Capacity</label>
                <input
                  type="number"
                  min="1"
                  value={quickSectionData.capacity}
                  onChange={(e) => setQuickSectionData({ ...quickSectionData, capacity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section Teacher In-Charge</label>
              <input
                type="text"
                list="inst-faculty-list"
                placeholder="Select or enter teacher name..."
                value={quickSectionData.classTeacher}
                onChange={(e) => setQuickSectionData({ ...quickSectionData, classTeacher: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickSectionClass(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                Add Section
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default ClassesView