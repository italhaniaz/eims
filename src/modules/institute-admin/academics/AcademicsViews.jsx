import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Users,
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  Calendar,
  Search,
  Eye,
  Filter,
  RotateCcw,
  Image as ImageIcon,
  Menu,
  ChevronDown,
  ChevronRight,
  Info,
  List
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import { downloadSimplePdf } from '../../../utils/pdfExport'
import Modal from '../../../components/common/Modal'

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        New Enrollment
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Add Payment
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Receipt className="w-3.5 h-3.5" />
        Generate Invoice
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-finance-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        Manage Expense
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-comm-sms')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Send SMS
      </button>
    </div>
  </div>
)

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // ignore storage quota errors
  }
}

export const AcademicsViews = ({
  mode = 'classes', // 'classes' | 'subjects' | 'timetable' | 'assignments'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const {
    classes = [],
    students = [],
    subjects = [],
    teachers = [],
    addItem,
    updateItem,
    deleteItem,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const instStudents = useMemo(
    () =>
      students.filter((s) => {
        if (currentInstitute?.id && s.instituteId && s.instituteId !== currentInstitute.id) return false
        if (!isClassAllowedForTier(s.className, currentInstitute)) return false
        const st = String(s.status || 'Active').toLowerCase()
        return !['dropped', 'left', 'withdrawn', 'graduated'].includes(st)
      }),
    [students, currentInstitute]
  )

  const instClasses = useMemo(
    () =>
      classes.filter(
        (c) =>
          (!currentInstitute?.id || !c.instituteId || c.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(c.name || c.className, currentInstitute)
      ),
    [classes, currentInstitute]
  )

  const availableClassNames = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  const instSubjects = useMemo(
    () =>
      subjects.filter(
        (sub) => !currentInstitute?.id || !sub.instituteId || sub.instituteId === currentInstitute.id
      ),
    [subjects, currentInstitute]
  )

  const instTeachers = useMemo(
    () =>
      teachers.filter(
        (t) => !currentInstitute?.id || !t.instituteId || t.instituteId === currentInstitute.id
      ),
    [teachers, currentInstitute]
  )

  // ============================================================================
  // 1. CLASSES & SECTIONS STATE
  // ============================================================================
  const [clsTypeFilter, setClsTypeFilter] = useState('ALL')
  const [clsSearch, setClsSearch] = useState('')
  const [expandedClassSubjects, setExpandedClassSubjects] = useState({})
  const [classModal, setClassModal] = useState(null) // { id?, name, classType, sections }

  const classRows = useMemo(() => {
    const map = new Map()
    for (const c of instClasses) {
      const name = c.name || c.className
      if (!name) continue
      map.set(name, {
        id: c.id,
        name,
        classType: c.classType || c.level || c.programLevel || name,
        sections: c.sections || '',
        paused: Boolean(c.paused || String(c.status || '').toLowerCase() === 'paused'),
        raw: c
      })
    }
    for (const cname of availableClassNames) {
      if (!map.has(cname)) {
        map.set(cname, {
          id: null,
          name: cname,
          classType: cname,
          sections: '',
          paused: false,
          raw: null
        })
      }
    }

    let list = Array.from(map.values()).map((cls) => {
      const stuCount = instStudents.filter((s) => s.className === cls.name).length
      const clsSubs = instSubjects.filter((sub) => sub.className === cls.name)
      const noTeacherCount = clsSubs.filter((sub) => !sub.teacherName && !sub.teacherId).length
      return { ...cls, stuCount, subjects: clsSubs, noTeacherCount }
    })

    if (clsTypeFilter !== 'ALL') {
      list = list.filter((c) => c.classType === clsTypeFilter)
    }
    if (clsSearch.trim()) {
      const q = clsSearch.trim().toLowerCase()
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.classType || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [instClasses, availableClassNames, instStudents, instSubjects, clsTypeFilter, clsSearch])

  const classTypesList = useMemo(
    () => Array.from(new Set(classRows.map((c) => c.classType).filter(Boolean))),
    [classRows]
  )

  const handleSaveClass = async (e) => {
    e.preventDefault()
    if (!classModal?.name?.trim()) {
      toast.warning('Class name is required')
      return
    }
    const payload = {
      name: classModal.name.trim(),
      classType: classModal.classType?.trim() || classModal.name.trim(),
      sections: classModal.sections?.trim() || '',
      instituteId: currentInstitute?.id
    }
    try {
      if (classModal.id) {
        await updateItem('classes', classModal.id, payload)
        toast.success(`Updated "${payload.name}"`)
      } else {
        await addItem('classes', { ...payload, status: 'Active' })
        toast.success(`Added class "${payload.name}"`)
      }
      setClassModal(null)
    } catch {
      toast.error('Failed to save class')
    }
  }

  const handleTogglePauseClass = async (cls) => {
    if (!cls.id) {
      toast.info('Save this class record first to pause or activate it')
      return
    }
    try {
      await updateItem('classes', cls.id, {
        paused: !cls.paused,
        status: !cls.paused ? 'Paused' : 'Active'
      })
      toast.success(`${cls.name} ${cls.paused ? 'activated' : 'paused'}`)
    } catch {
      toast.error('Failed to update class status')
    }
  }

  // ============================================================================
  // 2. SUBJECTS STATE
  // ============================================================================
  const [subClassFilter, setSubClassFilter] = useState('ALL')
  const [subSearch, setSubSearch] = useState('')
  const [subApplied, setSubApplied] = useState({ className: 'ALL', search: '' })
  const [subjectModal, setSubjectModal] = useState(null)
  const [subjectDeleteTarget, setSubjectDeleteTarget] = useState(null)

  const filteredSubjects = useMemo(() => {
    return instSubjects.filter((s) => {
      if (subApplied.className !== 'ALL' && s.className !== subApplied.className) return false
      if (subApplied.search.trim()) {
        const q = subApplied.search.trim().toLowerCase()
        const tName =
          s.teacherName ||
          instTeachers.find((t) => t.id === s.teacherId)?.name ||
          ''
        const match =
          (s.name || '').toLowerCase().includes(q) ||
          (s.shortName || '').toLowerCase().includes(q) ||
          (s.className || '').toLowerCase().includes(q) ||
          tName.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [instSubjects, instTeachers, subApplied])

  const groupedSubjects = useMemo(() => {
    const groups = {}
    for (const s of filteredSubjects) {
      const cls = s.className || 'Unassigned Class'
      if (!groups[cls]) groups[cls] = []
      groups[cls].push(s)
    }
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredSubjects])

  const assignedTeachersCount = useMemo(() => {
    const set = new Set()
    instSubjects.forEach((s) => {
      const t = s.teacherName || instTeachers.find((x) => x.id === s.teacherId)?.name
      if (t) set.add(t)
    })
    return set.size
  }, [instSubjects, instTeachers])

  const handleSaveSubject = async (e) => {
    e.preventDefault()
    if (!subjectModal?.name?.trim()) {
      toast.warning('Subject name is required')
      return
    }
    const tObj = instTeachers.find((t) => t.id === subjectModal.teacherId || t.name === subjectModal.teacherName)
    const payload = {
      name: subjectModal.name.trim(),
      shortName: subjectModal.shortName?.trim() || subjectModal.name.trim().slice(0, 6).toUpperCase(),
      className: subjectModal.className || availableClassNames[0] || '',
      teacherId: tObj?.id || '',
      teacherName: tObj?.name || subjectModal.teacherName || '',
      optional: Boolean(subjectModal.optional),
      instituteId: currentInstitute?.id
    }
    try {
      if (subjectModal.id) {
        await updateItem('subjects', subjectModal.id, payload)
        toast.success(`Updated subject "${payload.name}"`)
      } else {
        await addItem('subjects', payload)
        toast.success(`Added subject "${payload.name}"`)
      }
      setSubjectModal(null)
    } catch {
      toast.error('Failed to save subject')
    }
  }

  // ============================================================================
  // 3. TIMETABLE STATE
  // ============================================================================
  const ttStorageKey = `eims_timetables_list_${instId}`
  const [timetables, setTimetables] = useState(() => loadJson(ttStorageKey, []))
  const [ttTab, setTtTab] = useState('manage') // 'manage' | 'create'
  const [ttFilter, setTtFilter] = useState('')
  const [ttPageSize, setTtPageSize] = useState(10)
  const [ttMenuId, setTtMenuId] = useState(null)
  const [ttNewForm, setTtNewForm] = useState({
    title: '',
    className: '',
    year: '2026-2027',
    teachers: ''
  })

  useEffect(() => {
    setTimetables(loadJson(ttStorageKey, []))
  }, [ttStorageKey])

  const persistTimetables = (updater) => {
    setTimetables((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(ttStorageKey, next)
      return next
    })
  }

  const filteredTimetables = useMemo(() => {
    const q = ttFilter.trim().toLowerCase()
    if (!q) return timetables
    return timetables.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.className || '').toLowerCase().includes(q) ||
        (t.teachers || '').toLowerCase().includes(q)
    )
  }, [timetables, ttFilter])

  // ============================================================================
  // 4. ASSIGNMENTS STATE
  // ============================================================================
  const assignStorageKey = `eims_assignments_list_${instId}`
  const [assignments, setAssignments] = useState(() => loadJson(assignStorageKey, []))
  const [assignSearch, setAssignSearch] = useState('')
  const [assignClass, setAssignClass] = useState('ALL')
  const [assignSubject, setAssignSubject] = useState('ALL')
  const [assignTeacher, setAssignTeacher] = useState('ALL')
  const [assignDate, setAssignDate] = useState('')
  const [assignApplied, setAssignApplied] = useState({
    search: '',
    className: 'ALL',
    subject: 'ALL',
    teacher: 'ALL',
    date: ''
  })
  const [viewAssignment, setViewAssignment] = useState(null)
  const [newAssignModal, setNewAssignModal] = useState(false)
  const [newAssignForm, setNewAssignForm] = useState({
    title: '',
    description: '',
    className: '',
    subject: '',
    teacher: '',
    date: new Date().toISOString().slice(0, 10),
    hasFile: false
  })

  useEffect(() => {
    setAssignments(loadJson(assignStorageKey, []))
  }, [assignStorageKey])

  const persistAssignments = (updater) => {
    setAssignments((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(assignStorageKey, next)
      return next
    })
  }

  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      if (assignApplied.className !== 'ALL' && a.className !== assignApplied.className) return false
      if (assignApplied.subject !== 'ALL' && a.subject !== assignApplied.subject) return false
      if (assignApplied.teacher !== 'ALL' && a.teacher !== assignApplied.teacher) return false
      if (assignApplied.date && a.date !== assignApplied.date) return false
      if (assignApplied.search.trim()) {
        const q = assignApplied.search.trim().toLowerCase()
        const match =
          (a.title || '').toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [assignments, assignApplied])

  // ============================================================================
  // RENDER: CLASSES & SECTIONS
  // ============================================================================
  if (mode === 'classes') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Classes & Sections"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileText className="w-4 h-4 text-slate-500" />
              Classes
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                <button type="button" className="px-3 py-1.5 bg-blue-600 text-white">
                  Classes
                </button>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-subjects')}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border-l border-slate-200"
                >
                  Subjects
                </button>
              </div>
              <button
                type="button"
                onClick={() => setClassModal({ name: '', classType: '', sections: '' })}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add class
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Filter by class type
              </label>
              <select
                value={clsTypeFilter}
                onChange={(e) => setClsTypeFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All types</option>
                {classTypesList.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <input
                type="text"
                value={clsSearch}
                onChange={(e) => setClsSearch(e.target.value)}
                placeholder="Class name or type..."
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="text-xs text-slate-400 pb-2">{classRows.length} class(es)</div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Students</th>
                  <th className="py-2.5 px-3">Subjects &amp; Teachers</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No classes found. Click <strong>+ Add class</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  classRows.map((cls, idx) => {
                    const isExpanded = Boolean(expandedClassSubjects[cls.name])
                    return (
                      <tr key={cls.name} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-800">{cls.name}</div>
                          <div className="text-[11px] text-slate-400">{cls.classType}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[11px]">
                            <Users className="w-3 h-3" />
                            {cls.stuCount}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {cls.subjects.length === 0 ? (
                            <button
                              type="button"
                              onClick={() => onRouteChange?.('inst-subjects')}
                              className="text-blue-600 hover:underline font-medium text-[11px]"
                            >
                              + Add subjects
                            </button>
                          ) : (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedClassSubjects((p) => ({
                                      ...p,
                                      [cls.name]: !p[cls.name]
                                    }))
                                  }
                                  className="inline-flex items-center gap-1 text-slate-700 font-medium hover:text-blue-600"
                                >
                                  {isExpanded ? (
                                    <ChevronDown className="w-3 h-3" />
                                  ) : (
                                    <ChevronRight className="w-3 h-3" />
                                  )}
                                  {cls.subjects.length} {cls.subjects.length === 1 ? 'subject' : 'subjects'}
                                </button>
                                {cls.noTeacherCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded bg-orange-500 text-white text-[10px] font-bold">
                                    {cls.noTeacherCount} no teacher
                                  </span>
                                )}
                              </div>
                              {isExpanded && (
                                <div className="pl-4 text-[11px] text-slate-500 space-y-0.5">
                                  {cls.subjects.map((sub) => (
                                    <div key={sub.id}>
                                      • {sub.name}{' '}
                                      <span className="text-slate-400">
                                        ({sub.teacherName || 'Unassigned'})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                                cls.paused ? 'bg-amber-500' : 'bg-emerald-600'
                              }`}
                            >
                              {cls.paused ? 'Paused' : 'Active'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleTogglePauseClass(cls)}
                              className="px-2 py-0.5 rounded border border-orange-200 text-orange-600 hover:bg-orange-50 text-[10px] font-semibold"
                            >
                              {cls.paused ? 'Activate' : 'Pause'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setClassModal({
                                id: cls.id,
                                name: cls.name,
                                classType: cls.classType,
                                sections: cls.sections || ''
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-[11px] font-semibold"
                          >
                            <Pencil className="w-3 h-3" />
                            Edit
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Section in name if needed, e.g.</span>
            <span className="px-2 py-0.5 rounded border border-blue-200 text-blue-600 font-semibold">
              Class 1 - Section A
            </span>
            <span>Pause excludes student attendance / unmarked for those days.</span>
          </div>
        </div>

        {/* Add/Edit Class Modal */}
        {classModal && (
          <Modal
            isOpen
            onClose={() => setClassModal(null)}
            title={classModal.id ? `Edit Class — ${classModal.name}` : 'Add New Class'}
            maxWidth="max-w-sm"
          >
            <form onSubmit={handleSaveClass} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  value={classModal.name}
                  onChange={(e) => setClassModal((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Class 1 - Section A"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class Type / Subtitle</label>
                <input
                  type="text"
                  value={classModal.classType}
                  onChange={(e) => setClassModal((p) => ({ ...p, classType: e.target.value }))}
                  placeholder="e.g. Primary / Matric Part I"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Sections (comma separated)</label>
                <input
                  type="text"
                  value={classModal.sections}
                  onChange={(e) => setClassModal((p) => ({ ...p, sections: e.target.value }))}
                  placeholder="e.g. A, B, Super"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClassModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Class
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: SUBJECTS
  // ============================================================================
  if (mode === 'subjects') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Subjects"
          onBack={() => onRouteChange?.('inst-classes')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total subjects</p>
              <p className="text-xl font-bold text-slate-900">{instSubjects.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Classes</p>
              <p className="text-xl font-bold text-slate-900">{availableClassNames.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned teachers</p>
              <p className="text-xl font-bold text-slate-900">{assignedTeachersCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <List className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Showing</p>
              <p className="text-xl font-bold text-slate-900">{filteredSubjects.length}</p>
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_240px] gap-3 items-end">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                FILTER BY CLASS
              </label>
              <select
                value={subClassFilter}
                onChange={(e) => setSubClassFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All classes</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                SEARCH
              </label>
              <input
                type="text"
                value={subSearch}
                onChange={(e) => setSubSearch(e.target.value)}
                placeholder="Name, class, or teacher / instructor..."
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setSubApplied({ className: subClassFilter, search: subSearch })}
              className="py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              Search
            </button>
          </div>
        </div>

        {/* Subject Records Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Subject records
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-classes')}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50"
                >
                  Classes
                </button>
                <button type="button" className="px-3 py-1.5 bg-blue-600 text-white border-l border-slate-200">
                  Subjects
                </button>
              </div>
              <button
                type="button"
                onClick={() =>
                  setSubjectModal({
                    name: '',
                    shortName: '',
                    className: availableClassNames[0] || '',
                    teacherId: '',
                    teacherName: '',
                    optional: false
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add subject
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-3">NAME</th>
                  <th className="py-2.5 px-3">SHORT NAME</th>
                  <th className="py-2.5 px-3">CLASS</th>
                  <th className="py-2.5 px-3">TEACHER / INSTRUCTOR</th>
                  <th className="py-2.5 px-3">OPTIONAL</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {groupedSubjects.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No subjects found. Click <strong>+ Add subject</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  (() => {
                    let serial = 0
                    return groupedSubjects.map(([clsName, list]) => (
                      <React.Fragment key={clsName}>
                        <tr className="bg-slate-50/90">
                          <td colSpan={7} className="py-2 px-4 font-bold text-slate-700 text-[11px]">
                            {clsName}
                          </td>
                        </tr>
                        {list.map((sub) => {
                          serial += 1
                          const tName =
                            sub.teacherName ||
                            instTeachers.find((t) => t.id === sub.teacherId)?.name ||
                            ''
                          return (
                            <tr key={sub.id} className="hover:bg-slate-50/70">
                              <td className="py-2.5 px-4 text-slate-500">{serial}</td>
                              <td className="py-2.5 px-3 font-semibold text-slate-800">{sub.name}</td>
                              <td className="py-2.5 px-3 text-slate-600">{sub.shortName || sub.name}</td>
                              <td className="py-2.5 px-3 text-slate-700">{sub.className}</td>
                              <td className="py-2.5 px-3">
                                {tName ? (
                                  <span className="text-blue-600 font-medium">{tName}</span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">{sub.optional ? 'Yes' : '—'}</td>
                              <td className="py-2.5 px-4 text-right space-x-1">
                                <button
                                  type="button"
                                  onClick={() => setSubjectModal({ ...sub })}
                                  title="Edit"
                                  className="p-1.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 inline-flex items-center"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setSubjectDeleteTarget(sub)}
                                  title="Delete"
                                  className="p-1.5 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 inline-flex items-center"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </React.Fragment>
                    ))
                  })()
                )}
              </tbody>
            </table>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing {filteredSubjects.length === 0 ? 0 : 1}–{filteredSubjects.length} of{' '}
            {filteredSubjects.length}
          </div>
        </div>

        {/* Add/Edit Subject Modal */}
        {subjectModal && (
          <Modal
            isOpen
            onClose={() => setSubjectModal(null)}
            title={subjectModal.id ? `Edit Subject — ${subjectModal.name}` : 'Add Subject'}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSaveSubject} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject Name</label>
                  <input
                    type="text"
                    required
                    value={subjectModal.name}
                    onChange={(e) => setSubjectModal((p) => ({ ...p, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Short Name</label>
                  <input
                    type="text"
                    value={subjectModal.shortName || ''}
                    onChange={(e) => setSubjectModal((p) => ({ ...p, shortName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={subjectModal.className}
                    onChange={(e) => setSubjectModal((p) => ({ ...p, className: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {availableClassNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Teacher / Instructor</label>
                  <select
                    value={subjectModal.teacherId || ''}
                    onChange={(e) => {
                      const t = instTeachers.find((x) => x.id === e.target.value)
                      setSubjectModal((p) => ({
                        ...p,
                        teacherId: e.target.value,
                        teacherName: t?.name || ''
                      }))
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {instTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(subjectModal.optional)}
                  onChange={(e) => setSubjectModal((p) => ({ ...p, optional: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600"
                />
                Optional Subject
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubjectModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Subject Confirmation */}
        {subjectDeleteTarget && (
          <Modal
            isOpen
            onClose={() => setSubjectDeleteTarget(null)}
            title="Delete Subject"
            maxWidth="max-w-sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Delete <strong className="text-slate-900">{subjectDeleteTarget.name}</strong> from{' '}
                {subjectDeleteTarget.className}?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubjectDeleteTarget(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await deleteItem('subjects', subjectDeleteTarget.id)
                      toast.success('Subject deleted')
                    } catch {
                      toast.error('Failed to delete subject')
                    }
                    setSubjectDeleteTarget(null)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: TIMETABLE
  // ============================================================================
  if (mode === 'timetable') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Timetable"
          onBack={() => onRouteChange?.('inst-classes')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-slate-800">Timetable</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                <button type="button" className="px-3 py-1.5 bg-blue-600 text-white">
                  Timetables
                </button>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-exams-schedule')}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border-l border-slate-200"
                >
                  Exams
                </button>
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-makeup-sessions')}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border-l border-slate-200"
                >
                  Make-up
                </button>
              </div>
              <button
                type="button"
                onClick={() => setTtTab('create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New timetable
              </button>
            </div>
          </div>

          <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setTtTab('manage')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                ttTab === 'manage'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Manage Timetables
            </button>
            <button
              type="button"
              onClick={() => setTtTab('create')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                ttTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              + Create New Timetable
            </button>
          </div>

          {ttTab === 'create' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!ttNewForm.title.trim()) {
                  toast.warning('Timetable title is required')
                  return
                }
                const created = {
                  id: `tt_${Date.now()}`,
                  title: ttNewForm.title.trim(),
                  className: ttNewForm.className || availableClassNames[0] || 'Class One',
                  year: ttNewForm.year.trim() || '2026-2027',
                  teachers: ttNewForm.teachers.trim() || '—'
                }
                persistTimetables((prev) => [created, ...prev])
                toast.success(`Created timetable "${created.title}"`)
                setTtNewForm({ title: '', className: '', year: '2026-2027', teachers: '' })
                setTtTab('manage')
              }}
              className="p-6 max-w-2xl space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Timetable Title</label>
                  <input
                    type="text"
                    required
                    value={ttNewForm.title}
                    onChange={(e) => setTtNewForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Nursery Class Schedule"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={ttNewForm.className}
                    onChange={(e) => setTtNewForm((p) => ({ ...p, className: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select class...</option>
                    {availableClassNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={ttNewForm.year}
                    onChange={(e) => setTtNewForm((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Teachers</label>
                  <input
                    type="text"
                    value={ttNewForm.teachers}
                    onChange={(e) => setTtNewForm((p) => ({ ...p, teachers: e.target.value }))}
                    placeholder="e.g. Asad Ali, Sana Kosar"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Timetable
                </button>
                <button
                  type="button"
                  onClick={() => setTtTab('manage')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600">Filter:</span>
                  <div className="relative">
                    <input
                      type="text"
                      value={ttFilter}
                      onChange={(e) => setTtFilter(e.target.value)}
                      placeholder="Type to filter..."
                      className="pl-3 pr-7 py-1.5 rounded-md border border-slate-200 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-600">Show:</span>
                  <select
                    value={ttPageSize}
                    onChange={(e) => setTtPageSize(Number(e.target.value))}
                    className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(
                        filteredTimetables.map((t) => `${t.title}\t${t.className}\t${t.year}`).join('\n')
                      )
                      toast.success('Copied timetable rows')
                    }}
                    className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      downloadSimplePdf('timetables.pdf', [
                        { text: 'Class Timetables', bold: true },
                        ...filteredTimetables.map((t, i) => `${i + 1}. ${t.title} — ${t.className} (${t.year})`)
                      ])
                    }
                    className="px-2.5 py-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
                  >
                    PDF
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                      <th className="py-2.5 px-3 w-16">S/N</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Class</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Teachers</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTimetables.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-400">
                          No timetables created yet. Click <strong>+ New timetable</strong> to add one.
                        </td>
                      </tr>
                    ) : (
                      filteredTimetables.slice(0, ttPageSize).map((tt, idx) => (
                        <tr key={tt.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{tt.title}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold text-[11px]">
                              {tt.className}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{tt.year}</td>
                          <td className="py-3 px-3 text-slate-600">{tt.teachers || '—'}</td>
                          <td className="py-3 px-3 text-right relative">
                            <button
                              type="button"
                              onClick={() => setTtMenuId((p) => (p === tt.id ? null : tt.id))}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
                            >
                              <Menu className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {ttMenuId === tt.id && (
                              <div className="absolute right-4 top-9 z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistTimetables((prev) => prev.filter((x) => x.id !== tt.id))
                                    toast.success('Timetable removed')
                                    setTtMenuId(null)
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-rose-50 text-rose-600 font-medium"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-slate-500">
                Showing {filteredTimetables.length === 0 ? 0 : 1} to {Math.min(filteredTimetables.length, ttPageSize)} of{' '}
                {filteredTimetables.length} entries
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: ASSIGNMENTS
  // ============================================================================
  const assignWithFiles = filteredAssignments.filter((a) => a.hasFile).length
  const assignClassesCount = new Set(filteredAssignments.map((a) => a.className).filter(Boolean)).size
  const assignTeachersCount = new Set(filteredAssignments.map((a) => a.teacher).filter(Boolean)).size

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Assignments"
        onBack={() => onRouteChange?.('inst-classes')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Shown</p>
            <p className="text-xl font-bold text-slate-900">{filteredAssignments.length}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">With files</p>
            <p className="text-xl font-bold text-slate-900">{assignWithFiles}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Classes</p>
            <p className="text-xl font-bold text-slate-900">{assignClassesCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Teachers</p>
            <p className="text-xl font-bold text-slate-900">{assignTeachersCount}</p>
          </div>
        </div>
      </div>

      {/* Assignments Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <BookOpen className="w-4 h-4 text-slate-500" />
              Assignments
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              View classwork, handouts, notes and study material posted by teachers across all classes
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNewAssignModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Assignment
          </button>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr] gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <input
                type="text"
                value={assignSearch}
                onChange={(e) => setAssignSearch(e.target.value)}
                placeholder="Title or description..."
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={assignClass}
                onChange={(e) => setAssignClass(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All classes</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
              <select
                value={assignSubject}
                onChange={(e) => setAssignSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All subjects</option>
                {Array.from(new Set(instSubjects.map((s) => s.name))).map((sn) => (
                  <option key={sn} value={sn}>
                    {sn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Teacher / Instructor</label>
              <select
                value={assignTeacher}
                onChange={(e) => setAssignTeacher(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All teachers</option>
                {instTeachers.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setAssignApplied({
                  search: assignSearch,
                  className: assignClass,
                  subject: assignSubject,
                  teacher: assignTeacher,
                  date: assignDate
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              type="button"
              onClick={() => {
                setAssignSearch('')
                setAssignClass('ALL')
                setAssignSubject('ALL')
                setAssignTeacher('ALL')
                setAssignDate('')
                setAssignApplied({ search: '', className: 'ALL', subject: 'ALL', teacher: 'ALL', date: '' })
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4 w-12">#</th>
                <th className="py-2.5 px-3 min-w-[260px]">Title</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Teacher / Instructor</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No assignments posted yet. Click <strong>+ Post Assignment</strong> to create one.
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{a.title}</div>
                      {a.description && (
                        <div className="text-[11px] text-slate-500 mt-0.5">{a.description}</div>
                      )}
                      {a.hasFile && (
                        <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-semibold">
                          <ImageIcon className="w-3 h-3" />
                          Image
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{a.className}</td>
                    <td className="py-3 px-3 text-slate-700">{a.subject}</td>
                    <td className="py-3 px-3 text-slate-700">{a.teacher}</td>
                    <td className="py-3 px-3 text-slate-600">{a.date}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setViewAssignment(a)}
                        className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white inline-flex items-center"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Assignment Modal */}
      {newAssignModal && (
        <Modal
          isOpen
          onClose={() => setNewAssignModal(false)}
          title="Post Class Assignment"
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newAssignForm.title.trim()) {
                toast.warning('Title is required')
                return
              }
              const created = {
                id: `asg_${Date.now()}`,
                ...newAssignForm,
                title: newAssignForm.title.trim(),
                className: newAssignForm.className || availableClassNames[0] || 'Class One',
                subject: newAssignForm.subject || instSubjects[0]?.name || 'English',
                teacher: newAssignForm.teacher || instTeachers[0]?.name || 'Teacher'
              }
              persistAssignments((prev) => [created, ...prev])
              toast.success('Assignment posted')
              setNewAssignModal(false)
              setNewAssignForm({
                title: '',
                description: '',
                className: '',
                subject: '',
                teacher: '',
                date: new Date().toISOString().slice(0, 10),
                hasFile: false
              })
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={newAssignForm.title}
                onChange={(e) => setNewAssignForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newAssignForm.description}
                onChange={(e) => setNewAssignForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={newAssignForm.className}
                  onChange={(e) => setNewAssignForm((p) => ({ ...p, className: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select...</option>
                  {availableClassNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newAssignForm.date}
                  onChange={(e) => setNewAssignForm((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={newAssignForm.hasFile}
                onChange={(e) => setNewAssignForm((p) => ({ ...p, hasFile: e.target.checked }))}
                className="rounded border-slate-300 text-blue-600"
              />
              Includes attachment / image
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewAssignModal(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Post Assignment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Assignment Modal */}
      {viewAssignment && (
        <Modal
          isOpen
          onClose={() => setViewAssignment(null)}
          title={viewAssignment.title}
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-400 block">Class</span>
                <span className="font-semibold text-slate-800">{viewAssignment.className}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Subject</span>
                <span className="font-semibold text-slate-800">{viewAssignment.subject}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Teacher</span>
                <span className="font-semibold text-slate-800">{viewAssignment.teacher}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Date</span>
                <span className="font-semibold text-slate-800">{viewAssignment.date}</span>
              </div>
            </div>
            <p className="text-slate-600">{viewAssignment.description || 'No description provided.'}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setViewAssignment(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AcademicsViews
