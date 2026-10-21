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
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const ExamsView = ({ currentInstitute }) => {
  const { exams = [], students = [], addItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
  const instExams = exams.filter(e => !e.instituteId || e.instituteId === currentInstitute?.id)

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false)
  const [selectedReportCard, setSelectedReportCard] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Batch Printing Filter States
  const [batchClass, setBatchClass] = useState('10th Grade')
  const [batchTerm, setBatchTerm] = useState('Midterm Examination 2026')

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

  const filteredExams = useMemo(() => {
    return instExams.filter(e => 
      e.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.term.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [instExams, searchTerm])

  const totalPages = Math.ceil(filteredExams.length / pageSize) || 1
  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredExams.slice(start, start + pageSize)
  }, [filteredExams, currentPage])

  // Batch class exams
  const batchExamsList = useMemo(() => {
    const matches = instExams.filter(e => 
      (!batchClass || batchClass === 'All' || e.className === batchClass)
    )
    return matches.length > 0 ? matches : instExams
  }, [instExams, batchClass])

  // Unique classes for batch dropdown
  const availableClasses = useMemo(() => {
    const set = new Set([...instExams.map(e => e.className), ...instStudents.map(s => s.className)].filter(Boolean))
    return Array.from(set)
  }, [instExams, instStudents])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examinations & Academic Marksheets</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Subject-wise score recording, automated GPA grading, individual and class-wide batch printable DMCs
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsBatchModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            title="Batch Print Class Transcripts"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Batch Print Class Transcripts</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Examination Result</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, roll number, or exam term..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">
          Total Marksheets: {filteredExams.length}
        </span>
      </div>

      {/* Exam Result Cards Grid */}
      {paginatedExams.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedExams.map((ex) => (
              <div 
                key={ex.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {ex.rollNumber}
                      </span>
                      <h3 className="font-bold text-slate-900 mt-2 text-base">{ex.studentName}</h3>
                      <p className="text-xs text-slate-500">{ex.className} • {ex.term}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm border border-emerald-200">
                        {ex.overallGrade}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1">{ex.percentage}</span>
                    </div>
                  </div>

                  {/* Subject Breakdown preview */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                    {(ex.subjects || []).slice(0, 3).map((sub, idx) => (
                      <div key={idx} className="flex justify-between text-slate-600">
                        <span className="text-slate-500 truncate max-w-[150px]">{sub.name}</span>
                        <span className="font-mono font-medium">{sub.obtained}/{sub.maxMarks} ({sub.grade})</span>
                      </div>
                    ))}
                    {(ex.subjects || []).length > 3 && (
                      <div className="text-[11px] text-slate-400 italic">
                        + {(ex.subjects || []).length - 3} more subjects recorded
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setSelectedReportCard(ex)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Report Card</span>
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id, ex.studentName)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete Result"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              <div>
                Showing Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded font-semibold ${
                      currentPage === page
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Exam Records Found</h3>
          <p className="text-xs text-slate-400 mt-1">Record student exam marks and generate report cards using the button above.</p>
        </div>
      )}

      {/* New Examination Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Examination Result & Marksheet"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student *</label>
            <select
              value={formData.studentName}
              onChange={(e) => handleStudentSelect(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {instStudents.map(s => (
                <option key={s.id} value={s.name}>{s.name} ({s.rollNumber}) - {s.className}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                readOnly
                value={formData.rollNumber}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Examination Term</label>
              <input
                type="text"
                required
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. Midterm 2026"
              />
            </div>
          </div>

          {/* Subjects marks entry */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Subject Marks (Max 100 each)</span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Mathematics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.math}
                  onChange={(e) => setFormData({ ...formData, math: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Physics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.physics}
                  onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Chemistry</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.chemistry}
                  onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">English Literature</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.english}
                  onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 block mb-0.5">Computer Science</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.computer}
                  onChange={(e) => setFormData({ ...formData, computer: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teacher Remarks / Notes</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Excellent conduct and analytical problem solving."
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all"
            >
              Save Exam Result
            </button>
          </div>
        </form>
      </Modal>

      {/* Single Official Marksheet Modal (Printable) */}
      {selectedReportCard && (
        <Modal
          isOpen={Boolean(selectedReportCard)}
          onClose={() => setSelectedReportCard(null)}
          title="Official Academic Transcript & Marksheet"
        >
          <div className="space-y-4">
            <div id="printable-report-card" className="p-6 bg-white border-2 border-slate-300 rounded-2xl space-y-4 print:border-black">
              {/* Header */}
              <div className="text-center border-b pb-4">
                <School className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h3>
                <p className="text-xs text-slate-500">{selectedReportCard.term} • Official Marksheet</p>
              </div>

              {/* Student Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-400">Student Name:</span> <strong className="text-slate-800">{selectedReportCard.studentName}</strong></div>
                <div><span className="text-slate-400">Roll Number:</span> <strong className="text-slate-800 font-mono">{selectedReportCard.rollNumber}</strong></div>
                <div><span className="text-slate-400">Grade / Class:</span> <strong className="text-slate-800">{selectedReportCard.className}</strong></div>
                <div><span className="text-slate-400">Issue Date:</span> <strong className="text-slate-800">{selectedReportCard.date}</strong></div>
              </div>

              {/* Subject Table */}
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

              {/* Remarks & Signatures */}
              <div className="pt-2 text-xs text-slate-600 border-t">
                <p><strong>Remarks:</strong> {selectedReportCard.remarks || 'Satisfactory academic performance.'}</p>
                <div className="flex justify-between mt-8 pt-4 border-t text-slate-400 text-[11px]">
                  <span>Class Teacher Signature</span>
                  <span>Controller of Examinations</span>
                  <span>Principal Seal & Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
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
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Marksheet</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Batch Full Class Transcripts Modal (Print-Ready) */}
      {isBatchModalOpen && (
        <Modal
          isOpen={isBatchModalOpen}
          onClose={() => setIsBatchModalOpen(false)}
          title="Batch Class Transcripts & DMCs Generator"
        >
          <div className="space-y-5">
            {/* Filter selection strip */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-600">Filter Grade/Class:</label>
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

            {/* Continuous printable preview container */}
            <div className="max-h-[60vh] overflow-y-auto space-y-6 pr-1">
              {batchExamsList.map((exam, index) => (
                <div 
                  key={exam.id || index}
                  className="p-5 bg-white border-2 border-slate-200 rounded-xl space-y-3 print:border-black print:page-break-after-always print:p-8"
                  style={{ pageBreakAfter: 'always' }}
                >
                  {/* Header */}
                  <div className="text-center border-b pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium">{exam.term} • Official Transcript of Record</p>
                  </div>

                  {/* Student Details */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-50 p-2.5 rounded border">
                    <div><span className="text-slate-400">Student:</span> <strong className="text-slate-800">{exam.studentName}</strong></div>
                    <div><span className="text-slate-400">Roll No:</span> <strong className="text-slate-800 font-mono">{exam.rollNumber}</strong></div>
                    <div><span className="text-slate-400">Class:</span> <strong className="text-slate-800">{exam.className}</strong></div>
                    <div><span className="text-slate-400">Date:</span> <strong className="text-slate-800">{exam.date}</strong></div>
                  </div>

                  {/* Marks Table */}
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

                  {/* Signatures */}
                  <div className="flex justify-between pt-4 text-[10px] text-slate-400 border-t">
                    <span>Class Teacher</span>
                    <span>Exam Controller</span>
                    <span>Principal Seal</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
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
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All ({batchExamsList.length}) Class Transcripts (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ExamsView
