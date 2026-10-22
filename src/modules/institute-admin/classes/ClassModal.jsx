import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  User, 
  Layers, 
  Building2, 
  GraduationCap, 
  Sparkles, 
  Check, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Copy,
  DoorOpen,
  Clock,
  ShieldAlert,
  Loader2
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { 
  PROGRAM_LEVELS, 
  detectProgramLevel,
  STANDARD_TIER_CLASS_NAMES,
  calculateClassSortOrder
} from '../../../constants/academicLevels'
import { getCampusRooms } from '../../../constants/campusRooms'

// Auto-format class title: "9th grade" -> "9th Grade", "class 5" -> "Class 5"
function formatClassTitle(title = '') {
  if (!title) return ''
  const upperAcronyms = ['BSCS', 'BSSE', 'BSIT', 'BSAI', 'BSDS', 'BBA', 'ICS', 'FSC', 'FA', 'ADP', 'DAE', 'MS', 'MSCS', 'MSSE', 'MBA', 'MPHIL', 'PHD', 'SSC', 'HSSC', 'KG', 'ECCE']
  return title
    .trim()
    .split(/\s+/)
    .map(word => {
      const upper = word.toUpperCase()
      if (upperAcronyms.includes(upper)) return upper
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')
}

export const ClassModal = ({
  isOpen,
  onClose,
  editingClass = null,
  teachers = [],
  classes = [],
  students = [],
  currentInstitute,
  currentLevel = 'all',
  currentSession = '2026-2027',
  onSaveClass
}) => {
  const [activeStep, setActiveStep] = useState('details') // 'details' | 'sections' | 'subjects'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customSectionInput, setCustomSectionInput] = useState('')
  const [isCustomClassName, setIsCustomClassName] = useState(false)
  const [customClassNameValue, setCustomClassNameValue] = useState('')

  // Section Deletion Block Modal
  const [blockedSectionNotice, setBlockedSectionNotice] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    programLevel: 'secondary',
    academicSession: currentSession || '2026-2027',
    sortOrder: 90,
    classTeacherId: '',
    classTeacherName: '',
    medium: 'English',
    shift: 'Morning',
    // Level specific
    group: '',
    board: 'BISE Lahore',
    department: 'General',
    creditHours: 18,
    totalSemesters: 8,
    programHead: '',
    reservedMeritSeats: 0,
    reservedStaffSeats: 0,
    // Subjects list
    subjects: [
      { id: 'sub-1', name: 'English', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 },
      { id: 'sub-2', name: 'Mathematics', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 },
      { id: 'sub-3', name: 'Urdu', totalMarks: 100, passingMarks: 33, periodsPerWeek: 5 },
      { id: 'sub-4', name: 'General Science', totalMarks: 100, passingMarks: 33, periodsPerWeek: 5 }
    ],
    // Sections list
    sections: [
      { 
        id: `sec-${Date.now()}-1`, 
        name: 'Section A', 
        roomNo: 'Room 101', 
        capacity: 40, 
        shift: 'Morning', 
        gender: 'Co-ed', 
        medium: 'English', 
        group: 'General',
        classTeacherId: '', 
        classTeacherName: '',
        badge: 'None',
        enrolled: 0
      }
    ]
  })

  const [validationError, setValidationError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  // Filter teachers for current institute
  const instTeachers = useMemo(() => {
    return teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  }, [teachers, currentInstitute?.id])

  // Map of teachers already appointed as Class Teacher in other classes/sections
  const busyClassTeachersMap = useMemo(() => {
    const map = new Map() // teacherId -> { className, sectionName }
    classes.forEach(c => {
      if (editingClass && c.id === editingClass.id) return
      if ((c.academicSession || currentSession) !== (formData.academicSession || currentSession)) return
      const secs = Array.isArray(c.sections) ? c.sections : []
      secs.forEach(s => {
        if (s.classTeacherId) {
          map.set(s.classTeacherId, { className: c.name, sectionName: s.name })
        }
      })
    })
    return map
  }, [classes, editingClass, formData.academicSession, currentSession])

  // Get available campus rooms
  const campusRooms = useMemo(() => {
    return getCampusRooms()
  }, [])

  // Standard names for the selected tier
  const standardTierNames = useMemo(() => {
    return STANDARD_TIER_CLASS_NAMES[formData.programLevel] || []
  }, [formData.programLevel])

  // Count active students currently enrolled in this class
  const classEnrolledStudentsCount = useMemo(() => {
    if (!editingClass) return 0
    return students.filter(s => {
      const matchInst = !s.instituteId || s.instituteId === currentInstitute?.id
      if (!matchInst) return false
      return (s.className || '').toLowerCase().trim() === editingClass.name.toLowerCase().trim() && s.status !== 'Withdrawn'
    }).length
  }, [editingClass, students, currentInstitute?.id])

  // Populate form on open
  useEffect(() => {
    if (editingClass) {
      const level = editingClass.programLevel || detectProgramLevel(editingClass.name)
      const tierPresetNames = STANDARD_TIER_CLASS_NAMES[level] || []
      const isCustom = !tierPresetNames.includes(editingClass.name)

      setIsCustomClassName(isCustom)
      setCustomClassNameValue(isCustom ? editingClass.name : '')

      // Populate sections ensuring all required fields
      const normalizedSections = (editingClass.sections || []).map((sec, i) => {
        const secEnrolled = students.filter(s => 
          (!s.instituteId || s.instituteId === currentInstitute?.id) &&
          (s.className || '').toLowerCase().trim() === editingClass.name.toLowerCase().trim() &&
          (s.section || '').toLowerCase().trim() === (sec.name || '').toLowerCase().trim() &&
          s.status !== 'Withdrawn'
        ).length

        return {
          id: sec.id || `sec-${Date.now()}-${i}`,
          name: sec.name || `Section ${String.fromCharCode(65 + i)}`,
          roomNo: sec.roomNo || campusRooms[i % campusRooms.length]?.name || 'Room 101',
          capacity: Number(sec.capacity || 40),
          shift: sec.shift || 'Morning',
          gender: sec.gender || 'Co-ed',
          medium: sec.medium || 'English',
          group: sec.group || editingClass.group || 'General',
          classTeacherId: sec.classTeacherId || '',
          classTeacherName: sec.classTeacherName || sec.classTeacher || '',
          badge: sec.badge || 'None',
          enrolled: secEnrolled
        }
      })

      setFormData({
        name: editingClass.name || '',
        programLevel: level,
        academicSession: editingClass.academicSession || currentSession,
        sortOrder: editingClass.sortOrder || calculateClassSortOrder(editingClass.name, level),
        classTeacherId: editingClass.classTeacherId || '',
        classTeacherName: editingClass.classTeacher || editingClass.classTeacherName || '',
        medium: editingClass.medium || 'English',
        shift: editingClass.shift || 'Morning',
        group: editingClass.group || '',
        board: editingClass.board || 'BISE Lahore',
        department: editingClass.department || 'General',
        creditHours: editingClass.creditHours || 18,
        totalSemesters: editingClass.totalSemesters || 8,
        programHead: editingClass.programHead || '',
        reservedMeritSeats: editingClass.reservedMeritSeats || 0,
        reservedStaffSeats: editingClass.reservedStaffSeats || 0,
        subjects: editingClass.subjects && editingClass.subjects.length > 0 
          ? editingClass.subjects 
          : [
              { id: 'sub-1', name: 'English', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 },
              { id: 'sub-2', name: 'Mathematics', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 }
            ],
        sections: normalizedSections.length > 0 
          ? normalizedSections 
          : [{
              id: `sec-${Date.now()}-1`, 
              name: 'Section A', 
              roomNo: 'Room 101', 
              capacity: 40, 
              shift: 'Morning', 
              gender: 'Co-ed', 
              medium: 'English', 
              group: 'General',
              classTeacherId: '', 
              classTeacherName: '',
              badge: 'None',
              enrolled: 0
            }]
      })
      setIsDirty(false)
    } else {
      const initialLevel = currentLevel !== 'all' ? currentLevel : 'secondary'
      const presets = STANDARD_TIER_CLASS_NAMES[initialLevel] || []
      const defaultName = presets[0] || '9th Grade (Matric Science)'

      setIsCustomClassName(false)
      setCustomClassNameValue('')

      setFormData({
        name: defaultName,
        programLevel: initialLevel,
        academicSession: currentSession || '2026-2027',
        sortOrder: calculateClassSortOrder(defaultName, initialLevel),
        classTeacherId: '',
        classTeacherName: '',
        medium: 'English',
        shift: 'Morning',
        group: initialLevel === 'higher-secondary' ? 'Pre-Medical' : '',
        board: 'BISE Lahore',
        department: 'General',
        creditHours: 18,
        totalSemesters: 8,
        programHead: '',
        reservedMeritSeats: 0,
        reservedStaffSeats: 0,
        subjects: [
          { id: 'sub-1', name: 'English', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 },
          { id: 'sub-2', name: 'Mathematics', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 },
          { id: 'sub-3', name: 'Urdu', totalMarks: 100, passingMarks: 33, periodsPerWeek: 5 },
          { id: 'sub-4', name: 'General Science', totalMarks: 100, passingMarks: 33, periodsPerWeek: 5 }
        ],
        sections: [
          { 
            id: `sec-${Date.now()}-1`, 
            name: 'Section A', 
            roomNo: 'Room 101', 
            capacity: 40, 
            shift: 'Morning', 
            gender: 'Co-ed', 
            medium: 'English', 
            group: 'General',
            classTeacherId: '', 
            classTeacherName: '',
            badge: 'None',
            enrolled: 0
          }
        ]
      })
      setIsDirty(false)
    }
    setActiveStep('details')
    setValidationError('')
    setBlockedSectionNotice(null)
  }, [editingClass, isOpen, currentLevel, currentSession])

  // Total Seating Capacity dynamically calculated as sum of section capacities
  const totalCapacity = useMemo(() => {
    return formData.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
  }, [formData.sections])

  // When Tier dropdown changes
  const handleTierChange = (newTier) => {
    const presets = STANDARD_TIER_CLASS_NAMES[newTier] || []
    const newDefaultName = presets[0] || 'Grade 1'
    setIsCustomClassName(false)
    setCustomClassNameValue('')
    setFormData(prev => ({
      ...prev,
      programLevel: newTier,
      name: newDefaultName,
      sortOrder: calculateClassSortOrder(newDefaultName, newTier),
      group: newTier === 'higher-secondary' ? 'Pre-Medical' : ''
    }))
    setIsDirty(true)
  }

  // When Class Title dropdown changes
  const handleClassTitleSelect = (e) => {
    const val = e.target.value
    if (val === '__custom__') {
      setIsCustomClassName(true)
      setCustomClassNameValue('')
      setFormData(prev => ({ ...prev, name: '' }))
    } else {
      setIsCustomClassName(false)
      setCustomClassNameValue('')
      setFormData(prev => ({
        ...prev,
        name: val,
        sortOrder: calculateClassSortOrder(val, prev.programLevel)
      }))
    }
    setIsDirty(true)
  }

  // When Custom Class Name input changes
  const handleCustomClassNameChange = (e) => {
    const val = e.target.value
    setCustomClassNameValue(val)
    const formatted = formatClassTitle(val)
    setFormData(prev => ({
      ...prev,
      name: formatted,
      sortOrder: calculateClassSortOrder(formatted, prev.programLevel)
    }))
    setIsDirty(true)
  }

  // Quick Presets: Super Section, Star Section, Section A, B, C, D
  const availablePresets = ['Super Section', 'Star Section', 'Section A', 'Section B', 'Section C', 'Section D']

  const handleAddPreset = (presetName) => {
    if (formData.sections.some(s => s.name.trim().toLowerCase() === presetName.toLowerCase())) {
      return
    }
    const nextRoom = campusRooms[(formData.sections.length) % campusRooms.length]?.name || `Room ${100 + formData.sections.length + 1}`
    const newSec = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: presetName,
      roomNo: nextRoom,
      capacity: 40,
      shift: formData.shift || 'Morning',
      gender: 'Co-ed',
      medium: formData.medium || 'English',
      group: formData.group || 'General',
      classTeacherId: '',
      classTeacherName: '',
      badge: presetName.includes('Super') ? 'Super Section' : presetName.includes('Star') ? 'Star Section' : 'None',
      enrolled: 0
    }
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSec] }))
    setIsDirty(true)
  }

  // Add Custom Section via input or Enter key
  const handleAddCustomSection = (e) => {
    if (e) e.preventDefault()
    const clean = customSectionInput.trim()
    if (!clean) return

    if (formData.sections.some(s => s.name.toLowerCase() === clean.toLowerCase())) {
      setValidationError(`Section "${clean}" already exists in this class.`)
      return
    }

    const nextRoom = campusRooms[(formData.sections.length) % campusRooms.length]?.name || `Room ${100 + formData.sections.length + 1}`
    const newSec = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: clean,
      roomNo: nextRoom,
      capacity: 40,
      shift: formData.shift || 'Morning',
      gender: 'Co-ed',
      medium: formData.medium || 'English',
      group: formData.group || 'General',
      classTeacherId: '',
      classTeacherName: '',
      badge: 'None',
      enrolled: 0
    }
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSec] }))
    setCustomSectionInput('')
    setValidationError('')
    setIsDirty(true)
  }

  // Add Multiple (A to D in one action)
  const handleAddMultipleSections = () => {
    const letters = ['Section A', 'Section B', 'Section C', 'Section D']
    const existingNames = new Set(formData.sections.map(s => s.name.trim().toLowerCase()))
    const newSections = [...formData.sections]

    letters.forEach((letter, i) => {
      if (!existingNames.has(letter.toLowerCase())) {
        const nextRoom = campusRooms[newSections.length % campusRooms.length]?.name || `Room ${100 + newSections.length + 1}`
        newSections.push({
          id: `sec-${Date.now()}-${i}`,
          name: letter,
          roomNo: nextRoom,
          capacity: 40,
          shift: formData.shift || 'Morning',
          gender: 'Co-ed',
          medium: formData.medium || 'English',
          group: formData.group || 'General',
          classTeacherId: '',
          classTeacherName: '',
          badge: 'None',
          enrolled: 0
        })
      }
    })

    setFormData(prev => ({ ...prev, sections: newSections }))
    setIsDirty(true)
  }

  // Duplicate Section Action
  const handleDuplicateSection = (sec) => {
    const existingLetters = formData.sections.map(s => s.name.replace(/[^A-Za-z0-9]/g, '').slice(-1).toUpperCase())
    const nextCode = String.fromCharCode(65 + formData.sections.length)
    const nextRoom = campusRooms[formData.sections.length % campusRooms.length]?.name || `Room ${100 + formData.sections.length + 1}`

    const duplicated = {
      ...sec,
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `${sec.name} (Copy)`,
      roomNo: nextRoom,
      classTeacherId: '',
      classTeacherName: '',
      enrolled: 0
    }

    setFormData(prev => ({ ...prev, sections: [...prev.sections, duplicated] }))
    setIsDirty(true)
  }

  // Reorder Sections (Move Up / Down)
  const handleMoveSection = (index, direction) => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= formData.sections.length) return
    const updated = [...formData.sections]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    setFormData(prev => ({ ...prev, sections: updated }))
    setIsDirty(true)
  }

  // Delete Section with Safety Check (Blocked if students enrolled or teacher assigned)
  const handleDeleteSection = (sec) => {
    if (formData.sections.length <= 1) {
      setValidationError('A class must have at least one configured section.')
      return
    }

    if (sec.enrolled > 0 || (sec.classTeacherId && sec.classTeacherId.trim() !== '')) {
      setBlockedSectionNotice({
        sectionName: sec.name,
        enrolled: sec.enrolled,
        hasTeacher: Boolean(sec.classTeacherId)
      })
      return
    }

    if (window.confirm(`Remove section "${sec.name}"?`)) {
      setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== sec.id) }))
      setIsDirty(true)
    }
  }

  // Update Section Row Field
  const handleUpdateSectionField = (secId, field, val) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, [field]: val } : s)
    }))
    setIsDirty(true)
  }

  // Add / Remove Subjects
  const handleAddSubject = () => {
    const newSub = {
      id: `sub-${Date.now()}`,
      name: '',
      totalMarks: 100,
      passingMarks: 33,
      periodsPerWeek: 5
    }
    setFormData(prev => ({ ...prev, subjects: [...prev.subjects, newSub] }))
    setIsDirty(true)
  }

  const handleRemoveSubject = (subId) => {
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== subId) }))
    setIsDirty(true)
  }

  const handleUpdateSubject = (subId, field, val) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subId ? { ...s, [field]: val } : s)
    }))
    setIsDirty(true)
  }

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')

    const formattedName = formatClassTitle(formData.name)
    if (!formattedName) {
      setValidationError('Please provide a class / program title.')
      setActiveStep('details')
      return
    }

    // Duplicate class name check within same level and session
    const isDuplicate = classes.some(c => 
      (!editingClass || c.id !== editingClass.id) &&
      (!c.instituteId || c.instituteId === currentInstitute?.id) &&
      (c.academicSession || currentSession) === (formData.academicSession || currentSession) &&
      (c.programLevel || '').toLowerCase() === (formData.programLevel || '').toLowerCase() &&
      (c.name || '').toLowerCase().trim() === formattedName.toLowerCase()
    )

    if (isDuplicate) {
      setValidationError(`A class named "${formattedName}" already exists for session ${formData.academicSession} in this tier.`)
      setActiveStep('details')
      return
    }

    if (formData.sections.length === 0) {
      setValidationError('Please configure at least one section.')
      setActiveStep('sections')
      return
    }

    // Validate section names unique within class
    const secNames = formData.sections.map(s => (s.name || '').trim().toLowerCase())
    if (new Set(secNames).size !== secNames.length) {
      setValidationError('Section names within the same class must be unique.')
      setActiveStep('sections')
      return
    }

    // Require group for Higher Secondary (Years 11-12)
    if (formData.programLevel === 'higher-secondary') {
      for (const sec of formData.sections) {
        if (!sec.group || !sec.group.trim()) {
          setValidationError(`Section "${sec.name}" requires an HSSC Study Group (e.g. Pre-Medical, Pre-Engineering, ICS).`)
          setActiveStep('sections')
          return
        }
      }
    }

    // Validate room double-booking in same shift across sections and across classes
    const roomShiftMap = new Map() // roomKey -> secName
    const secTeacherMap = new Map() // teacherId -> secName

    for (const sec of formData.sections) {
      if (!sec.name.trim()) {
        setValidationError('All sections must have a valid name.')
        setActiveStep('sections')
        return
      }
      const capNum = Number(sec.capacity || 0)
      if (capNum <= 0) {
        setValidationError(`Section "${sec.name}" capacity must be a positive whole number.`)
        setActiveStep('sections')
        return
      }
      if (sec.enrolled > capNum) {
        setValidationError(`Section "${sec.name}" capacity (${capNum}) cannot be set lower than currently enrolled students (${sec.enrolled}).`)
        setActiveStep('sections')
        return
      }

      // Check room conflict within this modal
      if (sec.roomNo && sec.roomNo.trim()) {
        const roomKey = `${sec.roomNo.trim().toLowerCase()}-${(sec.shift || 'Morning').toLowerCase()}`
        if (roomShiftMap.has(roomKey)) {
          setValidationError(`Room conflict: "${sec.roomNo}" cannot be assigned to multiple sections ("${roomShiftMap.get(roomKey)}" and "${sec.name}") in the ${sec.shift || 'Morning'} shift.`)
          setActiveStep('sections')
          return
        }
        roomShiftMap.set(roomKey, sec.name)

        // Check room conflict across other campus classes in the same session and shift
        for (const c of classes) {
          if (editingClass && c.id === editingClass.id) continue
          if ((c.academicSession || currentSession) !== (formData.academicSession || currentSession)) continue
          const cSecs = Array.isArray(c.sections) ? c.sections : []
          for (const cs of cSecs) {
            if ((cs.roomNo || '').trim().toLowerCase() === sec.roomNo.trim().toLowerCase() &&
                (cs.shift || 'Morning').toLowerCase() === (sec.shift || 'Morning').toLowerCase()) {
              setValidationError(`Room conflict: "${sec.roomNo}" is already occupied in the ${sec.shift || 'Morning'} shift by ${c.name} (${cs.name}).`)
              setActiveStep('sections')
              return
            }
          }
        }
      }

      // Check teacher single assignment within this modal
      if (sec.classTeacherId) {
        if (secTeacherMap.has(sec.classTeacherId)) {
          setValidationError(`Teacher conflict: "${sec.classTeacherName || 'Faculty'}" cannot be appointed Class Teacher for multiple sections ("${secTeacherMap.get(sec.classTeacherId)}" and "${sec.name}").`)
          setActiveStep('sections')
          return
        }
        secTeacherMap.set(sec.classTeacherId, sec.name)

        // Check teacher conflict across other campus classes
        if (busyClassTeachersMap.has(sec.classTeacherId)) {
          const conflict = busyClassTeachersMap.get(sec.classTeacherId)
          setValidationError(`Teacher conflict: "${sec.classTeacherName}" is already appointed Class Teacher for ${conflict.className} (${conflict.sectionName}).`)
          setActiveStep('sections')
          return
        }
      }
    }

    setIsSubmitting(true)

    try {
      const payload = {
        ...formData,
        name: formattedName,
        capacity: totalCapacity,
        section: formData.sections.map(s => s.name).join(', '),
        roomNo: formData.sections[0]?.roomNo || 'Room 101',
        classTeacher: formData.classTeacherName || (formData.sections[0]?.classTeacherName || 'Teacher In-Charge'),
        instituteId: currentInstitute?.id || 'inst-1',
        updatedAt: new Date().toISOString()
      }

      await onSaveClass(payload)
      setIsDirty(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCloseAttempt = () => {
    if (isDirty) {
      setShowDiscardConfirm(true)
    } else {
      onClose()
    }
  }

  if (!isOpen) return null

  const isHssc = formData.programLevel === 'higher-secondary'
  const isCollege = formData.programLevel === 'college'
  const isUni = formData.programLevel === 'university'
  const isPreSchool = formData.programLevel === 'preschool'

  const entityTitle = isUni ? 'Degree Program' : isCollege ? 'Course Program' : 'Class'
  const subEntityTitle = isUni ? 'Batch / Cohort' : 'Section'

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title={
          <div className="flex items-center justify-between gap-3 pr-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                {editingClass ? `Edit ${entityTitle}: ${editingClass.name}` : `Create New ${entityTitle}`}
              </span>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Session: {formData.academicSession}
            </span>
          </div>
        }
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-[75vh] max-h-[800px]">
          
          {/* Step Navigation Tabs */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50 px-6 py-2 gap-2 text-xs font-bold text-slate-600 shrink-0">
            <button
              type="button"
              onClick={() => setActiveStep('details')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeStep === 'details'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>1. {entityTitle} Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('sections')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeStep === 'sections'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. {subEntityTitle}s ({formData.sections.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveStep('subjects')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                activeStep === 'subjects'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>3. Curriculum & Subjects ({formData.subjects.length})</span>
            </button>
          </div>

          {/* Validation Warning Alert */}
          {validationError && (
            <div className="p-3 mx-6 mt-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 shrink-0">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            
            {/* STEP 1: DETAILS */}
            {activeStep === 'details' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                
                {/* Tier Lock Warning in Edit Mode */}
                {editingClass && classEnrolledStudentsCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 flex items-center gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Educational Tier Locked:</strong> This {entityTitle.toLowerCase()} has <strong>{classEnrolledStudentsCount}</strong> actively enrolled student(s). Tier cannot be changed while enrollments exist.
                    </span>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Institutional Tier & Nomenclature
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Educational Tier Dropdown */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Target Educational Tier *
                      </label>
                      <select
                        disabled={editingClass && classEnrolledStudentsCount > 0}
                        value={formData.programLevel}
                        onChange={(e) => handleTierChange(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-100 disabled:cursor-not-allowed"
                      >
                        <option value="preschool">Pre-School (Playgroup - KG)</option>
                        <option value="elementary">Elementary (Grade 1 - 8)</option>
                        <option value="secondary">Secondary (Grade 9 - 10 / Matric)</option>
                        <option value="higher-secondary">Higher Secondary (Grade 11 - 12 / Inter)</option>
                        <option value="college">College (Associate Degree / ADP)</option>
                        <option value="university">University (BS / MS Honors)</option>
                      </select>
                    </div>

                    {/* Class Title Selection (Standard Dropdown + Custom) */}
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        {entityTitle} Title / Preset *
                      </label>
                      <select
                        value={isCustomClassName ? '__custom__' : formData.name}
                        onChange={handleClassTitleSelect}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {standardTierNames.map(titleOption => (
                          <option key={titleOption} value={titleOption}>{titleOption}</option>
                        ))}
                        <option value="__custom__">+ Enter Custom Title...</option>
                      </select>

                      {/* Custom Title Input */}
                      {isCustomClassName && (
                        <div className="mt-2">
                          <input
                            type="text"
                            required
                            placeholder="Enter custom title (e.g. Cambridge O-1, Robotics Batch)..."
                            value={customClassNameValue}
                            onChange={handleCustomClassNameChange}
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Level-Specific Fields */}
                  {isHssc && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200/80">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          HSSC Study Group *
                        </label>
                        <select
                          required
                          value={formData.group || 'Pre-Medical'}
                          onChange={(e) => {
                            setFormData({ ...formData, group: e.target.value })
                            setIsDirty(true)
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800"
                        >
                          <option value="Pre-Medical">F.Sc Pre-Medical</option>
                          <option value="Pre-Engineering">F.Sc Pre-Engineering</option>
                          <option value="ICS">ICS (Computer Science)</option>
                          <option value="I.Com">I.Com (Commerce)</option>
                          <option value="Arts / Humanities">FA (Arts & Humanities)</option>
                          <option value="A-Levels">Cambridge A-Levels</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Board of Intermediate Examination</label>
                        <input
                          type="text"
                          value={formData.board}
                          onChange={(e) => {
                            setFormData({ ...formData, board: e.target.value })
                            setIsDirty(true)
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          placeholder="BISE Lahore / Federal Board"
                        />
                      </div>
                    </div>
                  )}

                  {isUni && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Department / Faculty *</label>
                        <input
                          type="text"
                          required
                          value={formData.department}
                          onChange={(e) => {
                            setFormData({ ...formData, department: e.target.value })
                            setIsDirty(true)
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                          placeholder="Faculty of Computer Science"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Credit Hours</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.creditHours}
                          onChange={(e) => {
                            setFormData({ ...formData, creditHours: Number(e.target.value) })
                            setIsDirty(true)
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Total Semesters</label>
                        <input
                          type="number"
                          min="1"
                          max="12"
                          value={formData.totalSemesters}
                          onChange={(e) => {
                            setFormData({ ...formData, totalSemesters: Number(e.target.value) })
                            setIsDirty(true)
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {/* Class In-Charge Dropdown from Faculty & Staff */}
                  <div className="pt-3 border-t border-slate-200/80">
                    <label className="block font-semibold text-slate-700 mb-1">
                      {isUni ? 'Program Head / Coordinator' : 'Overall Class In-Charge'}
                    </label>
                    {instTeachers.length > 0 ? (
                      <select
                        value={formData.classTeacherId}
                        onChange={(e) => {
                          const t = instTeachers.find(item => item.id === e.target.value)
                          setFormData({
                            ...formData,
                            classTeacherId: e.target.value,
                            classTeacherName: t?.name || ''
                          })
                          setIsDirty(true)
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                      >
                        <option value="">-- Select Faculty In-Charge --</option>
                        {instTeachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {t.name} ({t.empId} • {t.designation || 'Faculty'} • {t.department || 'General'})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-center justify-between text-xs">
                        <span>No faculty registered yet. Please add staff in Faculty & Staff first.</span>
                        <a href="#inst-teachers" className="font-bold underline text-amber-900">
                          Add Faculty
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SECTIONS BUILDER */}
            {activeStep === 'sections' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                {/* Header Controls: Quick Presets & Add Multiple */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block">
                        Quick {subEntityTitle} Presets
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Click preset to append section. Already added presets appear disabled.
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddMultipleSections}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors"
                      >
                        + Add Multiple (A to D)
                      </button>
                    </div>
                  </div>

                  {/* Presets Row (Only Section Names, No Shifts!) */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {availablePresets.map(preset => {
                      const isAdded = formData.sections.some(s => s.name.trim().toLowerCase() === preset.toLowerCase())
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={isAdded}
                          onClick={() => handleAddPreset(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                            isAdded
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                              : 'bg-white hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 shadow-2xs'
                          }`}
                          title={isAdded ? 'Already added to sections' : `Add ${preset}`}
                        >
                          + {preset}
                        </button>
                      )
                    })}
                  </div>

                  {/* Add Custom Section with Enter Key Support */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                    <input
                      type="text"
                      placeholder={`Type custom ${subEntityTitle.toLowerCase()} name and press Enter (e.g. Star Section, Alpha)...`}
                      value={customSectionInput}
                      onChange={(e) => setCustomSectionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddCustomSection()
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSection}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors"
                    >
                      Add Custom
                    </button>
                  </div>
                </div>

                {/* Section Rows List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                    <span>Configured {subEntityTitle}s ({formData.sections.length})</span>
                    <span>Total Class Capacity: <strong className="text-slate-800 font-mono text-xs">{totalCapacity} Desks</strong></span>
                  </div>

                  <div className="space-y-2.5">
                    {formData.sections.map((sec, idx) => (
                      <div 
                        key={sec.id || idx}
                        className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                      >
                        {/* Row 1: Name, Reorder Buttons, Distinction Badge, Status Badge, Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Reorder arrows */}
                            <div className="flex items-center gap-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSection(idx, 'up')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move section up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === formData.sections.length - 1}
                                onClick={() => handleMoveSection(idx, 'down')}
                                className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                                title="Move section down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="font-bold text-slate-400 font-mono text-xs">#{idx + 1}</span>
                            <input
                              type="text"
                              required
                              value={sec.name}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'name', e.target.value)}
                              className="font-bold text-slate-900 border-b border-slate-300 focus:border-emerald-600 outline-none px-1 py-0.5 text-xs w-36"
                              placeholder="Section Name"
                            />

                            {/* Section Distinction Badge / Color Tag */}
                            <select
                              value={sec.badge || 'None'}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'badge', e.target.value)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                                sec.badge === 'Super Section' 
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : sec.badge === 'Star Section'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : sec.badge === 'Merit Wing'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : sec.badge === 'Remedial'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                              title="Section Distinction Badge"
                            >
                              <option value="None">Standard Badge</option>
                              <option value="Star Section">★ Star Section</option>
                              <option value="Super Section">✦ Super Section</option>
                              <option value="Merit Wing">🎓 Merit Wing</option>
                              <option value="Remedial">⚡ Remedial Wing</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {/* Read-only enrolled badge */}
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {sec.enrolled || 0} / {sec.capacity} Enrolled
                            </span>

                            {/* Duplicate Button */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateSection(sec)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Duplicate Section"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete Section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Row 2: Shift, Gender, Medium, Group, Capacity, Room, Teacher */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
                          {/* Shift */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Shift</label>
                            <select
                              value={sec.shift || 'Morning'}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'shift', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                            >
                              <option value="Morning">Morning</option>
                              <option value="Evening">Evening</option>
                            </select>
                          </div>

                          {/* Gender */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Gender</label>
                            <select
                              value={sec.gender || 'Co-ed'}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'gender', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                            >
                              <option value="Co-ed">Co-ed</option>
                              <option value="Boys">Boys</option>
                              <option value="Girls">Girls</option>
                            </select>
                          </div>

                          {/* Medium */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Medium</label>
                            <select
                              value={sec.medium || 'English'}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'medium', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                            >
                              <option value="English">English</option>
                              <option value="Urdu">Urdu</option>
                              <option value="Both">Both</option>
                            </select>
                          </div>

                          {/* Group (Required for Years 11-12) */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">
                              Group {isHssc && <span className="text-rose-500">*</span>}
                            </label>
                            <select
                              value={sec.group || formData.group || (isHssc ? 'Pre-Medical' : 'General')}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'group', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-semibold"
                            >
                              <option value="General">General</option>
                              <option value="Pre-Medical">F.Sc Pre-Med</option>
                              <option value="Pre-Engineering">F.Sc Pre-Eng</option>
                              <option value="ICS">ICS (Comp Sci)</option>
                              <option value="I.Com">I.Com</option>
                              <option value="Arts / Humanities">FA Arts</option>
                              <option value="Cambridge">Cambridge</option>
                            </select>
                          </div>

                          {/* Capacity */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Capacity</label>
                            <input
                              type="number"
                              min={Math.max(1, sec.enrolled || 0)}
                              required
                              value={sec.capacity}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'capacity', Number(e.target.value))}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono font-bold text-xs"
                            />
                          </div>

                          {/* Room (Dropdown from Rooms Register) */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Room</label>
                            <select
                              required
                              value={sec.roomNo || 'Room 101'}
                              onChange={(e) => handleUpdateSectionField(sec.id, 'roomNo', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs font-mono"
                            >
                              {campusRooms.map(r => (
                                <option key={r.id} value={r.name}>
                                  {r.name} ({r.floor})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Section Teacher (Dropdown from Faculty & Staff) */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Section Teacher</label>
                            <select
                              value={sec.classTeacherId || ''}
                              onChange={(e) => {
                                const t = instTeachers.find(item => item.id === e.target.value)
                                handleUpdateSectionField(sec.id, 'classTeacherId', e.target.value)
                                handleUpdateSectionField(sec.id, 'classTeacherName', t?.name || '')
                              }}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white text-xs"
                            >
                              <option value="">-- No Teacher --</option>
                              {instTeachers.map(t => {
                                const busy = busyClassTeachersMap.get(t.id)
                                return (
                                  <option key={t.id} value={t.id} disabled={Boolean(busy)}>
                                    {t.name} ({t.empId}){busy ? ` • In ${busy.className}` : ''}
                                  </option>
                                )
                              })}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SUBJECTS */}
            {activeStep === 'subjects' && (
              <div className="space-y-4 text-xs animate-in fade-in duration-150">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                      Curriculum Schemes & Subject Allotment
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Configure course scheme, maximum marks, passing benchmark, and weekly period loads
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubject}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-2xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Subject</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.subjects.map((sub, idx) => (
                    <div 
                      key={sub.id || idx}
                      className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Subject Name</label>
                        <input
                          type="text"
                          required
                          value={sub.name}
                          onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                          placeholder="e.g. Physics, Chemistry, English"
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg font-semibold text-slate-900"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Total Marks</label>
                        <input
                          type="number"
                          min="10"
                          value={sub.totalMarks}
                          onChange={(e) => handleUpdateSubject(sub.id, 'totalMarks', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Passing Marks</label>
                        <input
                          type="number"
                          min="5"
                          value={sub.passingMarks}
                          onChange={(e) => handleUpdateSubject(sub.id, 'passingMarks', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Periods/Wk</label>
                        <input
                          type="number"
                          min="1"
                          value={sub.periodsPerWeek}
                          onChange={(e) => handleUpdateSubject(sub.id, 'periodsPerWeek', Number(e.target.value))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubject(sub.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded self-end mb-1"
                        title="Remove subject"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Fixed Footer Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500 font-mono">
              Total {formData.sections.length} {subEntityTitle.toLowerCase()}(s) • {totalCapacity} Seats
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{editingClass ? `Save Changes` : `Create ${entityTitle}`}</span>
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Discard Changes Confirmation */}
      {showDiscardConfirm && (
        <Modal
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          title="Discard Unsaved Changes?"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs text-slate-600">
            <p>You have unsaved changes in this {entityTitle.toLowerCase()} configuration. If you leave now, all adjustments will be lost.</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Continue Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false)
                  setIsDirty(false)
                  onClose()
                }}
                className="px-4 py-1.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Blocked Section Deletion Notice */}
      {blockedSectionNotice && (
        <Modal
          isOpen={Boolean(blockedSectionNotice)}
          onClose={() => setBlockedSectionNotice(null)}
          title="Cannot Delete Section"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl space-y-1">
              <strong className="block font-bold">Deletion Blocked:</strong>
              <p>
                Section <strong className="text-slate-900">{blockedSectionNotice.sectionName}</strong> cannot be deleted because:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {blockedSectionNotice.enrolled > 0 && (
                  <li>It has <strong>{blockedSectionNotice.enrolled}</strong> active enrolled student(s).</li>
                )}
                {blockedSectionNotice.hasTeacher && (
                  <li>An active Class Teacher is currently appointed to this section.</li>
                )}
              </ul>
            </div>
            <p className="text-[11px] text-slate-500">
              Please transfer enrolled students to another section and unassign the teacher before removing this section.
            </p>
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBlockedSectionNotice(null)}
                className="px-4 py-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Understood
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default ClassModal
