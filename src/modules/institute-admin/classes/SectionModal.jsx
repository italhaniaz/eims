import React, { useState, useEffect, useMemo } from 'react'
import { 
  X, 
  DoorOpen, 
  Users, 
  UserCheck, 
  AlertCircle, 
  Star, 
  Sparkles, 
  Clock, 
  BookOpen, 
  Award,
  Layers
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const SectionModal = ({
  isOpen,
  onClose,
  targetClass,
  editingSection = null,
  allClasses = [],
  teachers = [],
  currentEnrolled = 0,
  onSaveSection
}) => {
  const [formData, setFormData] = useState({
    name: '',
    shift: 'Morning',
    gender: 'Co-ed',
    medium: 'English',
    roomNo: '',
    capacity: 40,
    classTeacherId: '',
    classTeacherName: '',
    monitorName: '',
    badge: 'None', // 'None' | 'Star Section' | 'Super Section' | 'Merit Wing' | 'Remedial'
    subjectTeachers: {} // { [subjectId]: teacherId }
  })

  const [validationError, setValidationError] = useState('')

  // Map of teachers already assigned as Class Teacher elsewhere
  const busyClassTeachers = useMemo(() => {
    const map = new Map() // teacherId -> { className, sectionName }
    allClasses.forEach(c => {
      const secs = Array.isArray(c.sections) ? c.sections : []
      secs.forEach(s => {
        // Skip current editing section
        if (editingSection && c.id === targetClass?.id && s.id === editingSection.id) return
        if (s.classTeacherId) {
          map.set(s.classTeacherId, { className: c.name, sectionName: s.name })
        }
      })
    })
    return map
  }, [allClasses, targetClass?.id, editingSection])

  // Populate form
  useEffect(() => {
    if (editingSection) {
      setFormData({
        name: editingSection.name || '',
        shift: editingSection.shift || 'Morning',
        gender: editingSection.gender || 'Co-ed',
        medium: editingSection.medium || 'English',
        roomNo: editingSection.roomNo || '',
        capacity: Number(editingSection.capacity || 40),
        classTeacherId: editingSection.classTeacherId || '',
        classTeacherName: editingSection.classTeacherName || editingSection.classTeacher || '',
        monitorName: editingSection.monitorName || '',
        badge: editingSection.badge || 'None',
        subjectTeachers: editingSection.subjectTeachers || {}
      })
    } else {
      const existingSecs = Array.isArray(targetClass?.sections) ? targetClass.sections : []
      const nextRoom = 100 + existingSecs.length + 1
      const nextLetter = String.fromCharCode(65 + existingSecs.length)
      setFormData({
        name: `Section ${nextLetter}`,
        shift: targetClass?.shift || 'Morning',
        gender: 'Co-ed',
        medium: targetClass?.medium || 'English',
        roomNo: `Room ${nextRoom}`,
        capacity: 40,
        classTeacherId: '',
        classTeacherName: '',
        monitorName: '',
        badge: 'None',
        subjectTeachers: {}
      })
    }
    setValidationError('')
  }, [editingSection, targetClass, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    setValidationError('')

    const secName = formData.name.trim()
    if (!secName) {
      setValidationError('Section name is required.')
      return
    }

    // Check duplicate section name in same class
    const existingSecs = Array.isArray(targetClass?.sections) ? targetClass.sections : []
    const isDuplicateName = existingSecs.some(s => 
      (!editingSection || s.id !== editingSection.id) &&
      s.name.toLowerCase().trim() === secName.toLowerCase()
    )
    if (isDuplicateName) {
      setValidationError(`Section "${secName}" already exists in ${targetClass?.name}.`)
      return
    }

    // Capacity must be at least current enrolled students
    const capNum = Number(formData.capacity)
    if (capNum <= 0) {
      setValidationError('Section capacity must be a positive number.')
      return
    }
    if (capNum < currentEnrolled) {
      setValidationError(`Capacity cannot be set below currently enrolled students (${currentEnrolled} students).`)
      return
    }

    // Check room collision: room cannot be assigned to another section in the same shift
    if (formData.roomNo && formData.roomNo.trim()) {
      const roomClean = formData.roomNo.trim().toLowerCase()
      const shiftClean = (formData.shift || 'Morning').toLowerCase()

      for (const c of allClasses) {
        const secs = Array.isArray(c.sections) ? c.sections : []
        for (const s of secs) {
          if (editingSection && c.id === targetClass?.id && s.id === editingSection.id) continue
          if ((s.roomNo || '').trim().toLowerCase() === roomClean && 
              (s.shift || 'Morning').toLowerCase() === shiftClean) {
            setValidationError(`Room Conflict: "${formData.roomNo}" is already occupied in the ${formData.shift} shift by ${c.name} (${s.name}).`)
            return
          }
        }
      }
    }

    // Check Single Class Teacher rule
    if (formData.classTeacherId && busyClassTeachers.has(formData.classTeacherId)) {
      const conflict = busyClassTeachers.get(formData.classTeacherId)
      setValidationError(`Teacher conflict: Selected teacher is already the designated Class Teacher for ${conflict.className} (${conflict.sectionName}). Only one class teacher assignment is allowed per faculty member.`)
      return
    }

    const payload = {
      id: editingSection?.id || `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: secName,
      shift: formData.shift,
      gender: formData.gender,
      medium: formData.medium,
      roomNo: formData.roomNo.trim() || 'Room 101',
      capacity: capNum,
      enrolled: editingSection?.enrolled || currentEnrolled || 0,
      classTeacherId: formData.classTeacherId,
      classTeacherName: formData.classTeacherName,
      classTeacher: formData.classTeacherName,
      monitorName: formData.monitorName,
      badge: formData.badge,
      subjectTeachers: formData.subjectTeachers
    }

    onSaveSection(payload)
  }

  if (!isOpen) return null

  const classSubjects = Array.isArray(targetClass?.subjects) ? targetClass.subjects : []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSection ? `Edit Section: ${editingSection.name} (${targetClass?.name})` : `Add New Section to: ${targetClass?.name}`}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{validationError}</span>
          </div>
        )}

        {/* Section Name & Presets */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
            Section Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            placeholder="e.g. Section A, Morning Batch, Green Wing"
          />
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold">Quick Presets:</span>
            {['Section A', 'Section B', 'Section C', 'Section D', 'Morning Batch', 'Evening Batch'].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setFormData({ ...formData, name: preset })}
                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Shift, Gender & Medium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Session Shift *</label>
            <select
              value={formData.shift}
              onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="Morning">Morning Shift</option>
              <option value="Evening">Evening Shift</option>
              <option value="Weekend">Weekend Shift</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Gender Cohort *</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="Co-ed">Co-educational</option>
              <option value="Boys">Boys Only</option>
              <option value="Girls">Girls Only</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Instruction Medium</label>
            <select
              value={formData.medium}
              onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
            >
              <option value="English">English Medium</option>
              <option value="Urdu">Urdu Medium</option>
              <option value="Both">Bilingual / Both</option>
            </select>
          </div>
        </div>

        {/* Room & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Classroom / Room Number *</label>
            <input
              type="text"
              required
              value={formData.roomNo}
              onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium"
              placeholder="e.g. Room 101, Science Lab 2"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Checked for double-booking conflicts across shift.
            </span>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Max Seating Capacity * {currentEnrolled > 0 && <span className="text-emerald-600 font-normal">({currentEnrolled} Enrolled)</span>}
            </label>
            <input
              type="number"
              min={Math.max(1, currentEnrolled)}
              required
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Cannot be set lower than {currentEnrolled} currently enrolled student(s).
            </span>
          </div>
        </div>

        {/* Section Class Teacher & Monitor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-slate-100">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Section In-Charge (Class Teacher)</label>
            {teachers.length > 0 ? (
              <select
                value={formData.classTeacherId}
                onChange={(e) => {
                  const sel = teachers.find(t => t.id === e.target.value)
                  setFormData({
                    ...formData,
                    classTeacherId: e.target.value,
                    classTeacherName: sel?.name || ''
                  })
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium"
              >
                <option value="">-- No Class Teacher Assigned --</option>
                {teachers.map(t => {
                  const isBusy = busyClassTeachers.has(t.id)
                  const info = isBusy ? busyClassTeachers.get(t.id) : null
                  return (
                    <option key={t.id} value={t.id} disabled={isBusy}>
                      {t.name} ({t.empId}) {isBusy ? `• Already in ${info.className}` : ''}
                    </option>
                  )
                })}
              </select>
            ) : (
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500 text-[11px]">
                No faculty registered in system.
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Class Monitor / Prefect (Optional)</label>
            <input
              type="text"
              value={formData.monitorName}
              onChange={(e) => setFormData({ ...formData, monitorName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
              placeholder="e.g. Ali Raza (Roll # 01)"
            />
          </div>
        </div>

        {/* Special Section Badge */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <label className="block text-slate-700 font-bold mb-1">Section Distinction Badge</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'None', label: 'Standard Section' },
              { id: 'Star Section', label: '★ Star Section' },
              { id: 'Super Section', label: '⚡ Super Section' },
              { id: 'Merit Wing', label: '🎖 Merit Wing' }
            ].map(b => (
              <label 
                key={b.id} 
                className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                  formData.badge === b.id 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' 
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="section-badge"
                  value={b.id}
                  checked={formData.badge === b.id}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="hidden"
                />
                <span className="text-[11px] block">{b.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Subject Teachers Allocation for this Section */}
        {classSubjects.length > 0 && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <span className="font-bold text-slate-700 block">Subject Teachers Allocation for this Section</span>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {classSubjects.map(sub => {
                const assignedTid = formData.subjectTeachers[sub.id] || ''
                return (
                  <div key={sub.id} className="flex items-center justify-between gap-3 bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800 w-1/3 truncate">{sub.name}</span>
                    <select
                      value={assignedTid}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData(prev => ({
                          ...prev,
                          subjectTeachers: {
                            ...prev.subjectTeachers,
                            [sub.id]: val
                          }
                        }))
                      }}
                      className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 bg-white"
                    >
                      <option value="">-- Unassigned Subject Teacher --</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.department || 'Faculty'})
                        </option>
                      ))}
                    </select>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all"
          >
            {editingSection ? 'Save Changes' : 'Create Section'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SectionModal
