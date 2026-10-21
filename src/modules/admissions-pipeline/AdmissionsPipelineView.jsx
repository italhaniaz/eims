import React, { useState } from 'react'
import { UserCheck, Plus, Search, CheckCircle2, ChevronRight, Phone, Calendar, ArrowRight, Trash2 } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'

export const AdmissionsPipelineView = () => {
  const { admissionsPipeline, addItem, updateItem, deleteItem } = useAppData()
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
    if (!formData.studentName || !formData.parentPhone) return

    await addItem('admissionsPipeline', {
      ...formData,
      status: formData.stage === 'Enrolled & Admitted' ? 'Admitted' : 'In Progress'
    })
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
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this admission inquiry?')) {
      await deleteItem('admissionsPipeline', id)
    }
  }

  const filtered = admissionsPipeline.filter(a =>
    a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (a.parentPhone && a.parentPhone.includes(searchTerm)) ||
    a.gradeApplied.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admissions Inquiry & Leads Pipeline</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Track prospective student inquiries from initial contact to entrance test and enrollment</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Admission Inquiry</span>
        </button>
      </div>

      {/* Stage Flow Indicator */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
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

      {/* Pipeline Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(app => (
            <div key={app.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                    {app.stage}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {app.gradeApplied}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{app.studentName}</h3>
                <p className="text-xs text-slate-500 mt-1">Parent: <strong className="text-slate-700">{app.parentName || 'Guardian'}</strong></p>

                <div className="mt-4 pt-3 border-t border-slate-50 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono">{app.parentPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Test Date: {app.testDate || 'Pending'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {app.stage !== 'Enrolled & Admitted' ? (
                  <button
                    onClick={() => handleAdvanceStage(app)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded transition-colors"
                  >
                    <span>Advance Next Stage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Officially Enrolled
                  </span>
                )}

                <button onClick={() => handleDelete(app.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <UserCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Admissions Inquiries</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No admission inquiries currently in the pipeline. Click "New Admission Inquiry" to register a prospective student applicant.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Inquiry</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record New Prospective Student Admission Inquiry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Applicant Student Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Daniyal Tariq"
                value={formData.studentName}
                onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Applying for Grade</label>
              <input
                type="text"
                required
                placeholder="e.g. 10th Grade (Science)"
                value={formData.gradeApplied}
                onChange={(e) => setFormData({ ...formData, gradeApplied: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent / Guardian Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Tariq Mehmood"
                value={formData.parentName}
                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Parent Contact Mobile</label>
              <input
                type="text"
                required
                placeholder="+92 321 8899001"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Pipeline Stage</label>
              <select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                {stages.map(stg => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Entrance Test Date</label>
              <input
                type="date"
                value={formData.testDate}
                onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-teal-600 rounded-lg font-semibold">Save Inquiry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdmissionsPipelineView
