// src/modules/institute-admin/exams/ExamsView.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { 
  Award, 
  Plus, 
  Search, 
  Trash2, 
  Printer, 
  FileText, 
  CheckCircle2, 
  User, 
  Download,
  ChevronLeft, 
  ChevronRight,
  School, 
  Copy, 
  Layers, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  IdCard, 
  QrCode, 
  FileCheck, 
  Building, 
  Sparkles,
  Settings,
  MessageSquare,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Sliders,
  Filter
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import PrintableExamAdmitCardModal from '../../../components/common/PrintableExamAdmitCardModal'
import { 
  getExamSettings, 
  saveExamSettings, 
  getExamTerms, 
  saveExamTerms, 
  getDateSheets, 
  saveDateSheets, 
  calculateGrade, 
  calculateClassRanks, 
  computeClassExamStats, 
  formatDateDDMMYYYY, 
  exportResultGazetteCSV, 
  exportDateSheetCSV 
} from './examService'
import ExamTermsModal from './ExamTermsModal'
import TabulationSheetModal from './TabulationSheetModal'
import ResultGazetteModal from './ResultGazetteModal'
import ExamGradingSettingsModal from './ExamGradingSettingsModal'
import ExamResultNotificationModal from './ExamResultNotificationModal'

export const ExamsView = ({ currentInstitute }) => {
  const { 
    exams = [], 
    students = [], 
    classes = [], 
    subjects = [], 
    teachers = [], 
    addItem, 
    updateItem, 
    deleteItem, 
    logAuditEvent 
  } = useAppData()
  const { toast } = useToast()

  // Clean stale legacy demo keys if any
  useEffect(() => {
    try {
      localStorage.removeItem('sms_exam_demo_seed')
    } catch (e) {}
  }, [])

  // Scoped student & exam lists
  const instStudents = useMemo(() => {
    return students.filter(s => !s.instituteId || !currentInstitute?.id || s.instituteId === currentInstitute.id)
  }, [students, currentInstitute])

  const instExams = useMemo(() => {
    return exams.filter(e => !e.instituteId || !currentInstitute?.id || e.instituteId === currentInstitute.id)
  }, [exams, currentInstitute])

  // Shared academic sessions list
  const sessionsList = useMemo(() => {
    try {
      const stored = localStorage.getItem('sms_academic_sessions')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch (e) {}
    return ['2026-2027']
  }, [])

  // 1. Settings & Terms State (Persistent)
  const [settings, setSettings] = useState(() => getExamSettings())
  const [terms, setTerms] = useState(() => getExamTerms(currentInstitute?.id))
  const [dateSheet, setDateSheet] = useState(() => getDateSheets(currentInstitute?.id))

  // Modals state
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isTabulationModalOpen, setIsTabulationModalOpen] = useState(false)
  const [isGazetteModalOpen, setIsGazetteModalOpen] = useState(false)
  const [notificationMarksheet, setNotificationMarksheet] = useState(null)

  // Active Main Tabs: 'results' | 'datesheet'
  const [activeViewTab, setActiveViewTab] = useState('results')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterClass, setFilterClass] = useState('All')
  const [filterTerm, setFilterTerm] = useState('All')
  const [filterGrade, setFilterGrade] = useState('All')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Single Marksheet Creation Modal
  const [isNewMarksheetOpen, setIsNewMarksheetOpen] = useState(false)
  const [newMarksheetForm, setNewMarksheetForm] = useState({
    studentId: '',
    studentName: '',
    rollNumber: '',
    className: '',
    section: '',
    term: '',
    session: sessionsList[0] || '2026-2027',
    date: new Date().toISOString().split('T')[0],
    subjects: [
      { name: 'Mathematics', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
      { name: 'English Language', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
      { name: 'Urdu', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
      { name: 'General Science', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false }
    ],
    remarks: ''
  })
  const [newSubjectInput, setNewSubjectInput] = useState('')

  // Report Card Modal States
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [selectedPtmReportCard, setSelectedPtmReportCard] = useState(null)
  const [selectedRollNumberSlip, setSelectedRollNumberSlip] = useState(null)
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [selectedCandidateForAdmit, setSelectedCandidateForAdmit] = useState(null)

  // Batch Printing Modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [batchClass, setBatchClass] = useState('All')
  const [batchTerm, setBatchTerm] = useState('All')

  // Date Sheet Creation Modal
  const [isAddDateSheetOpen, setIsAddDateSheetOpen] = useState(false)
  const [dateSheetClass, setDateSheetClass] = useState('All')
  const [dateSheetTerm, setDateSheetTerm] = useState('')
  const [newDateSheetItem, setNewDateSheetItem] = useState({
    subject: '',
    date: new Date().toISOString().split('T')[0],
    day: 'Monday',
    time: '09:00 AM - 12:00 PM',
    hall: 'Main Examination Hall A',
    invigilator: ''
  })

  // Synchronize Terms to localStorage
  const handleSaveTerms = (updatedTerms) => {
    setTerms(updatedTerms)
    saveExamTerms(updatedTerms)
    toast.success('Examination terms updated!')
  }

  // Synchronize DateSheet to localStorage
  const handleSaveDateSheets = (updatedSheets) => {
    setDateSheet(updatedSheets)
    saveDateSheets(updatedSheets)
  }

  // Synchronize Settings to localStorage
  const handleSaveSettings = (updatedSettings) => {
    setSettings(updatedSettings)
    saveExamSettings(updatedSettings)
    toast.success('Grading scale & moderation settings updated!')
  }

  // Available classes
  const availableClasses = useMemo(() => {
    const set = new Set()
    classes.forEach(c => { if (c.name) set.add(c.name) })
    instStudents.forEach(s => { if (s.className) set.add(s.className) })
    instExams.forEach(e => { if (e.className) set.add(e.className) })
    return Array.from(set).sort()
  }, [classes, instStudents, instExams])

  // Available terms
  const availableTerms = useMemo(() => {
    const set = new Set()
    terms.forEach(t => set.add(t.name))
    instExams.forEach(e => { if (e.term) set.add(e.term) })
    return Array.from(set)
  }, [terms, instExams])

  // Filtered Marksheets list
  const filteredExams = useMemo(() => {
    return instExams.filter(e => {
      const s = (searchTerm || '').toLowerCase()
      const matchesSearch = 
        (e.studentName || '').toLowerCase().includes(s) ||
        (e.rollNumber || '').toLowerCase().includes(s) ||
        (e.className || '').toLowerCase().includes(s) ||
        (e.term || '').toLowerCase().includes(s)

      const matchesClass = filterClass === 'All' || e.className === filterClass
      const matchesTerm = filterTerm === 'All' || e.term === filterTerm
      const matchesGrade = filterGrade === 'All' || e.overallGrade === filterGrade

      return matchesSearch && matchesClass && matchesTerm && matchesGrade
    })
  }, [instExams, searchTerm, filterClass, filterTerm, filterGrade])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize))
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  // Class Ranks Map
  const { ranksMap } = useMemo(() => {
    return calculateClassRanks(instExams)
  }, [instExams])

  // Dynamic Rank helper
  const getClassRank = (exam) => {
    const classExams = instExams.filter(e => e.className === exam.className && e.term === exam.term)
    if (classExams.length === 0) return { rank: 1, total: 1 }
    const sorted = [...classExams].sort((a, b) => Number(b.totalObtained || 0) - Number(a.totalObtained || 0))
    const idx = sorted.findIndex(e => e.id === exam.id || e.rollNumber === exam.rollNumber)
    return {
      rank: idx >= 0 ? idx + 1 : 1,
      total: sorted.length
    }
  }

  // Handle student selection in New Marksheet form
  const handleStudentSelect = (studentId) => {
    const std = instStudents.find(s => s.id === studentId || s.name === studentId)
    if (!std) return
    setNewMarksheetForm(prev => ({
      ...prev,
      studentId: std.id,
      studentName: std.name,
      rollNumber: std.rollNumber || '',
      className: std.className || '',
      section: std.section || ''
    }))
  }

  // Handle single subject marks change
  const handleSubjectMarkChange = (index, field, value) => {
    const updated = [...newMarksheetForm.subjects]
    const sub = { ...updated[index], [field]: value }

    const t = Number(sub.theoryMarks) || 0
    const p = Number(sub.practicalMarks) || 0
    sub.obtained = sub.isAbsent ? 0 : (t + p)
    const pct = sub.maxMarks > 0 ? (sub.obtained / sub.maxMarks) * 100 : 0
    sub.grade = calculateGrade(pct, settings).grade

    updated[index] = sub
    setNewMarksheetForm(prev => ({ ...prev, subjects: updated }))
  }

  // Add custom subject row to form
  const handleAddSubjectToForm = () => {
    if (!newSubjectInput.trim()) return
    const newSub = {
      name: newSubjectInput.trim(),
      maxMarks: 100,
      theoryMarks: '',
      practicalMarks: '',
      obtained: '',
      grade: 'F',
      isAbsent: false,
      isExempt: false
    }
    setNewMarksheetForm(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSub]
    }))
    setNewSubjectInput('')
  }

  // Submit Single Marksheet
  const handleSubmitNewMarksheet = async (e) => {
    e.preventDefault()
    if (!newMarksheetForm.studentName || !newMarksheetForm.className || !newMarksheetForm.term) {
      toast.error('Please select a student, class, and examination term.')
      return
    }

    const totalMax = newMarksheetForm.subjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0)
    const totalObtained = newMarksheetForm.subjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0)
    const pctNumber = totalMax > 0 ? ((totalObtained / totalMax) * 100) : 0
    const percentage = pctNumber.toFixed(1) + '%'
    const gradeObj = calculateGrade(pctNumber, settings)
    const isPassed = pctNumber >= (settings.passingPercentage || 33)

    const newRecord = {
      studentId: newMarksheetForm.studentId,
      studentName: newMarksheetForm.studentName,
      rollNumber: newMarksheetForm.rollNumber,
      className: newMarksheetForm.className,
      section: newMarksheetForm.section,
      term: newMarksheetForm.term,
      session: newMarksheetForm.session,
      date: newMarksheetForm.date || new Date().toISOString().split('T')[0],
      subjects: newMarksheetForm.subjects,
      totalObtained,
      totalMax,
      percentage,
      numericPercentage: pctNumber,
      overallGrade: gradeObj.grade,
      gpa: gradeObj.gpa,
      status: isPassed ? 'PASSED' : 'FAILED',
      remarks: newMarksheetForm.remarks || 'Conduct and academic participation recorded.',
      graceMarksAwarded: 0,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    // Check if marksheet already exists for this student & term
    const existingIndex = instExams.findIndex(m => 
      (m.studentId === newRecord.studentId || m.rollNumber === newRecord.rollNumber) && 
      m.term === newRecord.term
    )

    if (existingIndex >= 0 && updateItem) {
      await updateItem('exams', instExams[existingIndex].id, newRecord)
      toast.success(`Exam marksheet for ${newRecord.studentName} updated successfully!`)
    } else {
      await addItem('exams', newRecord)
      toast.success(`Exam marksheet for ${newRecord.studentName} recorded successfully!`)
    }

    setIsNewMarksheetOpen(false)
  }

  // Handle Bulk Tabulation Save
  const handleBulkSaveTabulation = async (recordsToUpdate = []) => {
    for (const item of recordsToUpdate) {
      const { student, term, subjectEntry } = item

      // Find existing marksheet
      const existing = instExams.find(m => 
        (m.studentId === student.id || m.rollNumber === student.rollNumber) && 
        m.term === term
      )

      if (existing) {
        // Merge subject into existing subjects array
        const currentSubjects = Array.isArray(existing.subjects) ? [...existing.subjects] : []
        const subIdx = currentSubjects.findIndex(s => s.name?.toLowerCase() === subjectEntry.name.toLowerCase())
        if (subIdx >= 0) {
          currentSubjects[subIdx] = subjectEntry
        } else {
          currentSubjects.push(subjectEntry)
        }

        const totalMax = currentSubjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0)
        const totalObtained = currentSubjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0)
        const pctNumber = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
        const percentage = pctNumber.toFixed(1) + '%'
        const gradeObj = calculateGrade(pctNumber, settings)

        const updatedExam = {
          ...existing,
          subjects: currentSubjects,
          totalObtained,
          totalMax,
          percentage,
          numericPercentage: pctNumber,
          overallGrade: gradeObj.grade,
          gpa: gradeObj.gpa,
          status: pctNumber >= (settings.passingPercentage || 33) ? 'PASSED' : 'FAILED'
        }

        if (updateItem) await updateItem('exams', existing.id, updatedExam)
      } else {
        // Create new marksheet
        const totalMax = Number(subjectEntry.maxMarks) || 100
        const totalObtained = Number(subjectEntry.obtained) || 0
        const pctNumber = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
        const percentage = pctNumber.toFixed(1) + '%'
        const gradeObj = calculateGrade(pctNumber, settings)

        const newExam = {
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber || '',
          className: student.className || '',
          section: student.section || '',
          term: term,
          session: sessionsList[0] || '2026-2027',
          date: new Date().toISOString().split('T')[0],
          subjects: [subjectEntry],
          totalObtained,
          totalMax,
          percentage,
          numericPercentage: pctNumber,
          overallGrade: gradeObj.grade,
          gpa: gradeObj.gpa,
          status: pctNumber >= (settings.passingPercentage || 33) ? 'PASSED' : 'FAILED',
          remarks: 'Recorded via Class Tabulation Sheet.',
          graceMarksAwarded: 0,
          instituteId: currentInstitute?.id || 'inst-1'
        }

        if (addItem) await addItem('exams', newExam)
      }
    }
    toast.success('Class Tabulation recorded into academic marksheets!')
  }

  // Handle Awarding Grace Marks from Gazette
  const handleAwardGraceMarks = async ({ marksheetId, subjectName, graceMarks, reason }) => {
    const match = instExams.find(m => m.id === marksheetId)
    if (!match) return

    const updatedSubjects = (match.subjects || []).map(s => {
      if (s.name?.toLowerCase() === subjectName.toLowerCase()) {
        const newObt = Number(s.obtained || 0) + Number(graceMarks)
        const pct = s.maxMarks > 0 ? (newObt / s.maxMarks) * 100 : 0
        return {
          ...s,
          obtained: newObt,
          grade: calculateGrade(pct, settings).grade,
          remarks: `${s.remarks || ''} (+${graceMarks} Grace Marks: ${reason})`
        }
      }
      return s
    })

    const totalMax = updatedSubjects.reduce((sum, s) => sum + (Number(s.maxMarks) || 0), 0)
    const totalObtained = updatedSubjects.reduce((sum, s) => sum + (Number(s.obtained) || 0), 0)
    const pctNumber = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
    const percentage = pctNumber.toFixed(1) + '%'
    const gradeObj = calculateGrade(pctNumber, settings)

    const updatedRecord = {
      ...match,
      subjects: updatedSubjects,
      totalObtained,
      totalMax,
      percentage,
      numericPercentage: pctNumber,
      overallGrade: gradeObj.grade,
      gpa: gradeObj.gpa,
      status: pctNumber >= (settings.passingPercentage || 33) ? 'PASSED' : 'FAILED',
      graceMarksAwarded: (Number(match.graceMarksAwarded) || 0) + Number(graceMarks)
    }

    if (updateItem) await updateItem('exams', match.id, updatedRecord)
    toast.success(`Awarded ${graceMarks} grace marks to ${match.studentName} in ${subjectName}!`)
  }

  // Handle Add Date Sheet Slot
  const handleAddDateSheetEntry = (e) => {
    e.preventDefault()
    if (!newDateSheetItem.subject.trim()) {
      toast.error('Please enter subject title.')
      return
    }

    const entry = {
      id: `ds-${Date.now()}`,
      className: dateSheetClass === 'All' ? '' : dateSheetClass,
      term: dateSheetTerm || (terms[0]?.name || 'Annual Examination'),
      instituteId: currentInstitute?.id || 'inst-1',
      ...newDateSheetItem
    }

    const updated = [...dateSheet, entry]
    handleSaveDateSheets(updated)
    setIsAddDateSheetOpen(false)
    toast.success(`Exam paper slot for "${newDateSheetItem.subject}" scheduled!`)
    setNewDateSheetItem({
      subject: '',
      date: new Date().toISOString().split('T')[0],
      day: 'Monday',
      time: '09:00 AM - 12:00 PM',
      hall: 'Main Examination Hall A',
      invigilator: ''
    })
  }

  // Handle Roll Number Slip Generation
  const handleGenerateRollNumberSlip = (student) => {
    setSelectedRollNumberSlip({
      studentName: student.name || student.studentName,
      rollNumber: student.rollNumber || 'STD-001',
      className: student.className || '',
      fatherName: student.fatherName || student.guardianName || 'Guardian On Record',
      term: dateSheetTerm || (terms[0]?.name || 'Annual Board Examination'),
      center: `${currentInstitute?.name || 'Central Campus'}, Examination Hall Block A`,
      examSchedule: dateSheet
    })
    if (logAuditEvent) {
      logAuditEvent(`Generated Roll Number Slip for ${student.name || student.studentName}`, 'Exam Controller', 'Success')
    }
  }

  // Delete marksheet record
  const handleDelete = async (id, studentName) => {
    if (window.confirm(`Delete exam marksheet for ${studentName}?`)) {
      await deleteItem('exams', id)
      toast.info('Marksheet record deleted.')
    }
  }

  return (
    <div className="p-3 sm:p-5 md:p-7 space-y-5 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Examinations & Marksheets
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Conduct term assessments, manage date sheets, generate admit slips, and publish verified DMCs
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Navigation Hub */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {/* Main View Mode Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200/60">
            <button
              type="button"
              onClick={() => setActiveViewTab('results')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeViewTab === 'results' 
                  ? 'bg-white text-indigo-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Results & Transcripts ({instExams.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveViewTab('datesheet')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeViewTab === 'datesheet' 
                  ? 'bg-white text-indigo-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Date Sheet & Admit Slips ({dateSheet.length})
            </button>
          </div>

          {/* Configuration Buttons */}
          <button
            type="button"
            onClick={() => setIsTermsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Manage Examination Terms & Cycles"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Exam Terms</span> ({terms.length})
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-all cursor-pointer"
            title="Grading Scale & Moderation Settings"
          >
            <Settings className="w-4 h-4 text-slate-500" />
          </button>

          {/* Module Primary Actions */}
          {activeViewTab === 'results' ? (
            <>
              <button
                type="button"
                onClick={() => setIsGazetteModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Open Official Result Gazette and Merit Standings"
              >
                <Award className="w-3.5 h-3.5 text-purple-600" />
                <span>Result Gazette</span>
              </button>

              <button
                type="button"
                onClick={() => setIsTabulationModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                title="Rapid Class Tabulation Sheet (Bulk Marks Entry)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bulk Tabulation</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                title="Batch print class report cards"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden md:inline">Batch Print</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setNewMarksheetForm({
                    studentId: instStudents[0]?.id || '',
                    studentName: instStudents[0]?.name || '',
                    rollNumber: instStudents[0]?.rollNumber || '',
                    className: instStudents[0]?.className || '',
                    section: instStudents[0]?.section || '',
                    term: terms[0]?.name || 'Annual Examination',
                    session: sessionsList[0] || '2026-2027',
                    date: new Date().toISOString().split('T')[0],
                    subjects: [
                      { name: 'Mathematics', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
                      { name: 'English Language', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
                      { name: 'Urdu', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false },
                      { name: 'General Science', maxMarks: 100, theoryMarks: '', practicalMarks: '', obtained: '', grade: 'F', isAbsent: false, isExempt: false }
                    ],
                    remarks: ''
                  })
                  setIsNewMarksheetOpen(true)
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record Marksheet</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddDateSheetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Paper Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW TAB 1: RESULTS & TRANSCRIPTS */}
      {activeViewTab === 'results' ? (
        <>
          {/* Search & Filters Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search transcript by student name, roll number, class, or term..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Quick Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Class Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Class:</span>
                <select
                  value={filterClass}
                  onChange={(e) => {
                    setFilterClass(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="All">All Classes</option>
                  {availableClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Term Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Term:</span>
                <select
                  value={filterTerm}
                  onChange={(e) => {
                    setFilterTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="All">All Terms</option>
                  {availableTerms.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Grade Filter */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-slate-500">Grade:</span>
                <select
                  value={filterGrade}
                  onChange={(e) => {
                    setFilterGrade(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
                >
                  <option value="All">All Grades</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="F">F (Fail)</option>
                </select>
              </div>

              <span className="text-xs text-slate-400 font-mono hidden xl:inline ml-2">
                Showing {filteredExams.length} transcripts
              </span>
            </div>
          </div>

          {/* Marksheets Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[750px]">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="px-5 py-3.5">Student & Roll No</th>
                    <th className="px-5 py-3.5">Class & Section</th>
                    <th className="px-5 py-3.5">Examination Term</th>
                    <th className="px-5 py-3.5 text-center">Marks Obtained</th>
                    <th className="px-5 py-3.5 text-center">Grade</th>
                    <th className="px-5 py-3.5 text-center">Class Rank</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {paginatedExams.length > 0 ? (
                    paginatedExams.map(e => {
                      const rankObj = getClassRank(e)
                      return (
                        <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-xs sm:text-sm">{e.studentName}</p>
                                <p className="text-[11px] text-slate-400 font-mono">{e.rollNumber}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600 font-medium text-xs">
                            {e.className} {e.section ? <span className="text-slate-400">({e.section})</span> : ''}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {e.term}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-800 text-xs sm:text-sm">
                            {e.totalObtained} / {e.totalMax} <span className="text-[11px] text-slate-400 font-normal">({e.percentage})</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                              e.overallGrade?.startsWith('A') 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : e.overallGrade === 'F'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {e.overallGrade}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center font-mono font-bold">
                            {rankObj.rank === 1 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[11px] border border-amber-300 font-black">
                                1st
                              </span>
                            ) : rankObj.rank === 2 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[11px] font-black">
                                2nd
                              </span>
                            ) : rankObj.rank === 3 ? (
                              <span className="inline-block px-2 py-0.5 rounded bg-orange-100 text-orange-900 text-[11px] font-black">
                                3rd
                              </span>
                            ) : (
                              <span className="text-xs text-slate-500">#{rankObj.rank}</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* PTM Progress Card */}
                              <button
                                type="button"
                                onClick={() => setSelectedPtmReportCard(e)}
                                className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Parent-Teacher Meeting Comprehensive Progress Report"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-600" />
                                <span>PTM</span>
                              </button>

                              {/* Single DMC Print */}
                              <button
                                type="button"
                                onClick={() => setSelectedReportCard(e)}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                title="Print Official Detailed Mark Certificate (DMC)"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              {/* Parent WhatsApp / SMS Dispatch */}
                              <button
                                type="button"
                                onClick={() => setNotificationMarksheet(e)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                                title="Send Result to Parents via WhatsApp or SMS"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>

                              {/* Candidate Roll Number Slip */}
                              <button
                                type="button"
                                onClick={() => handleGenerateRollNumberSlip({ name: e.studentName, rollNumber: e.rollNumber, className: e.className })}
                                className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                                title="Generate Candidate Roll Number Slip"
                              >
                                <IdCard className="w-4 h-4" />
                              </button>

                              {/* Delete Marksheet */}
                              <button
                                type="button"
                                onClick={() => handleDelete(e.id, e.studentName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete marksheet record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No Marksheet Records Found</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Record student grades or use Bulk Tabulation to generate transcripts.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredExams.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
                <div>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filteredExams.length)}</strong> of <strong>{filteredExams.length}</strong> marksheets
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  
                  <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>

                  <button
                    type="button"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* VIEW TAB 2: DATE SHEET & ADMIT CARDS */
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Official Examination Schedule
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {dateSheetTerm || (terms[0]?.name || 'Annual Examination Schedule')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Centralized timetable approved by the Board of Examiners & Academic Council
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => exportDateSheetCSV(dateSheetTerm, dateSheetClass, dateSheet)}
                disabled={dateSheet.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={dateSheet.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Date Sheet</span>
              </button>
            </div>
          </div>

          {/* Date Sheet Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 text-[11px] uppercase font-bold border-b">
                  <tr>
                    <th className="px-5 py-3.5">Subject / Course Paper</th>
                    <th className="px-5 py-3.5">Examination Date</th>
                    <th className="px-5 py-3.5">Day</th>
                    <th className="px-5 py-3.5">Time Slot</th>
                    <th className="px-5 py-3.5">Examination Hall</th>
                    <th className="px-5 py-3.5">Chief Invigilator</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {dateSheet.length > 0 ? (
                    dateSheet.map((ds, idx) => (
                      <tr key={ds.id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-slate-800 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                          <span>{ds.subject}</span>
                        </td>
                        <td className="px-5 py-3.5 font-mono font-semibold text-slate-700">{formatDateDDMMYYYY(ds.date)}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">{ds.day}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{ds.time}</td>
                        <td className="px-5 py-3.5 text-slate-600 font-medium">
                          <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {ds.hall}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs">{ds.invigilator || 'Staff On Duty'}</td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = dateSheet.filter(item => item.id !== ds.id)
                              handleSaveDateSheets(updated)
                              toast.info(`Paper slot for ${ds.subject} removed.`)
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Remove exam slot"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-slate-400">
                        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No Exam Paper Slots Scheduled</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Click "Add Exam Paper Slot" above to configure your date sheet.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Roll Number Slip Action Card */}
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <IdCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Individual Candidate Roll Number Slip & Admit Card</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate verified entry card with student photo, hall code, barcode, and exam rules
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  const std = instStudents.find(s => s.id === e.target.value || s.name === e.target.value)
                  if (std) handleGenerateRollNumberSlip(std)
                }}
                defaultValue=""
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              >
                <option value="" disabled>Select Student for Roll No Slip...</option>
                {instStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNumber || 'STD'})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: RECORD NEW MARKSHEET */}
      <Modal
        isOpen={isNewMarksheetOpen}
        onClose={() => setIsNewMarksheetOpen(false)}
        title="Record Examination Marksheet"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitNewMarksheet} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Select Student *</label>
              <select
                required
                value={newMarksheetForm.studentId}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Choose Student --</option>
                {instStudents.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNumber || 'STD'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                readOnly
                value={newMarksheetForm.rollNumber}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Class / Grade *</label>
              <select
                required
                value={newMarksheetForm.className}
                onChange={(e) => setNewMarksheetForm({ ...newMarksheetForm, className: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Select Class --</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Examination Term *</label>
              <select
                required
                value={newMarksheetForm.term}
                onChange={(e) => setNewMarksheetForm({ ...newMarksheetForm, term: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="">-- Select Term --</option>
                {terms.map(t => (
                  <option key={t.id} value={t.name}>{t.name} ({t.session})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Academic Session</label>
              <select
                value={newMarksheetForm.session}
                onChange={(e) => setNewMarksheetForm({ ...newMarksheetForm, session: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono"
              >
                {sessionsList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic Subject Marks Table */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase text-slate-700 tracking-wider">
                Subject Marks Breakdown
              </span>
              <span className="text-[10px] text-slate-400">Total subjects: {newMarksheetForm.subjects.length}</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2 w-20 text-center">Max</th>
                    <th className="p-2 w-24 text-center">Theory</th>
                    <th className="p-2 w-24 text-center">Practical</th>
                    <th className="p-2 w-20 text-center">Total</th>
                    <th className="p-2 w-16 text-center">Grade</th>
                    <th className="p-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {newMarksheetForm.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="p-2 font-semibold text-slate-800">{sub.name}</td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={sub.maxMarks}
                          onChange={(e) => handleSubjectMarkChange(idx, 'maxMarks', Number(e.target.value))}
                          className="w-16 px-1.5 py-1 text-center font-mono text-xs border border-slate-300 rounded"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={sub.maxMarks}
                          value={sub.theoryMarks}
                          onChange={(e) => handleSubjectMarkChange(idx, 'theoryMarks', e.target.value)}
                          placeholder="0"
                          className="w-20 px-1.5 py-1 text-center font-mono font-bold text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-1.5 text-center">
                        <input
                          type="number"
                          min="0"
                          max={sub.maxMarks}
                          value={sub.practicalMarks}
                          onChange={(e) => handleSubjectMarkChange(idx, 'practicalMarks', e.target.value)}
                          placeholder="0"
                          className="w-20 px-1.5 py-1 text-center font-mono font-bold text-xs border border-slate-300 rounded focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-2 text-center font-mono font-bold text-indigo-700">
                        {sub.obtained || 0}
                      </td>
                      <td className="p-2 text-center font-bold font-mono text-emerald-700">
                        {sub.grade || 'F'}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = newMarksheetForm.subjects.filter((_, i) => i !== idx)
                            setNewMarksheetForm(prev => ({ ...prev, subjects: updated }))
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Add Custom Subject input */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Add custom subject (e.g. Islamiyat, Biology, Economics)..."
                value={newSubjectInput}
                onChange={(e) => setNewSubjectInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSubjectToForm(); } }}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
              <button
                type="button"
                onClick={handleAddSubjectToForm}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
              >
                + Add Subject
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">
              Teacher Observations & Conduct Remarks
            </label>
            <input
              type="text"
              value={newMarksheetForm.remarks}
              onChange={(e) => setNewMarksheetForm({ ...newMarksheetForm, remarks: e.target.value })}
              placeholder="e.g. Excellent analytical abilities and punctual participation."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsNewMarksheetOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Save Marksheet
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: ADD DATE SHEET PAPER SLOT */}
      <Modal
        isOpen={isAddDateSheetOpen}
        onClose={() => setIsAddDateSheetOpen(false)}
        title="Add Exam Schedule Paper Slot"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddDateSheetEntry} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Subject Title *</label>
            <input
              type="text"
              required
              value={newDateSheetItem.subject}
              onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, subject: e.target.value })}
              placeholder="e.g. Mathematics / Physics"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={newDateSheetItem.date}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Day</label>
              <select
                value={newDateSheetItem.day}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, day: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Time Slot</label>
              <input
                type="text"
                value={newDateSheetItem.time}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Hall / Room</label>
              <input
                type="text"
                value={newDateSheetItem.hall}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, hall: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Chief Invigilator</label>
            <input
              type="text"
              value={newDateSheetItem.invigilator}
              onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, invigilator: e.target.value })}
              placeholder="e.g. Faculty Member On Duty"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddDateSheetOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
            >
              Add Paper Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: EXAMINATION TERMS MANAGER */}
      <ExamTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        terms={terms}
        onSaveTerms={handleSaveTerms}
        sessionsList={sessionsList}
      />

      {/* MODAL 4: TABULATION SHEET / BULK MARKS ENTRY */}
      <TabulationSheetModal
        isOpen={isTabulationModalOpen}
        onClose={() => setIsTabulationModalOpen(false)}
        students={instStudents}
        classes={classes}
        terms={terms}
        subjects={subjects}
        existingMarksheets={instExams}
        onBulkSaveMarks={handleBulkSaveTabulation}
        gradingSettings={settings}
      />

      {/* MODAL 5: OFFICIAL RESULT GAZETTE & MERIT STANDINGS */}
      <ResultGazetteModal
        isOpen={isGazetteModalOpen}
        onClose={() => setIsGazetteModalOpen(false)}
        marksheets={instExams}
        terms={terms}
        currentInstitute={currentInstitute}
        onAwardGraceMarks={handleAwardGraceMarks}
      />

      {/* MODAL 6: GRADING SCALE & SETTINGS */}
      <ExamGradingSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
      />

      {/* MODAL 7: PARENT WHATSAPP & SMS RESULT NOTIFICATION */}
      <ExamResultNotificationModal
        isOpen={Boolean(notificationMarksheet)}
        onClose={() => setNotificationMarksheet(null)}
        marksheet={notificationMarksheet}
        currentInstitute={currentInstitute}
        rank={notificationMarksheet ? ranksMap[notificationMarksheet.id] : null}
      />

      {/* MODAL 8: SINGLE OFFICIAL DETAILED MARKS CERTIFICATE (DMC) */}
      {selectedReportCard && (
        <Modal
          isOpen={Boolean(selectedReportCard)}
          onClose={() => setSelectedReportCard(null)}
          title="Official Detailed Marks Certificate (DMC)"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-dmc-single, #printable-dmc-single * { visibility: visible !important; }
                #printable-dmc-single {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 8mm !important;
                  background: white !important;
                }
                @page { size: A4 portrait; margin: 8mm; }
              }
            `}</style>
            <div id="printable-dmc-single" className="p-6 bg-white border-2 border-slate-900 rounded-xl space-y-4 font-sans text-slate-800">
              <div className="text-center border-b-2 border-slate-900 pb-3">
                <School className="w-8 h-8 text-indigo-700 mx-auto mb-1" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h3>
                <p className="text-xs text-slate-600 font-semibold">{selectedReportCard.term} • Official Academic Transcript</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Session: {selectedReportCard.session || '2026-2027'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div><span className="text-slate-400">Candidate:</span> <strong className="text-slate-900">{selectedReportCard.studentName}</strong></div>
                <div><span className="text-slate-400">Roll No:</span> <strong className="text-indigo-800 font-mono font-bold">{selectedReportCard.rollNumber}</strong></div>
                <div><span className="text-slate-400">Grade / Class:</span> <strong className="text-slate-800">{selectedReportCard.className}</strong></div>
                <div><span className="text-slate-400">Date of Declaration:</span> <strong className="text-slate-800 font-mono">{formatDateDDMMYYYY(selectedReportCard.date)}</strong></div>
                {settings.showRankOnDMC && (
                  <div className="col-span-2 pt-1 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-slate-400">Class Standing:</span>
                    <span className="font-bold text-amber-800 font-mono">Position #{getClassRank(selectedReportCard).rank} of {getClassRank(selectedReportCard).total}</span>
                  </div>
                )}
              </div>

              <table className="w-full text-xs text-left border border-slate-300">
                <thead className="bg-slate-100 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2 text-center">Max Marks</th>
                    <th className="p-2 text-center">Marks Obtained</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(selectedReportCard.subjects || []).map((s, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2 text-center font-mono">{s.maxMarks}</td>
                      <td className="p-2 text-center font-bold font-mono">
                        {s.isAbsent ? 'ABS' : s.isExempt ? 'EXM' : s.obtained}
                      </td>
                      <td className="p-2 text-center font-bold text-emerald-700 font-mono">{s.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-900">
                    <td className="p-2 font-black uppercase">Grand Total</td>
                    <td className="p-2 text-center font-mono">{selectedReportCard.totalMax}</td>
                    <td className="p-2 text-center font-mono text-emerald-800 font-black">{selectedReportCard.totalObtained}</td>
                    <td className="p-2 text-center font-mono text-emerald-800 font-black">{selectedReportCard.overallGrade} ({selectedReportCard.percentage})</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs text-slate-600">
                <span className="font-bold text-slate-800 block text-[10px] uppercase">Instructor Evaluation:</span>
                <p className="mt-0.5 italic">"{selectedReportCard.remarks || 'Diligent academic effort and disciplined conduct.'}"</p>
              </div>

              <div className="flex justify-between pt-8 text-[10px] text-slate-500 border-t border-slate-200 text-center">
                <div>
                  <div className="w-24 border-b border-slate-400 mb-1 mx-auto"></div>
                  <span>Class Teacher</span>
                </div>
                <div>
                  <div className="w-24 border-b border-slate-400 mb-1 mx-auto"></div>
                  <span>Exam Controller</span>
                </div>
                <div>
                  <div className="w-28 border-b-2 border-slate-900 mb-1 mx-auto"></div>
                  <strong className="text-slate-900 font-bold">Principal Verification</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReportCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official DMC (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 9: CONSOLIDATED PTM REPORT CARD */}
      {selectedPtmReportCard && (
        <Modal
          isOpen={Boolean(selectedPtmReportCard)}
          onClose={() => setSelectedPtmReportCard(null)}
          title="Consolidated Parent-Teacher Meeting (PTM) Terminal Report Card"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-ptm-report-card, #printable-ptm-report-card * { visibility: visible !important; }
                #printable-ptm-report-card {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 8mm !important;
                  background: white !important;
                }
                @page { size: A4 portrait; margin: 8mm; }
              }
            `}</style>
            <div 
              id="printable-ptm-report-card"
              className="p-8 bg-white border-4 border-double border-slate-900 rounded-2xl space-y-6 text-slate-800 font-sans"
            >
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <School className="w-10 h-10 text-amber-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">Affiliated with Board of Intermediate & Secondary Education</p>
                <div className="mt-2 inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-black uppercase tracking-widest text-amber-950">
                  COMPREHENSIVE ACADEMIC PROGRESS REPORT CARD & TERMINAL TRANSCRIPT
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Session: {selectedPtmReportCard.session || '2026 - 2027'}</span>
                  <span>Terminal Term: {selectedPtmReportCard.term}</span>
                  <span>Issue Date: {formatDateDDMMYYYY(selectedPtmReportCard.date)}</span>
                </div>
              </div>

              {/* Student Details & Merit Standing */}
              {(() => {
                const rankInfo = getClassRank(selectedPtmReportCard)
                return (
                  <div className="p-4 bg-gradient-to-r from-amber-50/70 via-slate-50 to-indigo-50/70 border border-slate-300 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 font-black flex items-center justify-center text-lg shrink-0 border-2 border-amber-500">
                        {selectedPtmReportCard.studentName?.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{selectedPtmReportCard.studentName}</h3>
                        <p className="text-xs text-slate-600">
                          Roll No: <span className="font-mono font-bold text-slate-900">{selectedPtmReportCard.rollNumber}</span> • Class: <strong>{selectedPtmReportCard.className}</strong>
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Status: <strong className="text-emerald-700">{selectedPtmReportCard.status}</strong> • Conduct: <strong className="text-emerald-700">Exemplary</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right bg-white p-2.5 rounded-lg border border-slate-300 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Merit Standing</span>
                      <span className="text-sm font-black text-amber-800 flex items-center gap-1 justify-end font-mono">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Position #{rankInfo.rank} of {rankInfo.total}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">In {selectedPtmReportCard.className}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Subject Wise Performance Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Detailed Academic Assessment & Grading Matrix
                </span>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 font-bold border-b border-slate-300 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Subject / Course Module</th>
                      <th className="p-2.5 text-center">Max Marks</th>
                      <th className="p-2.5 text-center">Marks Obtained</th>
                      <th className="p-2.5 text-center">Performance Curve</th>
                      <th className="p-2.5 text-center">Grade</th>
                      <th className="p-2.5 text-center">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {(selectedPtmReportCard.subjects || []).map((s, idx) => {
                      const max = Number(s.maxMarks) || 100
                      const obt = Number(s.obtained) || 0
                      const pct = Math.round((obt / max) * 100)
                      const barColor = pct >= 80 ? 'bg-emerald-600' : pct >= 60 ? 'bg-blue-600' : 'bg-amber-600'
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-bold text-slate-900 font-sans">{s.name}</td>
                          <td className="p-2.5 text-center">{s.maxMarks}</td>
                          <td className="p-2.5 text-center font-bold">{s.isAbsent ? 'ABS' : s.obtained}</td>
                          <td className="p-2.5 text-center w-36">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{pct}%</span>
                          </td>
                          <td className="p-2.5 text-center font-bold text-emerald-700">{s.grade}</td>
                          <td className="p-2.5 text-center text-[10px] text-slate-600 font-sans font-medium">
                            {pct >= 85 ? 'Distinction' : pct >= 70 ? 'Very Good' : pct >= 50 ? 'Satisfactory' : 'Needs Focus'}
                          </td>
                        </tr>
                      )
                    })}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
                      <td className="p-2.5 font-black uppercase font-sans">Aggregate Grand Total</td>
                      <td className="p-2.5 text-center">{selectedPtmReportCard.totalMax}</td>
                      <td className="p-2.5 text-center text-emerald-800 font-black">{selectedPtmReportCard.totalObtained}</td>
                      <td className="p-2.5 text-center font-black text-emerald-800">{selectedPtmReportCard.percentage}</td>
                      <td className="p-2.5 text-center font-black text-emerald-800">{selectedPtmReportCard.overallGrade}</td>
                      <td className="p-2.5 text-center font-black text-emerald-800 font-sans">{selectedPtmReportCard.status}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Assessment Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-800 block uppercase text-[10px]">Class Teacher Observations:</span>
                  <p className="mt-1 italic text-slate-700">
                    "{selectedPtmReportCard.remarks || 'Shows remarkable aptitude and disciplined conduct in all modules.'}"
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-800 block uppercase text-[10px]">Principal Promotion Endorsement:</span>
                  <p className="mt-1 font-semibold text-emerald-800">
                    Recommended and verified in good academic standing by the Examination Council.
                  </p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 grid grid-cols-4 gap-4 text-center text-[11px] text-slate-500 border-t">
                <div>
                  <div className="border-b border-slate-400 mb-1 w-24 mx-auto"></div>
                  <span>Class In-Charge</span>
                </div>
                <div>
                  <div className="border-b border-slate-400 mb-1 w-24 mx-auto"></div>
                  <span>Exam Controller</span>
                </div>
                <div>
                  <div className="border-b-2 border-slate-900 mb-1 w-28 mx-auto"></div>
                  <strong className="text-slate-900 font-bold">Principal Seal</strong>
                </div>
                <div>
                  <div className="border-b border-dashed border-slate-400 mb-1 w-28 mx-auto"></div>
                  <span>Parent / Guardian</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedPtmReportCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official PTM Report Card (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 10: OFFICIAL ROLL NUMBER SLIP / ADMIT CARD */}
      {selectedRollNumberSlip && (
        <Modal
          isOpen={Boolean(selectedRollNumberSlip)}
          onClose={() => setSelectedRollNumberSlip(null)}
          title="Official Candidate Roll Number Slip & Admit Card"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-roll-no-slip, #printable-roll-no-slip * { visibility: visible !important; }
                #printable-roll-no-slip {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 8mm !important;
                  background: white !important;
                }
                @page { size: A4 portrait; margin: 8mm; }
              }
            `}</style>
            <div id="printable-roll-no-slip" className="p-6 bg-white border-2 border-slate-900 rounded-xl space-y-4 font-sans text-slate-800">
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-xl">
                    <School className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                      {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-600">
                      BOARD OF INTERMEDIATE & SECONDARY EDUCATION • ROLL NUMBER SLIP
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Examination Session: {selectedRollNumberSlip.term}
                    </p>
                  </div>
                </div>

                <div className="w-20 h-24 border-2 border-dashed border-slate-300 rounded bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[9px] font-semibold">
                  <User className="w-6 h-6 mb-1 text-slate-300" />
                  <span>AFFIX PHOTO</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidate Full Name</span>
                  <strong className="text-slate-900 text-sm">{selectedRollNumberSlip.studentName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number / Token</span>
                  <strong className="text-indigo-700 text-sm font-mono tracking-wider">{selectedRollNumberSlip.rollNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Father / Guardian Name</span>
                  <strong className="text-slate-800">{selectedRollNumberSlip.fatherName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Grade & Group</span>
                  <strong className="text-slate-800">{selectedRollNumberSlip.className}</strong>
                </div>
                <div className="col-span-2 pt-1.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Allotted Examination Center</span>
                    <strong className="text-slate-800">{selectedRollNumberSlip.center}</strong>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-300 text-[10px] font-bold text-emerald-900">
                    <span>Attendance Clearance:</span>
                    <span className="font-mono text-emerald-800">Verified & Eligible</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Examination Paper Schedule & Seating Allotment
                </span>
                <table className="w-full text-left text-[11px] border border-slate-200">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2">Subject</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Day</th>
                      <th className="p-2">Timing</th>
                      <th className="p-2">Room / Hall</th>
                      <th className="p-2 text-center">Invigilator Sign</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {selectedRollNumberSlip.examSchedule.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{item.subject}</td>
                        <td className="p-2 font-mono">{formatDateDDMMYYYY(item.date)}</td>
                        <td className="p-2">{item.day}</td>
                        <td className="p-2 font-mono text-[10px]">{item.time}</td>
                        <td className="p-2">{item.hall}</td>
                        <td className="p-2 border-l border-slate-200 text-center text-slate-300">____________</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                <p className="font-semibold text-slate-700">Crucial Candidate Instructions:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Candidates must be present at the examination hall 30 minutes before the scheduled time.</li>
                  <li>Original Roll Number Slip is compulsory for entry into the examination premises.</li>
                  <li>Mobile phones, smartwatches, and programmable calculators are strictly prohibited.</li>
                </ul>

                <div className="flex justify-between items-end pt-6 text-[11px] font-semibold text-slate-700">
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-1"></div>
                    <span>Candidate Signature</span>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b border-slate-400 mb-1"></div>
                    <span>Center Superintendent</span>
                  </div>
                  <div className="text-center">
                    <div className="w-32 border-b-2 border-slate-900 mb-1"></div>
                    <span className="font-bold text-slate-900">Controller of Examinations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRollNumberSlip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Admit Card (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 11: BATCH CLASS MARKSHEET GENERATOR */}
      {isBatchModalOpen && (
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title="Batch Class Marksheet & Report Card Generator"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Select Class:</span>
                  <select
                    value={batchClass}
                    onChange={(e) => setBatchClass(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="All">All Grades & Classes</option>
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-600">Term:</span>
                  <select
                    value={batchTerm}
                    onChange={(e) => setBatchTerm(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="All">All Terms</option>
                    {availableTerms.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {instExams.filter(e => (batchClass === 'All' || e.className === batchClass) && (batchTerm === 'All' || e.term === batchTerm)).length} DMCs Ready
              </span>
            </div>

            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #printable-batch-dmc-root, #printable-batch-dmc-root * { visibility: visible !important; }
                #printable-batch-dmc-root {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 6mm !important;
                  background: white !important;
                }
                @page { size: A4 portrait; margin: 6mm; }
              }
            `}</style>
            <div id="printable-batch-dmc-root" className="max-h-[60vh] overflow-y-auto space-y-6 pr-1 font-sans">
              {instExams
                .filter(e => (batchClass === 'All' || e.className === batchClass) && (batchTerm === 'All' || e.term === batchTerm))
                .map((exam, index) => (
                  <div 
                    key={exam.id || index}
                    className="p-5 bg-white border-2 border-slate-200 rounded-xl space-y-3 print:border-black print:page-break-after-always print:p-8"
                    style={{ pageBreakAfter: 'always' }}
                  >
                    <div className="text-center border-b pb-3">
                      <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                        {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">{exam.term} • Official Transcript of Record</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2.5 rounded border">
                      <div><span className="text-slate-400">Student:</span> <strong className="text-slate-800">{exam.studentName}</strong></div>
                      <div><span className="text-slate-400">Roll No:</span> <strong className="text-slate-800 font-mono">{exam.rollNumber}</strong></div>
                      <div><span className="text-slate-400">Class:</span> <strong className="text-slate-800">{exam.className}</strong></div>
                      <div><span className="text-slate-400">Date:</span> <strong className="text-slate-800">{formatDateDDMMYYYY(exam.date)}</strong></div>
                    </div>

                    <table className="w-full text-[11px] text-left border">
                      <thead className="bg-slate-100 font-bold border-b">
                        <tr>
                          <th className="p-1.5">Subject</th>
                          <th className="p-1.5 text-center">Max</th>
                          <th className="p-1.5 text-center">Obt.</th>
                          <th className="p-1.5 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono">
                        {(exam.subjects || []).map((s, i) => (
                          <tr key={i}>
                            <td className="p-1.5 font-medium font-sans">{s.name}</td>
                            <td className="p-1.5 text-center">{s.maxMarks}</td>
                            <td className="p-1.5 text-center font-bold">{s.obtained}</td>
                            <td className="p-1.5 text-center font-bold text-emerald-700">{s.grade}</td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50 font-bold border-t-2">
                          <td className="p-1.5 font-sans font-black">Grand Total</td>
                          <td className="p-1.5 text-center">{exam.totalMax}</td>
                          <td className="p-1.5 text-center text-emerald-700">{exam.totalObtained}</td>
                          <td className="p-1.5 text-center text-emerald-700">{exam.overallGrade} ({exam.percentage})</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="flex justify-between pt-4 text-[10px] text-slate-400 border-t">
                      <span>Class Teacher</span>
                      <span>Exam Controller</span>
                      <span>Principal Seal</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsBatchModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Transcripts (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 12: PRINTABLE EXAM ADMIT CARD */}
      <PrintableExamAdmitCardModal
        isOpen={isAdmitModalOpen}
        onClose={() => {
          setIsAdmitModalOpen(false)
          setSelectedCandidateForAdmit(null)
        }}
        selectedCandidate={selectedCandidateForAdmit}
        allStudents={instStudents}
        currentInstitute={currentInstitute}
        examSchedule={dateSheet}
        examTerm={dateSheetTerm || terms[0]?.name || 'Annual Board Examination'}
      />
    </div>
  )
}

export default ExamsView
