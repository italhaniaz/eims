import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  Check,
  Search,
  X,
  Plus,
  Eye,
  Pencil,
  Printer,
  Settings,
  Award,
  CheckCircle2,
  Info,
  Save
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const DEFAULT_GRADES = [
  { id: 'g_1', grade: 'A', minPct: 70, maxPct: 100, remark: 'Excellent', group: 'INSTITUTION DEFAULT', color: 'emerald' },
  { id: 'g_2', grade: 'B', minPct: 60, maxPct: 69, remark: 'Very Good', group: 'INSTITUTION DEFAULT', color: 'blue' },
  { id: 'g_3', grade: 'C', minPct: 50, maxPct: 59, remark: 'Good', group: 'INSTITUTION DEFAULT', color: 'amber' },
  { id: 'g_4', grade: 'D', minPct: 45, maxPct: 49, remark: 'Pass', group: 'INSTITUTION DEFAULT', color: 'orange' },
  { id: 'g_5', grade: 'E', minPct: 40, maxPct: 44, remark: 'Poor', group: 'INSTITUTION DEFAULT', color: 'rose' },
  { id: 'g_6', grade: 'F', minPct: 0, maxPct: 39, remark: 'Fail', group: 'INSTITUTION DEFAULT', color: 'rose' }
]

const DEFAULT_EXAM_SETTINGS = {
  institutionType: 'School',
  curriculumType: 'standard', // 'standard' | 'cbc'
  calendarType: 'Annual',
  enableCreditHours: false,
  enableRanking: true,
  allowTeacherConfig: true,
  showPercentage: true,
  showGpa: false
}

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

export const ExamsResultsViews = ({
  mode = 'summary', // 'summary' | 'report-cards' | 'grades' | 'settings'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { students = [], classes = [], subjects = [] } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
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

  const examsList = useMemo(
    () => loadJson(`eims_exams_registry_${instId}`, []),
    [instId]
  )

  const gradesKey = `eims_grading_scale_${instId}`
  const [grades, setGrades] = useState(() => loadJson(gradesKey, DEFAULT_GRADES))

  const settingsKey = `eims_exam_settings_${instId}`
  const [examSettings, setExamSettings] = useState(() =>
    loadJson(settingsKey, DEFAULT_EXAM_SETTINGS)
  )

  useEffect(() => {
    setGrades(loadJson(gradesKey, DEFAULT_GRADES))
  }, [gradesKey])

  useEffect(() => {
    setExamSettings(loadJson(settingsKey, DEFAULT_EXAM_SETTINGS))
  }, [settingsKey])

  const persistGrades = (updater) => {
    setGrades((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(gradesKey, next)
      return next
    })
  }

  const resolveGrade = (pct) => {
    const match = grades.find((g) => pct >= Number(g.minPct) && pct <= Number(g.maxPct))
    return match || { grade: pct >= 40 ? 'Pass' : 'F', remark: pct >= 40 ? 'Pass' : 'Fail' }
  }

  // ============================================================================
  // SHARED RESULT SUMMARY / REPORT CARDS FILTER STATE
  // ============================================================================
  const [resYear, setResYear] = useState(currentYear)
  const [resType, setResType] = useState('Exam') // 'Exam' | 'Assessment'
  const [resExamId, setResExamId] = useState('')
  const [resClass, setResClass] = useState('')
  const [resApplied, setResApplied] = useState(null) // { year, type, examId, className }

  const matchingExams = useMemo(
    () =>
      examsList.filter((ex) => {
        if (resYear !== 'ALL' && String(ex.year) !== String(resYear)) return false
        const isAssess = ex.isAssessment || String(ex.term || '').toLowerCase() === 'assessment'
        return resType === 'Assessment' ? isAssess : !isAssess
      }),
    [examsList, resYear, resType]
  )

  const computedResults = useMemo(() => {
    if (!resApplied) return null
    const classStudents = instStudents.filter((s) => s.className === resApplied.className)
    const classSubs = Array.from(
      new Set(
        instSubjects
          .filter((sub) => sub.className === resApplied.className)
          .map((sub) => sub.name)
      )
    )
    const activeSubs = classSubs.length > 0 ? classSubs : ['English', 'Mathematics', 'Science', 'Urdu']

    const rows = classStudents.map((stu) => {
      let totalObt = 0
      let totalMax = 0
      const subjectScores = {}

      activeSubs.forEach((subName) => {
        const key = `eims_marks_${instId}_${resApplied.examId}_${resApplied.className}_${subName}`
        const map = loadJson(key, {})
        const rec = map?.[stu.id]
        if (rec && !rec.absent && rec.obtained !== '' && rec.obtained !== undefined) {
          const val = Number(rec.obtained)
          subjectScores[subName] = val
          totalObt += val
          totalMax += 100
        } else if (rec?.absent) {
          subjectScores[subName] = 'AB'
          totalMax += 100
        } else {
          subjectScores[subName] = '—'
        }
      })

      const pct = totalMax > 0 ? Number(((totalObt / totalMax) * 100).toFixed(1)) : 0
      const gradeObj = resolveGrade(pct)
      return {
        student: stu,
        subjectScores,
        totalObt,
        totalMax,
        pct,
        grade: gradeObj.grade,
        remark: gradeObj.remark
      }
    })

    // Sort by totalObt descending for rank
    const sorted = [...rows].sort((a, b) => b.totalObt - a.totalObt)
    sorted.forEach((r, i) => {
      r.position = r.totalMax > 0 ? i + 1 : '—'
    })

    return { subjects: activeSubs, rows: sorted }
  }, [resApplied, instStudents, instSubjects, instId, grades])

  const printReportCards = (targetRows) => {
    if (!targetRows || targetRows.length === 0) return
    const win = window.open('', '_blank', 'width=900,height=750')
    if (!win) {
      toast.warning('Please allow pop-ups to print report cards')
      return
    }
    const instName = currentInstitute?.name || 'Institute Management System'
    const examObj = examsList.find((e) => e.id === resApplied?.examId)
    const htmlCards = targetRows
      .map(
        (r) => `
        <div class="card">
          <div class="hdr">
            <div>
              <div class="inst">${instName}</div>
              <div class="sub">${examObj?.name || 'Examination'} — Official Report Card</div>
            </div>
            <div style="text-align:right;font-size:12px;">
              <div><strong>Student:</strong> ${r.student.name}</div>
              <div><strong>Class:</strong> ${r.student.className} | <strong>Roll:</strong> ${r.student.rollNumber || '—'}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Subject</th><th style="text-align:right">Marks Obtained</th></tr></thead>
            <tbody>
              ${Object.entries(r.subjectScores)
                .map(
                  ([sub, sc]) => `<tr><td>${sub}</td><td style="text-align:right;font-weight:bold;">${sc}</td></tr>`
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total / Summary</strong></td>
                <td style="text-align:right;font-weight:bold;">
                  ${r.totalObt} / ${r.totalMax}
                  ${examSettings.showPercentage ? ` (${r.pct}%)` : ''}
                  • Grade: ${r.grade}
                  ${examSettings.enableRanking ? ` • Position: #${r.position}` : ''}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      `
      )
      .join('')

    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Student Report Cards</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            .card { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 24px; page-break-after: always; }
            .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; }
            .inst { font-size: 18px; font-weight: bold; }
            .sub { font-size: 12px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          ${htmlCards}
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  // ============================================================================
  // 1. GRADES STATE
  // ============================================================================
  const [gradeSearch, setGradeSearch] = useState('')
  const [gradeGroup, setGradeGroup] = useState('ALL')
  const [gradeRemark, setGradeRemark] = useState('ALL')
  const [gradeModal, setGradeModal] = useState(null)
  const [viewGrade, setViewGrade] = useState(null)

  const filteredGrades = useMemo(() => {
    return grades.filter((g) => {
      if (gradeGroup !== 'ALL' && g.group !== gradeGroup) return false
      if (gradeRemark !== 'ALL' && g.remark !== gradeRemark) return false
      if (gradeSearch.trim()) {
        const q = gradeSearch.trim().toLowerCase()
        const rangeStr = `${g.minPct}% - ${g.maxPct}%`
        if (
          !g.grade.toLowerCase().includes(q) &&
          !(g.remark || '').toLowerCase().includes(q) &&
          !rangeStr.includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [grades, gradeGroup, gradeRemark, gradeSearch])

  // ============================================================================
  // RENDER: RESULT SUMMARY
  // ============================================================================
  if (mode === 'summary') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Result Summary"
          onBack={() => onRouteChange?.('inst-exams')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Year</p>
              <p className="text-xl font-bold text-slate-900">{resYear}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Exams</p>
              <p className="text-xl font-bold text-slate-900">{examsList.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Students</p>
              <p className="text-xl font-bold text-slate-900">
                {computedResults ? computedResults.rows.length : '—'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Subjects</p>
              <p className="text-xl font-bold text-slate-900">
                {computedResults ? computedResults.subjects.length : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Result Summary Filter & Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <FileText className="w-4 h-4 text-blue-600" />
              Result Summary
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Year</span>
              <select
                value={resYear}
                onChange={(e) => setResYear(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white font-semibold"
              >
                <option value={currentYear}>{currentYear}</option>
                <option value="2025">2025</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
              <select
                value={resType}
                onChange={(e) => {
                  setResType(e.target.value)
                  setResExamId('')
                }}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="Exam">Exam</option>
                <option value="Assessment">Assessment</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam</label>
              <select
                value={resExamId}
                onChange={(e) => setResExamId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="">Select exam</option>
                {matchingExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={resClass}
                onChange={(e) => setResClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="">Select class</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!resExamId || !resClass) {
                  toast.warning('Select both Exam and Class')
                  return
                }
                setResApplied({ year: resYear, type: resType, examId: resExamId, className: resClass })
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              Apply filter
            </button>
          </div>

          {computedResults && (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-3">Pos</th>
                    <th className="py-2.5 px-3">Roll</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    {computedResults.subjects.map((sub) => (
                      <th key={sub} className="py-2.5 px-3 text-center">
                        {sub}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-right">%</th>
                    <th className="py-2.5 px-3 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {computedResults.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6 + computedResults.subjects.length} className="py-10 text-center text-slate-400">
                        No students found in {resApplied.className}.
                      </td>
                    </tr>
                  ) : (
                    computedResults.rows.map((r) => (
                      <tr key={r.student.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-700">#{r.position}</td>
                        <td className="py-2.5 px-3 text-slate-500">{r.student.rollNumber || '—'}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{r.student.name}</td>
                        {computedResults.subjects.map((sub) => (
                          <td key={sub} className="py-2.5 px-3 text-center text-slate-700">
                            {r.subjectScores[sub]}
                          </td>
                        ))}
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {r.totalObt} / {r.totalMax}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-blue-600">{r.pct}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            {r.grade}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: STUDENT REPORT CARDS
  // ============================================================================
  if (mode === 'report-cards') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Student Report Cards"
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
              <p className="text-xs font-medium text-slate-500">Exams ({resYear})</p>
              <p className="text-xl font-bold text-slate-900">{examsList.length}</p>
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
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Students</p>
              <p className="text-xl font-bold text-slate-900">
                {computedResults ? computedResults.rows.length : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Users className="w-4 h-4 text-blue-600" />
              Student report cards
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Year</span>
              <select
                value={resYear}
                onChange={(e) => setResYear(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 bg-white font-semibold"
              >
                <option value={currentYear}>{currentYear}</option>
                <option value="2025">2025</option>
                <option value="ALL">All</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Type</label>
              <select
                value={resType}
                onChange={(e) => {
                  setResType(e.target.value)
                  setResExamId('')
                }}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="Exam">Exam</option>
                <option value="Assessment">Assessment</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam</label>
              <select
                value={resExamId}
                onChange={(e) => setResExamId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="">Select exam</option>
                {matchingExams.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={resClass}
                onChange={(e) => setResClass(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="">Select class</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!resExamId || !resClass) {
                  toast.warning('Select both Exam and Class')
                  return
                }
                setResApplied({ year: resYear, type: resType, examId: resExamId, className: resClass })
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
            >
              <Check className="w-3.5 h-3.5" />
              Apply filter
            </button>
          </div>

          {computedResults && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => printReportCards(computedResults.rows)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print All Report Cards
                </button>
              </div>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                      <th className="py-2.5 px-4">Roll No</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3 text-right">Percentage</th>
                      <th className="py-2.5 px-3 text-center">Grade</th>
                      <th className="py-2.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {computedResults.rows.map((r) => (
                      <tr key={r.student.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-4 text-slate-500">{r.student.rollNumber || '—'}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{r.student.name}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-800">
                          {r.totalObt} / {r.totalMax}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-blue-600">{r.pct}%</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            {r.grade}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => printReportCards([r])}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold"
                          >
                            <Printer className="w-3 h-3" />
                            Print Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER: GRADES
  // ============================================================================
  if (mode === 'grades') {
    const groupsMap = filteredGrades.reduce((acc, g) => {
      const grp = g.group || 'INSTITUTION DEFAULT'
      if (!acc[grp]) acc[grp] = []
      acc[grp].push(g)
      return acc
    }, {})

    const generalCount = grades.filter((g) => (g.group || 'INSTITUTION DEFAULT') === 'INSTITUTION DEFAULT').length
    const distinctRemarks = Array.from(new Set(grades.map((g) => g.remark).filter(Boolean)))
    const distinctGroups = Array.from(new Set(grades.map((g) => g.group || 'INSTITUTION DEFAULT')))

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Grades"
          onBack={() => onRouteChange?.('inst-exams')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total grades</p>
              <p className="text-xl font-bold text-slate-900">{grades.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">General</p>
              <p className="text-xl font-bold text-slate-900">{generalCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Class-specific</p>
              <p className="text-xl font-bold text-slate-900">{grades.length - generalCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pass remarks</p>
              <p className="text-xl font-bold text-slate-900">{distinctRemarks.length}</p>
            </div>
          </div>
        </div>

        {/* Grading Scale Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Award className="w-4 h-4 text-blue-600" />
              Grading scale
            </div>
            <button
              type="button"
              onClick={() =>
                setGradeModal({
                  grade: '',
                  minPct: 0,
                  maxPct: 100,
                  remark: 'Pass',
                  group: 'INSTITUTION DEFAULT'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add grade
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gradeSearch}
                  onChange={(e) => setGradeSearch(e.target.value)}
                  placeholder="Name, remark, or range..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Group</label>
              <select
                value={gradeGroup}
                onChange={(e) => setGradeGroup(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All groups</option>
                {distinctGroups.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Remark</label>
              <select
                value={gradeRemark}
                onChange={(e) => setGradeRemark(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All remarks</option>
                {distinctRemarks.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => {
                setGradeSearch('')
                setGradeGroup('ALL')
                setGradeRemark('ALL')
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-3 w-24">GRADE</th>
                  <th className="py-2.5 px-3 min-w-[300px]">PERCENTAGE RANGE (% OF SUBJECT TOTAL)</th>
                  <th className="py-2.5 px-3">REMARK</th>
                  <th className="py-2.5 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(groupsMap).map(([grpName, list]) => (
                  <React.Fragment key={grpName}>
                    <tr className="bg-slate-50/90">
                      <td colSpan={5} className="py-2 px-4 text-[11px] font-bold text-slate-700">
                        {grpName}{' '}
                        <span className="ml-1.5 px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-[9px] font-bold">
                          Default
                        </span>
                        <span className="ml-2 text-slate-400 font-normal">{list.length} grades</span>
                      </td>
                    </tr>
                    {list.map((g, idx) => {
                      const leftPct = Math.max(0, Math.min(100, Number(g.minPct || 0)))
                      const widthPct = Math.max(2, Math.min(100 - leftPct, Number(g.maxPct || 0) - leftPct))
                      return (
                        <tr key={g.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                              {g.grade}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="w-full h-1.5 bg-slate-200 rounded-full relative overflow-hidden mb-1">
                              <div
                                className="h-full bg-blue-600 rounded-full absolute top-0"
                                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              />
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium">
                              {g.minPct}% – {g.maxPct}%
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                g.remark === 'Fail'
                                  ? 'bg-rose-100 text-rose-700'
                                  : g.remark === 'Excellent' || g.remark === 'Very Good'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {g.remark || '—'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <button
                              type="button"
                              onClick={() => setViewGrade(g)}
                              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 inline-flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setGradeModal({ ...g })}
                              className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 inline-flex items-center"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 text-[11px] text-slate-400">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              Ranges are percentages of a subject&apos;s total marks, not raw marks. A subject out of 100, 75, 60 or 50 all use the same ranges.
            </span>
          </div>
        </div>

        {gradeModal && (
          <Modal
            isOpen
            onClose={() => setGradeModal(null)}
            title={gradeModal.id ? `Edit Grade — ${gradeModal.grade}` : 'Add Grade'}
            maxWidth="max-w-sm"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!gradeModal.grade.trim()) return
                const payload = {
                  ...gradeModal,
                  id: gradeModal.id || `g_${Date.now()}`,
                  grade: gradeModal.grade.trim().toUpperCase(),
                  minPct: Number(gradeModal.minPct || 0),
                  maxPct: Number(gradeModal.maxPct || 0)
                }
                persistGrades((prev) =>
                  gradeModal.id ? prev.map((x) => (x.id === gradeModal.id ? payload : x)) : [...prev, payload]
                )
                toast.success('Grading band saved')
                setGradeModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Grade Label</label>
                  <input
                    type="text"
                    required
                    value={gradeModal.grade}
                    onChange={(e) => setGradeModal((p) => ({ ...p, grade: e.target.value }))}
                    placeholder="e.g. A+"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Remark</label>
                  <input
                    type="text"
                    value={gradeModal.remark}
                    onChange={(e) => setGradeModal((p) => ({ ...p, remark: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeModal.minPct}
                    onChange={(e) => setGradeModal((p) => ({ ...p, minPct: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={gradeModal.maxPct}
                    onChange={(e) => setGradeModal((p) => ({ ...p, maxPct: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradeModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </Modal>
        )}

        {viewGrade && (
          <Modal isOpen onClose={() => setViewGrade(null)} title={`Grade ${viewGrade.grade}`} maxWidth="max-w-xs">
            <div className="space-y-2 text-xs">
              <div>
                <strong>Range:</strong> {viewGrade.minPct}% – {viewGrade.maxPct}%
              </div>
              <div>
                <strong>Remark:</strong> {viewGrade.remark}
              </div>
              <div>
                <strong>Group:</strong> {viewGrade.group}
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: EXAM SETTINGS
  // ============================================================================
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Exam Settings"
        onBack={() => onRouteChange?.('inst-exams')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Institution Profile */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              INSTITUTION PROFILE
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Institution type
              </label>
              <select
                value={examSettings.institutionType}
                onChange={(e) => setExamSettings((p) => ({ ...p, institutionType: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="University">University</option>
                <option value="Academy">Academy</option>
                <option value="Custom Setup">Custom Setup</option>
              </select>
              <p className="text-[10px] text-slate-400 mt-1">
                Fills in recommended settings below. Custom Setup keeps them as they are.
              </p>
            </div>
          </div>

          {/* Curriculum / Exam Type */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              CURRICULUM / EXAM TYPE
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExamSettings((p) => ({ ...p, curriculumType: 'standard' }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  examSettings.curriculumType === 'standard'
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">Standard (default)</div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Percentage / GPA / CGPA report card — used by most schools, colleges, universities and academies.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExamSettings((p) => ({ ...p, curriculumType: 'cbc' }))}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  examSettings.curriculumType === 'cbc'
                    ? 'border-indigo-500 bg-indigo-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  CBC
                  <span className="px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 text-[9px] font-bold">
                    COMPETENCY-BASED
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                  Level bands (e.g. Emerging to Excellent). Report card shows score, level, points and remark per subject.
                </p>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              This is the institute-wide default. Marks entry and subjects work the same either way.
            </p>
          </div>

          {/* Academic Calendar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              ACADEMIC CALENDAR
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Calendar type
              </label>
              <select
                value={examSettings.calendarType}
                onChange={(e) => setExamSettings((p) => ({ ...p, calendarType: e.target.value }))}
                className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="Annual">Annual</option>
                <option value="Semester">Semester</option>
                <option value="Trimester">Trimester</option>
                <option value="Quarter">Quarter</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Grading System & Credit Hours */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              GRADING SYSTEM &amp; CREDIT HOURS
            </div>
            <p className="text-[11px] text-slate-400">
              Grading bands (A, B, C...) are managed on the{' '}
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-exams-grades')}
                className="text-blue-600 font-semibold hover:underline"
              >
                Grades
              </button>{' '}
              page.
            </p>
            <div className="space-y-3 pt-1">
              <label className="flex items-start justify-between gap-3 cursor-pointer text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Enable credit hours</div>
                  <div className="text-[11px] text-slate-400">
                    Universities only. Adds an optional Credit Hours field on Subjects.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={examSettings.enableCreditHours}
                  onChange={(e) =>
                    setExamSettings((p) => ({ ...p, enableCreditHours: e.target.checked }))
                  }
                  className="mt-1 rounded border-slate-300 text-slate-800"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Enable position / ranking</div>
                  <div className="text-[11px] text-slate-400">
                    Class position on official exam report cards.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={examSettings.enableRanking}
                  onChange={(e) => setExamSettings((p) => ({ ...p, enableRanking: e.target.checked }))}
                  className="mt-1 rounded border-slate-300 text-slate-800"
                />
              </label>
            </div>
          </div>

          {/* Marks Entry Permissions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
              MARKS ENTRY PERMISSIONS
            </div>
            <label className="flex items-start justify-between gap-3 cursor-pointer text-xs">
              <div>
                <div className="font-semibold text-slate-800">
                  Allow teachers to manage subject configurations
                </div>
                <div className="text-[11px] text-slate-400">
                  When enabled, teachers can set total marks and sections for their assigned subjects.
                </div>
              </div>
              <input
                type="checkbox"
                checked={examSettings.allowTeacherConfig}
                onChange={(e) =>
                  setExamSettings((p) => ({ ...p, allowTeacherConfig: e.target.checked }))
                }
                className="mt-1 rounded border-slate-300 text-slate-800"
              />
            </label>
          </div>

          {/* Report Card - What to show */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                REPORT CARD — WHAT TO SHOW
              </div>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-exams-report-cards')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-semibold"
              >
                <Eye className="w-3 h-3" />
                Preview Report Card
              </button>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 cursor-pointer text-xs">
                <span className="font-semibold text-slate-800">Show percentage</span>
                <input
                  type="checkbox"
                  checked={examSettings.showPercentage}
                  onChange={(e) =>
                    setExamSettings((p) => ({ ...p, showPercentage: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-slate-800"
                />
              </label>

              <label className="flex items-start justify-between gap-3 cursor-pointer text-xs">
                <div>
                  <div className="font-semibold text-slate-800">Show GPA</div>
                  <div className="text-[11px] text-slate-400">
                    Only shown when Result system is GPA or CGPA.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={examSettings.showGpa}
                  onChange={(e) => setExamSettings((p) => ({ ...p, showGpa: e.target.checked }))}
                  className="mt-1 rounded border-slate-300 text-slate-800"
                />
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  saveJson(settingsKey, examSettings)
                  toast.success('Exam settings saved')
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                Save Exam Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamsResultsViews
