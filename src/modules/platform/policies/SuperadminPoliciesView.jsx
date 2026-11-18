import React, { useState } from 'react'
import {
  ShieldCheck,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  Lock,
  Share2,
  Users,
  Plus
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

const STORAGE_KEY = 'sms_platform_policies_v1'

const CATEGORY_OPTIONS = [
  { key: 'academic', label: 'Academic Policies' },
  { key: 'fees', label: 'Fee & Refund Policies' },
  { key: 'attendance', label: 'Attendance & Leave Policies' },
  { key: 'discipline', label: 'Discipline & Code of Conduct' },
  { key: 'privacy', label: 'Data Privacy & Child Safety' }
]

const CATEGORY_KEYS = CATEGORY_OPTIONS.map((item) => item.key)

const SEED_POLICIES = [
  {
    id: 'POL-ACAD-01',
    title: 'Uniform Academic Progression & Promotion Policy',
    category: 'academic',
    version: 'v3.2',
    effectiveDate: '2026-08-01',
    status: 'Published (Enforced)',
    target: 'All Wings',
    summary: 'Sets a single academic progression and promotion standard for every wing.',
    fullText: ''
  },
  {
    id: 'POL-FEE-02',
    title: 'Fee Refund, Security Deposit & Waiver Directive',
    category: 'fees',
    version: 'v2.8',
    effectiveDate: '2026-07-15',
    status: 'Published (Enforced)',
    target: 'All Campuses',
    summary: 'Governs fee refunds, security deposits, and waiver decisions across campuses.',
    fullText: ''
  },
  {
    id: 'POL-SAFE-03',
    title: 'Child Protection, Anti-Bullying & Digital Safety Code',
    category: 'privacy',
    version: 'v4.0',
    effectiveDate: '2026-09-01',
    status: 'Published (Enforced)',
    target: 'Students, Staff & Parents',
    summary: 'Requires child protection, anti-bullying, and digital safety practices for students, staff, and parents.',
    fullText: ''
  },
  {
    id: 'POL-DISC-04',
    title: 'Campus Code of Conduct & Electronic Device Protocol',
    category: 'discipline',
    version: 'v2.1',
    effectiveDate: '2026-08-15',
    status: 'Published (Enforced)',
    target: 'Senior & Secondary Wings',
    summary: 'Defines the campus code of conduct and electronic device rules for senior and secondary wings.',
    fullText: ''
  },
  {
    id: 'POL-AC-01',
    title: 'Minimum Examination Eligibility Attendance Threshold',
    category: 'academic',
    version: 'v3.2',
    effectiveDate: '2026-08-01',
    status: 'Published',
    target: 'All School Wings',
    summary: 'Students must maintain minimum 75% verified biometric attendance in every registered subject to sit for annual School / Board examinations.',
    fullText: ''
  },
  {
    id: 'POL-AC-02',
    title: 'Grading Curve & Relative Normalization Directive',
    category: 'academic',
    version: 'v2.0',
    effectiveDate: '2026-08-01',
    status: 'Published',
    target: 'Middle & Secondary Wings',
    summary: 'Standardized grading curve guidelines to ensure parity across school branches and matric/O-level sections.',
    fullText: ''
  },
  {
    id: 'POL-FE-01',
    title: 'Withdrawal & Security Deposit Refund Schedule',
    category: 'fees',
    version: 'v2.4',
    effectiveDate: '2026-07-15',
    status: 'Published',
    target: 'All Campuses',
    summary: 'Advance security deposit refundable within 30 days of issuance of formal School Leaving Certificate (SLC).',
    fullText: ''
  },
  {
    id: 'POL-FE-02',
    title: 'Hardship Concession & Sibling Discount Governance',
    category: 'fees',
    version: 'v1.9',
    effectiveDate: '2026-07-15',
    status: 'Published',
    target: 'School Wing',
    summary: 'Sibling discounts apply automatically at 25% for 2nd enrolled child and 50% for 3rd enrolled child.',
    fullText: ''
  },
  {
    id: 'POL-AT-01',
    title: 'Unexcused Absence (AWOL) & Strike-Off Policy',
    category: 'attendance',
    version: 'v3.0',
    effectiveDate: '2026-08-01',
    status: 'Published',
    target: 'All Campuses',
    summary: 'Absence of 6 consecutive days without written parent notice results in formal strike-off notice from campus register.',
    fullText: ''
  },
  {
    id: 'POL-AT-02',
    title: 'Faculty Biometric Verification & Duty Leave Norms',
    category: 'attendance',
    version: 'v2.1',
    effectiveDate: '2026-08-01',
    status: 'Published',
    target: 'Staff & Faculty',
    summary: 'Daily thumbprint/face scan required prior to 08:15 AM PKT. Three late arrivals equivalent to half-day casual leave.',
    fullText: ''
  },
  {
    id: 'POL-DS-01',
    title: 'Zero-Tolerance Anti-Bullying & Cyber Safety Code',
    category: 'discipline',
    version: 'v4.0',
    effectiveDate: '2026-09-01',
    status: 'Published',
    target: 'All Campuses',
    summary: 'Strict prohibition of physical or digital harassment. Immediate referral to central disciplinary hearing committee.',
    fullText: ''
  },
  {
    id: 'POL-DS-02',
    title: 'Examination Hall Integrity & Malpractice Sanctions',
    category: 'discipline',
    version: 'v2.8',
    effectiveDate: '2026-08-15',
    status: 'Published',
    target: 'Middle & Secondary Wings',
    summary: 'Possession of unauthorized electronic devices during examination results in paper cancellation and board debarment.',
    fullText: ''
  },
  {
    id: 'POL-PR-01',
    title: 'Child Data Protection & Biometric Minimization Policy',
    category: 'privacy',
    version: 'v3.1',
    effectiveDate: '2026-09-01',
    status: 'Published',
    target: 'GDPR / PECRA Aligned',
    summary: 'All facial recognition and biometric scan templates encrypted with AES-256 at rest. Never shared with third parties.',
    fullText: ''
  },
  {
    id: 'POL-PR-02',
    title: 'Student Media & Online Publication Consent Guidelines',
    category: 'privacy',
    version: 'v2.0',
    effectiveDate: '2026-08-01',
    status: 'Published',
    target: 'Parental Consent Required',
    summary: 'Annual parental media release agreement mandatory prior to publishing student images in prospectuses or digital portals.',
    fullText: ''
  }
]

const cloneSeeds = () => SEED_POLICIES.map((policy) => ({ ...policy }))

const mergeWithSeeds = (stored) => {
  const list = Array.isArray(stored) ? stored.filter((item) => item && item.id) : []
  const byId = new Map(SEED_POLICIES.map((seed) => [seed.id, { ...seed }]))
  list.forEach((item) => {
    const previous = byId.get(item.id)
    byId.set(item.id, previous ? { ...previous, ...item } : { ...item })
  })
  const seedIds = new Set(SEED_POLICIES.map((seed) => seed.id))
  const mergedSeeds = SEED_POLICIES.map((seed) => byId.get(seed.id))
  const extras = list.filter((item) => !seedIds.has(item.id))
  return [...mergedSeeds, ...extras]
}

const loadPolicies = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneSeeds()
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length === 0) return cloneSeeds()
    return mergeWithSeeds(parsed)
  } catch {
    return cloneSeeds()
  }
}

const categoryLabel = (key) => CATEGORY_OPTIONS.find((item) => item.key === key)?.label || 'General'

const categoryForTab = (tab) => (CATEGORY_KEYS.includes(tab) ? tab : 'academic')

const blankDraft = (category) => ({
  id: '',
  title: '',
  category: categoryForTab(category),
  version: 'v1.0',
  target: '',
  summary: '',
  fullText: '',
  status: 'Draft',
  effectiveDate: new Date().toISOString().slice(0, 10)
})

const statusBadgeClass = (status) =>
  /draft/i.test(status || '')
    ? 'bg-slate-200 text-slate-700'
    : 'bg-emerald-100 text-emerald-800'

const fieldClass =
  'w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500'

export const SuperadminPoliciesView = ({ activeTab = 'academic', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'academic'
  const [policies, setPolicies] = useState(() => loadPolicies())
  const [editor, setEditor] = useState(null)

  const acknowledgments = [
    { group: 'Teaching Faculty & HODs', total: 171, signed: 168, rate: '98.2%', status: 'Compliant' },
    { group: 'Administrative Staff', total: 64, signed: 62, rate: '96.8%', status: 'Compliant' },
    { group: 'Enrolled Parents (Digital App Sign-off)', total: 3420, signed: 3180, rate: '93.0%', status: 'In Progress' }
  ]

  const tabsConfig = [
    { key: 'academic', label: 'Academic Policies', icon: FileText },
    { key: 'fees', label: 'Fee & Refund Policies', icon: DollarSign },
    { key: 'attendance', label: 'Attendance & Leave Policies', icon: Clock },
    { key: 'discipline', label: 'Discipline & Code of Conduct', icon: AlertTriangle },
    { key: 'privacy', label: 'Data Privacy & Child Safety', icon: Lock },
    { key: 'publish', label: 'Policy Versions & Publish', icon: Share2 },
    { key: 'acknowledgment', label: 'Acknowledgment Tracking', icon: Users }
  ]

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  const openCreate = () => {
    setEditor({ mode: 'create', draft: blankDraft(effectiveTab) })
  }

  const openView = (policy) => {
    setEditor({ mode: 'view', draft: { ...blankDraft(policy.category), ...policy } })
  }

  const openEdit = (policy) => {
    const status = /draft/i.test(policy.status || '') ? 'Draft' : 'Published'
    setEditor({
      mode: 'edit',
      draft: {
        ...blankDraft(policy.category),
        ...policy,
        category: categoryForTab(policy.category),
        version: policy.version || 'v1.0',
        target: policy.target || '',
        summary: policy.summary || '',
        fullText: policy.fullText || '',
        status
      }
    })
  }

  const updateDraft = (patch) => {
    setEditor((prev) => (prev ? { ...prev, draft: { ...prev.draft, ...patch } } : prev))
  }

  const handleSave = () => {
    if (!editor || editor.mode === 'view') return
    const draft = editor.draft
    const title = String(draft.title || '').trim()
    if (!title) {
      toast.error('Enter a policy title before saving.')
      return
    }

    const record = {
      id: draft.id,
      title,
      category: categoryForTab(draft.category),
      version: String(draft.version || '').trim() || 'v1.0',
      target: String(draft.target || '').trim() || 'All Campuses',
      summary: String(draft.summary || '').trim(),
      fullText: String(draft.fullText || '').trim(),
      status: draft.status === 'Published' ? 'Published' : 'Draft',
      effectiveDate: draft.effectiveDate || new Date().toISOString().slice(0, 10)
    }

    let next
    if (editor.mode === 'edit' && record.id) {
      next = policies.map((policy) => (policy.id === record.id ? { ...policy, ...record } : policy))
    } else {
      const prefix = { academic: 'AC', fees: 'FE', attendance: 'AT', discipline: 'DS', privacy: 'PR' }[record.category] || 'GN'
      record.id = `POL-${prefix}-${Date.now().toString(36).toUpperCase()}`
      next = [...policies, record]
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      toast.error('Could not save the policy on this device.')
      return
    }

    setPolicies(next)
    setEditor(null)
    toast.success('Policy draft saved locally on this device.')
  }

  const categoryPolicies = policies.filter((policy) => policy.category === effectiveTab)
  const draft = editor?.draft

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Legal & Policy Custodian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Policies & Governance Codes
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Formulate, version-control, and mandate digital policy sign-offs across all campus leadership, faculty, and student bodies.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Draft New Policy</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active
                    ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {effectiveTab === 'publish' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Active Policy Registry & Version Control</h3>
            <p className="text-xs text-slate-500">Saved on this device and merged with the built-in policy seeds</p>
          </div>
          <div className="divide-y divide-slate-100">
            {policies.map(p => (
              <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">{p.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">{p.version}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Category: <b>{categoryLabel(p.category)}</b> &bull; Scope: <b>{p.target || 'All Campuses'}</b>
                    {p.effectiveDate ? <> &bull; Effective Since: {p.effectiveDate}</> : null}
                  </p>
                </div>
                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => openView(p)}
                    className="text-purple-700 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Read
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-slate-600 text-xs font-bold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadgeClass(p.status)}`}>
                    {p.status || 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {effectiveTab === 'acknowledgment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Digital Policy Acknowledgment Index</h3>
          <p className="text-xs text-slate-500">Tracks digital signatures affirming code of conduct and safety guidelines</p>
          <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs text-purple-900 leading-relaxed">
            Live acknowledgment sync requires future database integration. The figures on this tab are display data only and do not update from campus sign-offs.
          </div>
          <div className="space-y-4 pt-2">
            {acknowledgments.map((a, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>{a.group}</span>
                  <span className="text-purple-700">{a.rate} ({a.signed} / {a.total} Signed)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: a.rate }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {CATEGORY_KEYS.includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base capitalize">{effectiveTab} Official Directive Suite</h3>
              <p className="text-xs text-slate-500">Standard operating policies active across all affiliated campus branches.</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Policy Revision</span>
            </button>
          </div>

          <div className="space-y-4">
            {categoryPolicies.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500 rounded-xl border border-dashed border-slate-200">
                No directives in this category yet. Use Draft Policy Revision to store one on this device.
              </div>
            ) : categoryPolicies.map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{pol.id}</span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{pol.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">{pol.version}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{pol.target}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusBadgeClass(pol.status)}`}>{pol.status || 'Draft'}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pol.summary}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Enforcement: Immediate &bull; Legally Binding</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openView(pol)}
                      className="text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      Read Full Directive
                    </button>
                    &bull;
                    <button
                      type="button"
                      onClick={() => openEdit(pol)}
                      className="text-slate-600 font-bold hover:underline cursor-pointer"
                    >
                      Edit Directive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={Boolean(editor)}
        onClose={() => setEditor(null)}
        title={editor?.mode === 'view' ? 'Full Directive' : editor?.mode === 'edit' ? 'Edit Directive' : 'Draft New Policy'}
        maxWidth="max-w-lg"
      >
        {draft && editor?.mode === 'view' ? (
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[11px] font-bold text-purple-700">{draft.id}</p>
              <h4 className="text-base font-bold text-slate-900 mt-1">{draft.title}</h4>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">{categoryLabel(draft.category)}</span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">{draft.version}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{draft.target || 'All Campuses'}</span>
              <span className={`px-2 py-0.5 rounded ${statusBadgeClass(draft.status)}`}>{draft.status || 'Draft'}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Summary</p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{draft.summary || 'No summary filed.'}</p>
            </div>
            {draft.fullText ? (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full text</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{draft.fullText}</p>
              </div>
            ) : null}
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : draft ? (
          <form
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault()
              handleSave()
            }}
          >
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Title</span>
              <input
                className={fieldClass}
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                placeholder="Policy title"
              />
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</span>
                <select
                  className={fieldClass}
                  value={categoryForTab(draft.category)}
                  onChange={(event) => updateDraft({ category: event.target.value })}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.key} value={option.key}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Version</span>
                <input
                  className={fieldClass}
                  value={draft.version}
                  onChange={(event) => updateDraft({ version: event.target.value })}
                  placeholder="v1.0"
                />
              </label>
            </div>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Scope / target</span>
              <input
                className={fieldClass}
                value={draft.target}
                onChange={(event) => updateDraft({ target: event.target.value })}
                placeholder="All Campuses"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Summary</span>
              <textarea
                className={`${fieldClass} min-h-20`}
                value={draft.summary}
                onChange={(event) => updateDraft({ summary: event.target.value })}
                placeholder="Short directive summary"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Full text</span>
              <textarea
                className={`${fieldClass} min-h-28`}
                value={draft.fullText}
                onChange={(event) => updateDraft({ fullText: event.target.value })}
                placeholder="Optional full directive text"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
              <select
                className={fieldClass}
                value={draft.status === 'Published' ? 'Published' : 'Draft'}
                onChange={(event) => updateDraft({ status: event.target.value })}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditor(null)}
                className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save policy
              </button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  )
}

export default SuperadminPoliciesView
