import React, { useState, useMemo } from 'react'
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
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import PrintableExamAdmitCardModal from '../../../components/common/PrintableExamAdmitCardModal'

export const ExamsView = ({ currentInstitute }) => {
  const { exams = [], students = [], addItem, deleteItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
  const instExams = exams.filter(e => !e.instituteId || e.instituteId === currentInstitute?.id)

  const [activeViewTab, setActiveViewTab] = useState('results') // 'results' | 'datesheet'
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [selectedPtmReportCard, setSelectedPtmReportCard] = useState(null)
  const [selectedRollNumberSlip, setSelectedRollNumberSlip] = useState(null)
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [selectedCandidateForAdmit, setSelectedCandidateForAdmit] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Batch Printing Filter States
  const [batchClass, setBatchClass] = useState('10th Grade')
  const [batchTerm, setBatchTerm] = useState('Midterm Examination 2026')

  // Date Sheet State
  const [dateSheetTerm, setDateSheetTerm] = useState('Annual Examination 2026')
  const [dateSheetClass, setDateSheetClass] = useState('10th Grade')
  const [isAddDateSheetOpen, setIsAddDateSheetOpen] = useState(false)
  const [dateSheet, setDateSheet] = useState([
    { id: 'ds-1', subject: 'Mathematics (Advanced)', date: '2026-11-02', day: 'Monday', time: '09:00 AM - 12:00 PM', hall: 'Main Examination Hall A', invigilator: 'Prof. Tariq Mahmood' },
    { id: 'ds-2', subject: 'Physics (Theory & Numericals)', date: '2026-11-04', day: 'Wednesday', time: '09:00 AM - 12:00 PM', hall: 'Hall B (Science Block)', invigilator: 'Dr. Fatima Zahra' },
    { id: 'ds-3', subject: 'Chemistry', date: '2026-11-06', day: 'Friday', time: '09:00 AM - 12:00 PM', hall: 'Hall B (Science Block)', invigilator: 'Dr. Rashid Minhas' },
    { id: 'ds-4', subject: 'English Language & Comp', date: '2026-11-09', day: 'Monday', time: '09:00 AM - 12:00 PM', hall: 'Main Examination Hall A', invigilator: 'Ms. Ayesha Siddiqua' },
    { id: 'ds-5', subject: 'Computer Science (Paper I)', date: '2026-11-11', day: 'Wednesday', time: '09:00 AM - 12:00 PM', hall: 'IT Center Workstation Lab', invigilator: 'Engr. Imran Qureshi' },
  ])

  const [newDateSheetItem, setNewDateSheetItem] = useState({
    subject: '',
    date: '2026-11-15',
    day: 'Monday',
    time: '09:00 AM - 12:00 PM',
    hall: 'Main Examination Hall A',
    invigilator: ''
  })

  const [formData, setFormData] = useState({
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: instStudents[0]?.className || '10th Grade',
    term: 'Midterm Examination 2026',
    math: 85,
    physics: 80,
    chemistry: 78,
    english: 88,
    computer: 90,
    remarks: 'Keep up the consistent hard work.'
  })

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

  const getGrade = (marks) => {
    const m = Number(marks)
    if (m >= 90) return 'A+'
    if (m >= 80) return 'A'
    if (m >= 70) return 'B'
    if (m >= 60) return 'C'
    if (m >= 50) return 'D'
    return 'F'
  }

  const handleStudentSelect = (studentName) => {
    const std = instStudents.find(s => s.name === studentName)
    setFormData(prev => ({
      ...prev,
      studentName,
      rollNumber: std?.rollNumber || `STD-${Math.floor(100 + Math.random() * 900)}`,
      className: std?.className || '10th Grade'
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.rollNumber) {
      toast.error('Please select or specify student details.')
      return
    }

    const subjects = [
      { name: 'Mathematics', maxMarks: 100, obtained: Number(formData.math), grade: getGrade(formData.math) },
      { name: 'Physics', maxMarks: 100, obtained: Number(formData.physics), grade: getGrade(formData.physics) },
      { name: 'Chemistry', maxMarks: 100, obtained: Number(formData.chemistry), grade: getGrade(formData.chemistry) },
      { name: 'English Literature', maxMarks: 100, obtained: Number(formData.english), grade: getGrade(formData.english) },
      { name: 'Computer Science', maxMarks: 100, obtained: Number(formData.computer), grade: getGrade(formData.computer) }
    ]

    const totalObtained = subjects.reduce((sum, s) => sum + s.obtained, 0)
    const percentage = ((totalObtained / 500) * 100).toFixed(1) + '%'
    const overallGrade = getGrade(totalObtained / 5)

    const newExamRecord = {
      studentName: formData.studentName,
      rollNumber: formData.rollNumber,
      className: formData.className,
      term: formData.term,
      date: new Date().toISOString().split('T')[0],
      subjects,
      totalObtained,
      totalMax: 500,
      percentage,
      overallGrade,
      remarks: formData.remarks,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    await addItem('exams', newExamRecord)
    toast.success(`Exam marksheet for ${formData.studentName} generated successfully!`)
    setIsModalOpen(false)
  }

  const handleDelete = async (id, studentName) => {
    if (window.confirm(`Delete exam marksheet for ${studentName}?`)) {
      await deleteItem('exams', id)
      toast.info('Marksheet record deleted.')
    }
  }

  const handleAddDateSheetEntry = (e) => {
    e.preventDefault()
    if (!newDateSheetItem.subject) {
      toast.error('Please enter subject title.')
      return
    }
    const entry = {
      ...newDateSheetItem,
      id: `ds-${Date.now()}`
    }
    setDateSheet(prev => [...prev, entry])
    setIsAddDateSheetOpen(false)
    toast.success(`Exam slot for "${newDateSheetItem.subject}" scheduled!`)
    setNewDateSheetItem({
      subject: '',
      date: '2026-11-15',
      day: 'Monday',
      time: '09:00 AM - 12:00 PM',
      hall: 'Main Examination Hall A',
      invigilator: ''
    })
  }

  const handleGenerateRollNumberSlip = (student) => {
    setSelectedRollNumberSlip({
      studentName: student.name || student.studentName,
      rollNumber: student.rollNumber || 'BHS-2024-001',
      className: student.className || '10th Grade',
      fatherName: student.fatherName || 'Muhammad Farooq',
      term: dateSheetTerm,
      center: `${currentInstitute?.name || 'Central High Campus'}, Main Exam Hall A`,
      examSchedule: dateSheet
    })
    if (logAuditEvent) {
      logAuditEvent(`Generated Roll Number Slip for ${student.name || student.studentName}`, 'Exam Controller', 'Success')
    }
  }

  const filteredExams = useMemo(() => {
    return instExams.filter(e => {
      const s = searchTerm.toLowerCase()
      return (
        (e.studentName || '').toLowerCase().includes(s) ||
        (e.rollNumber || '').toLowerCase().includes(s) ||
        (e.className || '').toLowerCase().includes(s) ||
        (e.term || '').toLowerCase().includes(s)
      )
    })
  }, [instExams, searchTerm])

  const totalPages = Math.max(1, Math.ceil(filteredExams.length / pageSize))
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage, pageSize])

  const availableClasses = useMemo(() => {
    const set = new Set(instStudents.map(s => s.className).filter(Boolean))
    return Array.from(set)
  }, [instStudents])

  const batchExamsList = useMemo(() => {
    return instExams.filter(e => {
      const matchesClass = batchClass === 'All' || e.className === batchClass
      const matchesTerm = !batchTerm || e.term === batchTerm
      return matchesClass && matchesTerm
    })
  }, [instExams, batchClass, batchTerm])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examinations & Marksheets</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Conduct terms, manage date sheets, generate roll number slips, and print official DMCs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveViewTab('results')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeViewTab === 'results' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Results & Transcripts ({instExams.length})
            </button>
            <button
              onClick={() => setActiveViewTab('datesheet')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeViewTab === 'datesheet' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Date Sheet & Admit Slips
            </button>
          </div>

          {activeViewTab === 'results' ? (
            <>
              <button
                onClick={() => setIsBatchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                title="Batch print class report cards"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Batch Print DMCs</span>
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Record New Marksheet</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsAddDateSheetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exam Paper Slot</span>
            </button>
          )}
        </div>
      </div>

      {activeViewTab === 'results' ? (
        <>
          {/* Search bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search marksheet by student, roll number, or term..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Showing {filteredExams.length} transcripts
            </span>
          </div>

          {/* Marksheets Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Student & Roll No</th>
                    <th className="px-6 py-4">Class</th>
                    <th className="px-6 py-4">Examination Term</th>
                    <th className="px-6 py-4 text-center">Marks Obtained</th>
                    <th className="px-6 py-4 text-center">Grade</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedExams.length > 0 ? (
                    paginatedExams.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-800">{e.studentName}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{e.rollNumber}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">{e.className}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {e.term}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-slate-800">
                          {e.totalObtained} / {e.totalMax} <span className="text-[11px] text-slate-400 font-normal">({e.percentage})</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-black ${
                            e.overallGrade.startsWith('A') 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}>
                            {e.overallGrade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedPtmReportCard(e)}
                              className="px-2 py-1 text-xs font-bold rounded-lg bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center gap-1 transition-colors cursor-pointer"
                              title="Generate Consolidated Annual Terminal Report Card for Parent-Teacher Meeting"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600" />
                              <span>PTM Card</span>
                            </button>
                            <button
                              onClick={() => setSelectedReportCard(e)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Print Detailed Mark Certificate (DMC)"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleGenerateRollNumberSlip({ name: e.studentName, rollNumber: e.rollNumber, className: e.className })}
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Generate Official Roll Number Slip"
                            >
                              <IdCard className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(e.id, e.studentName)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete marksheet record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No Marksheet Records Found</p>
                        <p className="text-xs text-slate-400 mt-1">Record terms and subject grades to generate student transcripts.</p>
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
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  
                  <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>

                  <button
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
        /* Examination Date Sheet & Admit Card Tab */
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Official Examination Schedule
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">{dateSheetTerm} • {dateSheetClass}</h3>
              <p className="text-xs text-slate-500 mt-1">
                Centralized timetable approved by the Board of Examiners & Academic Council
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Date Sheet Notice</span>
              </button>
            </div>
          </div>

          {/* Date Sheet Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
                  <tr>
                    <th className="px-6 py-4">Subject / Course Paper</th>
                    <th className="px-6 py-4">Examination Date</th>
                    <th className="px-6 py-4">Day</th>
                    <th className="px-6 py-4">Time Slot</th>
                    <th className="px-6 py-4">Examination Hall</th>
                    <th className="px-6 py-4">Chief Invigilator</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {dateSheet.map((ds, idx) => (
                    <tr key={ds.id || idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        <span>{ds.subject}</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-slate-700">{ds.date}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{ds.day}</td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{ds.time}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {ds.hall}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{ds.invigilator || 'Staff On Duty'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setDateSheet(prev => prev.filter(item => item.id !== ds.id))
                            toast.info(`Paper slot for ${ds.subject} removed.`)
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove exam slot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
                  const std = instStudents.find(s => s.name === e.target.value)
                  if (std) handleGenerateRollNumberSlip(std)
                }}
                defaultValue=""
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              >
                <option value="" disabled>Select Student for Roll No Slip...</option>
                {instStudents.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.rollNumber || 'STD'})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Record New Marksheet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Examination Marksheet"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student</label>
              <select
                value={formData.studentName}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                {instStudents.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.rollNumber || 'STD'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                readOnly
                value={formData.rollNumber}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class / Grade</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Term</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
              >
                <option value="Midterm Examination 2026">Midterm Examination 2026</option>
                <option value="Annual Examination 2026">Annual Examination 2026</option>
                <option value="Send-Up Board Prep 2026">Send-Up Board Prep 2026</option>
              </select>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <span className="text-xs font-bold uppercase text-slate-700 tracking-wider">Subject Marks (Max 100 Each)</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] text-slate-500 font-medium">Mathematics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.math}
                  onChange={(e) => setFormData({ ...formData, math: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium">Physics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.physics}
                  onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium">Chemistry</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.chemistry}
                  onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium">English Literature</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.english}
                  onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 font-medium">Computer Science</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.computer}
                  onChange={(e) => setFormData({ ...formData, computer: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Remarks & Conduct</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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

      {/* Add Date Sheet Slot Modal */}
      <Modal
        isOpen={isAddDateSheetOpen}
        onClose={() => setIsAddDateSheetOpen(false)}
        title="Add Exam Schedule Paper Slot"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddDateSheetEntry} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Name</label>
            <input
              type="text"
              required
              value={newDateSheetItem.subject}
              onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, subject: e.target.value })}
              placeholder="e.g. Pakistan Studies / Biology"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Date</label>
              <input
                type="date"
                required
                value={newDateSheetItem.date}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, date: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Day</label>
              <select
                value={newDateSheetItem.day}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, day: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white"
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
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Time Slot</label>
              <input
                type="text"
                value={newDateSheetItem.time}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, time: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Hall / Room</label>
              <input
                type="text"
                value={newDateSheetItem.hall}
                onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, hall: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Chief Invigilator</label>
            <input
              type="text"
              value={newDateSheetItem.invigilator}
              onChange={(e) => setNewDateSheetItem({ ...newDateSheetItem, invigilator: e.target.value })}
              placeholder="e.g. Prof. Tariq Mahmood"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
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

      {/* Official Roll Number Slip Modal */}
      {selectedRollNumberSlip && (
        <Modal
          isOpen={!!selectedRollNumberSlip}
          onClose={() => setSelectedRollNumberSlip(null)}
          title="Official Candidate Roll Number Slip & Admit Card"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div id="printable-roll-no-slip" className="p-6 bg-white border-2 border-slate-900 rounded-xl space-y-4 font-sans text-slate-800">
              {/* Slip Header */}
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

              {/* Candidate Info Grid */}
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
                  <strong className="text-slate-800">{selectedRollNumberSlip.className} (Science Group)</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Allotted Examination Center</span>
                  <strong className="text-slate-800">{selectedRollNumberSlip.center}</strong>
                </div>
              </div>

              {/* Schedule Table */}
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
                  <tbody className="divide-y divide-slate-100">
                    {selectedRollNumberSlip.examSchedule.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-bold">{item.subject}</td>
                        <td className="p-2 font-mono">{item.date}</td>
                        <td className="p-2">{item.day}</td>
                        <td className="p-2 font-mono text-[10px]">{item.time}</td>
                        <td className="p-2">{item.hall}</td>
                        <td className="p-2 border-l border-slate-200 text-center text-slate-300">____________</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Instructions & Signatures */}
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
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

      {/* Consolidated Annual Terminal Report Card (PTM) Modal */}
      {selectedPtmReportCard && (
        <Modal
          isOpen={Boolean(selectedPtmReportCard)}
          onClose={() => setSelectedPtmReportCard(null)}
          title="Consolidated Annual Terminal Report Card (PTM Official Transcript)"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div 
              id="printable-ptm-report-card"
              className="p-8 bg-white border-4 border-double border-slate-900 rounded-2xl space-y-6 print:border-black print:p-8 text-slate-800"
            >
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4">
                <School className="w-10 h-10 text-amber-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h2>
                <p className="text-xs text-slate-600 font-semibold">Affiliated with Board of Intermediate & Secondary Education (BISE)</p>
                <div className="mt-2 inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-black uppercase tracking-widest text-amber-950">
                  COMPREHENSIVE ACADEMIC PROGRESS REPORT CARD & TERMINAL TRANSCRIPT
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2 font-mono">
                  <span>Session: 2026 - 2027</span>
                  <span>Terminal Term: {selectedPtmReportCard.term}</span>
                  <span>Issue Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Student Details & Class Position Hero Card */}
              {(() => {
                const rankInfo = getClassRank(selectedPtmReportCard);
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
                          Attendance Record: <strong className="text-emerald-700">96.4% (Regular)</strong> • Conduct: <strong className="text-emerald-700">Exemplary</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:text-right bg-white p-2.5 rounded-lg border border-slate-300 shadow-sm">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Class Merit Standing</span>
                      <span className="text-sm font-black text-amber-800 flex items-center gap-1 justify-end font-mono">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Position #{rankInfo.rank} of {rankInfo.total}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium block">In {selectedPtmReportCard.className}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Subject Wise Performance Table with Visual Progress Bar Curve */}
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
                  <tbody className="divide-y divide-slate-200">
                    {(selectedPtmReportCard.subjects || []).map((s, idx) => {
                      const pct = Math.round((Number(s.obtained) / Number(s.maxMarks)) * 100);
                      const barColor = pct >= 80 ? 'bg-emerald-600' : pct >= 60 ? 'bg-blue-600' : 'bg-amber-600';
                      return (
                        <tr key={idx} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                          <td className="p-2.5 text-center font-mono">{s.maxMarks}</td>
                          <td className="p-2.5 text-center font-mono font-bold">{s.obtained}</td>
                          <td className="p-2.5 text-center w-36">
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div className={`${barColor} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                            </div>
                            <span className="text-[9px] text-slate-500 font-mono block mt-0.5">{pct}%</span>
                          </td>
                          <td className="p-2.5 text-center font-bold font-mono text-emerald-700">{s.grade}</td>
                          <td className="p-2.5 text-center text-[10px] text-slate-600 font-medium">
                            {pct >= 85 ? 'Distinction' : pct >= 70 ? 'Very Good' : 'Satisfactory'}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-100 font-bold border-t-2 border-slate-900 text-xs">
                      <td className="p-2.5 font-black uppercase">Aggregate Grand Total</td>
                      <td className="p-2.5 text-center font-mono">{selectedPtmReportCard.totalMax}</td>
                      <td className="p-2.5 text-center font-mono text-emerald-800 font-black">{selectedPtmReportCard.totalObtained}</td>
                      <td className="p-2.5 text-center font-mono font-black text-emerald-800">{selectedPtmReportCard.percentage}</td>
                      <td className="p-2.5 text-center font-mono text-emerald-800 font-black">{selectedPtmReportCard.overallGrade}</td>
                      <td className="p-2.5 text-center text-emerald-800 font-black">PASSED</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Assessment Observations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-800 block uppercase text-[10px]">Class Teacher Observations:</span>
                  <p className="mt-1 italic text-slate-700">
                    "{selectedPtmReportCard.remarks || 'Shows remarkable aptitude in scientific analysis and punctual attendance.'}"
                  </p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
                  <span className="font-bold text-slate-800 block uppercase text-[10px]">Principal Promotion Endorsement:</span>
                  <p className="mt-1 font-semibold text-emerald-800">
                    Recommended and Promoted in Good Standing to the next academic level with distinction.
                  </p>
                </div>
              </div>

              {/* Signatures & Parent Acknowledgment */}
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
                  <span>Parent / Guardian Sign</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
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

      {/* Individual DMC Modal */}
      {selectedReportCard && (
        <Modal
          isOpen={!!selectedReportCard}
          onClose={() => setSelectedReportCard(null)}
          title="Official Detailed Marks Certificate (DMC)"
          maxWidth="max-w-xl"
        >
          <div className="space-y-4">
            {/* Print Specific CSS Rules */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-dmc-single, #printable-dmc-single * {
                  visibility: visible !important;
                }
                #printable-dmc-single {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 8mm !important;
                  background: white !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 8mm;
                }
              }
            `}</style>
            <div id="printable-dmc-single" className="p-6 bg-white border-2 border-slate-800 rounded-xl space-y-4 font-sans">
              <div className="text-center border-b pb-3">
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h3>
                <p className="text-xs text-slate-500 font-medium">{selectedReportCard.term} • Official Transcript</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-400">Student:</span> <strong className="text-slate-800">{selectedReportCard.studentName}</strong></div>
                <div><span className="text-slate-400">Roll No:</span> <strong className="text-slate-800 font-mono">{selectedReportCard.rollNumber}</strong></div>
                <div><span className="text-slate-400">Class:</span> <strong className="text-slate-800">{selectedReportCard.className}</strong></div>
                <div><span className="text-slate-400">Issued On:</span> <strong className="text-slate-800">{selectedReportCard.date}</strong></div>
              </div>

              <table className="w-full text-xs text-left border">
                <thead className="bg-slate-100 font-bold border-b">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2 text-center">Max Marks</th>
                    <th className="p-2 text-center">Marks Obtained</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {(selectedReportCard.subjects || []).map((s, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{s.name}</td>
                      <td className="p-2 text-center">{s.maxMarks}</td>
                      <td className="p-2 text-center font-bold">{s.obtained}</td>
                      <td className="p-2 text-center font-bold text-emerald-700">{s.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-bold border-t-2">
                    <td className="p-2">Grand Total</td>
                    <td className="p-2 text-center">{selectedReportCard.totalMax}</td>
                    <td className="p-2 text-center text-emerald-700">{selectedReportCard.totalObtained}</td>
                    <td className="p-2 text-center text-emerald-700">{selectedReportCard.overallGrade} ({selectedReportCard.percentage})</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-slate-50 rounded border text-xs text-slate-600">
                <span className="font-bold text-slate-700 block">Instructor Assessment & Remarks:</span>
                <p className="mt-0.5 italic">"{selectedReportCard.remarks}"</p>
              </div>

              <div className="flex justify-between pt-6 text-[10px] text-slate-400 border-t">
                <span>Class Teacher Signature</span>
                <span>Exam Controller Seal</span>
                <span>Principal Verification</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedReportCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official DMC</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch DMC Modal */}
      {isBatchModalOpen && (
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title="Batch Class Marksheet & Report Card Generator"
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Select Class:</span>
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

              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {batchExamsList.length} DMCs Ready for Batch Printing
              </span>
            </div>

            {/* Print Specific CSS Rules */}
            <style>{`
              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-batch-dmc-root, #printable-batch-dmc-root * {
                  visibility: visible !important;
                }
                #printable-batch-dmc-root {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin: 0 !important;
                  padding: 6mm !important;
                  background: white !important;
                }
                .no-print {
                  display: none !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 6mm;
                }
              }
            `}</style>
            <div id="printable-batch-dmc-root" className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
              {batchExamsList.map((exam, index) => (
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
                    <div><span className="text-slate-400">Date:</span> <strong className="text-slate-800">{exam.date}</strong></div>
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
                    <tbody className="divide-y">
                      {(exam.subjects || []).map((s, i) => (
                        <tr key={i}>
                          <td className="p-1.5 font-medium">{s.name}</td>
                          <td className="p-1.5 text-center">{s.maxMarks}</td>
                          <td className="p-1.5 text-center font-bold">{s.obtained}</td>
                          <td className="p-1.5 text-center font-bold text-emerald-700">{s.grade}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 font-bold border-t-2">
                        <td className="p-1.5">Grand Total</td>
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
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All ({batchExamsList.length}) Class Transcripts (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
          {/* Printable Candidate Exam Admit Card & Roll Number Slip Modal */}
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
        examTerm={dateSheetTerm}
      />
    </div>
  )
}

export default ExamsView