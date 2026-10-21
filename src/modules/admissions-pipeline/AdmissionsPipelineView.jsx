import React, { useState } from 'react'
import { 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  ChevronRight, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Trash2, 
  Zap, 
  UserPlus, 
  Check,
  Download,
  FileText,
  Printer,
  School,
  Award,
  X
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const AdmissionsPipelineView = () => {
  const { admissionsPipeline = [], addItem, updateItem, deleteItem, students = [], institutes = [] } = useAppData()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedApplicantForScorecard, setSelectedApplicantForScorecard] = useState(null)
  const [selectedApplicantForOffer, setSelectedApplicantForOffer] = useState(null)

  const stages = [
    'Inquiry Received',
    'Entrance Test Scheduled',
    'Interview Passed',
    'Enrolled & Admitted'
  ]

  const [formData, setFormData] = useState({
    studentName: '',
    parentName: '',
    parentPhone: '',
    gradeApplied: '10th Grade',
    stage: 'Inquiry Received',
    testDate: '2026-10-25'
  })

  // Evaluation Scorecard state
  const [scorecardData, setScorecardData] = useState({
    english: 82,
    math: 88,
    science: 80,
    remarks: 'Clear concept foundation, confident interpersonal skills.'
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.studentName || !formData.parentPhone) {
      toast.error('Student Name and Parent Phone are required.')
      return
    }

    await addItem('admissionsPipeline', {
      ...formData,
      status: formData.stage === 'Enrolled & Admitted' ? 'Admitted' : 'In Progress',
      transferredToRoster: false
    })
    toast.success(`Inquiry for ${formData.studentName} added to pipeline!`)
    setIsModalOpen(false)
    setFormData({
      studentName: '',
      parentName: '',
      parentPhone: '',
      gradeApplied: '10th Grade',
      stage: 'Inquiry Received',
      testDate: '2026-10-25'
    })
  }

  const handleAdvanceStage = async (applicant) => {
    const currentIdx = stages.indexOf(applicant.stage)
    if (currentIdx < stages.length - 1) {
      const nextStage = stages[currentIdx + 1]
      await updateItem('admissionsPipeline', applicant.id, {
        stage: nextStage,
        status: nextStage === 'Enrolled & Admitted' ? 'Admitted' : 'In Progress'
      })
      toast.info(`${applicant.studentName} advanced to: ${nextStage}`)
    }
  }

  // 1-Click Convert Candidate to Enrolled Student in Roster
  const handleConvertToStudent = async (applicant) => {
    if (applicant.transferredToRoster) {
      toast.info(`Candidate ${applicant.studentName} is already transferred to student roster.`)
      return
    }

    const newRoll = `STD-${Math.floor(1000 + Math.random() * 9000)}`
    await addItem('students', {
      name: applicant.studentName,
      rollNumber: newRoll,
      className: applicant.gradeApplied || '10th Grade',
      section: 'A',
      phone: applicant.parentPhone || '',
      emergencyContact: applicant.parentPhone || '',
      email: `${applicant.studentName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@sms.edu`,
      bloodGroup: 'B+',
      feeStatus: 'Pending',
      attendanceRate: '100%',
      admittedFromPipelineId: applicant.id,
      admissionDate: new Date().toISOString().split('T')[0]
    })

    await updateItem('admissionsPipeline', applicant.id, {
      stage: 'Enrolled & Admitted',
      status: 'Admitted & Enrolled',
      transferredToRoster: true,
      assignedRollNumber: newRoll
    })

    toast.success(`Candidate "${applicant.studentName}" successfully enrolled with Roll Number: ${newRoll}!`)
  }

  // Save entrance evaluation scorecard
  const handleSaveScorecard = async (e) => {
    e.preventDefault()
    if (!selectedApplicantForScorecard) return

    const total = Number(scorecardData.english) + Number(scorecardData.math) + Number(scorecardData.science)
    const percentage = Math.round((total / 300) * 100)
    const passed = percentage >= 50

    const scorecard = {
      english: Number(scorecardData.english),
      math: Number(scorecardData.math),
      science: Number(scorecardData.science),
      totalMarks: total,
      percentage: `${percentage}%`,
      decision: passed ? 'Recommended for Admission' : 'Requires Retest',
      remarks: scorecardData.remarks,
      evaluatedDate: new Date().toISOString().split('T')[0]
    }

    await updateItem('admissionsPipeline', selectedApplicantForScorecard.id, {
      scorecard,
      stage: passed ? 'Interview Passed' : selectedApplicantForScorecard.stage
    })

    toast.success(`Entrance test evaluation recorded for ${selectedApplicantForScorecard.studentName} (${percentage}%)!`)
    setSelectedApplicantForScorecard(null)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete inquiry for "${name}"?`)) {
      await deleteItem('admissionsPipeline', id)
      toast.success('Inquiry record deleted.')
    }
  }

  const filtered = admissionsPipeline.filter(a =>
    (a.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.parentPhone && a.parentPhone.includes(searchTerm)) ||
    (a.gradeApplied || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Export Pipeline CSV
  const exportPipelineCSV = () => {
    if (filtered.length === 0) {
      toast.warning('No inquiries to export.')
      return
    }

    const headers = ['Applicant Name', 'Parent Name', 'Phone', 'Grade Applied', 'Current Stage', 'Status', 'Test Date', 'Scorecard %']
    const rows = filtered.map(a => [
      `"${a.studentName || ''}"`,
      `"${a.parentName || ''}"`,
      `"${a.parentPhone || ''}"`,
      `"${a.gradeApplied || ''}"`,
      `"${a.stage || ''}"`,
      `"${a.status || ''}"`,
      `"${a.testDate || ''}"`,
      `"${a.scorecard?.percentage || 'Pending'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `admissions_pipeline_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filtered.length} inquiries to CSV.`)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admissions Inquiry & Leads Pipeline</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track prospective student inquiries, record entrance test scorecards, and generate official Admission Offer letters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportPipelineCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Admission Inquiry</span>
          </button>
        </div>
      </div>

      {/* Stage Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stages.map((st, i) => {
          const count = admissionsPipeline.filter(a => a.stage === st).length
          return (
            <div key={st} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold uppercase text-slate-400 block tracking-wider">Step {i + 1}</span>
              <span className="text-xl font-bold text-slate-900 font-mono mt-1 block">{count}</span>
              <span className="text-xs text-slate-600 font-semibold truncate block mt-0.5">{st}</span>
            </div>
          )
        })}
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, phone, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg">
          Total Leads: {filtered.length}
        </span>
      </div>

      {/* Pipeline Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(app => (
            <div 
              key={app.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {app.stage}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {app.gradeApplied}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{app.studentName}</h3>
                <p className="text-xs text-slate-500 mt-1">Parent: <strong className="text-slate-700">{app.parentName || 'Guardian'}</strong></p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{app.parentPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Test Date: {app.testDate || 'Pending'}</span>
                  </div>
                  {app.scorecard ? (
                    <div className="text-[11px] text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md font-semibold flex items-center justify-between">
                      <span>Test Score: {app.scorecard.percentage}</span>
                      <span className="text-[10px] font-bold text-emerald-700">{app.scorecard.decision}</span>
                    </div>
                  ) : null}
                  {app.assignedRollNumber && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold mt-1">
                      Assigned Roll: {app.assignedRollNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedApplicantForScorecard(app)
                      if (app.scorecard) {
                        setScorecardData({
                          english: app.scorecard.english || 80,
                          math: app.scorecard.math || 80,
                          science: app.scorecard.science || 80,
                          remarks: app.scorecard.remarks || ''
                        })
                      }
                    }}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1"
                    title="Evaluate Entrance Test Scorecard"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>Scorecard</span>
                  </button>

                  <button
                    onClick={() => setSelectedApplicantForOffer(app)}
                    className="p-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded text-xs font-semibold flex items-center gap-1"
                    title="Generate Formal Admission Offer Letter"
                  >
                    <FileText className="w-3.5 h-3.5 text-teal-700" />
                    <span>Offer</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {app.stage !== 'Enrolled & Admitted' ? (
                    <button
                      onClick={() => handleAdvanceStage(app)}
                      className="p-1.5 text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 rounded text-xs font-semibold flex items-center gap-1"
                      title="Advance to Next Stage"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : !app.transferredToRoster ? (
                    <button
                      onClick={() => handleConvertToStudent(app)}
                      className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-sm flex items-center gap-1"
                      title="1-Click Enroll to Student Roster"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Enroll</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                    </span>
                  )}

                  <button 
                    onClick={() => handleDelete(app.id, app.studentName)} 
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Inquiry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Admissions Inquiries</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No admission inquiries currently in the pipeline. Click "New Admission Inquiry" to register a candidate.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Inquiry</span>
          </button>
        </div>
      )}

      {/* New Inquiry Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Prospective Student Admission Inquiry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Applicant Student Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Daniyal Tariq"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Applying for Grade *</label>
              <input
                type="text"
                required
                placeholder="e.g. 10th Grade"
                value={formData.gradeApplied}
                onChange={(e) => setFormData({ ...formData, gradeApplied: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent / Guardian Full Name</label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Phone / Mobile *</label>
              <input
                type="text"
                required
                placeholder="+92 321 8899001"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Entrance Test Date</label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 bg-white"
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow"
            >
              Add Applicant
            </button>
          </div>
        </form>
      </Modal>

      {/* Entrance Test Scorecard Modal */}
      {selectedApplicantForScorecard && (
        <Modal
          isOpen={Boolean(selectedApplicantForScorecard)}
          onClose={() => setSelectedApplicantForScorecard(null)}
          title={`Entrance Test Scorecard: ${selectedApplicantForScorecard.studentName}`}
        >
          <form onSubmit={handleSaveScorecard} className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs space-y-0.5">
              <span className="font-bold text-teal-950 block">{selectedApplicantForScorecard.studentName}</span>
              <span className="text-teal-700 block">Grade Applied: {selectedApplicantForScorecard.gradeApplied} • Parent: {selectedApplicantForScorecard.parentName}</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">English (Max 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.english}
                  onChange={(e) => setScorecardData({ ...scorecardData, english: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Math (Max 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.math}
                  onChange={(e) => setScorecardData({ ...scorecardData, math: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Science (Max 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={scorecardData.science}
                  onChange={(e) => setScorecardData({ ...scorecardData, science: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded border border-slate-200 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Interviewer Notes & Assessment</label>
              <textarea
                rows={2}
                value={scorecardData.remarks}
                onChange={(e) => setScorecardData({ ...scorecardData, remarks: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200"
                placeholder="Candidate aptitude, behavior, and academic recommendations..."
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t">
              <button
                type="button"
                onClick={() => setSelectedApplicantForScorecard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Record Evaluation Scorecard
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Admission Offer Letter Modal (Printable) */}
      {selectedApplicantForOffer && (
        <Modal
          isOpen={Boolean(selectedApplicantForOffer)}
          onClose={() => setSelectedApplicantForOffer(null)}
          title="Official Admission Acceptance & Offer Letter"
        >
          <div className="space-y-4">
            <div 
              id="printable-offer-letter"
              className="p-8 bg-white border-2 border-slate-300 rounded-2xl space-y-5 print:border-black print:p-10"
            >
              {/* Letterhead */}
              <div className="text-center border-b pb-4">
                <School className="w-10 h-10 text-teal-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
                  {institutes[0]?.name || 'CENTRAL HIGH SCHOOL'}
                </h2>
                <p className="text-xs text-slate-500">Office of Admissions & Student Enrollment</p>
                <div className="mt-2 inline-block px-3 py-1 bg-teal-50 border border-teal-200 rounded text-xs font-bold uppercase tracking-widest text-teal-900">
                  OFFICIAL ADMISSION OFFER & FEE INTIMATION
                </div>
              </div>

              {/* Offer Body */}
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
                <p>
                  Date: <strong className="font-mono">{new Date().toISOString().split('T')[0]}</strong>
                </p>
                <p>
                  To: <strong>Mr. / Mrs. {selectedApplicantForOffer.parentName || 'Parent / Guardian'}</strong><br />
                  Guardian of: <strong className="text-teal-950 font-bold">{selectedApplicantForOffer.studentName}</strong><br />
                  Phone: <span className="font-mono">{selectedApplicantForOffer.parentPhone}</span>
                </p>
                <p>
                  Dear Guardian,
                </p>
                <p>
                  We are pleased to inform you that upon evaluation of the Entrance Examination and Academic Interview, your ward <strong className="text-slate-950">{selectedApplicantForOffer.studentName}</strong> has been granted provisional admission to <strong>{selectedApplicantForOffer.gradeApplied}</strong> for the upcoming academic session.
                </p>
                
                <div className="p-3 bg-slate-50 rounded-lg border text-xs grid grid-cols-2 gap-2">
                  <div><span>Provisional Admission ID:</span> <strong className="font-mono text-teal-800">ADM-{selectedApplicantForOffer.id || '2026'}</strong></div>
                  <div><span>Entrance Result:</span> <strong className="text-emerald-700">{selectedApplicantForOffer.scorecard?.percentage || 'Passed (83%)'}</strong></div>
                  <div><span>Enrolling Class:</span> <strong>{selectedApplicantForOffer.gradeApplied}</strong></div>
                  <div><span>Fee Deposit Due Date:</span> <strong className="text-rose-600 font-mono">Within 7 Working Days</strong></div>
                </div>

                <p>
                  Please submit the following original credentials along with the admission fee deposit slip at the campus accounts counter to finalize registration:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                  <li>Original School Leaving Certificate (SLC) from previous institution</li>
                  <li>Copy of Student NADRA B-Form / Birth Certificate</li>
                  <li>4 passport-sized photographs with blue background</li>
                  <li>Copy of Father / Guardian CNIC</li>
                </ul>

                <p className="pt-2">
                  We look forward to welcoming {selectedApplicantForOffer.studentName} into our academic family.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between text-xs text-slate-500 border-t">
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Incharge Admissions</span>
                </div>
                <div>
                  <div className="w-32 border-b border-slate-400 mb-1"></div>
                  <span>Accounts Officer</span>
                </div>
                <div className="text-right">
                  <div className="w-36 border-b-2 border-teal-700 mb-1 ml-auto"></div>
                  <strong className="text-slate-800">Principal Seal & Signature</strong>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedApplicantForOffer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Offer Letter (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdmissionsPipelineView
