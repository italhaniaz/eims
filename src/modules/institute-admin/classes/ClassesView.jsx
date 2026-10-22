import React, { useState, useEffect, useMemo } from 'react'
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
  Upload,
  CheckCircle2, 
  X, 
  ChevronRight,
  School,
  AlertCircle,
  Wand2,
  Check,
  UserCheck,
  Calendar,
  ArrowRightLeft,
  Copy,
  Printer,
  Archive,
  ArrowUpDown,
  Filter,
  Eye,
  ShieldAlert,
  RotateCcw
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { 
  detectProgramLevel, 
  normalizeClassSections, 
  PROGRAM_LEVELS, 
  getDefaultClassesForTier,
  calculateClassSortOrder
} from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'
import { ClassModal } from './ClassModal'
import { SectionModal } from './SectionModal'
import { SectionRosterDrawer } from './SectionRosterDrawer'
import { ClassPromotionModal } from './ClassPromotionModal'
import { ClassProfileModal } from './ClassProfileModal'
import { RoomsRegisterModal } from './RoomsRegisterModal'
import { ClassCsvImportModal } from './ClassCsvImportModal'

export const ClassesView = ({ currentInstitute }) => {
  const { 
    classes = [], 
    students = [],
    teachers = [],
    institutes = [],
    academicYears = [],
    addItem, 
    updateItem, 
    deleteItem,
    activeProgramLevel = 'all',
    setActiveProgramLevel
  } = useAppData()

  const { toast } = useToast()

  // Academic Sessions Management
  const defaultSessions = [
    { id: 'sess-prev', name: '2025-2026', isCurrent: false },
    { id: 'sess-curr', name: '2026-2027', isCurrent: true },
    { id: 'sess-next', name: '2027-2028', isCurrent: false }
  ]

  const [sessionsList, setSessionsList] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_academic_sessions')
      if (stored) return JSON.parse(stored)
    } catch (e) {}
    return defaultSessions
  })

  const currentActiveSessionName = useMemo(() => {
    const cur = sessionsList.find(s => s.isCurrent)
    return cur ? cur.name : (sessionsList[0]?.name || '2026-2027')
  }, [sessionsList])

  const [selectedSession, setSelectedSession] = useState(currentActiveSessionName)
  const [isAddSessionModalOpen, setIsAddSessionModalOpen] = useState(false)
  const [newSessionInput, setNewSessionInput] = useState('')

  // Level Tabs state (Two-way linked with global navbar)
  const [selectedLevelTab, setSelectedLevelTab] = useState(activeProgramLevel || 'all')

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

  // Search & Sorting
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('numericName') // 'numericName' | 'capacity' | 'enrolled'
  const [sortDirection, setSortDirection] = useState('asc')

  // Modals & Drawers
  const [isClassModalOpen, setIsClassModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false)
  const [sectionModalTargetClass, setSectionModalTargetClass] = useState(null)
  const [editingSection, setEditingSection] = useState(null)

  const [rosterDrawerData, setRosterDrawerData] = useState(null) // { classItem, sectionItem }

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false)
  const [profileModalClass, setProfileModalClass] = useState(null)
  const [isRoomsModalOpen, setIsRoomsModalOpen] = useState(false)
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false)

  // Delete & Archive Safety Modal
  const [classToDelete, setClassToDelete] = useState(null)

  // Filtered teachers for this campus
  const instTeachers = useMemo(() => {
    return teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  }, [teachers, currentInstitute?.id])

  // Count live enrolled students for a specific class & section
  const getLiveEnrolledCount = (className, sectionName) => {
    return students.filter(s => {
      const matchInst = !s.instituteId || s.instituteId === currentInstitute?.id
      if (!matchInst) return false
      const matchClass = (s.className || '').toLowerCase().trim() === className.toLowerCase().trim()
      const matchSec = !sectionName || (s.section || '').toLowerCase().trim() === sectionName.toLowerCase().trim()
      return matchClass && matchSec
    }).length
  }

  // Filter campus classes for current institute and session
  const campusClasses = useMemo(() => {
    return classes.filter(c => {
      const matchInst = !c.instituteId || c.instituteId === currentInstitute?.id
      if (!matchInst) return false
      // Filter by session if specified on class
      if (c.academicSession && selectedSession) {
        if (c.academicSession !== selectedSession) return false
      }
      return true
    })
  }, [classes, currentInstitute?.id, selectedSession])

  // Filter by level tab & search term, then apply natural numeric sorting
  const filteredClasses = useMemo(() => {
    let list = campusClasses.filter(c => {
      const cLevel = c.programLevel || detectProgramLevel(c.name)

      if (selectedLevelTab !== 'all') {
        if (c.programLevel) {
          if (c.programLevel !== selectedLevelTab) return false
        } else {
          if (detectProgramLevel(c.name) !== selectedLevelTab) return false
        }
      }

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase()
        const secs = normalizeClassSections(c)
        const matchName = c.name.toLowerCase().includes(term)
        const matchSec = secs.some(s => 
          s.name.toLowerCase().includes(term) || 
          (s.roomNo && s.roomNo.toLowerCase().includes(term)) ||
          (s.classTeacher && s.classTeacher.toLowerCase().includes(term))
        )
        if (!matchName && !matchSec) return false
      }

      return true
    })

    // Natural educational & numeric sorting: Nursery -> Prep -> Class 1 -> Class 10
    return list.sort((a, b) => {
      if (sortField === 'numericName') {
        const orderA = a.sortOrder !== undefined ? a.sortOrder : calculateClassSortOrder(a.name, a.programLevel)
        const orderB = b.sortOrder !== undefined ? b.sortOrder : calculateClassSortOrder(b.name, b.programLevel)
        if (orderA !== orderB) {
          return sortDirection === 'asc' ? orderA - orderB : orderB - orderA
        }
        const res = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        return sortDirection === 'asc' ? res : -res
      }
      if (sortField === 'capacity') {
        const capA = (a.sections || []).reduce((sum, s) => sum + Number(s.capacity || 0), 0)
        const capB = (b.sections || []).reduce((sum, s) => sum + Number(s.capacity || 0), 0)
        return sortDirection === 'asc' ? capA - capB : capB - capA
      }
      return 0
    })
  }, [campusClasses, selectedLevelTab, searchTerm, sortField, sortDirection])

  // Real KPI Metrics derived strictly from filtered classes
  const kpiClassesCount = filteredClasses.length
  const kpiSectionsCount = filteredClasses.reduce((sum, c) => sum + normalizeClassSections(c).length, 0)
  const kpiCapacityCount = filteredClasses.reduce((sum, c) => {
    const secs = normalizeClassSections(c)
    return sum + secs.reduce((acc, s) => acc + Number(s.capacity || 0), 0)
  }, 0)
  const kpiEnrolledCount = filteredClasses.reduce((sum, c) => {
    const secs = normalizeClassSections(c)
    return sum + secs.reduce((acc, s) => acc + getLiveEnrolledCount(c.name, s.name), 0)
  }, 0)
  const kpiFillPct = kpiCapacityCount > 0 ? Math.round((kpiEnrolledCount / kpiCapacityCount) * 100) : 0

  // Handle Add New Academic Session
  const handleAddNewSession = (e) => {
    e.preventDefault()
    const clean = newSessionInput.trim()
    if (!clean) return
    if (sessionsList.some(s => s.name.toLowerCase() === clean.toLowerCase())) {
      toast.warning(`Session "${clean}" already exists.`)
      return
    }

    const updated = [
      ...sessionsList,
      { id: `sess-${Date.now()}`, name: clean, isCurrent: false }
    ]
    setSessionsList(updated)
    try {
      localStorage.setItem('sms_academic_sessions', JSON.stringify(updated))
    } catch (err) {}
    setSelectedSession(clean)
    setNewSessionInput('')
    setIsAddSessionModalOpen(false)
    toast.success(`Academic session "${clean}" created and selected!`)
  }

  // Handle Save Class (Add or Edit)
  const handleSaveClass = async (classData) => {
    try {
      const payload = {
        ...classData,
        instituteId: currentInstitute?.id || 'inst-1',
        academicSession: selectedSession
      }

      if (editingClass) {
        await updateItem('classes', editingClass.id, payload)
        toast.success(`Class "${payload.name}" updated successfully!`)
      } else {
        await addItem('classes', payload)
        toast.success(`Class "${payload.name}" created with ${payload.sections.length} section(s)!`)
        
        // Auto-switch tab to class's level if currently on another tab
        if (payload.programLevel && payload.programLevel !== selectedLevelTab && selectedLevelTab !== 'all') {
          handleTabChange(payload.programLevel)
        }
      }
      setIsClassModalOpen(false)
      setEditingClass(null)
    } catch (err) {
      toast.error('Failed to save class. Please try again.')
    }
  }

  // Handle Save Section (Add or Edit single section on a class)
  const handleSaveSection = async (sectionData) => {
    if (!sectionModalTargetClass) return
    try {
      const currentSecs = normalizeClassSections(sectionModalTargetClass)
      let updatedSecs = []

      if (editingSection) {
        updatedSecs = currentSecs.map(s => s.id === editingSection.id ? sectionData : s)
      } else {
        updatedSecs = [...currentSecs, sectionData]
      }

      const totalCap = updatedSecs.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
      const payload = {
        ...sectionModalTargetClass,
        sections: updatedSecs,
        section: updatedSecs.map(s => s.name).join(', '),
        capacity: totalCap,
        updatedAt: new Date().toISOString()
      }

      await updateItem('classes', sectionModalTargetClass.id, payload)
      toast.success(`Section "${sectionData.name}" saved in ${sectionModalTargetClass.name}!`)
      setIsSectionModalOpen(false)
      setSectionModalTargetClass(null)
      setEditingSection(null)
    } catch (err) {
      toast.error('Failed to save section.')
    }
  }

  // Delete Individual Section with Safety Check
  const handleDeleteSection = async (classItem, secId, secName) => {
    const currentSecs = normalizeClassSections(classItem)
    if (currentSecs.length <= 1) {
      toast.warning('A class must contain at least one configured section.')
      return
    }

    const enrolled = getLiveEnrolledCount(classItem.name, secName)
    if (enrolled > 0) {
      toast.error(`Cannot delete "${secName}": ${enrolled} student(s) currently enrolled. Transfer students first or archive.`)
      return
    }

    if (window.confirm(`Delete section "${secName}" from ${classItem.name}?`)) {
      const updatedSecs = currentSecs.filter(s => s.id !== secId)
      const payload = {
        ...classItem,
        sections: updatedSecs,
        section: updatedSecs.map(s => s.name).join(', '),
        capacity: updatedSecs.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
      }
      await updateItem('classes', classItem.id, payload)
      toast.info(`Section "${secName}" removed.`)
    }
  }

  // Delete Class with Student Enrollment Guard
  const initiateDeleteClass = (c) => {
    const enrolled = getLiveEnrolledCount(c.name, '')
    setClassToDelete({ ...c, enrolled })
  }

  const confirmDeleteClass = async () => {
    if (!classToDelete) return
    if (classToDelete.enrolled > 0) {
      toast.error(`Cannot delete "${classToDelete.name}": ${classToDelete.enrolled} students are actively enrolled. Transfer students or archive class instead.`)
      return
    }

    await deleteItem('classes', classToDelete.id)
    toast.info(`Class "${classToDelete.name}" deleted.`)
    setClassToDelete(null)
  }

  // Archive Class
  const handleArchiveClass = async (c) => {
    await updateItem('classes', c.id, { isArchived: true, status: 'Archived' })
    toast.info(`Class "${c.name}" archived.`)
    setClassToDelete(null)
  }

  // Move Single Student to Another Section
  const handleMoveStudent = async (studentId, className, newSectionName) => {
    await updateItem('students', studentId, { section: newSectionName })
    toast.success(`Student reassigned to Section ${newSectionName}!`)
    if (rosterDrawerData) {
      // Refresh drawer target section count
      const updatedClass = classes.find(c => c.id === rosterDrawerData.classItem.id)
      const updatedSec = (updatedClass?.sections || []).find(s => s.name === rosterDrawerData.sectionItem.name)
      if (updatedSec) {
        setRosterDrawerData({ classItem: updatedClass, sectionItem: updatedSec })
      }
    }
  }

  // Bulk Move Multiple Students
  const handleBulkMoveStudents = async (studentIds, className, newSectionName) => {
    for (const id of studentIds) {
      await updateItem('students', id, { section: newSectionName })
    }
    toast.success(`${studentIds.length} student(s) transferred to Section ${newSectionName}!`)
  }

  // Auto-Distribute Students Evenly Across Sections
  const handleAutoDistribute = async (classId) => {
    const targetClass = classes.find(c => c.id === classId)
    if (!targetClass) return

    const secs = normalizeClassSections(targetClass)
    if (secs.length <= 1) {
      toast.warning('Class only has 1 section. Add more sections to balance.')
      return
    }

    const classStudents = students.filter(s => 
      (!s.instituteId || s.instituteId === currentInstitute?.id) &&
      (s.className || '').toLowerCase().trim() === targetClass.name.toLowerCase().trim()
    )

    if (classStudents.length === 0) {
      toast.warning('No enrolled students in this class to distribute.')
      return
    }

    // Round-robin assignment across sections
    for (let i = 0; i < classStudents.length; i++) {
      const assignedSec = secs[i % secs.length].name
      await updateItem('students', classStudents[i].id, { section: assignedSec })
    }

    toast.success(`Balanced ${classStudents.length} students evenly across ${secs.length} sections!`)
  }

  // Promote Class to Next Grade
  const handlePromoteClass = async ({ sourceClass, targetClass, students: promotingStudents, newSession }) => {
    for (const st of promotingStudents) {
      await updateItem('students', st.id, {
        className: targetClass.name,
        section: targetClass.sections?.[0]?.name || 'Section A',
        academicSession: newSession
      })
    }
    toast.success(`Successfully promoted ${promotingStudents.length} students from ${sourceClass.name} to ${targetClass.name} (${newSession})!`)
  }

  // Clone Classes to Next Session
  const handleCloneSession = async ({ fromSession, toSession, classes: classesList }) => {
    let count = 0
    for (const c of classesList) {
      const clonePayload = {
        name: c.name,
        programLevel: c.programLevel || detectProgramLevel(c.name),
        academicSession: toSession,
        capacity: c.capacity,
        enrolled: 0,
        group: c.group || '',
        board: c.board || '',
        department: c.department || '',
        subjects: c.subjects || [],
        sections: (c.sections || []).map(s => ({ ...s, enrolled: 0 })),
        instituteId: currentInstitute?.id || 'inst-1',
        createdAt: new Date().toISOString()
      }
      await addItem('classes', clonePayload)
      count++
    }
    toast.success(`Cloned ${count} classes and their sections into session ${toSession}!`)
    setSelectedSession(toSession)
  }

  // CSV Import Confirm
  const handleImportClassesFromCsv = async (parsedList) => {
    for (const item of parsedList) {
      await addItem('classes', item)
    }
    toast.success(`Imported ${parsedList.length} classes via CSV!`)
  }

  // 1-Click Standard Classes Preset Generator (User Triggered Only)
  const handleGeneratePresetClasses = async (targetTier) => {
    const tierToGenerate = targetTier === 'all' ? 'elementary' : targetTier
    const templates = getDefaultClassesForTier(tierToGenerate)

    if (!templates || templates.length === 0) {
      toast.warning(`No predefined template available for tier "${tierToGenerate}".`)
      return
    }

    if (!window.confirm(`Generate standard classes & custom sections for "${tierToGenerate.toUpperCase()}"? This will create ${templates.length} pre-configured classes.`)) {
      return
    }

    let createdCount = 0
    for (const tpl of templates) {
      const exists = classes.some(c => 
        (!c.instituteId || c.instituteId === currentInstitute?.id) && 
        (c.academicSession || selectedSession) === selectedSession &&
        c.name.toLowerCase().trim() === tpl.name.toLowerCase().trim()
      )
      if (!exists) {
        const enriched = {
          ...tpl,
          academicSession: selectedSession,
          instituteId: currentInstitute?.id || 'inst-1',
          section: tpl.sections.map(s => s.name).join(', '),
          capacity: tpl.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0),
          enrolled: 0,
          roomNo: tpl.sections[0]?.roomNo || 'Room 101',
          classTeacher: instTeachers[0]?.name || ''
        }
        await addItem('classes', enriched)
        createdCount++
      }
    }

    toast.success(`Scaffold complete! ${createdCount} standard classes added to ${tierToGenerate.toUpperCase()}.`)
  }

  // Export Filtered Classes to CSV
  const handleExportCSV = () => {
    if (filteredClasses.length === 0) {
      toast.warning('No classes to export.')
      return
    }

    const headers = [
      'Class Title',
      'Educational Tier',
      'Academic Session',
      'Section Name',
      'Room Number',
      'Shift',
      'Gender',
      'Medium',
      'Enrolled Students',
      'Max Capacity',
      'Seats Left',
      'Section Class Teacher'
    ]

    const rows = []
    filteredClasses.forEach(c => {
      const secs = normalizeClassSections(c)
      secs.forEach(s => {
        const enrolled = getLiveEnrolledCount(c.name, s.name)
        const cap = Number(s.capacity || 40)
        rows.push([
          `"${c.name}"`,
          `"${c.programLevel || detectProgramLevel(c.name)}"`,
          `"${c.academicSession || selectedSession}"`,
          `"${s.name}"`,
          `"${s.roomNo || 'Room 101'}"`,
          `"${s.shift || 'Morning'}"`,
          `"${s.gender || 'Co-ed'}"`,
          `"${s.medium || 'English'}"`,
          `"${enrolled}"`,
          `"${cap}"`,
          `"${Math.max(0, cap - enrolled)}"`,
          `"${s.classTeacherName || s.classTeacher || ''}"`
        ])
      })
    })

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Classes_and_Sections_${selectedSession}_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Classes & Sections CSV exported.')
  }

  const activeLevelMeta = PROGRAM_LEVELS.find(l => l.id === selectedLevelTab) || PROGRAM_LEVELS[0]

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Main Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Classroom & Section Allocations</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-normal">{activeLevelMeta.title}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            Classes & Sections
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Classroom configurations, section allocations, capacity heatmaps, subject teachers, and session transitions
          </p>
        </div>

        {/* Global Session & Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Academic Session Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {sessionsList.map(sess => (
                <option key={sess.id} value={sess.name}>
                  {sess.name} {sess.isCurrent ? '(Current)' : ''}
                </option>
              ))}
            </select>
            <button
              onClick={() => setIsAddSessionModalOpen(true)}
              className="text-emerald-600 hover:text-emerald-700 p-0.5"
              title="Add New Academic Session"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rooms Register */}
          <button
            onClick={() => setIsRoomsModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
            title="View classrooms & space register"
          >
            <DoorOpen className="w-3.5 h-3.5 text-slate-500" />
            <span>Spaces</span>
          </button>

          {/* Promote & Clone */}
          <button
            onClick={() => setIsPromotionModalOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Promote class cohorts or clone structure to next year"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Promote / Clone</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => setIsCsvImportOpen(true)}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Import classes and sections via CSV"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Import</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-all"
            title="Export filtered classes roster"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export</span>
          </button>

          {/* Create New Class */}
          <button
            onClick={() => {
              setEditingClass(null)
              setIsClassModalOpen(true)
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Class</span>
          </button>
        </div>
      </div>

      {/* Real KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Registered Classes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Classes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiClassesCount}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kpiClassesCount > 0 ? `${kpiClassesCount} in ${selectedSession}` : '0 classes registered'}
            </p>
          </div>
        </div>

        {/* Card 2: Configured Sections */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Sections</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiSectionsCount}
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kpiSectionsCount > 0 ? `${kpiSectionsCount} active classroom wings` : '0 sections configured'}
            </p>
          </div>
        </div>

        {/* Card 3: Seating Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Seating Capacity</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <DoorOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              {kpiCapacityCount} Seats
            </span>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kpiCapacityCount > 0 ? `${Math.max(0, kpiCapacityCount - kpiEnrolledCount)} seats available` : '0 desks configured'}
            </p>
          </div>
        </div>

        {/* Card 4: Enrolled vs Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrollment Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {kpiEnrolledCount} <span className="text-sm font-normal text-slate-400">/ {kpiCapacityCount}</span>
              </span>
              <span className="text-xs font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {kpiFillPct}%
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  kpiFillPct >= 100 ? 'bg-rose-500' : kpiFillPct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                }`}
                style={{ width: `${kpiFillPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Switcher Tabs & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Tier Tabs (Pre-School, Elementary, Secondary, HSSC, College, University) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Levels' },
            { id: 'preschool', label: 'Pre-School' },
            { id: 'elementary', label: 'Elementary (1-8)' },
            { id: 'secondary', label: 'Secondary (9-10)' },
            { id: 'higher-secondary', label: 'HSSC (11-12)' },
            { id: 'college', label: 'College (ADP)' },
            { id: 'university', label: 'University (BS/MS)' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-all ${
                selectedLevelTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search class, section, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

          {selectedLevelTab !== 'all' && (
            <button
              onClick={() => handleGeneratePresetClasses(selectedLevelTab)}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors flex items-center gap-1 shrink-0"
              title="Scaffold standard classes for this level"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Scaffold</span>
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map(c => {
            const cLevel = c.programLevel || detectProgramLevel(c.name)
            const secList = normalizeClassSections(c)
            const classEnrolled = secList.reduce((acc, s) => acc + getLiveEnrolledCount(c.name, s.name), 0)
            const classCapacity = secList.reduce((acc, s) => acc + Number(s.capacity || 0), 0)
            const seatsRemaining = Math.max(0, classCapacity - classEnrolled)
            const fillPct = classCapacity > 0 ? Math.round((classEnrolled / classCapacity) * 100) : 0
            const isFull = classEnrolled >= classCapacity

            return (
              <div 
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Tier Badge & Seats Heatmap */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {cLevel.replace('-', ' ')}
                    </span>

                    {/* Capacity Heatmap Badge */}
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                      isFull 
                        ? 'bg-rose-50 text-rose-700 border-rose-200' 
                        : fillPct >= 80 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      <Users className="w-3 h-3" />
                      <span>{seatsRemaining === 0 ? 'Full' : `${seatsRemaining} Seats Left`}</span>
                    </span>
                  </div>

                  {/* Class Title */}
                  <div className="flex items-baseline justify-between mt-1">
                    <h3 
                      onClick={() => setProfileModalClass(c)}
                      className="text-lg font-black text-slate-900 tracking-tight cursor-pointer hover:text-emerald-700 transition-colors"
                      title="View Class Dossier"
                    >
                      {c.name}
                    </h3>
                    <span className="text-xs font-mono font-bold text-slate-600">
                      {classEnrolled} / {classCapacity}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-0.5">
                    In-Charge: <strong className="text-slate-800">{c.classTeacher || 'Teacher In-Charge'}</strong>
                  </p>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        isFull ? 'bg-rose-500' : fillPct >= 80 ? 'bg-amber-400' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, fillPct)}%` }}
                    />
                  </div>

                  {/* Configured Sections List */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>Assigned Sections ({secList.length})</span>
                      <button
                        onClick={() => {
                          setSectionModalTargetClass(c)
                          setEditingSection(null)
                          setIsSectionModalOpen(true)
                        }}
                        className="text-emerald-600 hover:text-emerald-700 lowercase font-semibold flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        <span>add section</span>
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {secList.map((sec, idx) => {
                        const secEnrolled = getLiveEnrolledCount(c.name, sec.name)
                        const secCap = Number(sec.capacity || 40)
                        const isSecFull = secEnrolled >= secCap

                        return (
                          <div 
                            key={sec.id || idx}
                            className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors flex items-center justify-between text-xs"
                          >
                            <div 
                              onClick={() => setRosterDrawerData({ classItem: c, sectionItem: sec })}
                              className="flex items-center gap-2 cursor-pointer truncate flex-1"
                              title="Click to view section student roster"
                            >
                              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {sec.name.replace(/Section\s*/i, '').charAt(0) || 'A'}
                              </div>
                              <div className="truncate">
                                <span className="font-bold text-slate-800 block truncate">{sec.name}</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>{sec.roomNo || 'Room 101'}</span>
                                  <span>•</span>
                                  <span className="font-mono text-slate-600">{secEnrolled}/{secCap} Enrolled</span>
                                  {sec.classTeacherName && (
                                    <>
                                      <span>•</span>
                                      <span className="truncate max-w-[80px]">{sec.classTeacherName}</span>
                                    </>
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 ml-2">
                              {isSecFull ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                                  Full
                                </span>
                              ) : (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {secCap - secEnrolled} Free
                                </span>
                              )}

                              <button
                                onClick={() => {
                                  setSectionModalTargetClass(c)
                                  setEditingSection(sec)
                                  setIsSectionModalOpen(true)
                                }}
                                className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                                title="Edit Section"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>

                              {secList.length > 1 && (
                                <button
                                  onClick={() => handleDeleteSection(c, sec.id, sec.name)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                  title="Remove Section"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <button
                      onClick={() => setProfileModalClass(c)}
                      className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="View Class Dossier"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Dossier</span>
                    </button>
                    <button
                      onClick={() => {
                        setEditingClass(c)
                        setIsClassModalOpen(true)
                      }}
                      className="py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Edit Class"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <button
                    onClick={() => initiateDeleteClass(c)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        /* Clean Zero Empty State */
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center shadow-2xs max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">
              No Classes Configured for {activeLevelMeta.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Get started by creating your first custom class or scaffold standard grade levels for session {selectedSession}.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            {selectedLevelTab !== 'all' && (
              <button
                onClick={() => handleGeneratePresetClasses(selectedLevelTab)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Scaffold {activeLevelMeta.shortTitle}</span>
              </button>
            )}
            <button
              onClick={() => {
                setEditingClass(null)
                setIsClassModalOpen(true)
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Class</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal 1: Add New Academic Session */}
      {isAddSessionModalOpen && (
        <Modal
          isOpen={isAddSessionModalOpen}
          onClose={() => setIsAddSessionModalOpen(false)}
          title="Add New Academic Session"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleAddNewSession} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Session Name (e.g. 2027-2028) *
              </label>
              <input
                type="text"
                required
                value={newSessionInput}
                onChange={(e) => setNewSessionInput(e.target.value)}
                placeholder="2027-2028"
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddSessionModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm"
              >
                Create Session
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal 2: Create / Edit Class Modal */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false)
          setEditingClass(null)
        }}
        editingClass={editingClass}
        teachers={instTeachers}
        classes={campusClasses}
        currentInstitute={currentInstitute}
        currentLevel={selectedLevelTab}
        currentSession={selectedSession}
        onSaveClass={handleSaveClass}
      />

      {/* Modal 3: Create / Edit Section Modal */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => {
          setIsSectionModalOpen(false)
          setSectionModalTargetClass(null)
          setEditingSection(null)
        }}
        targetClass={sectionModalTargetClass}
        editingSection={editingSection}
        allClasses={campusClasses}
        teachers={instTeachers}
        currentEnrolled={
          sectionModalTargetClass && editingSection 
            ? getLiveEnrolledCount(sectionModalTargetClass.name, editingSection.name) 
            : 0
        }
        onSaveSection={handleSaveSection}
      />

      {/* Drawer: Section Student Roster & Seating */}
      {rosterDrawerData && (
        <SectionRosterDrawer
          isOpen={Boolean(rosterDrawerData)}
          onClose={() => setRosterDrawerData(null)}
          targetClass={rosterDrawerData.classItem}
          targetSection={rosterDrawerData.sectionItem}
          allClasses={campusClasses}
          students={students}
          currentInstitute={currentInstitute}
          onMoveStudent={handleMoveStudent}
          onBulkMoveStudents={handleBulkMoveStudents}
          onAutoDistribute={handleAutoDistribute}
        />
      )}

      {/* Modal 4: Class Promotion & Structure Clone */}
      <ClassPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        classes={campusClasses}
        students={students}
        currentSession={selectedSession}
        onPromoteClass={handlePromoteClass}
        onCloneSession={handleCloneSession}
      />

      {/* Modal 5: Class Profile Dossier & Desk Roll Slips */}
      <ClassProfileModal
        isOpen={Boolean(profileModalClass)}
        onClose={() => setProfileModalClass(null)}
        classItem={profileModalClass}
        teachers={instTeachers}
        students={students}
        currentInstitute={currentInstitute}
      />

      {/* Modal 6: Rooms & Space Register */}
      <RoomsRegisterModal
        isOpen={isRoomsModalOpen}
        onClose={() => setIsRoomsModalOpen(false)}
        classes={campusClasses}
      />

      {/* Modal 7: CSV Import */}
      <ClassCsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        currentInstitute={currentInstitute}
        currentSession={selectedSession}
        onImportClasses={handleImportClassesFromCsv}
      />

      {/* Modal 8: Delete / Archive Safety Warning */}
      {classToDelete && (
        <Modal
          isOpen={Boolean(classToDelete)}
          onClose={() => setClassToDelete(null)}
          title={`Delete Class: ${classToDelete.name}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            {classToDelete.enrolled > 0 ? (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Active Student Enrollments Detected</span>
                </div>
                <p>
                  Class <strong className="text-slate-900">{classToDelete.name}</strong> currently has <strong>{classToDelete.enrolled}</strong> active enrolled student(s).
                </p>
                <p>
                  System safety rules strictly block deleting classes with enrolled students to prevent orphan records. You can <strong>Archive</strong> this class to hide it from new admissions while preserving records.
                </p>
              </div>
            ) : (
              <p className="text-slate-600">
                Are you sure you want to permanently delete class <strong className="text-slate-900">{classToDelete.name}</strong> and all its configured sections? This action cannot be undone.
              </p>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              {classToDelete.enrolled > 0 ? (
                <button
                  type="button"
                  onClick={() => handleArchiveClass(classToDelete)}
                  className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" />
                  <span>Archive Class Instead</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={confirmDeleteClass}
                  className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
                >
                  Confirm & Delete
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default ClassesView
