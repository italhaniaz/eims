import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Plus,
  Search,
  Lock,
  Unlock,
  Menu,
  ChevronDown,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  BookOpen,
  Users,
  LayoutGrid,
  Save
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
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
    // ignore
  }
}

export const ExamsManagementViews = ({
  mode = 'exams', // 'exams' | 'schedule' | 'assessments' | 'marks'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], subjects = [], teachers = [] } = useAppData()
  const { user } = useAuth()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const actorName = user?.name || user?.fullName || 'Admin'
  const currentYear = String(new Date().getFullYear())

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

  // ============================================================================
  // SHARED EXAMS & ASSESSMENTS STORE
  // ============================================================================
  const examsKey = `eims_exams_registry_${instId}`
  const [examsList, setExamsList] = useState(() => loadJson(examsKey, []))

  useEffect(() => {
    setExamsList(loadJson(examsKey, []))
  }, [examsKey])

  const persistExams = (updater) => {
    setExamsList((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(examsKey, next)
      return next
    })
  }

  // ============================================================================
  // 1. EXAMS STATE
  // ============================================================================
  const [examYearFilter, setExamYearFilter] = useState(currentYear)
  const [examTermFilter, setExamTermFilter] = useState('ALL') // 'ALL' | '1st' | '2nd'
  const [examSearch, setExamSearch] = useState('')
  const [examModal, setExamModal] = useState(null)
  const [examMenuId, setExamMenuId] = useState(null)

  const filteredExams = useMemo(() => {
    return examsList.filter((ex) => {
      if (examYearFilter !== 'ALL' && String(ex.year) !== String(examYearFilter)) return false
      if (examTermFilter === '1st' && !String(ex.term || '').toLowerCase().includes('first')) return false
      if (examTermFilter === '2nd' && !String(ex.term || '').toLowerCase().includes('second')) return false
      if (examSearch.trim()) {
        if (!String(ex.name || '').toLowerCase().includes(examSearch.trim().toLowerCase())) return false
      }
      return true
    })
  }, [examsList, examYearFilter, examTermFilter, examSearch])

  // ============================================================================
  // 2. EXAM SCHEDULE (DATE SHEETS) STATE
  // ============================================================================
  const dsKey = `eims_exam_datesheets_${instId}`
  const [dateSheets, setDateSheets] = useState(() => loadJson(dsKey, []))
  const [dsTab, setDsTab] = useState('manage') // 'manage' | 'create'
  const [dsFilter, setDsFilter] = useState('')
  const [dsPageSize, setDsPageSize] = useState(10)
  const [dsMenuId, setDsMenuId] = useState(null)
  const [dsForm, setDsForm] = useState({
    title: '',
    className: '',
    examName: '',
    year: '2026-2027',
    teachers: ''
  })

  useEffect(() => {
    setDateSheets(loadJson(dsKey, []))
  }, [dsKey])

  const persistDateSheets = (updater) => {
    setDateSheets((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(dsKey, next)
      return next
    })
  }

  const filteredDateSheets = useMemo(() => {
    const q = dsFilter.trim().toLowerCase()
    if (!q) return dateSheets
    return dateSheets.filter(
      (d) =>
        (d.title || '').toLowerCase().includes(q) ||
        (d.className || '').toLowerCase().includes(q) ||
        (d.examName || '').toLowerCase().includes(q)
    )
  }, [dateSheets, dsFilter])

  // ============================================================================
  // 3. ASSESSMENTS STATE
  // ============================================================================
  const assessTypesKey = `eims_assessment_types_${instId}`
  const [assessmentTypes, setAssessmentTypes] = useState(() =>
    loadJson(assessTypesKey, ['Weekly Tests', 'Monthly Test'])
  )
  const [assessYear, setAssessYear] = useState(currentYear)
  const [assessModal, setAssessModal] = useState(null)
  const [typesModalOpen, setTypesModalOpen] = useState(false)
  const [addTypeInput, setAddTypeInput] = useState('')

  useEffect(() => {
    setAssessmentTypes(loadJson(assessTypesKey, ['Weekly Tests', 'Monthly Test']))
  }, [assessTypesKey])

  const assessmentsList = useMemo(
    () =>
      examsList.filter(
        (ex) =>
          (ex.isAssessment || String(ex.term || '').toLowerCase() === 'assessment') &&
          (assessYear === 'ALL' || String(ex.year) === String(assessYear))
      ),
    [examsList, assessYear]
  )

  // ============================================================================
  // 4. MARKS ENTRY STATE
  // ============================================================================
  const [marksYear, setMarksYear] = useState(currentYear)
  const [selectedExamId, setSelectedExamId] = useState('')
  const [selectedMarksClass, setSelectedMarksClass] = useState('')
  const [subjectDashOpen, setSubjectDashOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [maxMarks, setMaxMarks] = useState(100)
  const [marksGrid, setMarksGrid] = useState({}) // { [studentId]: { obtained, absent, remarks } }

  const classSubjectsForMarks = useMemo(() => {
    const list = instSubjects
      .filter((s) => !selectedMarksClass || s.className === selectedMarksClass)
      .map((s) => s.name)
    return list.length > 0 ? Array.from(new Set(list)) : ['English', 'Mathematics', 'Science', 'Urdu']
  }, [instSubjects, selectedMarksClass])

  const classStudentsForMarks = useMemo(
    () => instStudents.filter((s) => !selectedMarksClass || s.className === selectedMarksClass),
    [instStudents, selectedMarksClass]
  )

  useEffect(() => {
    if (!subjectDashOpen || !selectedExamId || !selectedMarksClass || !selectedSubject) return
    const key = `eims_marks_${instId}_${selectedExamId}_${selectedMarksClass}_${selectedSubject}`
    setMarksGrid(loadJson(key, {}))
  }, [instId, subjectDashOpen, selectedExamId, selectedMarksClass, selectedSubject])

  const handleSaveMarks = () => {
    if (!selectedExamId || !selectedMarksClass || !selectedSubject) return
    const key = `eims_marks_${instId}_${selectedExamId}_${selectedMarksClass}_${selectedSubject}`
    saveJson(key, marksGrid)
    const enteredCount = Object.values(marksGrid).filter(
      (v) => v && (v.obtained !== '' || v.absent)
    ).length
    persistExams((prev) =>
      prev.map((ex) =>
        ex.id === selectedExamId
          ? { ...ex, marksCount: Math.max(ex.marksCount || 0, enteredCount), recordsCount: classStudentsForMarks.length }
          : ex
      )
    )
    toast.success(`Saved marks for ${selectedSubject} (${selectedMarksClass})`)
  }

  // ============================================================================
  // RENDER: EXAMS
  // ============================================================================
  if (mode === 'exams') {
    const examsOnlyCount = examsList.filter((e) => !e.isAssessment && e.term !== 'Assessment').length
    const assessmentsOnlyCount = examsList.length - examsOnlyCount
    const firstTermCount = examsList.filter((e) => String(e.term || '').toLowerCase().includes('first')).length
    const secondTermCount = examsList.filter((e) => String(e.term || '').toLowerCase().includes('second')).length

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Exams"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">All Exams</p>
              <p className="text-xl font-bold text-slate-900">{examsList.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Year {currentYear}</p>
              <p className="text-xl font-bold text-slate-900">
                {examsList.filter((e) => String(e.year) === currentYear).length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sum of Exams</p>
              <p className="text-xl font-bold text-slate-900">{examsOnlyCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Sum of Assessments</p>
              <p className="text-xl font-bold text-slate-900">{assessmentsOnlyCount}</p>
            </div>
          </div>
        </div>

        {/* Exams Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="w-4 h-4 text-slate-500" />
                Exams
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                Current year
              </span>
              <span className="text-xs text-slate-500 ml-1">Year</span>
              <select
                value={examYearFilter}
                onChange={(e) => setExamYearFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white font-semibold"
              >
                <option value={currentYear}>{currentYear} (Current)</option>
                <option value="2025">2025</option>
                <option value="ALL">All Years</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                setExamModal({ name: '', term: 'First Term', year: currentYear, locked: false })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New exam
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Term:</span>
              <button
                type="button"
                onClick={() => setExamTermFilter('ALL')}
                className={`px-3 py-1 rounded-full font-semibold ${
                  examTermFilter === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All ({examsList.length})
              </button>
              <button
                type="button"
                onClick={() => setExamTermFilter('1st')}
                className={`px-3 py-1 rounded-full font-semibold ${
                  examTermFilter === '1st'
                    ? 'bg-blue-600 text-white'
                    : 'border border-blue-200 text-blue-600 hover:bg-blue-50'
                }`}
              >
                1st ({firstTermCount})
              </button>
              <button
                type="button"
                onClick={() => setExamTermFilter('2nd')}
                className={`px-3 py-1 rounded-full font-semibold ${
                  examTermFilter === '2nd'
                    ? 'bg-emerald-600 text-white'
                    : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                }`}
              >
                2nd ({secondTermCount})
              </button>
            </div>

            <input
              type="text"
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
              placeholder="Search exam name..."
              className="px-3 py-1.5 text-xs rounded-md border border-slate-200 w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-3">EXAM NAME</th>
                  <th className="py-2.5 px-3">TERM</th>
                  <th className="py-2.5 px-3">YEAR</th>
                  <th className="py-2.5 px-3 text-center">MARKS</th>
                  <th className="py-2.5 px-3 text-center">RECORDS</th>
                  <th className="py-2.5 px-3 text-center">CONFIGS</th>
                  <th className="py-2.5 px-3 text-center">SHEETS</th>
                  <th className="py-2.5 px-3">MARKING</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExams.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-10 text-center text-slate-400">
                      No exams created yet. Click <strong>+ New exam</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  filteredExams.map((ex, idx) => (
                    <tr key={ex.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{ex.name}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ex.term === 'Assessment'
                              ? 'bg-purple-100 text-purple-700'
                              : ex.term === 'Second Term'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {ex.term}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {ex.year}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-600">
                        {ex.marksCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-600">
                        {ex.recordsCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-600">
                        {ex.configsCount || 0}
                      </td>
                      <td className="py-3 px-3 text-center font-semibold text-blue-600">
                        {ex.sheetsCount || 0}
                      </td>
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() =>
                            persistExams((prev) =>
                              prev.map((x) => (x.id === ex.id ? { ...x, locked: !x.locked } : x))
                            )
                          }
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            ex.locked ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {ex.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                          {ex.locked ? 'Locked' : 'Open'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right relative space-x-1.5">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('inst-exams-marks')}
                          className="px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-[11px] font-semibold"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('inst-exams-result-summary')}
                          className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
                        >
                          Results
                        </button>
                        <button
                          type="button"
                          onClick={() => setExamMenuId((p) => (p === ex.id ? null : ex.id))}
                          className="inline-flex items-center gap-0.5 px-2 py-1 rounded hover:bg-slate-100 text-slate-600 text-[11px] font-semibold"
                        >
                          <Menu className="w-3.5 h-3.5" />
                          More
                        </button>
                        {examMenuId === ex.id && (
                          <div className="absolute right-4 top-10 z-20 w-36 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setExamMenuId(null)
                                setExamModal({ ...ex })
                              }}
                              className="w-full px-3 py-1.5 hover:bg-slate-50 text-slate-700"
                            >
                              Edit Exam
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setExamMenuId(null)
                                persistExams((prev) => prev.filter((x) => x.id !== ex.id))
                                toast.success('Exam deleted')
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
        </div>

        {examModal && (
          <Modal
            isOpen
            onClose={() => setExamModal(null)}
            title={examModal.id ? 'Edit Exam' : 'Create New Exam'}
            maxWidth="max-w-md"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!examModal.name.trim()) return
                const payload = {
                  ...examModal,
                  id: examModal.id || `ex_${Date.now()}`,
                  name: examModal.name.trim(),
                  isAssessment: examModal.term === 'Assessment',
                  lastModified: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }),
                  modifiedBy: actorName
                }
                persistExams((prev) =>
                  examModal.id ? prev.map((x) => (x.id === examModal.id ? payload : x)) : [payload, ...prev]
                )
                toast.success(`Saved exam "${payload.name}"`)
                setExamModal(null)
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  required
                  value={examModal.name}
                  onChange={(e) => setExamModal((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. First Term Examination"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term</label>
                  <select
                    value={examModal.term}
                    onChange={(e) => setExamModal((p) => ({ ...p, term: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Final Term">Final Term</option>
                    <option value="Assessment">Assessment</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={examModal.year}
                    onChange={(e) => setExamModal((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setExamModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Exam
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: EXAM SCHEDULE
  // ============================================================================
  if (mode === 'schedule') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Exam Schedule"
          onBack={() => onRouteChange?.('inst-exams')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm font-bold text-slate-800">Exam Schedule</div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onRouteChange?.('inst-timetable')}
                  className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50"
                >
                  Timetables
                </button>
                <button type="button" className="px-3 py-1.5 bg-blue-600 text-white border-l border-slate-200">
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
                onClick={() => setDsTab('create')}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New date sheet
              </button>
            </div>
          </div>

          <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-6">
            <button
              type="button"
              onClick={() => setDsTab('manage')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                dsTab === 'manage'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Manage Date Sheets
            </button>
            <button
              type="button"
              onClick={() => setDsTab('create')}
              className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
                dsTab === 'create'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              + Create New Date Sheet
            </button>
          </div>

          {dsTab === 'create' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!dsForm.title.trim()) return
                const created = {
                  id: `ds_${Date.now()}`,
                  title: dsForm.title.trim(),
                  className: dsForm.className || availableClassNames[0] || 'Nursery',
                  examName: dsForm.examName || examsList[0]?.name || 'First term',
                  year: dsForm.year.trim() || '2026-2027',
                  teachers: dsForm.teachers.trim() || '—'
                }
                persistDateSheets((prev) => [created, ...prev])
                toast.success(`Created date sheet "${created.title}"`)
                setDsForm({ title: '', className: '', examName: '', year: '2026-2027', teachers: '' })
                setDsTab('manage')
              }}
              className="p-6 max-w-2xl space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date Sheet Title</label>
                  <input
                    type="text"
                    required
                    value={dsForm.title}
                    onChange={(e) => setDsForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Exam Sheet"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={dsForm.className}
                    onChange={(e) => setDsForm((p) => ({ ...p, className: e.target.value }))}
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
                  <label className="block font-semibold text-slate-700 mb-1">Exam</label>
                  <input
                    type="text"
                    value={dsForm.examName}
                    onChange={(e) => setDsForm((p) => ({ ...p, examName: e.target.value }))}
                    placeholder="e.g. First term"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={dsForm.year}
                    onChange={(e) => setDsForm((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invigilators / Teachers</label>
                <input
                  type="text"
                  value={dsForm.teachers}
                  onChange={(e) => setDsForm((p) => ({ ...p, teachers: e.target.value }))}
                  placeholder="e.g. Asad Ali"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  Save Date Sheet
                </button>
                <button
                  type="button"
                  onClick={() => setDsTab('manage')}
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
                      value={dsFilter}
                      onChange={(e) => setDsFilter(e.target.value)}
                      placeholder="Type to filter..."
                      className="pl-3 pr-7 py-1.5 rounded-md border border-slate-200 w-52"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-600">Show:</span>
                  <select
                    value={dsPageSize}
                    onChange={(e) => setDsPageSize(Number(e.target.value))}
                    className="px-2 py-1.5 rounded-md border border-slate-200 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      downloadSimplePdf('exam-datesheets.pdf', [
                        { text: 'Exam Date Sheets', bold: true },
                        ...filteredDateSheets.map(
                          (d, i) => `${i + 1}. ${d.title} — ${d.className} (${d.examName}, ${d.year})`
                        )
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
                      <th className="py-2.5 px-3">Exam</th>
                      <th className="py-2.5 px-3">Year</th>
                      <th className="py-2.5 px-3">Teachers</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredDateSheets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          No exam date sheets created yet. Click <strong>+ New date sheet</strong> to add one.
                        </td>
                      </tr>
                    ) : (
                      filteredDateSheets.slice(0, dsPageSize).map((ds, idx) => (
                        <tr key={ds.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-800">{ds.title}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-700 font-semibold text-[11px]">
                              {ds.className}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-700">{ds.examName}</td>
                          <td className="py-3 px-3 text-slate-600">{ds.year}</td>
                          <td className="py-3 px-3 text-slate-600">{ds.teachers || '—'}</td>
                          <td className="py-3 px-3 text-right relative">
                            <button
                              type="button"
                              onClick={() => setDsMenuId((p) => (p === ds.id ? null : ds.id))}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 text-slate-600"
                            >
                              <Menu className="w-3.5 h-3.5" />
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            {dsMenuId === ds.id && (
                              <div className="absolute right-4 top-9 z-20 w-32 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-left">
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistDateSheets((prev) => prev.filter((x) => x.id !== ds.id))
                                    toast.success('Date sheet removed')
                                    setDsMenuId(null)
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
                Showing {filteredDateSheets.length === 0 ? 0 : 1} to{' '}
                {Math.min(filteredDateSheets.length, dsPageSize)} of {filteredDateSheets.length} entries
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: ASSESSMENTS
  // ============================================================================
  if (mode === 'assessments') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Assessments"
          onBack={() => onRouteChange?.('inst-exams')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 3 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">This year</p>
              <p className="text-xl font-bold text-slate-900">{assessmentsList.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Assessment types</p>
              <p className="text-xl font-bold text-slate-900">{assessmentTypes.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Viewing year</p>
              <p className="text-xl font-bold text-slate-900">{assessYear === 'ALL' ? 'All' : assessYear}</p>
            </div>
          </div>
        </div>

        {/* Assessments Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="text-sm font-bold text-slate-800">Assessments</div>
              <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                Current year
              </span>
              <span className="text-xs text-slate-500">Year</span>
              <select
                value={assessYear}
                onChange={(e) => setAssessYear(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 bg-white font-semibold"
              >
                <option value={currentYear}>{currentYear} (Current)</option>
                <option value="2025">2025</option>
                <option value="ALL">All</option>
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setTypesModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                View Assessment Type
              </button>
              <button
                type="button"
                onClick={() => setTypesModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Assessment Type
              </button>
              <button
                type="button"
                onClick={() =>
                  setAssessModal({
                    name: '',
                    assessmentType: assessmentTypes[0] || 'Weekly Tests',
                    year: currentYear,
                    classesCount: 0
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                New assessment
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-3">ASSESSMENT NAME</th>
                  <th className="py-2.5 px-3">TYPE</th>
                  <th className="py-2.5 px-3 text-center">CLASSES</th>
                  <th className="py-2.5 px-3">YEAR</th>
                  <th className="py-2.5 px-3">LAST MODIFIED</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessmentsList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No assessments created yet. Click <strong>+ New assessment</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  assessmentsList.map((as, idx) => (
                    <tr key={as.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-slate-800">{as.name}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-semibold">
                          {as.assessmentType || 'Weekly Tests'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 font-bold items-center justify-center text-[11px]">
                          {as.classesCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                          {as.year}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-[11px] text-slate-500">{as.lastModified || '—'}</div>
                        <div className="font-semibold text-slate-700">{as.modifiedBy || actorName}</div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setAssessModal({ ...as })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('inst-exams-marks')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold"
                        >
                          <Pencil className="w-3 h-3" />
                          Enter Marks
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistExams((prev) => prev.filter((x) => x.id !== as.id))
                            toast.success('Assessment deleted')
                          }}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {assessModal && (
          <Modal
            isOpen
            onClose={() => setAssessModal(null)}
            title={assessModal.id ? 'Edit Assessment' : 'New Assessment'}
            maxWidth="max-w-md"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!assessModal.name.trim()) return
                const payload = {
                  ...assessModal,
                  id: assessModal.id || `as_${Date.now()}`,
                  name: assessModal.name.trim(),
                  term: 'Assessment',
                  isAssessment: true,
                  lastModified: new Date().toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  }),
                  modifiedBy: actorName
                }
                persistExams((prev) =>
                  assessModal.id ? prev.map((x) => (x.id === assessModal.id ? payload : x)) : [payload, ...prev]
                )
                toast.success('Assessment saved')
                setAssessModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assessment Name</label>
                <input
                  type="text"
                  required
                  value={assessModal.name}
                  onChange={(e) => setAssessModal((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assessment Type</label>
                  <select
                    value={assessModal.assessmentType}
                    onChange={(e) => setAssessModal((p) => ({ ...p, assessmentType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {assessmentTypes.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Year</label>
                  <input
                    type="text"
                    value={assessModal.year}
                    onChange={(e) => setAssessModal((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssessModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </Modal>
        )}

        {typesModalOpen && (
          <Modal
            isOpen
            onClose={() => setTypesModalOpen(false)}
            title="Assessment Types"
            maxWidth="max-w-sm"
          >
            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={addTypeInput}
                  onChange={(e) => setAddTypeInput(e.target.value)}
                  placeholder="New assessment type..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!addTypeInput.trim()) return
                    const next = Array.from(new Set([...assessmentTypes, addTypeInput.trim()]))
                    setAssessmentTypes(next)
                    saveJson(assessTypesKey, next)
                    setAddTypeInput('')
                    toast.success('Assessment type added')
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg">
                {assessmentTypes.map((t) => (
                  <div key={t} className="px-3 py-2 flex items-center justify-between">
                    <span className="font-medium text-slate-800">{t}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = assessmentTypes.filter((x) => x !== t)
                        setAssessmentTypes(next)
                        saveJson(assessTypesKey, next)
                      }}
                      className="text-rose-600 hover:underline text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: MARKS ENTRY
  // ============================================================================
  const examsForYear = examsList.filter(
    (ex) => marksYear === 'ALL' || String(ex.year) === String(marksYear)
  )

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Marks Entry"
        onBack={() => onRouteChange?.('inst-exams')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Exams ({marksYear})</p>
            <p className="text-xl font-bold text-slate-900">{examsForYear.length}</p>
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
            <Pencil className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Step</p>
            <p className="text-sm font-bold text-slate-900">
              {subjectDashOpen ? `Entering: ${selectedSubject}` : 'Select exam & class'}
            </p>
          </div>
        </div>
      </div>

      {/* Marks Entry Selector Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Pencil className="w-4 h-4 text-slate-500" />
            Marks Entry
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-exams')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Add new Exam
            </button>
            <span className="text-xs text-slate-500">Year</span>
            <select
              value={marksYear}
              onChange={(e) => setMarksYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white font-semibold"
            >
              <option value={currentYear}>{currentYear} (Current)</option>
              <option value="2025">2025</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-4 py-2">
          <p className="text-xs text-slate-400">
            Select an exam and class to open the subject dashboard and enter marks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Exam</label>
              <select
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value)
                  setSubjectDashOpen(false)
                }}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select exam —</option>
                {examsForYear.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name} ({ex.term})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">Class</label>
              <select
                value={selectedMarksClass}
                onChange={(e) => {
                  setSelectedMarksClass(e.target.value)
                  setSubjectDashOpen(false)
                }}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">— Select class —</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!selectedExamId || !selectedMarksClass) {
                toast.warning('Please select both an Exam and a Class')
                return
              }
              setSelectedSubject(classSubjectsForMarks[0] || 'English')
              setSubjectDashOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Open subject dashboard
          </button>
        </div>

        {/* Subject Dashboard & Marks Entry Table */}
        {subjectDashOpen && (
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {classSubjectsForMarks.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSelectedSubject(sub)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      selectedSubject === sub
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 font-semibold">Max Marks:</span>
                <input
                  type="number"
                  min="1"
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value || 100))}
                  className="w-20 px-2.5 py-1 rounded border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleSaveMarks}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Marks
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Obtained Marks (/{maxMarks})</th>
                    <th className="py-2.5 px-3 text-center">Absent</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudentsForMarks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No active students found in {selectedMarksClass}.
                      </td>
                    </tr>
                  ) : (
                    classStudentsForMarks.map((st, idx) => {
                      const row = marksGrid[st.id] || { obtained: '', absent: false, remarks: '' }
                      const pct =
                        !row.absent && row.obtained !== '' && maxMarks > 0
                          ? `${((Number(row.obtained) / maxMarks) * 100).toFixed(1)}%`
                          : row.absent
                            ? 'Absent'
                            : '—'
                      return (
                        <tr key={st.id} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2.5 px-3 text-slate-600">{st.rollNumber || '—'}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{st.name}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="number"
                              min="0"
                              max={maxMarks}
                              disabled={row.absent}
                              value={row.obtained}
                              onChange={(e) =>
                                setMarksGrid((p) => ({
                                  ...p,
                                  [st.id]: { ...row, obtained: e.target.value }
                                }))
                              }
                              className="w-28 px-2.5 py-1 rounded border border-slate-200 disabled:bg-slate-100"
                            />
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(row.absent)}
                              onChange={(e) =>
                                setMarksGrid((p) => ({
                                  ...p,
                                  [st.id]: { ...row, absent: e.target.checked, obtained: '' }
                                }))
                              }
                              className="rounded border-slate-300 text-rose-600"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-700">{pct}</td>
                          <td className="py-2.5 px-3">
                            <input
                              type="text"
                              value={row.remarks || ''}
                              onChange={(e) =>
                                setMarksGrid((p) => ({
                                  ...p,
                                  [st.id]: { ...row, remarks: e.target.value }
                                }))
                              }
                              placeholder="Optional remarks..."
                              className="w-full px-2.5 py-1 rounded border border-slate-200"
                            />
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExamsManagementViews
