import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Plus,
  Filter,
  RotateCcw,
  Eye,
  Pencil,
  Trash2,
  PlayCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Megaphone,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { getDistinctInstituteClassNames, isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        New Enrollment
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Add Payment
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
      >
        <Receipt className="w-3.5 h-3.5" />
        Generate Invoice
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-finance-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        Manage Expense
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-comm-sms')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        Send SMS
      </button>
    </div>
  </div>
)

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // ignore storage errors
  }
}

const EVENT_TYPE_BADGES = {
  Holiday: 'bg-rose-600 text-white',
  Exam: 'bg-blue-600 text-white',
  Event: 'bg-emerald-600 text-white',
  Meeting: 'bg-orange-500 text-white',
  Celebration: 'bg-green-600 text-white'
}

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const AcademicsResourcesViews = ({
  mode = 'handouts', // 'handouts' | 'lectures' | 'calendar' | 'makeup'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { classes = [], students = [], subjects = [], teachers = [] } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClassNames = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  const instSubjects = useMemo(
    () =>
      subjects.filter(
        (sub) => !currentInstitute?.id || !sub.instituteId || sub.instituteId === currentInstitute.id
      ),
    [subjects, currentInstitute]
  )

  const instTeachers = useMemo(
    () =>
      teachers.filter(
        (t) => !currentInstitute?.id || !t.instituteId || t.instituteId === currentInstitute.id
      ),
    [teachers, currentInstitute]
  )

  // ============================================================================
  // 1. HANDOUTS STATE
  // ============================================================================
  const handoutsKey = `eims_handouts_${instId}`
  const [handouts, setHandouts] = useState(() => loadJson(handoutsKey, []))
  const [hoSearch, setHoSearch] = useState('')
  const [hoClass, setHoClass] = useState('ALL')
  const [hoSubject, setHoSubject] = useState('ALL')
  const [hoStatus, setHoStatus] = useState('ALL')
  const [hoApplied, setHoApplied] = useState({ search: '', className: 'ALL', subject: 'ALL', status: 'ALL' })
  const [hoModal, setHoModal] = useState(null)
  const [hoView, setHoView] = useState(null)

  useEffect(() => {
    setHandouts(loadJson(handoutsKey, []))
  }, [handoutsKey])

  const persistHandouts = (updater) => {
    setHandouts((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(handoutsKey, next)
      return next
    })
  }

  const filteredHandouts = useMemo(() => {
    return handouts.filter((h) => {
      if (hoApplied.className !== 'ALL' && h.className !== hoApplied.className) return false
      if (hoApplied.subject !== 'ALL' && h.subject !== hoApplied.subject) return false
      if (hoApplied.status !== 'ALL' && h.status !== hoApplied.status) return false
      if (hoApplied.search.trim()) {
        const q = hoApplied.search.trim().toLowerCase()
        if (
          !(h.title || '').toLowerCase().includes(q) &&
          !(h.lecturer || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [handouts, hoApplied])

  // ============================================================================
  // 2. RECORDED LECTURES STATE
  // ============================================================================
  const lecturesKey = `eims_recorded_lectures_${instId}`
  const [lectures, setLectures] = useState(() => loadJson(lecturesKey, []))
  const [lecSearch, setLecSearch] = useState('')
  const [lecClass, setLecClass] = useState('ALL')
  const [lecSubject, setLecSubject] = useState('ALL')
  const [lecStatus, setLecStatus] = useState('ALL')
  const [lecApplied, setLecApplied] = useState({ search: '', className: 'ALL', subject: 'ALL', status: 'ALL' })
  const [lecModal, setLecModal] = useState(null)
  const [lecView, setLecView] = useState(null)

  useEffect(() => {
    setLectures(loadJson(lecturesKey, []))
  }, [lecturesKey])

  const persistLectures = (updater) => {
    setLectures((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(lecturesKey, next)
      return next
    })
  }

  const filteredLectures = useMemo(() => {
    return lectures.filter((l) => {
      if (lecApplied.className !== 'ALL' && l.className !== lecApplied.className) return false
      if (lecApplied.subject !== 'ALL' && l.subject !== lecApplied.subject) return false
      if (lecApplied.status !== 'ALL' && l.status !== lecApplied.status) return false
      if (lecApplied.search.trim()) {
        const q = lecApplied.search.trim().toLowerCase()
        if (
          !(l.title || '').toLowerCase().includes(q) &&
          !(l.lecturer || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [lectures, lecApplied])

  // ============================================================================
  // 3. ACADEMIC CALENDAR STATE
  // ============================================================================
  const calKey = `eims_academic_calendar_${instId}`
  const [calEvents, setCalEvents] = useState(() => loadJson(calKey, []))
  const [calViewMode, setCalViewMode] = useState('grid') // 'grid' | 'list'
  const [calMonthDate, setCalMonthDate] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [calSearch, setCalSearch] = useState('')
  const [calType, setCalType] = useState('ALL')
  const [calStatus, setCalStatus] = useState('ALL')
  const [calFrom, setCalFrom] = useState('')
  const [calTo, setCalTo] = useState('')
  const [calApplied, setCalApplied] = useState({ search: '', type: 'ALL', status: 'ALL', from: '', to: '' })
  const [calModal, setCalModal] = useState(null)

  useEffect(() => {
    setCalEvents(loadJson(calKey, []))
  }, [calKey])

  const persistCalEvents = (updater) => {
    setCalEvents((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(calKey, next)
      return next
    })
  }

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const filteredCalEvents = useMemo(() => {
    return calEvents.filter((ev) => {
      if (calApplied.type !== 'ALL' && ev.type !== calApplied.type) return false
      if (calApplied.status !== 'ALL' && ev.status !== calApplied.status) return false
      if (calApplied.from && ev.date < calApplied.from) return false
      if (calApplied.to && ev.date > calApplied.to) return false
      if (calApplied.search.trim()) {
        const q = calApplied.search.trim().toLowerCase()
        if (
          !(ev.title || '').toLowerCase().includes(q) &&
          !(ev.description || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [calEvents, calApplied])

  const upcomingEvents = useMemo(
    () =>
      calEvents
        .filter((ev) => ev.date >= todayIso)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [calEvents, todayIso]
  )

  // ============================================================================
  // 4. MAKE-UP SESSIONS STATE
  // ============================================================================
  const makeupKey = `eims_makeup_sessions_${instId}`
  const [makeupSessions, setMakeupSessions] = useState(() => loadJson(makeupKey, []))
  const [mkClass, setMkClass] = useState('ALL')
  const [mkStatus, setMkStatus] = useState('ALL')
  const [mkModal, setMkModal] = useState(null)

  useEffect(() => {
    setMakeupSessions(loadJson(makeupKey, []))
  }, [makeupKey])

  const persistMakeup = (updater) => {
    setMakeupSessions((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveJson(makeupKey, next)
      return next
    })
  }

  const filteredMakeup = useMemo(() => {
    return makeupSessions.filter((m) => {
      if (mkClass !== 'ALL' && m.className !== mkClass) return false
      if (mkStatus !== 'ALL' && m.status !== mkStatus) return false
      return true
    })
  }, [makeupSessions, mkClass, mkStatus])

  // ============================================================================
  // RENDER: HANDOUTS
  // ============================================================================
  if (mode === 'handouts') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Handouts"
          onBack={() => onRouteChange?.('inst-classes')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FileText className="w-4 h-4 text-slate-500" />
                Handouts
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Manage class/subject learning handouts</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setHoModal({
                  title: '',
                  className: availableClassNames[0] || '',
                  subject: instSubjects[0]?.name || '',
                  lecturer: '',
                  attachment: '',
                  status: 'Active'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Handout
            </button>
          </div>

          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <input
                type="text"
                value={hoSearch}
                onChange={(e) => setHoSearch(e.target.value)}
                placeholder="Title, description or lecturer"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={hoClass}
                onChange={(e) => setHoClass(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
              <select
                value={hoSubject}
                onChange={(e) => setHoSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                {Array.from(new Set(instSubjects.map((s) => s.name))).map((sn) => (
                  <option key={sn} value={sn}>
                    {sn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={hoStatus}
                onChange={(e) => setHoStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setHoApplied({ search: hoSearch, className: hoClass, subject: hoSubject, status: hoStatus })
                }
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setHoSearch('')
                  setHoClass('ALL')
                  setHoSubject('ALL')
                  setHoStatus('ALL')
                  setHoApplied({ search: '', className: 'ALL', subject: 'ALL', status: 'ALL' })
                }}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Lecturer</th>
                  <th className="py-2.5 px-3">Attachment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredHandouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">
                      No handouts found. Click <strong>+ Add Handout</strong> to upload one.
                    </td>
                  </tr>
                ) : (
                  filteredHandouts.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => setHoView(h)}
                          className="font-semibold text-blue-600 hover:underline text-left"
                        >
                          {h.title}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{h.className}</td>
                      <td className="py-3 px-3 text-slate-700">{h.subject || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{h.lecturer || '—'}</td>
                      <td className="py-3 px-3 text-slate-500">{h.attachment || '—'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            h.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        >
                          {h.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDisplayDate(h.updatedAt)}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setHoView(h)}
                          className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setHoModal({ ...h })}
                          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 inline-flex items-center"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistHandouts((prev) => prev.filter((x) => x.id !== h.id))
                            toast.success('Handout deleted')
                          }}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {hoModal && (
          <Modal
            isOpen
            onClose={() => setHoModal(null)}
            title={hoModal.id ? 'Edit Handout' : 'Add Handout'}
            maxWidth="max-w-md"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!hoModal.title.trim()) return
                const payload = {
                  ...hoModal,
                  id: hoModal.id || `ho_${Date.now()}`,
                  title: hoModal.title.trim(),
                  updatedAt: todayIso
                }
                persistHandouts((prev) =>
                  hoModal.id ? prev.map((x) => (x.id === hoModal.id ? payload : x)) : [payload, ...prev]
                )
                toast.success('Handout saved')
                setHoModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={hoModal.title}
                  onChange={(e) => setHoModal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={hoModal.className}
                    onChange={(e) => setHoModal((p) => ({ ...p, className: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {availableClassNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={hoModal.subject}
                    onChange={(e) => setHoModal((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lecturer</label>
                  <input
                    type="text"
                    value={hoModal.lecturer}
                    onChange={(e) => setHoModal((p) => ({ ...p, lecturer: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={hoModal.status}
                    onChange={(e) => setHoModal((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attachment File / URL</label>
                <input
                  type="text"
                  value={hoModal.attachment}
                  onChange={(e) => setHoModal((p) => ({ ...p, attachment: e.target.value }))}
                  placeholder="e.g. chapter-1-notes.pdf"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHoModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Handout
                </button>
              </div>
            </form>
          </Modal>
        )}

        {hoView && (
          <Modal isOpen onClose={() => setHoView(null)} title={hoView.title} maxWidth="max-w-md">
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Class</span>
                  <span className="font-semibold text-slate-800">{hoView.className}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Subject</span>
                  <span className="font-semibold text-slate-800">{hoView.subject || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Lecturer</span>
                  <span className="font-semibold text-slate-800">{hoView.lecturer || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Attachment</span>
                  <span className="font-semibold text-slate-800">{hoView.attachment || 'None'}</span>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setHoView(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: RECORDED LECTURES
  // ============================================================================
  if (mode === 'lectures') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Recorded Lectures"
          onBack={() => onRouteChange?.('inst-classes')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <PlayCircle className="w-4 h-4 text-slate-600" />
                Recorded Lectures
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage YouTube recorded lectures by class and subject
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setLecModal({
                  title: '',
                  className: availableClassNames[0] || '',
                  subject: instSubjects[0]?.name || '',
                  lecturer: '',
                  videoUrl: '',
                  status: 'Active'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Lecture
            </button>
          </div>

          <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_auto] gap-3 items-end">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Search</label>
              <input
                type="text"
                value={lecSearch}
                onChange={(e) => setLecSearch(e.target.value)}
                placeholder="Title, notes or lecturer"
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
              <select
                value={lecClass}
                onChange={(e) => setLecClass(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                {availableClassNames.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject</label>
              <select
                value={lecSubject}
                onChange={(e) => setLecSubject(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                {Array.from(new Set(instSubjects.map((s) => s.name))).map((sn) => (
                  <option key={sn} value={sn}>
                    {sn}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={lecStatus}
                onChange={(e) => setLecStatus(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setLecApplied({
                    search: lecSearch,
                    className: lecClass,
                    subject: lecSubject,
                    status: lecStatus
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setLecSearch('')
                  setLecClass('ALL')
                  setLecSubject('ALL')
                  setLecStatus('ALL')
                  setLecApplied({ search: '', className: 'ALL', subject: 'ALL', status: 'ALL' })
                }}
                className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Title</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Lecturer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Updated</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLectures.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No recorded lectures found.
                    </td>
                  </tr>
                ) : (
                  filteredLectures.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-blue-600">{l.title}</td>
                      <td className="py-3 px-3 text-slate-700">{l.className}</td>
                      <td className="py-3 px-3 text-slate-700">{l.subject || '—'}</td>
                      <td className="py-3 px-3 text-slate-600">{l.lecturer || '—'}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            l.status === 'Active' ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{formatDisplayDate(l.updatedAt)}</td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setLecView(l)}
                          className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 inline-flex items-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setLecModal({ ...l })}
                          className="p-1.5 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 inline-flex items-center"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistLectures((prev) => prev.filter((x) => x.id !== l.id))
                            toast.success('Lecture deleted')
                          }}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {lecModal && (
          <Modal
            isOpen
            onClose={() => setLecModal(null)}
            title={lecModal.id ? 'Edit Recorded Lecture' : 'Add Recorded Lecture'}
            maxWidth="max-w-md"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!lecModal.title.trim()) return
                const payload = {
                  ...lecModal,
                  id: lecModal.id || `lec_${Date.now()}`,
                  title: lecModal.title.trim(),
                  updatedAt: todayIso
                }
                persistLectures((prev) =>
                  lecModal.id ? prev.map((x) => (x.id === lecModal.id ? payload : x)) : [payload, ...prev]
                )
                toast.success('Recorded lecture saved')
                setLecModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lecture Title</label>
                <input
                  type="text"
                  required
                  value={lecModal.title}
                  onChange={(e) => setLecModal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={lecModal.className}
                    onChange={(e) => setLecModal((p) => ({ ...p, className: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {availableClassNames.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={lecModal.subject}
                    onChange={(e) => setLecModal((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lecturer</label>
                  <input
                    type="text"
                    value={lecModal.lecturer}
                    onChange={(e) => setLecModal((p) => ({ ...p, lecturer: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={lecModal.status}
                    onChange={(e) => setLecModal((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">YouTube Video URL</label>
                <input
                  type="url"
                  value={lecModal.videoUrl}
                  onChange={(e) => setLecModal((p) => ({ ...p, videoUrl: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLecModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Lecture
                </button>
              </div>
            </form>
          </Modal>
        )}

        {lecView && (
          <Modal isOpen onClose={() => setLecView(null)} title={lecView.title} maxWidth="max-w-md">
            <div className="space-y-3 text-xs">
              <p className="text-slate-600">
                <strong>Class:</strong> {lecView.className} • <strong>Subject:</strong> {lecView.subject || '—'}
              </p>
              {lecView.videoUrl && (
                <a
                  href={lecView.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-600 text-white font-semibold"
                >
                  <PlayCircle className="w-4 h-4" />
                  Open YouTube Video
                </a>
              )}
            </div>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: ACADEMIC CALENDAR
  // ============================================================================
  if (mode === 'calendar') {
    const year = calMonthDate.getFullYear()
    const month = calMonthDate.getMonth()
    const monthLabel = calMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const firstDow = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < firstDow; i += 1) cells.push(null)
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(d)

    const holidaysCount = calEvents.filter((e) => e.type === 'Holiday').length

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Academic Calendar"
          onBack={() => onRouteChange?.('inst-classes')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">All events</p>
              <p className="text-xl font-bold text-slate-900">{calEvents.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Upcoming</p>
              <p className="text-xl font-bold text-slate-900">{upcomingEvents.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Holidays</p>
              <p className="text-xl font-bold text-slate-900">{holidaysCount}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Filter className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Matching filters</p>
              <p className="text-xl font-bold text-slate-900">{filteredCalEvents.length}</p>
            </div>
          </div>
        </div>

        {/* Main Academic Calendar Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-slate-600" />
                Academic Calendar
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Manage holidays, celebrations, and institute events for the academic year
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setCalModal({
                  title: '',
                  type: 'Event',
                  date: todayIso,
                  description: '',
                  status: 'Active'
                })
              }
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Event
            </button>
          </div>

          {/* Next Upcoming Events Strip */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Next upcoming events
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {upcomingEvents.slice(0, 4).map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => setCalModal({ ...ev })}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-xs"
                >
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      EVENT_TYPE_BADGES[ev.type] || 'bg-slate-600 text-white'
                    }`}
                  >
                    {ev.type}
                  </span>
                  <span className="font-semibold text-slate-800">{ev.title}</span>
                  <span className="text-[11px] text-slate-400">{formatDisplayDate(ev.date)}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-notices')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold"
              >
                <Megaphone className="w-3 h-3" />
                Create Announcement
              </button>
            </div>
          </div>

          {/* Legend & Grid/List Switcher */}
          <div className="border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 mr-1">Legend:</span>
              {Object.entries(EVENT_TYPE_BADGES).map(([typeName, cls]) => (
                <span key={typeName} className={`px-2 py-0.5 rounded text-[10px] font-bold ${cls}`}>
                  {typeName}
                </span>
              ))}
            </div>

            <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCalViewMode('grid')}
                className={`inline-flex items-center gap-1 px-3 py-1 ${
                  calViewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setCalViewMode('list')}
                className={`inline-flex items-center gap-1 px-3 py-1 border-l border-slate-200 ${
                  calViewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="border border-slate-200 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.9fr_0.8fr_1fr_1fr_auto] gap-2.5 items-end">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Search</label>
              <input
                type="text"
                value={calSearch}
                onChange={(e) => setCalSearch(e.target.value)}
                placeholder="Title or description..."
                className="w-full px-3 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Type</label>
              <select
                value={calType}
                onChange={(e) => setCalType(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All types</option>
                {Object.keys(EVENT_TYPE_BADGES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">Status</label>
              <select
                value={calStatus}
                onChange={(e) => setCalStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white"
              >
                <option value="ALL">All</option>
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">From</label>
              <input
                type="date"
                value={calFrom}
                onChange={(e) => setCalFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 mb-1">To</label>
              <input
                type="date"
                value={calTo}
                onChange={(e) => setCalTo(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-slate-200"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  setCalApplied({
                    search: calSearch,
                    type: calType,
                    status: calStatus,
                    from: calFrom,
                    to: calTo
                  })
                }
                className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold"
              >
                <Filter className="w-3.5 h-3.5" />
                Apply
              </button>
              <button
                type="button"
                onClick={() => {
                  setCalSearch('')
                  setCalType('ALL')
                  setCalStatus('ALL')
                  setCalFrom('')
                  setCalTo('')
                  setCalApplied({ search: '', type: 'ALL', status: 'ALL', from: '', to: '' })
                }}
                className="p-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {calViewMode === 'grid' ? (
            <div className="space-y-3">
              {/* Month Header */}
              <div className="border border-slate-200 rounded-lg px-4 py-2.5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCalMonthDate(new Date(year, month - 1, 1))}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="text-sm font-bold text-slate-800">{monthLabel}</div>
                <button
                  type="button"
                  onClick={() => setCalMonthDate(new Date(year, month + 1, 1))}
                  className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 text-slate-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300" />
                  Weekly off (Sunday, Saturday)
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-orange-50 border border-orange-300" />
                  Holiday / non-working day
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border-2 border-blue-500" />
                  Today
                </span>
              </div>

              {/* 7-column Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div
                    key={d}
                    className="py-2 text-center text-xs font-bold text-slate-600 bg-slate-100 rounded-md"
                  >
                    {d}
                  </div>
                ))}

                {cells.map((dayNum, idx) => {
                  if (!dayNum) {
                    return <div key={`empty_${idx}`} className="min-h-[86px] rounded-lg bg-slate-50/40" />
                  }
                  const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  const dow = new Date(year, month, dayNum).getDay()
                  const isWeekend = dow === 0 || dow === 6
                  const isToday = iso === todayIso
                  const dayEvents = filteredCalEvents.filter((e) => e.date === iso)
                  const hasHoliday = dayEvents.some((e) => e.type === 'Holiday')

                  return (
                    <div
                      key={iso}
                      onClick={() =>
                        setCalModal({
                          title: '',
                          type: 'Event',
                          date: iso,
                          description: '',
                          status: 'Active'
                        })
                      }
                      className={`min-h-[86px] rounded-lg p-2 border cursor-pointer transition-colors ${
                        isToday
                          ? 'border-2 border-blue-500 bg-white'
                          : hasHoliday
                            ? 'border-orange-200 bg-orange-50/60'
                            : isWeekend
                              ? 'border-slate-200 bg-slate-100/80'
                              : 'border-slate-200 bg-white hover:bg-slate-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isToday
                              ? 'w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]'
                              : 'text-slate-700'
                          }`}
                        >
                          {dayNum}
                        </span>
                      </div>
                      {isWeekend && dayEvents.length === 0 && (
                        <div className="text-[10px] text-slate-400 mt-1">Weekly off</div>
                      )}
                      <div className="mt-1 space-y-1">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              setCalModal({ ...ev })
                            }}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate ${
                              EVENT_TYPE_BADGES[ev.type] || 'bg-slate-600 text-white'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCalEvents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No events match the current filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCalEvents.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {formatDisplayDate(ev.date)}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-800">{ev.title}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              EVENT_TYPE_BADGES[ev.type] || 'bg-slate-600 text-white'
                            }`}
                          >
                            {ev.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">{ev.description || '—'}</td>
                        <td className="py-3 px-4 text-right space-x-1">
                          <button
                            type="button"
                            onClick={() => setCalModal({ ...ev })}
                            className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 inline-flex items-center"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              persistCalEvents((prev) => prev.filter((x) => x.id !== ev.id))
                              toast.success('Event deleted')
                            }}
                            className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 inline-flex items-center"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {calModal && (
          <Modal
            isOpen
            onClose={() => setCalModal(null)}
            title={calModal.id ? 'Edit Calendar Event' : 'Add Calendar Event'}
            maxWidth="max-w-md"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!calModal.title.trim()) return
                const payload = {
                  ...calModal,
                  id: calModal.id || `cal_${Date.now()}`,
                  title: calModal.title.trim()
                }
                persistCalEvents((prev) =>
                  calModal.id ? prev.map((x) => (x.id === calModal.id ? payload : x)) : [payload, ...prev]
                )
                toast.success('Calendar event saved')
                setCalModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={calModal.title}
                  onChange={(e) => setCalModal((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={calModal.type}
                    onChange={(e) => setCalModal((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {Object.keys(EVENT_TYPE_BADGES).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={calModal.date}
                    onChange={(e) => setCalModal((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={calModal.description}
                  onChange={(e) => setCalModal((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex justify-between pt-2">
                {calModal.id ? (
                  <button
                    type="button"
                    onClick={() => {
                      persistCalEvents((prev) => prev.filter((x) => x.id !== calModal.id))
                      toast.success('Event removed')
                      setCalModal(null)
                    }}
                    className="px-3.5 py-1.5 rounded-lg border border-rose-200 text-rose-600 font-semibold"
                  >
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCalModal(null)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  >
                    Save Event
                  </button>
                </div>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: MAKE-UP SESSIONS
  // ============================================================================
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Make-up Sessions"
        onBack={() => onRouteChange?.('inst-classes')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <Calendar className="w-4 h-4 text-slate-600" />
              Make-up Sessions
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              One-time extra lectures — separate from the regular weekly timetable
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-timetable')}
                className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50"
              >
                Timetables
              </button>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-exams-schedule')}
                className="px-3 py-1.5 bg-white text-slate-600 hover:bg-slate-50 border-l border-slate-200"
              >
                Exams
              </button>
              <button type="button" className="px-3 py-1.5 bg-blue-600 text-white border-l border-slate-200">
                Make-up
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-timetable')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              New timetable
            </button>
            <button
              type="button"
              onClick={() =>
                setMkModal({
                  date: todayIso,
                  title: '',
                  subject: '',
                  className: availableClassNames[0] || '',
                  section: 'Super',
                  teacher: instTeachers[0]?.name || '',
                  time: '10:00 AM - 11:00 AM',
                  room: 'Room 1',
                  status: 'Scheduled'
                })
              }
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule makeup class
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Class</label>
            <select
              value={mkClass}
              onChange={(e) => setMkClass(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
            >
              <option value="ALL">All classes</option>
              {availableClassNames.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Status</label>
            <select
              value={mkStatus}
              onChange={(e) => setMkStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white"
            >
              <option value="ALL">All statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="text-xs text-slate-400 pb-2">{filteredMakeup.length} record(s)</div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Class</th>
                <th className="py-2.5 px-3">Teacher / Instructor</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMakeup.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    No make-up sessions scheduled. Click <strong>+ Schedule makeup class</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredMakeup.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-700 font-medium">{formatDisplayDate(m.date)}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">{m.title}</div>
                      {m.subject && <div className="text-[11px] text-slate-400">{m.subject}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {m.className} {m.section ? <span className="text-slate-400">· {m.section}</span> : ''}
                    </td>
                    <td className="py-3 px-3 text-slate-700">{m.teacher || '—'}</td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{m.time}</div>
                      {m.room && <div className="text-[11px] text-slate-400">{m.room}</div>}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                          m.status === 'Completed'
                            ? 'bg-emerald-600'
                            : m.status === 'Cancelled'
                              ? 'bg-rose-600'
                              : 'bg-blue-600'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1">
                      <button
                        type="button"
                        onClick={() => setMkModal({ ...m })}
                        className="p-1.5 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 inline-flex items-center"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          persistMakeup((prev) => prev.filter((x) => x.id !== m.id))
                          toast.success('Make-up session removed')
                        }}
                        className="p-1.5 rounded border border-orange-200 text-orange-600 hover:bg-orange-50 inline-flex items-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mkModal && (
        <Modal
          isOpen
          onClose={() => setMkModal(null)}
          title={mkModal.id ? 'Edit Make-up Session' : 'Schedule Make-up Session'}
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!mkModal.title.trim()) return
              const payload = {
                ...mkModal,
                id: mkModal.id || `mk_${Date.now()}`,
                title: mkModal.title.trim()
              }
              persistMakeup((prev) =>
                mkModal.id ? prev.map((x) => (x.id === mkModal.id ? payload : x)) : [payload, ...prev]
              )
              toast.success('Make-up session saved')
              setMkModal(null)
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Session Title</label>
              <input
                type="text"
                required
                value={mkModal.title}
                onChange={(e) => setMkModal((p) => ({ ...p, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={mkModal.date}
                  onChange={(e) => setMkModal((p) => ({ ...p, date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={mkModal.subject}
                  onChange={(e) => setMkModal((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Class</label>
                <select
                  value={mkModal.className}
                  onChange={(e) => setMkModal((p) => ({ ...p, className: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {availableClassNames.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Teacher</label>
                <select
                  value={mkModal.teacher}
                  onChange={(e) => setMkModal((p) => ({ ...p, teacher: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select...</option>
                  {instTeachers.map((t) => (
                    <option key={t.id} value={t.name}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Time</label>
                <input
                  type="text"
                  value={mkModal.time}
                  onChange={(e) => setMkModal((p) => ({ ...p, time: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Room</label>
                <input
                  type="text"
                  value={mkModal.room}
                  onChange={(e) => setMkModal((p) => ({ ...p, room: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={mkModal.status}
                onChange={(e) => setMkModal((p) => ({ ...p, status: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMkModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Save Session
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default AcademicsResourcesViews
