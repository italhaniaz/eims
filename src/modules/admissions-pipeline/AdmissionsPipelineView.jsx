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
  Download
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const AdmissionsPipelineView = () => {
  const { admissionsPipeline = [], addItem, updateItem, deleteItem, students = [] } = useAppData()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

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

    const headers = ['Applicant Name', 'Parent Name', 'Phone', 'Grade Applied', 'Current Stage', 'Status', 'Test Date']
    const rows = filtered.map(a => [
      `"${a.studentName || ''}"`,
      `"${a.parentName || ''}"`,
      `"${a.parentPhone || ''}"`,
      `"${a.gradeApplied || ''}"`,
      `"${a.stage || ''}"`,
      `"${a.status || ''}"`,
      `"${a.testDate || ''}"`
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
          <p className="text-xs text-slate-500 mt-1">Track prospective student inquiries, advance through entrance stages, and 1-click enroll</p>
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

      {/* Stage Flow Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        {stages.map((stg, idx) => {
          const count = admissionsPipeline.filter(a => a.stage === stg).length
          return (
            <div key={stg} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 0{idx + 1}</span>
              <p className="font-bold text-slate-800 mt-1 leading-snug">{stg}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-black text-teal-700">{count}</span>
                <span className="text-[10px] text-slate-400 font-medium">Applicants</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate name, parent phone, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <span className="text-xs text-slate-500 font-semibold bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg whitespace-nowrap">
          Total Inquiries: {filtered.length}
        </span>
      </div>

      {/* Pipeline Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
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
                  {app.assignedRollNumber && (
                    <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold mt-1">
                      Assigned Roll: {app.assignedRollNumber}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {app.stage !== 'Enrolled & Admitted' ? (
                  <button
                    onClick={() => handleAdvanceStage(app)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Advance Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : !app.transferredToRoster ? (
                  <button
                    onClick={() => handleConvertToStudent(app)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    title="1-Click Convert to Enrolled Student"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Enroll to Roster</span>
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled in Roster
                  </span>
                )}

                <button 
                  onClick={() => handleDelete(app.id, app.studentName)} 
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                  title="Delete Inquiry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                placeholder="e.g. Tariq Mehmood"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="+92 3XX-XXXXXXX"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Entrance Test Date</label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow cursor-pointer"
            >
              Register Inquiry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdmissionsPipelineView
