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
  AlertTriangle 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { PROGRAM_LEVELS, detectProgramLevel } from '../../../constants/academicLevels'

// Auto-format class title: "9th grade" -> "9th Grade", "class 5" -> "Class 5"
function formatClassTitle(title = '') {
  if (!title) return ''
  // Preserve known uppercase abbreviations like BSCS, ICS, BBA, DAE, ADP
  const upperAcronyms = ['BSCS', 'BSSE', 'BBA', 'ICS', 'FSC', 'FA', 'ADP', 'DAE', 'MS', 'MPHIL', 'PHD', 'SSC', 'HSSC', 'KG', 'ECCE']
  return title
    .trim()
    .split(/\s+/)
    .map(word => {
      const upper = word.toUpperCase()
      if (upperAcronyms.includes(upper)) return upper
      // Standard Title Case
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
  currentInstitute,
  currentLevel = 'all',
  currentSession = '2026-2027',
  onSaveClass
}) => {
  const [formData, setFormData] = useState({
    name: '',
    programLevel: 'secondary',
    academicSession: currentSession || '2026-2027',
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
    // Quota reservations
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
      { id: `sec-${Date.now()}-1`, name: 'Section A', roomNo: 'Room 101', capacity: 40, shift: 'Morning', gender: 'Co-ed', medium: 'English', classTeacherId: '', classTeacherName: '' }
    ]
  })

  const [validationError, setValidationError] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  // Filter teachers for current institute
  const instTeachers = useMemo(() => {
    return teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  }, [teachers, currentInstitute?.id])

  // Populate form on open
  useEffect(() => {
    if (editingClass) {
      setFormData({
        name: editingClass.name || '',
        programLevel: editingClass.programLevel || detectProgramLevel(editingClass.name),
        academicSession: editingClass.academicSession || currentSession,
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
        sections: editingClass.sections && editingClass.sections.length > 0
          ? editingClass.sections
          : [
              { id: `sec-${Date.now()}-1`, name: 'Section A', roomNo: 'Room 101', capacity: 40, shift: 'Morning', gender: 'Co-ed', medium: 'English', classTeacherId: '', classTeacherName: '' }
            ]
      })
      setIsDirty(false)
    } else {
      const initialLevel = currentLevel !== 'all' ? currentLevel : 'secondary'
      setFormData({
        name: '',
        programLevel: initialLevel,
        academicSession: currentSession || '2026-2027',
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
          { id: 'sub-2', name: 'Mathematics', totalMarks: 100, passingMarks: 33, periodsPerWeek: 6 }
        ],
        sections: [
          { id: `sec-${Date.now()}-1`, name: 'Section A', roomNo: 'Room 101', capacity: 40, shift: 'Morning', gender: 'Co-ed', medium: 'English', classTeacherId: '', classTeacherName: '' }
        ]
      })
      setIsDirty(false)
    }
    setValidationError('')
  }, [editingClass, isOpen, currentLevel, currentSession])

  // Total Seating Capacity is sum of section capacities
  const totalCapacity = useMemo(() => {
    return formData.sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
  }, [formData.sections])

  // Auto-format class name on blur
  const handleNameBlur = () => {
    if (formData.name) {
      setFormData(prev => ({ ...prev, name: formatClassTitle(prev.name) }))
    }
  }

  // Add 1-Click Sections A, B, C, D
  const handleAddStandardSections = () => {
    const letters = ['Section A', 'Section B', 'Section C', 'Section D']
    const existingNames = new Set(formData.sections.map(s => s.name.trim().toLowerCase()))
    const newSections = [...formData.sections]

    letters.forEach((letter, i) => {
      if (!existingNames.has(letter.toLowerCase())) {
        newSections.push({
          id: `sec-${Date.now()}-${i}`,
          name: letter,
          roomNo: `Room ${100 + newSections.length + 1}`,
          capacity: 40,
          shift: formData.shift || 'Morning',
          gender: 'Co-ed',
          medium: formData.medium || 'English',
          classTeacherId: '',
          classTeacherName: ''
        })
      }
    })

    setFormData(prev => ({ ...prev, sections: newSections }))
    setIsDirty(true)
  }

  // Add single custom section
  const handleAddSingleSection = () => {
    const nextRoom = 100 + formData.sections.length + 1
    const nextLetter = String.fromCharCode(65 + formData.sections.length) // A, B, C...
    const newSection = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: `Section ${nextLetter}`,
      roomNo: `Room ${nextRoom}`,
      capacity: 40,
      shift: formData.shift || 'Morning',
      gender: 'Co-ed',
      medium: formData.medium || 'English',
      classTeacherId: '',
      classTeacherName: ''
    }
    setFormData(prev => ({ ...prev, sections: [...prev.sections, newSection] }))
    setIsDirty(true)
  }

  // Remove section
  const handleRemoveSection = (secId) => {
    if (formData.sections.length <= 1) {
      setValidationError('A class must contain at least one configured section.')
      return
    }
    setFormData(prev => ({ ...prev, sections: prev.sections.filter(s => s.id !== secId) }))
    setIsDirty(true)
  }

  // Update section field
  const handleUpdateSection = (secId, field, val) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === secId ? { ...s, [field]: val } : s)
    }))
    setIsDirty(true)
  }

  // Add Subject to class
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

  // Remove Subject
  const handleRemoveSubject = (subId) => {
    setFormData(prev => ({ ...prev, subjects: prev.subjects.filter(s => s.id !== subId) }))
    setIsDirty(true)
  }

  // Update Subject
  const handleUpdateSubject = (subId, field, val) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => s.id === subId ? { ...s, [field]: val } : s)
    }))
    setIsDirty(true)
  }

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    const formattedName = formatClassTitle(formData.name)
    if (!formattedName) {
      setValidationError('Class / Program title is required.')
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
      return
    }

    if (formData.sections.length === 0) {
      setValidationError('Please configure at least one section.')
      return
    }

    // Validate section names unique within class
    const secNames = formData.sections.map(s => (s.name || '').trim().toLowerCase())
    if (new Set(secNames).size !== secNames.length) {
      setValidationError('Section names within the same class must be unique.')
      return
    }

    // Validate room conflicts across sections in the same shift
    const roomShiftMap = new Set()
    for (const sec of formData.sections) {
      if (!sec.name.trim()) {
        setValidationError('All sections must have a valid name.')
        return
      }
      if (Number(sec.capacity || 0) <= 0) {
        setValidationError(`Section "${sec.name}" capacity must be a positive whole number.`)
        return
      }
      if (sec.roomNo && sec.roomNo.trim()) {
        const key = `${sec.roomNo.trim().toLowerCase()}-${(sec.shift || 'Morning').toLowerCase()}`
        if (roomShiftMap.has(key)) {
          setValidationError(`Room conflict: "${sec.roomNo}" cannot be assigned to multiple sections in the ${sec.shift || 'Morning'} shift.`)
          return
        }
        roomShiftMap.add(key)
      }
    }

    // Prepare complete class payload
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

    onSaveClass(payload)
    setIsDirty(false)
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

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleCloseAttempt}
        title={editingClass ? `Edit Class: ${editingClass.name}` : 'Create New Class & Custom Sections'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="font-medium">{validationError}</span>
            </div>
          )}

          {/* Section 1: Tier, Session, and Class Name */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-4">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              1. Academic Program & Nomenclature
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Educational Tier *</label>
                <select
                  value={formData.programLevel}
                  onChange={(e) => {
                    setFormData({ ...formData, programLevel: e.target.value })
                    setIsDirty(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="preschool">Pre-School (Playgroup - KG)</option>
                  <option value="elementary">Elementary (Grade 1 - 8)</option>
                  <option value="secondary">Secondary (Grade 9 - 10 / Matric)</option>
                  <option value="higher-secondary">Higher Secondary (Grade 11 - 12 / Inter)</option>
                  <option value="college">College (Associate Degree / ADP)</option>
                  <option value="university">University (BS / MS Honors)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Academic Session *</label>
                <input
                  type="text"
                  required
                  value={formData.academicSession}
                  onChange={(e) => {
                    setFormData({ ...formData, academicSession: e.target.value })
                    setIsDirty(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-medium"
                  placeholder="2026-2027"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  {isUni ? 'Degree Program Name *' : isCollege ? 'Course / Program *' : 'Class Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setIsDirty(true)
                  }}
                  onBlur={handleNameBlur}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
                  placeholder={isUni ? 'e.g. BSCS or BBA' : isHssc ? 'e.g. 11th Grade' : 'e.g. 9th Grade, Class 5'}
                />
              </div>
            </div>

            {/* Level Specific Adaptations */}
            {isHssc && (
              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">HSSC Study Group *</label>
                  <select
                    value={formData.group}
                    onChange={(e) => {
                      setFormData({ ...formData, group: e.target.value })
                      setIsDirty(true)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
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
                  <label className="block text-slate-600 font-semibold mb-1">Board of Examination</label>
                  <input
                    type="text"
                    value={formData.board}
                    onChange={(e) => {
                      setFormData({ ...formData, board: e.target.value })
                      setIsDirty(true)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    placeholder="BISE Lahore / Rawalpindi / Federal"
                  />
                </div>
              </div>
            )}

            {isUni && (
              <div className="grid grid-cols-3 gap-3 text-xs pt-2 border-t border-slate-200/60">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Academic Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({ ...formData, department: e.target.value })
                      setIsDirty(true)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Semester Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.creditHours}
                    onChange={(e) => {
                      setFormData({ ...formData, creditHours: Number(e.target.value) })
                      setIsDirty(true)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Total Semesters</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.totalSemesters}
                    onChange={(e) => {
                      setFormData({ ...formData, totalSemesters: Number(e.target.value) })
                      setIsDirty(true)
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-medium"
                  />
                </div>
              </div>
            )}

            {/* In-Charge Dropdown from Faculty & Staff */}
            <div className="pt-2 border-t border-slate-200/60 text-xs">
              <label className="block text-slate-600 font-semibold mb-1">
                {isUni ? 'Program Head / Coordinator' : 'Overall Class In-Charge'}
              </label>
              {instTeachers.length > 0 ? (
                <select
                  value={formData.classTeacherId}
                  onChange={(e) => {
                    const sel = instTeachers.find(t => t.id === e.target.value)
                    setFormData({
                      ...formData,
                      classTeacherId: e.target.value,
                      classTeacherName: sel?.name || ''
                    })
                    setIsDirty(true)
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
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
                  <a href="#inst-teachers" className="font-bold underline text-amber-900 hover:text-amber-950">
                    Add Faculty
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Sections Configuration */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  2. Assigned Sections ({formData.sections.length}) • Total Capacity: {totalCapacity} Seats
                </span>
                <span className="text-[10px] text-slate-400">
                  Class capacity is automatically calculated as the sum of section capacities.
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleAddStandardSections}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 shadow-2xs transition-colors"
                >
                  + Add Sections A, B, C, D
                </button>
                <button
                  type="button"
                  onClick={handleAddSingleSection}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Section</span>
                </button>
              </div>
            </div>

            {/* Sections List */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {formData.sections.map((sec, idx) => (
                <div 
                  key={sec.id || idx}
                  className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs"
                >
                  <div className="sm:col-span-3">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Section Name</label>
                    <input
                      type="text"
                      required
                      value={sec.name}
                      onChange={(e) => handleUpdateSection(sec.id, 'name', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-bold text-slate-800"
                      placeholder="Section A"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Room</label>
                    <input
                      type="text"
                      value={sec.roomNo}
                      onChange={(e) => handleUpdateSection(sec.id, 'roomNo', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-medium"
                      placeholder="Room 101"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={sec.capacity}
                      onChange={(e) => handleUpdateSection(sec.id, 'capacity', Number(e.target.value))}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Shift</label>
                    <select
                      value={sec.shift || 'Morning'}
                      onChange={(e) => handleUpdateSection(sec.id, 'shift', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Morning">Morning</option>
                      <option value="Evening">Evening</option>
                      <option value="Weekend">Weekend</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-0.5">Gender</label>
                    <select
                      value={sec.gender || 'Co-ed'}
                      onChange={(e) => handleUpdateSection(sec.id, 'gender', e.target.value)}
                      className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-white font-medium"
                    >
                      <option value="Co-ed">Co-ed</option>
                      <option value="Boys">Boys</option>
                      <option value="Girls">Girls</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveSection(sec.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Remove section"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Class Curriculum / Subjects Setup */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  3. Class Curriculum & Subjects Scheme ({formData.subjects.length})
                </span>
                <span className="text-[10px] text-slate-400">
                  Total marks, passing criteria, and instructional periods per week
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {formData.subjects.map((sub, idx) => (
                <div 
                  key={sub.id || idx}
                  className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      value={sub.name}
                      onChange={(e) => handleUpdateSubject(sub.id, 'name', e.target.value)}
                      placeholder="Subject Name (e.g. Physics)"
                      className="w-full px-2.5 py-1 border border-slate-200 rounded-lg font-semibold text-slate-800"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="10"
                      value={sub.totalMarks}
                      onChange={(e) => handleUpdateSubject(sub.id, 'totalMarks', Number(e.target.value))}
                      placeholder="Total"
                      title="Total Marks"
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg font-mono text-center"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="5"
                      value={sub.passingMarks}
                      onChange={(e) => handleUpdateSubject(sub.id, 'passingMarks', Number(e.target.value))}
                      placeholder="Pass"
                      title="Passing Marks"
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg font-mono text-center"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      min="1"
                      value={sub.periodsPerWeek}
                      onChange={(e) => handleUpdateSubject(sub.id, 'periodsPerWeek', Number(e.target.value))}
                      placeholder="Periods/Wk"
                      title="Periods or Credit Hours per week"
                      className="w-full px-2 py-1 border border-slate-200 rounded-lg font-mono text-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(sub.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400 font-mono">
              Total {formData.sections.length} Section(s) • {totalCapacity} Seats
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleCloseAttempt}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
              >
                {editingClass ? 'Update Class & Sections' : 'Create Class & Sections'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Discard Changes Warning Dialog */}
      {showDiscardConfirm && (
        <Modal
          isOpen={showDiscardConfirm}
          onClose={() => setShowDiscardConfirm(false)}
          title="Discard Unsaved Changes?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              You have unsaved changes in this class configuration. If you leave now, your adjustments will be lost.
            </p>
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
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
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

export default ClassModal
