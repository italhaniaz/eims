import React, { useState } from 'react'
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
  School
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { detectProgramLevel, normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const ClassesView = ({ currentInstitute }) => {
  const { 
    classes,
    students = [], 
    addItem, 
    updateItem, 
    deleteItem,
    activeProgramLevel,
    setActiveProgramLevel,
    programLevels = []
  } = useAppData()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLevelTab, setSelectedLevelTab] = useState('all') // 'all' | 'elementary' | 'secondary' | 'higher-secondary' | 'college' | 'university'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

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

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const openAddModal = () => {
    setEditingClass(null)
    const initialLevel = activeProgramLevel !== 'all' ? activeProgramLevel : 'secondary'
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
    if (formData.sections.some(s => s.name.toLowerCase() === presetName.toLowerCase())) {
      triggerToast(`Section "${presetName}" is already added.`)
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
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, [field]: val } : s)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    const totalCapacity = formData.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
    const totalEnrolled = formData.sections.reduce((sum, s) => sum + Number(s.enrolled || 0), 0)
    const primarySectionName = formData.sections.map(s => s.name).join(', ')

    const payload = {
      name: formData.name.trim(),
      programLevel: formData.programLevel,
      sections: formData.sections,
      section: primarySectionName,
      capacity: totalCapacity,
      enrolled: totalEnrolled,
      roomNo: formData.sections[0]?.roomNo || 'Room 101',
      classTeacher: formData.sections[0]?.classTeacher || 'Teacher In-Charge',
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingClass) {
      await updateItem('classes', editingClass.id, payload)
      triggerToast(`Class "${payload.name}" updated with ${formData.sections.length} sections!`)
    } else {
      await addItem('classes', payload)
      triggerToast(`Class "${payload.name}" created with ${formData.sections.length} sections!`)
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

  // Export Classes and Sections Directory
  const handleExportCSV = () => {
    const rows = [
      ['Classes & Custom Sections Directory'],
      ['Institute:', currentInstitute?.name || 'Main Campus'],
      ['Generated At:', new Date().toLocaleString()],
      [''],
      ['Program Level', 'Class Title', 'Section Name', 'Room No', 'Enrolled', 'Max Capacity', 'Teacher In-Charge']
    ]

    classes.forEach(c => {
      const lvl = c.programLevel || detectProgramLevel(c.name)
      const secList = normalizeClassSections(c)
      secList.forEach(s => {
        rows.push([
          lvl.toUpperCase(),
          c.name,
          s.name,
          s.roomNo || 'Room 101',
          s.enrolled || 0,
          s.capacity || 40,
          s.classTeacher || 'Teacher'
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

  // Filter classes
  const filtered = classes.filter(c => {
    const matchesCampus = !c.instituteId || c.instituteId === currentInstitute?.id
    if (!matchesCampus) return false

    const cLevel = c.programLevel || detectProgramLevel(c.name)

    // Tab filter
    if (selectedLevelTab !== 'all' && cLevel !== selectedLevelTab) {
      return false
    }

    // Global navbar filter (if selected)
    if (activeProgramLevel !== 'all' && cLevel !== activeProgramLevel) {
      return false
    }

    if (!searchTerm) return true
    const term = searchTerm.toLowerCase()
    const secList = normalizeClassSections(c)
    return (
      c.name.toLowerCase().includes(term) ||
      cLevel.toLowerCase().includes(term) ||
      secList.some(s => s.name.toLowerCase().includes(term) || (s.classTeacher && s.classTeacher.toLowerCase().includes(term)))
    )
  })

  // Calculate totals
  const totalSectionsCount = classes.reduce((sum, c) => sum + normalizeClassSections(c).length, 0)
  const totalCapacityCount = classes.reduce((sum, c) => sum + (c.capacity || 40), 0)

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
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Classroom & Section Allocations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
            Classes & Custom Sections
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure flexible section names (e.g. Super Section, Section A, Star Section, Morning/Evening batches) tailored to each educational level from Primary to BS.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
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

      {/* Top 3 Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Registered Classes</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{classes.length} Classes</span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Across Tiers</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Configured Sections</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalSectionsCount} Sections</span>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">Custom Named</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-400 font-medium">Seating Capacity</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalCapacityCount} Seats</span>
            <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Total Desks</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Tier Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
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
              onClick={() => setSelectedLevelTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                selectedLevelTab === tab.id
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
            const liveEnrolledCount = students.filter(std => 
              (!std.instituteId || std.instituteId === currentInstitute?.id) &&
              (std.className || '').toLowerCase().includes((c.name || '').toLowerCase())
            ).length
            const totalEnrolled = liveEnrolledCount > 0 ? liveEnrolledCount : secList.reduce((acc, s) => acc + Number(s.enrolled || 0), 0)
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
                    <span>Primary In-Charge:</span>
                    <strong className="text-slate-700 font-medium">{c.classTeacher || 'Assigned Staff'}</strong>
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
                          setQuickSectionData({ name: '', roomNo: `Room ${100 + secList.length + 1}`, capacity: 40, classTeacher: '' })
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
                                <span className="font-bold text-slate-800">{sec.name}</span>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>{sec.roomNo || 'Room 101'}</span>
                                  <span>•</span>
                                  <span>Cap: {sec.capacity || 40}</span>
                                  {sec.classTeacher && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[80px]">{sec.classTeacher}</span>
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
                                className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors"
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
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Classes Configured for this Tier</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            You can configure classes (e.g. 10th Grade Matric, Grade 5, F.Sc Pre-Med, BSCS) and customize their sections (Super Section, Section A, B, etc.).
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 mt-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Class & Sections</span>
          </button>
        </div>
      )}

      {/* Modal 1: Create / Edit Class with Multi-Section Builder */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class & Custom Sections'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
                <p className="text-[11px] text-slate-400">Add or rename sections according to your school's naming rules</p>
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
                      value={sec.capacity}
                      onChange={(e) => updateSectionInForm(sec.id, 'capacity', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Section Teacher</label>
                    <input
                      type="text"
                      value={sec.classTeacher}
                      onChange={(e) => updateSectionInForm(sec.id, 'classTeacher', e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      placeholder="e.g. Dr. Fatima"
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
                placeholder="e.g. Dr. Ayesha Siddiqui"
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
