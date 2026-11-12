import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Mail,
  Plus,
  Bell,
  Search,
  Send,
  Megaphone,
  CheckCircle2,
  Edit3,
  Filter,
  RotateCcw,
  History,
  Eye,
  Trash2,
  Paperclip,
  MessageCircle,
  RefreshCw,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const formatShortDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const formatTime = (iso) => {
  if (!iso) return ''
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

export const CommunicationSuiteViews = ({
  mode = 'inbox', // 'inbox' | 'announcements' | 'notifications' | 'whatsapp'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { students = [], teachers = [], classes = [], notices = [], addItem, updateItem, deleteItem } =
    useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const inboxKey = `sms_campus_inbox_threads_${instId}`
  const notificationsKey = `sms_campus_notifications_${instId}`
  const whatsappKey = `sms_campus_whatsapp_cfg_${instId}`
  const whatsappLogKey = `sms_campus_whatsapp_logs_${instId}`
  const noticeExtrasKey = `sms_campus_notice_extras_${instId}`

  // ==========================
  // INBOX STATE (Pick 1)
  // ==========================
  const [threads, setThreads] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(inboxKey) || '{}')
    } catch {
      return {}
    }
  })
  const [convoSearch, setConvoSearch] = useState('')
  const [activeConvoId, setActiveConvoId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [newMsgOpen, setNewMsgOpen] = useState(false)
  const [newMsgRecipient, setNewMsgRecipient] = useState('')
  const [newMsgBody, setNewMsgBody] = useState('')

  // ==========================
  // ANNOUNCEMENTS STATE (Picks 2-3)
  // ==========================
  const [noticeExtras, setNoticeExtras] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(noticeExtrasKey) || '{}')
    } catch {
      return {}
    }
  })
  const [noticeFilters, setNoticeFilters] = useState({
    search: '',
    audience: 'All',
    classScope: 'All',
    status: 'All'
  })
  const [appliedNoticeFilters, setAppliedNoticeFilters] = useState({
    search: '',
    audience: 'All',
    classScope: 'All',
    status: 'All'
  })
  const [noticeModalOpen, setNoticeModalOpen] = useState(false)
  const [editingNoticeId, setEditingNoticeId] = useState(null)
  const [viewingNotice, setViewingNotice] = useState(null)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    summary: '',
    audience: 'All',
    scope: 'Institute-wide',
    status: 'Published',
    hasFile: false
  })

  // ==========================
  // NOTIFICATIONS STATE (Pick 4)
  // ==========================
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(notificationsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  // ==========================
  // WHATSAPP STATE (Picks 5-6)
  // ==========================
  const [waConfig, setWaConfig] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(whatsappKey) || 'null')
      if (saved) return saved
    } catch {}
    return {
      connected: true,
      number: '+1 555-381-6330',
      messagingOn: true,
      credits: 89,
      templates: [
        {
          id: 'tpl-fee-voucher',
          name: 'Fee voucher',
          status: 'Approved',
          description: 'Sent to parents with the voucher PDF attached whenever a fee voucher is generated.',
          body: 'Dear Parent, the fee voucher of {{1}} for {{2}} has been generated. Please find it attached.'
        }
      ]
    }
  })
  const [waLogs, setWaLogs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(whatsappLogKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })
  const [changeNumberOpen, setChangeNumberOpen] = useState(false)
  const [newWaNumber, setNewWaNumber] = useState('')
  const [creditRequestQty, setCreditRequestQty] = useState('100')
  const [testPhone, setTestPhone] = useState('')
  const [testBody, setTestBody] = useState(`Hello from ${instName} on WhatsApp.`)
  const [waLogOpen, setWaLogOpen] = useState(false)

  useEffect(() => {
    try {
      setThreads(JSON.parse(localStorage.getItem(inboxKey) || '{}'))
    } catch {
      setThreads({})
    }
    try {
      const n = JSON.parse(localStorage.getItem(notificationsKey) || '[]')
      setNotifications(Array.isArray(n) ? n : [])
    } catch {
      setNotifications([])
    }
    try {
      setNoticeExtras(JSON.parse(localStorage.getItem(noticeExtrasKey) || '{}'))
    } catch {
      setNoticeExtras({})
    }
  }, [instId, inboxKey, notificationsKey, noticeExtrasKey])

  const persistThreads = (next) => {
    setThreads(next)
    try {
      localStorage.setItem(inboxKey, JSON.stringify(next))
    } catch {}
  }

  const persistNoticeExtras = (next) => {
    setNoticeExtras(next)
    try {
      localStorage.setItem(noticeExtrasKey, JSON.stringify(next))
    } catch {}
  }

  const persistNotifications = (next) => {
    setNotifications(next)
    try {
      localStorage.setItem(notificationsKey, JSON.stringify(next))
    } catch {}
  }

  const persistWaConfig = (next) => {
    setWaConfig(next)
    try {
      localStorage.setItem(whatsappKey, JSON.stringify(next))
    } catch {}
  }

  const persistWaLogs = (next) => {
    setWaLogs(next)
    try {
      localStorage.setItem(whatsappLogKey, JSON.stringify(next))
    } catch {}
  }

  // Contacts for Inbox
  const inboxContacts = useMemo(() => {
    const instStudents = students.filter((s) => !s.instituteId || s.instituteId === instId)
    const instTeachers = teachers.filter((t) => !t.instituteId || t.instituteId === instId)
    const list = []
    const seenParents = new Set()

    instStudents.forEach((s) => {
      if (s.fatherName && !seenParents.has(s.fatherName)) {
        seenParents.add(s.fatherName)
        list.push({
          id: `parent-${s.id}`,
          name: s.fatherName,
          role: 'PARENT',
          phone: s.fatherPhone || s.phone || ''
        })
      }
      list.push({
        id: `student-${s.id}`,
        name: s.name,
        role: 'STUDENT',
        phone: s.phone || ''
      })
    })

    instTeachers.forEach((t) => {
      list.push({
        id: `staff-${t.id}`,
        name: t.name,
        role: 'STAFF',
        phone: t.phone || ''
      })
    })

    const q = convoSearch.trim().toLowerCase()
    if (!q) return list
    return list.filter((c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
  }, [students, teachers, instId, convoSearch])

  const activeContact = inboxContacts.find((c) => c.id === activeConvoId) || null
  const activeMessages = activeConvoId ? threads[activeConvoId] || [] : []

  const sendMessageToConvo = (convoId, text) => {
    const clean = text.trim()
    if (!clean) return
    const nextMsg = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      text: clean,
      at: new Date().toISOString()
    }
    persistThreads({
      ...threads,
      [convoId]: [...(threads[convoId] || []), nextMsg]
    })
  }

  // ==========================
  // ANNOUNCEMENTS LOGIC (Picks 2-3)
  // ==========================
  const campusClasses = useMemo(
    () => classes.filter((c) => !c.instituteId || c.instituteId === instId),
    [classes, instId]
  )

  const campusNotices = useMemo(() => {
    return notices
      .filter((n) => !n.instituteId || n.instituteId === instId)
      .map((n) => {
        const ex = noticeExtras[n.id] || {}
        return {
          ...n,
          summary: n.content || n.description || ex.summary || '',
          audience: ex.audience || n.audience || 'All',
          scope: ex.scope || n.targetClass || 'Institute-wide',
          status: ex.status || n.status || 'Published',
          createdBy: ex.createdBy || n.author || 'Admin',
          createdAt: n.createdAt || n.date || new Date().toISOString(),
          smsSentAt: ex.smsSentAt || '',
          hasFile: Boolean(ex.hasFile || n.attachment)
        }
      })
  }, [notices, instId, noticeExtras])

  const filteredNotices = useMemo(() => {
    const q = appliedNoticeFilters.search.trim().toLowerCase()
    return campusNotices.filter((n) => {
      if (q && !`${n.title} ${n.summary}`.toLowerCase().includes(q)) return false
      if (appliedNoticeFilters.audience !== 'All' && n.audience !== appliedNoticeFilters.audience) {
        return false
      }
      if (
        appliedNoticeFilters.classScope !== 'All' &&
        n.scope !== appliedNoticeFilters.classScope
      ) {
        return false
      }
      if (appliedNoticeFilters.status !== 'All' && n.status !== appliedNoticeFilters.status) {
        return false
      }
      return true
    })
  }, [campusNotices, appliedNoticeFilters])

  const noticeKpis = useMemo(() => {
    const total = campusNotices.length
    const published = campusNotices.filter((n) => n.status === 'Published').length
    const drafts = campusNotices.filter((n) => n.status === 'Draft').length
    return { total, published, drafts, matching: filteredNotices.length }
  }, [campusNotices, filteredNotices])

  const openCreateNotice = () => {
    setEditingNoticeId(null)
    setNoticeForm({
      title: '',
      summary: '',
      audience: 'All',
      scope: 'Institute-wide',
      status: 'Published',
      hasFile: false
    })
    setNoticeModalOpen(true)
  }

  const openEditNotice = (n) => {
    setEditingNoticeId(n.id)
    setNoticeForm({
      title: n.title || '',
      summary: n.summary || '',
      audience: n.audience || 'All',
      scope: n.scope || 'Institute-wide',
      status: n.status || 'Published',
      hasFile: Boolean(n.hasFile)
    })
    setNoticeModalOpen(true)
  }

  const handleSaveNotice = async (e) => {
    e.preventDefault()
    const cleanTitle = noticeForm.title.trim()
    if (!cleanTitle) {
      toast.error('Notice title is required.')
      return
    }
    if (editingNoticeId) {
      if (updateItem) {
        try {
          await updateItem('notices', editingNoticeId, {
            title: cleanTitle,
            content: noticeForm.summary.trim(),
            audience: noticeForm.audience,
            status: noticeForm.status
          })
        } catch {}
      }
      persistNoticeExtras({
        ...noticeExtras,
        [editingNoticeId]: {
          ...(noticeExtras[editingNoticeId] || {}),
          summary: noticeForm.summary.trim(),
          audience: noticeForm.audience,
          scope: noticeForm.scope,
          status: noticeForm.status,
          hasFile: noticeForm.hasFile
        }
      })
      toast.success(`Updated announcement "${cleanTitle}".`)
    } else {
      const newId = `NTC-${Date.now()}`
      if (addItem) {
        try {
          await addItem('notices', {
            id: newId,
            instituteId: instId,
            title: cleanTitle,
            content: noticeForm.summary.trim(),
            audience: noticeForm.audience,
            status: noticeForm.status,
            createdAt: new Date().toISOString()
          })
        } catch {}
      }
      persistNoticeExtras({
        ...noticeExtras,
        [newId]: {
          summary: noticeForm.summary.trim(),
          audience: noticeForm.audience,
          scope: noticeForm.scope,
          status: noticeForm.status,
          createdBy: 'Admin',
          hasFile: noticeForm.hasFile
        }
      })
      toast.success(`Created announcement "${cleanTitle}".`)
    }
    setNoticeModalOpen(false)
  }

  const handleDeleteNotice = async (n) => {
    if (deleteItem) {
      try {
        await deleteItem('notices', n.id)
      } catch {}
    }
    const next = { ...noticeExtras }
    delete next[n.id]
    persistNoticeExtras(next)
    toast.success(`Deleted "${n.title}".`)
  }

  const handleSendNoticeSms = (n) => {
    const stamp = new Date().toISOString()
    persistNoticeExtras({
      ...noticeExtras,
      [n.id]: {
        ...(noticeExtras[n.id] || {}),
        smsSentAt: stamp
      }
    })
    toast.success(`SMS alert sent for "${n.title}" (${n.audience}).`)
  }

  // ==========================
  // RENDER: ANNOUNCEMENTS (Picks 2-3)
  // ==========================
  if (mode === 'announcements') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Announcements"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total notices</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{noticeKpis.total}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Published</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {noticeKpis.published}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Drafts</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">{noticeKpis.drafts}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Matching filters</p>
              <p className="text-xl font-extrabold text-slate-900 mt-0.5">
                {noticeKpis.matching}
              </p>
            </div>
          </div>
        </div>

        {/* Main Announcements Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Megaphone className="w-4 h-4 text-slate-600" />
                <span>Announcements</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Publish and manage institute-wide and class-specific notices
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
              <button
                type="button"
                onClick={openCreateNotice}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Notice</span>
              </button>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={noticeFilters.search}
                  onChange={(e) => setNoticeFilters((p) => ({ ...p, search: e.target.value }))}
                  placeholder="Title or description..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Audience
                </label>
                <select
                  value={noticeFilters.audience}
                  onChange={(e) => setNoticeFilters((p) => ({ ...p, audience: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Students">Students</option>
                  <option value="Parents">Parents</option>
                  <option value="Teachers">Teachers</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Class
                </label>
                <select
                  value={noticeFilters.classScope}
                  onChange={(e) => setNoticeFilters((p) => ({ ...p, classScope: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                >
                  <option value="All">All classes</option>
                  <option value="Institute-wide">Institute-wide</option>
                  {campusClasses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={noticeFilters.status}
                  onChange={(e) => setNoticeFilters((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                >
                  <option value="All">All</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
              <div className="lg:col-span-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setAppliedNoticeFilters({ ...noticeFilters })}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Apply</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const empty = { search: '', audience: 'All', classScope: 'All', status: 'All' }
                    setNoticeFilters(empty)
                    setAppliedNoticeFilters(empty)
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500">
              Showing {filteredNotices.length === 0 ? 0 : 1}–{filteredNotices.length} of{' '}
              {campusNotices.length}
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Title</th>
                    <th className="py-2.5 px-3">Summary</th>
                    <th className="py-2.5 px-3">Audience</th>
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3">Created</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                    <th className="py-2.5 px-3 text-center">SMS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredNotices.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No announcements found. Click{' '}
                        <button
                          type="button"
                          onClick={openCreateNotice}
                          className="text-sky-600 font-semibold hover:underline cursor-pointer"
                        >
                          + New Notice
                        </button>{' '}
                        to publish one.
                      </td>
                    </tr>
                  ) : (
                    filteredNotices.map((n, idx) => (
                      <tr key={n.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <div>{n.title}</div>
                          {n.hasFile && (
                            <span className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                              <Paperclip className="w-2.5 h-2.5" /> File
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-600 max-w-xs truncate">
                          {n.summary || '—'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-semibold">
                            {n.audience}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              n.scope === 'Institute-wide'
                                ? 'bg-sky-500 text-white'
                                : 'bg-slate-600 text-white'
                            }`}
                          >
                            {n.scope}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="text-slate-800">{formatShortDate(n.createdAt)}</div>
                          <div className="text-[10px] text-slate-400">{n.createdBy}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              n.status === 'Published'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-orange-500 text-white'
                            }`}
                          >
                            {n.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingNotice(n)}
                              className="p-1.5 rounded bg-sky-500 hover:bg-sky-600 text-white cursor-pointer"
                              title="View"
                            >
                              <Eye className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditNotice(n)}
                              className="p-1.5 rounded bg-orange-500 hover:bg-orange-600 text-white cursor-pointer"
                              title="Edit"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteNotice(n)}
                              className="p-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleSendNoticeSms(n)}
                            className="inline-flex flex-col items-center cursor-pointer"
                            title="Send SMS alert"
                          >
                            <span className="p-1.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white">
                              <MessageCircle className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5">
                              {n.smsSentAt ? formatShortDate(n.smsSentAt) : 'Never'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create / Edit Notice Modal */}
        {noticeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveNotice}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingNoticeId ? 'Edit Notice' : 'New Notice'}
                </h3>
                <button
                  type="button"
                  onClick={() => setNoticeModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={noticeForm.title}
                    onChange={(e) => setNoticeForm((p) => ({ ...p, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Summary / Body</label>
                  <textarea
                    rows={3}
                    value={noticeForm.summary}
                    onChange={(e) => setNoticeForm((p) => ({ ...p, summary: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Audience</label>
                    <select
                      value={noticeForm.audience}
                      onChange={(e) => setNoticeForm((p) => ({ ...p, audience: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="All">All</option>
                      <option value="Students">Students</option>
                      <option value="Parents">Parents</option>
                      <option value="Teachers">Teachers</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Scope</label>
                    <select
                      value={noticeForm.scope}
                      onChange={(e) => setNoticeForm((p) => ({ ...p, scope: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Institute-wide">Institute-wide</option>
                      {campusClasses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Status</label>
                    <select
                      value={noticeForm.status}
                      onChange={(e) => setNoticeForm((p) => ({ ...p, status: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNoticeModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Notice Modal */}
        {viewingNotice && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">{viewingNotice.title}</h3>
                <button
                  type="button"
                  onClick={() => setViewingNotice(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line">{viewingNotice.summary}</p>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>
                  Audience: <strong>{viewingNotice.audience}</strong> • {viewingNotice.scope}
                </span>
                <span>{formatShortDate(viewingNotice.createdAt)}</span>
              </div>
            </div>
          </div>
        )}

        {/* History Modal */}
        {historyOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Announcement SMS History</h3>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 text-xs">
                {campusNotices.filter((n) => n.smsSentAt).length === 0 ? (
                  <p className="py-6 text-center text-slate-400">No SMS alerts sent yet.</p>
                ) : (
                  campusNotices
                    .filter((n) => n.smsSentAt)
                    .map((n) => (
                      <div key={n.id} className="py-2.5 flex justify-between">
                        <span className="font-semibold text-slate-800">{n.title}</span>
                        <span className="text-slate-500">{formatShortDate(n.smsSentAt)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: NOTIFICATIONS (Pick 4)
  // ==========================
  if (mode === 'notifications') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Notifications"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Bell className="w-4 h-4 text-slate-700" />
              <span>Notification Center</span>
            </div>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    persistNotifications([])
                    toast.success('Cleared all notifications.')
                  }}
                  className="px-3 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-communication-inbox')}
                className="px-3.5 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-semibold cursor-pointer"
              >
                Inbox
              </button>
            </div>
          </div>

          <div className="p-6">
            {notifications.length === 0 ? (
              <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Bell className="w-8 h-8 text-slate-400" />
                <p className="text-xs">No notifications yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{n.title}</div>
                      <div className="text-slate-500">{n.body}</div>
                    </div>
                    <span className="text-[11px] text-slate-400">{formatShortDate(n.at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: WHATSAPP (Picks 5-6)
  // ==========================
  if (mode === 'whatsapp') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="WhatsApp"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs max-w-xl overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">WhatsApp</h2>
            <button
              type="button"
              onClick={() => setWaLogOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message log</span>
            </button>
          </div>

          <div className="p-5 space-y-5 divide-y divide-slate-100">
            {/* Connected number */}
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-slate-500">Connected number</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-base font-bold text-slate-900">{waConfig.number}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewWaNumber(waConfig.number)
                      setChangeNumberOpen(true)
                    }}
                    className="px-2.5 py-1 rounded border border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-semibold cursor-pointer"
                  >
                    Change number
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      toast.success(
                        waConfig.connected
                          ? `WhatsApp Business API (${waConfig.number}) is healthy.`
                          : 'WhatsApp number is currently disconnected.'
                      )
                    }
                    className="px-2.5 py-1 rounded border border-cyan-400 text-cyan-700 hover:bg-cyan-50 text-xs font-semibold cursor-pointer"
                  >
                    Check connection
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !waConfig.connected
                      persistWaConfig({ ...waConfig, connected: next })
                      toast.success(next ? 'WhatsApp connected.' : 'WhatsApp disconnected.')
                    }}
                    className="px-2.5 py-1 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                  >
                    {waConfig.connected ? 'Disconnect WhatsApp' : 'Connect WhatsApp'}
                  </button>
                </div>
                <span
                  className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                    waConfig.connected
                      ? 'bg-emerald-500 text-white'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {waConfig.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Make sure a payment method is added in Meta Business Manager → WhatsApp Manager →
                Payment settings, otherwise messages will not be delivered.
              </p>

              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(waConfig.messagingOn)}
                  onChange={(e) =>
                    persistWaConfig({ ...waConfig, messagingOn: e.target.checked })
                  }
                />
                <span>WhatsApp messaging on</span>
              </label>
            </div>

            {/* Message credits */}
            <div className="pt-4 space-y-2">
              <p className="text-[11px] text-slate-500">Message credits</p>
              <p className="text-xs font-bold text-slate-900">{waConfig.credits} remaining</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="10"
                  value={creditRequestQty}
                  onChange={(e) => setCreditRequestQty(e.target.value)}
                  className="w-24 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    toast.success(`Requested ${creditRequestQty} additional WhatsApp credits.`)
                  }}
                  className="px-3 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-semibold cursor-pointer"
                >
                  Request more
                </button>
              </div>
              <p className="text-[10px] text-slate-400">EduDigize approves credit requests.</p>
            </div>

            {/* Send a test message */}
            <div className="pt-4 space-y-2.5">
              <p className="text-xs font-semibold text-slate-800">Send a test message</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="Parent number e.g. 0300..."
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <input
                  type="text"
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!testPhone.trim()) {
                    toast.error('Enter a recipient phone number.')
                    return
                  }
                  if (!waConfig.connected || !waConfig.messagingOn) {
                    toast.error('Connect WhatsApp and enable messaging first.')
                    return
                  }
                  if (waConfig.credits <= 0) {
                    toast.error('Insufficient WhatsApp message credits.')
                    return
                  }
                  persistWaConfig({ ...waConfig, credits: waConfig.credits - 1 })
                  persistWaLogs([
                    {
                      id: `WA-${Date.now()}`,
                      to: testPhone.trim(),
                      message: testBody.trim(),
                      status: 'Delivered',
                      at: new Date().toISOString()
                    },
                    ...waLogs
                  ])
                  toast.success(`Test WhatsApp message sent to ${testPhone.trim()}.`)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold cursor-pointer"
              >
                Send test
              </button>
            </div>

            {/* Message templates */}
            <div className="pt-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-800">Message templates</p>
                <button
                  type="button"
                  onClick={() => toast.success('Template statuses synced with Meta.')}
                  className="text-xs font-medium text-sky-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh status</span>
                </button>
              </div>
              {waConfig.templates.map((tpl) => (
                <div key={tpl.id} className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{tpl.name}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                      {tpl.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{tpl.description}</p>
                  <p className="text-[11px] text-slate-700 pt-1">{tpl.body}</p>
                </div>
              ))}
              <p className="text-[10px] text-slate-400">
                Messages go out automatically once a template is approved and WhatsApp messaging is on.
              </p>
            </div>
          </div>
        </div>

        {/* Change Number Modal */}
        {changeNumberOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Change WhatsApp Number</h3>
              <input
                type="text"
                value={newWaNumber}
                onChange={(e) => setNewWaNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setChangeNumberOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!newWaNumber.trim()) return
                    persistWaConfig({ ...waConfig, number: newWaNumber.trim() })
                    toast.success('Connected WhatsApp number updated.')
                    setChangeNumberOpen(false)
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Log Modal */}
        {waLogOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">WhatsApp Message Log</h3>
                <button
                  type="button"
                  onClick={() => setWaLogOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                {waLogs.length === 0 ? (
                  <p className="py-8 text-center text-slate-400">No WhatsApp messages logged yet.</p>
                ) : (
                  waLogs.map((l) => (
                    <div key={l.id} className="py-2.5 space-y-0.5">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">{l.to}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          {l.status}
                        </span>
                      </div>
                      <p className="text-slate-600">{l.message}</p>
                      <p className="text-[10px] text-slate-400">
                        {formatShortDate(l.at)} {formatTime(l.at)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: INBOX (Pick 1)
  // ==========================
  return (
    <div className="space-y-4">
      <QuickHeader
        title="Inbox"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Mail className="w-4 h-4 text-slate-600" />
            <span>Inbox</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewMsgOpen(true)}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-communication-notifications')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Notifications
            </button>
          </div>
        </div>

        <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-[460px]">
          {/* Left Pane: Conversations */}
          <div className="lg:col-span-3 border border-slate-200 rounded-xl flex flex-col overflow-hidden">
            <div className="p-3 border-b border-slate-100 space-y-2">
              <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                CONVERSATIONS
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={convoSearch}
                  onChange={(e) => setConvoSearch(e.target.value)}
                  placeholder="Search name..."
                  className="w-full pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[380px]">
              {inboxContacts.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">No contacts found.</div>
              ) : (
                inboxContacts.map((c) => {
                  const msgs = threads[c.id] || []
                  const last = msgs[msgs.length - 1]
                  const isActive = activeConvoId === c.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveConvoId(c.id)}
                      className={`w-full p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer ${
                        isActive ? 'bg-sky-50/70' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{c.name}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.role === 'PARENT'
                              ? 'bg-emerald-50 text-emerald-700'
                              : c.role === 'STUDENT'
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {c.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {last ? last.text : 'No messages yet'}
                      </p>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right Pane: Thread */}
          <div className="lg:col-span-9 border border-slate-200 rounded-xl flex flex-col overflow-hidden">
            {!activeContact ? (
              <>
                <div className="p-4 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-800">Select a conversation</div>
                  <div className="text-xs text-slate-500">
                    Choose a chat on the left, or send a new message.
                  </div>
                </div>
                <div className="flex-1 flex items-center justify-center bg-slate-50/50 text-xs text-slate-400">
                  Select a conversation or click <strong className="mx-1">Send Message</strong>.
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-slate-900">{activeContact.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {activeContact.role} {activeContact.phone ? `• ${activeContact.phone}` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto bg-slate-50/40 max-h-[320px]">
                  {activeMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No messages yet with {activeContact.name}. Write below to start chatting.
                    </div>
                  ) : (
                    activeMessages.map((m) => (
                      <div key={m.id} className="flex justify-end">
                        <div className="max-w-md px-3.5 py-2 rounded-xl bg-sky-600 text-white text-xs space-y-1 shadow-xs">
                          <p>{m.text}</p>
                          <p className="text-[10px] text-sky-100 text-right">
                            {formatTime(m.at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessageToConvo(activeContact.id, replyText)
                    setReplyText('')
                  }}
                  className="p-3 border-t border-slate-100 flex items-center gap-2 bg-white"
                >
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Message ${activeContact.name}...`}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Send New Message Modal */}
      {newMsgOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!newMsgRecipient || !newMsgBody.trim()) {
                toast.error('Select a recipient and enter a message.')
                return
              }
              sendMessageToConvo(newMsgRecipient, newMsgBody)
              setActiveConvoId(newMsgRecipient)
              setNewMsgBody('')
              setNewMsgOpen(false)
              toast.success('Message sent.')
            }}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Send New Message</h3>
              <button
                type="button"
                onClick={() => setNewMsgOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Recipient *</label>
                <select
                  value={newMsgRecipient}
                  onChange={(e) => setNewMsgRecipient(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select recipient...</option>
                  {inboxContacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.role})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message *</label>
                <textarea
                  rows={4}
                  value={newMsgBody}
                  onChange={(e) => setNewMsgBody(e.target.value)}
                  required
                  placeholder="Write your message..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNewMsgOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default CommunicationSuiteViews
