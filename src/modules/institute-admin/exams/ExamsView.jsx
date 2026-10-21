import React, { useState } from 'react'
import { Award, Plus, Search, Edit2, Trash2, Printer, FileText, CheckCircle2, User } from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import Modal from '../../../components/common/Modal'

export const ExamsView = ({ currentInstitute }) => {
  const { students } = useAppData()
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)

  const [exams, setExams] = useState([
    {
      id: 'ex-1',
      studentName: 'Hamza Farooq',
      rollNumber: 'BHS-2024-001',
      className: '10th Grade',
      term: 'Midterm Examination 2026',
      date: '2026-10-15',
      subjects: [
        { name: 'Mathematics', maxMarks: 100, obtained: 92, grade: 'A+' },
        { name: 'Physics', maxMarks: 100, obtained: 88, grade: 'A' },
        { name: 'Chemistry', maxMarks: 100, obtained: 85, grade: 'A' },
        { name: 'English Literature', maxMarks: 100, obtained: 90, grade: 'A+' },
        { name: 'Computer Science', maxMarks: 100, obtained: 95, grade: 'A+' }
      ],
      totalObtained: 450,
      totalMax: 500,
      percentage: '90.0%',
      overallGrade: 'A+',
      remarks: 'Outstanding performance! Exemplary conduct in academics.'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedReportCard, setSelectedReportCard] = useState(null)

  const [formData, setFormData] = useState({
    studentName: instStudents[0]?.name || '',
    rollNumber: instStudents[0]?.rollNumber || '',
    className: '10th Grade',
    term: 'Midterm Examination 2026',
    math: 85,
    physics: 80,
    chemistry: 78,
    english: 88,
    computer: 90,
    remarks: 'Keep up the consistent hard work.'
  })

  const handleStudentSelect = (studentName) => {
    const std = instStudents.find(s => s.name === studentName)
    setFormData(prev => ({
      ...prev,
      studentName,
      rollNumber: std?.rollNumber || `STD-${Math.floor(100 + Math.random() * 900)}`,
      className: std?.className || '10th Grade'
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
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
      id: `ex-${Date.now()}`,
      studentName: formData.studentName || 'Student',
      rollNumber: formData.rollNumber || 'STD-001',
      className: formData.className,
      term: formData.term,
      date: new Date().toISOString().split('T')[0],
      subjects,
      totalObtained,
      totalMax: 500,
      percentage,
      overallGrade,
      remarks: formData.remarks
    }

    setExams([newExamRecord, ...exams])
    setIsModalOpen(false)
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

  const handleDelete = (id) => {
    if (window.confirm('Delete exam result card?')) {
      setExams(exams.filter(e => e.id !== id))
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examinations & Report Cards</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Record term exams, calculate grades, and print official student report cards</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Exam Marks Entry</span>
        </button>
      </div>

      {/* Grid of Exam Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {exams.map((ex) => (
          <div key={ex.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {ex.term}
                  </span>
                  <h3 className="text-base font-bold text-slate-800 mt-2">{ex.studentName}</h3>
                  <p className="text-xs text-slate-400 font-mono">Roll: {ex.rollNumber} • {ex.className}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center font-bold shadow-md">
                  <span className="text-xs">Grade</span>
                  <span className="text-base leading-none">{ex.overallGrade}</span>
                </div>
              </div>

              {/* Subjects summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                {ex.subjects.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-600">
                    <span>{sub.name}</span>
                    <span className="font-semibold text-slate-800 font-mono">{sub.obtained}/{sub.maxMarks} ({sub.grade})</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Total: <strong>{ex.totalObtained}/{ex.totalMax}</strong></span>
                <span className="font-bold text-emerald-600 font-mono">{ex.percentage}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setSelectedReportCard(ex)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report Card</span>
              </button>

              <button
                onClick={() => handleDelete(ex.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                title="Delete Result"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Exam Marks Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Student Examination Marks"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student</label>
            {instStudents && instStudents.length > 0 ? (
              <select
                value={formData.studentName}
                onChange={(e) => handleStudentSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="">Select Enrolled Student...</option>
                {instStudents.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                required
                placeholder="Student Name"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Class / Grade</label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Examination Term</label>
            <select
              value={formData.term}
              onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
            >
              <option value="First Term Assessment 2026">First Term Assessment 2026</option>
              <option value="Midterm Examination 2026">Midterm Examination 2026</option>
              <option value="Final Term Annual Exam 2026">Final Term Annual Exam 2026</option>
            </select>
          </div>

          {/* Subject Marks Inputs */}
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Enter Marks (Out of 100)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Mathematics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.math}
                  onChange={(e) => setFormData({ ...formData, math: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Physics</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.physics}
                  onChange={(e) => setFormData({ ...formData, physics: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Chemistry</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.chemistry}
                  onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">English</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.english}
                  onChange={(e) => setFormData({ ...formData, english: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600">Computer</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.computer}
                  onChange={(e) => setFormData({ ...formData, computer: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Teacher Remarks</label>
            <input
              type="text"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Excellent academic performance!"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-emerald-600 rounded-lg font-semibold">Save Marks</button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Report Card Modal */}
      {selectedReportCard && (
        <Modal
          isOpen={Boolean(selectedReportCard)}
          onClose={() => setSelectedReportCard(null)}
          title="Official Student Progress Report Card"
          maxWidth="max-w-2xl"
        >
          <div className="p-4 bg-white border-2 border-slate-800 rounded-xl space-y-4 print:p-0">
            {/* School Header */}
            <div className="text-center border-b-2 border-slate-800 pb-3">
              <h2 className="text-xl font-black uppercase text-slate-900 tracking-wider">
                {currentInstitute?.name || 'CENTRAL HIGH SCHOOL & COLLEGE'}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Affiliated with {currentInstitute?.affiliatedBoard || 'Board of Intermediate & Secondary Education'} • Registered Examination Center
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-widest">
                {selectedReportCard.term} - Progress Report Card
              </div>
            </div>

            {/* Student Info Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Student Name</span>
                <span className="font-bold text-slate-900">{selectedReportCard.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Roll Number</span>
                <span className="font-mono font-bold text-slate-900">{selectedReportCard.rollNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Class / Grade</span>
                <span className="font-bold text-slate-900">{selectedReportCard.className}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Issue Date</span>
                <span className="font-mono text-slate-700">{selectedReportCard.date}</span>
              </div>
            </div>

            {/* Subject Marks Table */}
            <table className="w-full text-left text-xs border border-slate-300">
              <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-300">
                <tr>
                  <th className="p-2.5">Subject</th>
                  <th className="p-2.5 text-center">Max Marks</th>
                  <th className="p-2.5 text-center">Pass Marks</th>
                  <th className="p-2.5 text-center">Marks Obtained</th>
                  <th className="p-2.5 text-center">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {selectedReportCard.subjects.map((sub, idx) => (
                  <tr key={idx}>
                    <td className="p-2.5 font-bold text-slate-800">{sub.name}</td>
                    <td className="p-2.5 text-center text-slate-600">{sub.maxMarks}</td>
                    <td className="p-2.5 text-center text-slate-600">33</td>
                    <td className="p-2.5 text-center font-bold text-slate-900 font-mono">{sub.obtained}</td>
                    <td className="p-2.5 text-center font-bold text-emerald-700">{sub.grade}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold border-t-2 border-slate-800">
                  <td className="p-2.5">Total Aggregate</td>
                  <td className="p-2.5 text-center">{selectedReportCard.totalMax}</td>
                  <td className="p-2.5 text-center">—</td>
                  <td className="p-2.5 text-center text-base font-black text-slate-900">{selectedReportCard.totalObtained}</td>
                  <td className="p-2.5 text-center text-base font-black text-emerald-700">{selectedReportCard.overallGrade}</td>
                </tr>
              </tbody>
            </table>

            {/* Overall Summary Bar */}
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <div>
                <span className="text-emerald-700 font-semibold block text-[11px]">Percentage</span>
                <span className="text-lg font-black text-emerald-900">{selectedReportCard.percentage}</span>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold block text-[11px]">Final Result</span>
                <span className="font-bold text-emerald-900">Passed with Distinction</span>
              </div>
              <div>
                <span className="text-emerald-700 font-semibold block text-[11px]">Cumulative GPA</span>
                <span className="font-bold text-emerald-900">3.92 / 4.0</span>
              </div>
            </div>

            {/* Remarks */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-bold text-slate-700">Remarks: </span>
              <span className="italic text-slate-600">{selectedReportCard.remarks}</span>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-800">Class Teacher Signature</span>
              </div>
              <div className="border-t border-slate-400 pt-1">
                <span className="font-bold text-slate-800">Principal / Head of Institution</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t print:hidden">
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
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ExamsView
