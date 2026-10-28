import React, { useState, useEffect, useMemo } from 'react'
import {
  FileSpreadsheet,
  Award,
  DollarSign,
  Briefcase,
  BookOpen,
  Send,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Search,
  Filter,
  Check,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { TemplatesService } from '../../../services/templatesService'
import { DataService, getStoredData } from '../../../services/dataService'

const GlobalTemplatesView = () => {
  const [activeTab, setActiveTab] = useState('GRADING_SYSTEM') // 'GRADING_SYSTEM', 'FEE_HEAD', 'DESIGNATION', 'SUBJECT_TEMPLATE'
  const [templates, setTemplates] = useState([])
  const [institutes, setInstitutes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Push Template Modal
  const [isPushModalOpen, setIsPushModalOpen] = useState(false)
  const [templateToPush, setTemplateToPush] = useState(null)
  const [selectedInstituteIds, setSelectedInstituteIds] = useState([])
  const [isPushing, setIsPushing] = useState(false)

  // Edit / Create Template Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({
    title: '',
    code: '',
    description: '',
    templateType: 'GRADING_SYSTEM',
    isDefault: false,
    data: []
  })

  // Delete Template Confirmation
  const [templateToDelete, setTemplateToDelete] = useState(null)

  // Toast
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadAllTemplates()
  }, [])

  const loadAllTemplates = async () => {
    setLoading(true)
    try {
      const tpls = await TemplatesService.getTemplates()
      setTemplates(tpls)

      // Load institutes for the push target selector
      const store = getStoredData()
      const insts = store.institutes || []
      const defaultInsts = [
        { id: 'c1000000-0000-0000-0000-000000000001', name: 'Beaconhouse Central High School', code: 'BHS-001', city: 'Lahore' },
        { id: 'c1000000-0000-0000-0000-000000000002', name: 'City School Model Town Campus', code: 'CSM-002', city: 'Lahore' },
        { id: 'c1000000-0000-0000-0000-000000000003', name: 'Roots International Academy', code: 'RIA-003', city: 'Islamabad' }
      ]
      setInstitutes(insts.length > 0 ? insts : defaultInsts)
    } catch (err) {
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 4000)
  }

  // --- Push Template Handlers ---
  const handleOpenPushModal = (tpl) => {
    setTemplateToPush(tpl)
    // By default select all institutes
    setSelectedInstituteIds(institutes.map(i => i.id))
    setIsPushModalOpen(true)
  }

  const handleToggleInstituteSelect = (instId) => {
    if (selectedInstituteIds.includes(instId)) {
      setSelectedInstituteIds(selectedInstituteIds.filter(id => id !== instId))
    } else {
      setSelectedInstituteIds([...selectedInstituteIds, instId])
    }
  }

  const handleSelectAllInstitutes = () => {
    if (selectedInstituteIds.length === institutes.length) {
      setSelectedInstituteIds([])
    } else {
      setSelectedInstituteIds(institutes.map(i => i.id))
    }
  }

  const handleExecutePush = async () => {
    if (!templateToPush || selectedInstituteIds.length === 0) return
    setIsPushing(true)

    try {
      const res = await TemplatesService.pushTemplateToInstitutes(templateToPush.id, selectedInstituteIds)
      setIsPushModalOpen(false)
      loadAllTemplates()
      showToast(res.message || `Template pushed to ${selectedInstituteIds.length} institute(s).`)
    } catch (err) {
      console.error(err)
    } finally {
      setIsPushing(false)
    }
  }

  // --- Create / Edit Handlers ---
  const handleOpenCreateModal = () => {
    setEditingTemplate(null)
    setTemplateForm({
      title: '',
      code: 'TPL-' + Math.floor(100 + Math.random() * 900),
      description: '',
      templateType: activeTab,
      isDefault: false,
      data: getDefaultItemsForType(activeTab)
    })
    setIsEditModalOpen(true)
  }

  const handleOpenEditModal = (tpl) => {
    setEditingTemplate(tpl)
    setTemplateForm({
      title: tpl.title || '',
      code: tpl.code || '',
      description: tpl.description || '',
      templateType: tpl.templateType || activeTab,
      isDefault: !!tpl.isDefault,
      data: Array.isArray(tpl.data) ? JSON.parse(JSON.stringify(tpl.data)) : []
    })
    setIsEditModalOpen(true)
  }

  const handleSaveTemplate = async (e) => {
    e.preventDefault()
    if (!templateForm.title) return

    const payload = editingTemplate ? { ...templateForm, id: editingTemplate.id } : { ...templateForm }
    await TemplatesService.saveTemplate(payload)
    setIsEditModalOpen(false)
    loadAllTemplates()
    showToast(editingTemplate ? `Template "${templateForm.title}" updated.` : `New master template created.`)
  }

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return
    await TemplatesService.deleteTemplate(templateToDelete.id)
    setTemplateToDelete(null)
    loadAllTemplates()
    showToast(`Template deleted successfully.`)
  }

  const getDefaultItemsForType = (type) => {
    if (type === 'GRADING_SYSTEM') {
      return [
        { grade: 'A', minPercentage: 80, maxPercentage: 100, points: 4.0, remarks: 'Excellent' },
        { grade: 'B', minPercentage: 70, maxPercentage: 79, points: 3.0, remarks: 'Good' },
        { grade: 'C', minPercentage: 60, maxPercentage: 69, points: 2.0, remarks: 'Satisfactory' },
        { grade: 'F', minPercentage: 0, maxPercentage: 59, points: 0.0, remarks: 'Fail' }
      ]
    }
    if (type === 'FEE_HEAD') {
      return [
        { name: 'Standard Monthly Tuition', category: 'Academic', defaultAmount: 15000, refundable: false },
        { name: 'Computer Lab Facility', category: 'Facilities', defaultAmount: 2000, refundable: false }
      ]
    }
    if (type === 'DESIGNATION') {
      return [
        { title: 'Academic Principal', department: 'Management', level: 'Grade 20', role: 'Campus Lead' },
        { title: 'Senior Subject Faculty', department: 'Academics', level: 'Grade 17', role: 'Instructor' }
      ]
    }
    return [
      { name: 'Advanced Mathematics', code: 'MTH-201', credits: 4, category: 'Core Science' },
      { name: 'Applied Physics & Lab', code: 'PHY-201', credits: 4, category: 'Core Science' }
    ]
  }

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchTab = t.templateType === activeTab
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.code && t.code.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchTab && matchSearch
    })
  }, [templates, activeTab, searchQuery])

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading global academic master data & templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-xs text-emerald-700 underline font-medium cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Curriculum & Master Standards</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Global Master Data & Templates
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Standardize grading scales, institutional fee heads, faculty designations, and curriculum subjects across all affiliated campuses with 1-click template push.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Master Template</span>
        </button>
      </div>

      {/* Template Categories Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('GRADING_SYSTEM')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'GRADING_SYSTEM'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Grading Systems</span>
          </button>

          <button
            onClick={() => setActiveTab('FEE_HEAD')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'FEE_HEAD'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fee-Head Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('DESIGNATION')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'DESIGNATION'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Staff Designations</span>
          </button>

          <button
            onClick={() => setActiveTab('SUBJECT_TEMPLATE')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'SUBJECT_TEMPLATE'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Curriculum Subjects</span>
          </button>
        </nav>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search master templates by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredTemplates.length} template(s)
        </span>
      </div>

      {/* Templates List Cards */}
      <div className="space-y-4">
        {filteredTemplates.map((tpl) => (
          <div
            key={tpl.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 transition-all hover:border-slate-300"
          >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-600 flex items-center justify-center shrink-0">
                  {tpl.templateType === 'GRADING_SYSTEM' && <Award className="w-5 h-5" />}
                  {tpl.templateType === 'FEE_HEAD' && <DollarSign className="w-5 h-5" />}
                  {tpl.templateType === 'DESIGNATION' && <Briefcase className="w-5 h-5" />}
                  {tpl.templateType === 'SUBJECT_TEMPLATE' && <BookOpen className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{tpl.title}</h3>
                    {tpl.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f5eeff] text-purple-700 border border-purple-200 uppercase">
                        Default System Matrix
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{tpl.code}</span>
                    <span>Pushed to {tpl.pushedCount || 0} campus(es)</span>
                    {tpl.lastPushedAt && (
                      <span>Last push: {new Date(tpl.lastPushedAt).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  onClick={() => handleOpenPushModal(tpl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                  title="Push this template to selected institutes"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Push to Institutes</span>
                </button>
                <button
                  onClick={() => handleOpenEditModal(tpl)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-purple-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Edit Template"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setTemplateToDelete(tpl)}
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Delete Template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            {tpl.description && (
              <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                {tpl.description}
              </p>
            )}

            {/* Template Data Items Preview */}
            <div className="bg-slate-50/60 rounded-xl p-3 border border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Template Rules & Items ({Array.isArray(tpl.data) ? tpl.data.length : 0})
              </span>

              {/* GRADING_SYSTEM PREVIEW */}
              {tpl.templateType === 'GRADING_SYSTEM' && Array.isArray(tpl.data) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {tpl.data.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-sm font-black text-purple-600 block">{item.grade}</span>
                      <span className="text-xs font-semibold text-slate-800 block">{item.minPercentage}% - {item.maxPercentage}%</span>
                      <span className="text-[10px] text-slate-400 font-mono block">GPA: {item.points}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* FEE_HEAD PREVIEW */}
              {tpl.templateType === 'FEE_HEAD' && Array.isArray(tpl.data) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {tpl.data.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">{item.name}</span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">{item.category}</span>
                      </div>
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        ₨ {Number(item.defaultAmount).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* DESIGNATION PREVIEW */}
              {tpl.templateType === 'DESIGNATION' && Array.isArray(tpl.data) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {tpl.data.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-xs font-bold text-slate-900 block truncate">{item.title}</span>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>{item.department}</span>
                        <span className="font-mono bg-slate-100 px-1 rounded text-slate-700">{item.level}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SUBJECT_TEMPLATE PREVIEW */}
              {tpl.templateType === 'SUBJECT_TEMPLATE' && Array.isArray(tpl.data) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                  {tpl.data.map((item, idx) => (
                    <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] bg-[#f5eeff] text-purple-700 px-1 rounded">{item.code}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{item.credits} Credits</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 block mt-1 truncate">{item.name}</span>
                      <span className="text-[10px] text-slate-500 block">{item.category}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* PUSH TEMPLATE TO INSTITUTES MODAL */}
      <Modal
        isOpen={isPushModalOpen}
        onClose={() => setIsPushModalOpen(false)}
        title={`Push Master Template: ${templateToPush?.title}`}
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#f5eeff] border border-purple-200 rounded-xl text-xs text-purple-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Push Synchronization Notice</span>
              <p>
                Pushing this template will copy and synchronize these master data standards to the selected campus rosters without overwriting existing unique custom data.
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Institutes ({selectedInstituteIds.length} of {institutes.length} selected)
              </label>
              <button
                type="button"
                onClick={handleSelectAllInstitutes}
                className="text-xs text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
              >
                {selectedInstituteIds.length === institutes.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50">
              {institutes.map((inst) => {
                const isSelected = selectedInstituteIds.includes(inst.id)
                return (
                  <label
                    key={inst.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#f5eeff]/80 border-purple-300 text-blue-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleInstituteSelect(inst.id)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <span>{inst.name}</span>
                        <span className="block text-[11px] text-slate-400 font-normal">
                          {inst.code} • {inst.city}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                      Target
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPushModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPushing || selectedInstituteIds.length === 0}
              onClick={handleExecutePush}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              {isPushing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Pushing Standards...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute Push ({selectedInstituteIds.length})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* CREATE / EDIT TEMPLATE MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingTemplate ? `Edit Template: ${editingTemplate.title}` : 'Create Master Template'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSaveTemplate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Template Title</label>
              <input
                type="text"
                required
                value={templateForm.title}
                onChange={(e) => setTemplateForm({ ...templateForm, title: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g. Standard O-Level Scale"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Standard Code</label>
              <input
                type="text"
                value={templateForm.code}
                onChange={(e) => setTemplateForm({ ...templateForm, code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category & Type</label>
            <select
              value={templateForm.templateType}
              onChange={(e) => {
                const t = e.target.value
                setTemplateForm({
                  ...templateForm,
                  templateType: t,
                  data: getDefaultItemsForType(t)
                })
              }}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
            >
              <option value="GRADING_SYSTEM">Grading System & Scale</option>
              <option value="FEE_HEAD">Fee-Head Templates (PKR)</option>
              <option value="DESIGNATION">Institutional Staff Designations</option>
              <option value="SUBJECT_TEMPLATE">Curriculum Subject Matrix</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope & Description</label>
            <textarea
              rows="2"
              value={templateForm.description}
              onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Provide context or guidance on applying this template..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={templateForm.isDefault}
              onChange={(e) => setTemplateForm({ ...templateForm, isDefault: e.target.checked })}
              className="rounded text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isDefault" className="text-xs font-medium text-slate-700">
              Set as Platform Default Matrix for New Institutes
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        title="Delete Master Template"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{templateToDelete?.title}</strong>? This template will no longer be available for global synchronization.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setTemplateToDelete(null)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteTemplate}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default GlobalTemplatesView
