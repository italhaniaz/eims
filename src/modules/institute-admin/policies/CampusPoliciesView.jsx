import React, { useState, useMemo, useEffect } from 'react'
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  Printer,
  Edit3,
  ShieldCheck,
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

const getStorageKey = (instId) => `eims_school_policies_${instId || 'default'}`

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

export const CampusPoliciesView = ({ currentInstitute }) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'default'

  const [policies, setPolicies] = useState(() => loadPolicies(instId))
  const [selectedCategory, setSelectedCategory] = useState('All Categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [previewPolicy, setPreviewPolicy] = useState(null)

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
  }, [instId])

  const savePolicies = (next) => {
    setPolicies(next)
    try {
      localStorage.setItem(getStorageKey(instId), JSON.stringify(next))
    } catch (_) {}
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

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] font-heading flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Policies &amp; Guidelines</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Publish and govern school handbooks, fee policies, attendance rules, and student code of conduct for {currentInstitute?.name || 'your campus'}.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Policy Document</span>
        </button>
      </div>

      {/* Filters */}
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

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-2xl p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-[var(--text)]">No School Policies Published</h3>
          <p className="text-xs text-[var(--text-muted)] mt-1 max-w-md mx-auto">
            Add official school rules such as attendance requirements, late fee policies, examination conduct, or campus safety SOPs.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
          >
            + Add First Policy
          </button>
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
                    onClick={() => setPreviewPolicy(policy)}
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

      {/* Create / Edit Modal */}
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

      {/* Preview Modal */}
      {previewPolicy && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white text-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  {currentInstitute?.name || 'School Campus'} • {previewPolicy.category}
                </p>
                <h2 className="text-lg font-bold mt-1">{previewPolicy.title}</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Version {previewPolicy.version} • Effective {previewPolicy.effectiveDate} • Audience: {previewPolicy.audience}
                </p>
              </div>
              <button type="button" onClick={() => setPreviewPolicy(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm leading-relaxed text-slate-700 whitespace-pre-line max-h-80 overflow-y-auto">
              {previewPolicy.content}
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
