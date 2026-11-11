import React, { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Printer,
  Edit3,
  ShieldCheck,
  Users,
  UserCheck,
  GraduationCap,
  Download,
  X
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

const POLICY_CATEGORIES = [
  'All Categories',
  'Academic & Promotion',
  'Attendance & Leave',
  'Fees & Fine Rules',
  'Student Conduct & Discipline',
  'Safety & Child Protection'
]

const DEFAULT_ROLE_GUIDELINES = [
  {
    id: 'guide-teacher',
    roleKey: 'Teacher Guidelines',
    subtitle: 'Guidelines for teachers including punctuality, leave policy, and responsibilities.',
    status: 'Active',
    accent: 'sky',
    content: '1. Teachers must arrive at least 15 minutes before morning assembly.\n2. Daily lesson plans and attendance registers must be submitted on time.\n3. Prior leave approval with substitute proxy assignment is mandatory.'
  },
  {
    id: 'guide-student',
    roleKey: 'Student Guidelines',
    subtitle: 'Guidelines for students including discipline, attendance, and behavior.',
    status: 'Active',
    accent: 'teal',
    content: '1. Minimum 75% attendance is required for term examination eligibility.\n2. Complete school uniform and valid Student ID card are mandatory on campus.\n3. Respectful conduct towards faculty, peers, and school property is expected.'
  },
  {
    id: 'guide-parent',
    roleKey: 'Parent Guidelines',
    subtitle: 'Guidelines for parents including fee payment, meetings, and communication.',
    status: 'Active',
    accent: 'emerald',
    content: '1. Monthly fee challans should be cleared before the due date to avoid late fee surcharges.\n2. Attendance at scheduled Parent-Teacher Meetings (PTMs) is strongly encouraged.\n3. Contact the school office in advance for early leave or gate pass requests.'
  }
]

const getStorageKey = (instId) => `eims_school_policies_${instId || 'default'}`
const getRoleGuidelinesKey = (instId) => `eims_role_guidelines_${instId || 'default'}`

const loadPolicies = (instId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(instId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (_) {}
  return []
}

const loadRoleGuidelines = (instId) => {
  try {
    const raw = localStorage.getItem(getRoleGuidelinesKey(instId))
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}
  return DEFAULT_ROLE_GUIDELINES
}

export const CampusPoliciesView = ({ currentInstitute }) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'default'

  const [roleGuidelines, setRoleGuidelines] = useState(() => loadRoleGuidelines(instId))
  const [editingGuideline, setEditingGuideline] = useState(null)

  const [policies, setPolicies] = useState(() => loadPolicies(instId))
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [previewDoc, setPreviewDoc] = useState(null)

  const [form, setForm] = useState({
    title: '',
    category: 'Academic & Promotion',
    version: 'v1.0',
    effectiveDate: new Date().toISOString().split('T')[0],
    audience: 'Students, Parents & Faculty',
    content: '',
    status: 'Published'
  })

  useEffect(() => {
    setPolicies(loadPolicies(instId))
    setRoleGuidelines(loadRoleGuidelines(instId))
  }, [instId])

  const savePolicies = (next) => {
    setPolicies(next)
    try {
      localStorage.setItem(getStorageKey(instId), JSON.stringify(next))
    } catch (_) {}
  }

  const saveGuidelines = (next) => {
    setRoleGuidelines(next)
    try {
      localStorage.setItem(getRoleGuidelinesKey(instId), JSON.stringify(next))
    } catch (_) {}
  }

  const handleSaveGuideline = (e) => {
    e.preventDefault()
    if (!editingGuideline) return
    saveGuidelines(
      roleGuidelines.map(g => (g.id === editingGuideline.id ? editingGuideline : g))
    )
    toast.success(`${editingGuideline.roleKey} updated.`)
    setEditingGuideline(null)
  }

  const handleDownloadText = (title, body) => {
    const content = `${currentInstitute?.name || 'School Campus'}\n${title}\n${'='.repeat(40)}\n\n${body}\n`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Downloaded "${title}".`)
  }

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return policies.filter(p => {
      if (selectedCategory !== 'All Categories' && p.category !== selectedCategory) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q)
      )
    })
  }, [policies, selectedCategory, searchQuery])

  const openCreateModal = () => {
    setEditingPolicy(null)
    setForm({
      title: '',
      category: 'Academic & Promotion',
      version: 'v1.0',
      effectiveDate: new Date().toISOString().split('T')[0],
      audience: 'Students, Parents & Faculty',
      content: '',
      status: 'Published'
    })
    setShowModal(true)
  }

  const openEditModal = (policy) => {
    setEditingPolicy(policy)
    setForm({
      title: policy.title,
      category: policy.category,
      version: policy.version,
      effectiveDate: policy.effectiveDate,
      audience: policy.audience,
      content: policy.content,
      status: policy.status
    })
    setShowModal(true)
  }

  const handleSavePolicy = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Policy title and guidelines text are required.')
      return
    }
    if (editingPolicy) {
      const updated = policies.map(p =>
        p.id === editingPolicy.id
          ? { ...p, ...form, title: form.title.trim(), content: form.content.trim(), updatedAt: new Date().toISOString() }
          : p
      )
      savePolicies(updated)
      toast.success('School policy updated.')
    } else {
      const created = {
        id: `pol-${Date.now()}`,
        ...form,
        title: form.title.trim(),
        content: form.content.trim(),
        createdAt: new Date().toISOString()
      }
      savePolicies([created, ...policies])
      toast.success('New school policy saved.')
    }
    setShowModal(false)
  }

  const handleToggleStatus = (id) => {
    savePolicies(
      policies.map(p =>
        p.id === id ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p
      )
    )
    toast.success('Policy status updated.')
  }

  const handleDelete = (id) => {
    savePolicies(policies.filter(p => p.id !== id))
    toast.success('Policy removed.')
  }

  const guidelineCardStyles = {
    sky: {
      border: 'border-sky-300',
      icon: 'text-sky-600',
      btn: 'bg-sky-500 hover:bg-sky-600 text-white',
      outline: 'border-sky-300 text-sky-600 hover:bg-sky-50'
    },
    teal: {
      border: 'border-teal-300',
      icon: 'text-teal-600',
      btn: 'bg-teal-500 hover:bg-teal-600 text-white',
      outline: 'border-teal-300 text-teal-600 hover:bg-teal-50'
    },
    emerald: {
      border: 'border-emerald-400',
      icon: 'text-emerald-600',
      btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      outline: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Policies &amp; Guidelines</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Institute policies and guidelines for teachers, students, and parents at {currentInstitute?.name || 'your campus'}.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Custom Policy</span>
        </button>
      </div>

      {/* Institute Policies & Guidelines Trio Panel */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-soft">
        <div className="bg-sky-600 text-white px-5 py-3.5 flex items-center gap-2 font-semibold text-sm">
          <FileText className="w-4 h-4" />
          <span>Institute Policies &amp; Guidelines</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roleGuidelines.map((guide, index) => {
              const st = guidelineCardStyles[guide.accent] || guidelineCardStyles.emerald
              const Icon = index === 0 ? UserCheck : index === 1 ? Users : GraduationCap
              return (
                <div key={guide.id} className={`rounded-xl border-2 ${st.border} bg-[var(--surface)] p-5 flex flex-col justify-between gap-4`}>
                  <div>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-7 h-7 ${st.icon} shrink-0 mt-0.5`} />
                      <div>
                        <h3 className="text-base font-bold text-[var(--text)]">{guide.roleKey}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold">
                          {guide.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
                      {guide.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingGuideline({ ...guide })}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${st.btn}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc({ title: guide.roleKey, category: 'Institute Guidelines', content: guide.content, subtitle: guide.subtitle })}
                      className={`p-2 rounded-lg border cursor-pointer ${st.outline}`}
                      title="Print Guideline"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadText(guide.roleKey, guide.content)}
                      className={`p-2 rounded-lg border cursor-pointer ${st.outline}`}
                      title="Download Guideline"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="rounded-xl bg-sky-50 border border-sky-200 px-4 py-3 text-xs text-sky-900">
            <strong className="block mb-0.5">About Policies &amp; Guidelines</strong>
            These policies can be edited, printed, and shared with teachers, students, and parents. They can be attached to appointment letters, admission forms, and welcome cards.
          </div>
        </div>
      </div>

      {/* Filters for Custom Policy Documents */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {POLICY_CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 text-[var(--text-muted)] hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search policies..."
            className="pl-9 pr-3.5 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)] w-full md:w-56"
          />
        </div>
      </div>

      {/* Custom Policies List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-8 text-center">
          <ShieldCheck className="w-9 h-9 text-slate-300 mx-auto mb-2.5" />
          <h3 className="text-sm font-semibold text-[var(--text)]">No Custom School Policies Added</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            Click &ldquo;Create Custom Policy&rdquo; to publish additional campus circulars, fee rules, or examination SOPs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(policy => (
            <div key={policy.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-soft flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                      {policy.category}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text)] mt-2">{policy.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(policy.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                      policy.status === 'Published'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {policy.status}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-2.5 line-clamp-3 whitespace-pre-line">
                  {policy.content}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--text-muted)]">
                <div>
                  <span>{policy.version}</span> • <span>Effective {policy.effectiveDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc({ title: policy.title, category: policy.category, content: policy.content, subtitle: `Version ${policy.version} • Effective ${policy.effectiveDate}` })}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
                    title="Preview / Print"
                  >
                    <Printer className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(policy)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-emerald-700 cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(policy.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-500 hover:text-rose-600 cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Role Guideline Modal */}
      {editingGuideline && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">Edit {editingGuideline.roleKey}</h2>
              <button type="button" onClick={() => setEditingGuideline(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveGuideline} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Summary</label>
                <input
                  type="text"
                  required
                  value={editingGuideline.subtitle}
                  onChange={(e) => setEditingGuideline({ ...editingGuideline, subtitle: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Status</label>
                <select
                  value={editingGuideline.status}
                  onChange={(e) => setEditingGuideline({ ...editingGuideline, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                >
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Full Guidelines Clauses</label>
                <textarea
                  rows="6"
                  required
                  value={editingGuideline.content}
                  onChange={(e) => setEditingGuideline({ ...editingGuideline, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingGuideline(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer">
                  Save Guidelines
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create / Edit Custom Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[var(--text)]">
                {editingPolicy ? 'Edit Policy Document' : 'Create School Policy'}
              </h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSavePolicy} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Policy Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Monthly Tuition Fee & Late Surcharge Policy"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  >
                    {POLICY_CATEGORIES.filter(c => c !== 'All Categories').map(c => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Effective Date</label>
                  <input
                    type="date"
                    value={form.effectiveDate}
                    onChange={(e) => setForm({ ...form, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Target Audience</label>
                  <input
                    type="text"
                    value={form.audience}
                    onChange={(e) => setForm({ ...form, audience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Version &amp; Status</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.version}
                      onChange={(e) => setForm({ ...form, version: e.target.value })}
                      className="w-20 px-2.5 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                    />
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="flex-1 px-2.5 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                    >
                      <option>Published</option>
                      <option>Draft</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Policy Guidelines &amp; Clauses *</label>
                <textarea
                  rows="5"
                  required
                  placeholder="Write detailed school policy clauses..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] text-sm bg-[var(--surface)] text-[var(--text)]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer">
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview / Print Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {currentInstitute?.name || 'School Campus'} • {previewDoc.category}
                </p>
                <h2 className="text-lg font-bold mt-1">{previewDoc.title}</h2>
                {previewDoc.subtitle && <p className="text-xs text-slate-500 mt-0.5">{previewDoc.subtitle}</p>}
              </div>
              <button type="button" onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line max-h-80 overflow-y-auto">
              {previewDoc.content}
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusPoliciesView
