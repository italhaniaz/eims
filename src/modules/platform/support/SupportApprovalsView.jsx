import React, { useState, useEffect, useMemo } from 'react'
import {
  LifeBuoy,
  CheckCircle,
  Clock,
  AlertCircle,
  MessageSquare,
  Send,
  Check,
  X,
  FileText,
  Filter,
  Search,
  ExternalLink,
  ShieldAlert,
  Bell,
  HelpCircle,
  BookOpen,
  Edit2,
  Eye,
  EyeOff,
  Copy,
  Building2,
  School,
  GraduationCap,
  Sparkles,
  User,
  Mail,
  Phone,
  MapPin,
  Key
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { SupportService } from '../../../services/supportService'
import { useToast } from '../../../context/ToastContext'
import { useAppData } from '../../../context/AppDataContext'

const SupportApprovalsView = () => {
  const { toast } = useToast()
  const { logAuditEvent } = useAppData()
  const [activeTab, setActiveTab] = useState('approvals') // 'tickets', 'approvals', 'notifications', 'content'
  const [tickets, setTickets] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL') // ALL, ACTIVE, OPEN, IN_PROGRESS, RESOLVED
  const [approvalFilter, setApprovalFilter] = useState('PENDING') // PENDING, APPROVED, REJECTED, ALL
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false)
  const [newTicketForm, setNewTicketForm] = useState({ subject: '', category: 'General', priority: 'Medium', message: '', instituteName: '' })

  // Ticket Reply Modal
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [replyStatus, setReplyStatus] = useState('IN_PROGRESS')
  const [isSendingReply, setIsSendingReply] = useState(false)

  // Approval Review Modal
  const [selectedApproval, setSelectedApproval] = useState(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)

  // CMS Content State
  const [selectedContentKey, setSelectedContentKey] = useState('terms_of_service')
  const [contentDoc, setContentDoc] = useState(null)
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [contentDraft, setContentDraft] = useState({ title: '', content: '', version: '' })

  // Notifications State & Persistence
  const [clearedNotifications, setClearedNotifications] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sms_cleared_notifications') || '[]')
    } catch {
      return []
    }
  })

  // Toast
  const [actionToast, setActionToast] = useState(null)
  const [revealedPasswords, setRevealedPasswords] = useState({})

  const togglePasswordVisibility = (id) => {
    setRevealedPasswords(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleQuickApprove = async (appr) => {
    setIsProcessingApproval(true)
    try {
      await SupportService.approveRequest(appr.id, 'Authorized & approved by Super Administrator')
      await loadAll()
      toast?.success?.(`Successfully approved ${appr.instituteName}! Campus is now Active.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'APPROVAL_GRANT',
          details: `Authorized onboarding approval for ${appr.instituteName} (${appr.id})`,
          target: appr.instituteName
        })
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_approvals_updated'))
      }
    } catch (err) {
      toast?.error?.('Error approving request: ' + err.message)
    } finally {
      setIsProcessingApproval(false)
    }
  }

  const handleQuickReject = async (apprOrId) => {
    const isObj = typeof apprOrId === 'object' && apprOrId !== null
    const id = isObj ? apprOrId.id : apprOrId
    const name = isObj ? apprOrId.instituteName : 'the applicant institution'

    const defaultReason = 'Documentation Verification Pending / Missing Board Affiliation NOC'
    const promptReason = window.prompt(`Please enter the official decision note for declining "${name}":`, defaultReason)
    if (promptReason === null) return // User cancelled

    setIsProcessingApproval(true)
    try {
      const finalNotes = promptReason.trim() || defaultReason
      await SupportService.rejectRequest(id, finalNotes)
      await loadAll()
      toast?.info?.(`Petition for "${name}" declined. Reason recorded.`)
      if (logAuditEvent) {
        logAuditEvent({
          action: 'APPROVAL_REJECT',
          details: `Declined petition for ${name} (${id}). Notes: ${finalNotes}`,
          target: name
        })
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_approvals_updated'))
      }
    } catch (err) {
      toast?.error?.('Error rejecting request: ' + err.message)
    } finally {
      setIsProcessingApproval(false)
    }
  }

  useEffect(() => {
    loadAll()
    const handleSync = () => loadAll()
    window.addEventListener('sms_tickets_updated', handleSync)
    window.addEventListener('sms_approvals_updated', handleSync)
    window.addEventListener('sms_approval_created', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('sms_tickets_updated', handleSync)
      window.removeEventListener('sms_approvals_updated', handleSync)
      window.removeEventListener('sms_approval_created', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'content') {
      loadContent(selectedContentKey)
    }
  }, [activeTab, selectedContentKey])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [t, a] = await Promise.all([
        SupportService.getTickets(),
        SupportService.getApprovals()
      ])
      setTickets(Array.isArray(t) ? t : [])
      setApprovals(Array.isArray(a) ? a : [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const loadContent = async (key) => {
    const doc = await SupportService.getContent(key)
    if (doc) {
      setContentDoc(doc)
      setContentDraft(doc)
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  // --- Ticket Actions ---
  const handleCreateNewTicket = async (e) => {
    e.preventDefault()
    if (!newTicketForm.subject.trim() || !newTicketForm.instituteName.trim()) return

    try {
      await SupportService.createTicket({
        instituteName: newTicketForm.instituteName.trim(),
        subject: newTicketForm.subject.trim(),
        category: newTicketForm.category,
        priority: newTicketForm.priority,
        message: newTicketForm.message.trim(),
        requesterName: 'Super Administrator',
        requesterEmail: 'superadmin@eims.edu.pk'
      })
      await loadAll()
      setIsNewTicketModalOpen(false)
      setNewTicketForm({ subject: '', category: 'General', priority: 'Medium', message: '', instituteName: '' })
      setActiveTab('tickets')
      setTicketStatusFilter('ALL')
      showToast('Support ticket created successfully!')
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_tickets_updated'))
      }
    } catch (err) {
      showToast('Failed to create ticket: ' + err.message)
    }
  }

  const handleOpenTicketThread = (ticket) => {
    setSelectedTicket(ticket)
    setReplyText('')
    setReplyStatus(ticket.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS')
  }

  const handleSendTicketReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim() || !selectedTicket) return
    setIsSendingReply(true)

    try {
      const res = await SupportService.replyTicket(selectedTicket.id, replyText, replyStatus)
      if (res.ticket) setSelectedTicket(res.ticket)
      loadAll()
      setReplyText('')
      showToast(`Reply sent to ${selectedTicket.requesterName}.`)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sms_tickets_updated'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsSendingReply(false)
    }
  }

  // --- Approval Actions ---
  const handleApprove = async () => {
    if (!selectedApproval) return
    setIsProcessingApproval(true)
    try {
      await SupportService.approveRequest(selectedApproval.id, approvalNotes)
      setSelectedApproval(null)
      loadAll()
      showToast(`Request "${selectedApproval.title}" APPROVED.`)
    } finally {
      setIsProcessingApproval(false)
    }
  }

  const handleReject = async () => {
    if (!selectedApproval) return
    setIsProcessingApproval(true)
    try {
      await SupportService.rejectRequest(selectedApproval.id, approvalNotes)
      setSelectedApproval(null)
      loadAll()
      showToast(`Request "${selectedApproval.title}" REJECTED.`)
    } finally {
      setIsProcessingApproval(false)
    }
  }

  // --- CMS Content Actions ---
  const handleSaveContent = async () => {
    await SupportService.saveContent(selectedContentKey, contentDraft)
    setContentDoc(contentDraft)
    setIsEditingContent(false)
    showToast('Platform CMS document updated.')
  }

  // Memoized computations & counters (Always call hooks at top-level before early returns)
  const safeApprovalsList = Array.isArray(approvals) ? approvals : []
  const safeTicketsList = Array.isArray(tickets) ? tickets : []

  const pendingApprovalsCount = useMemo(() => safeApprovalsList.filter(a => a && a.status === 'PENDING').length, [safeApprovalsList])
  const approvedApprovalsCount = useMemo(() => safeApprovalsList.filter(a => a && a.status === 'APPROVED').length, [safeApprovalsList])
  const rejectedApprovalsCount = useMemo(() => safeApprovalsList.filter(a => a && a.status === 'REJECTED').length, [safeApprovalsList])
  const openTicketsCount = useMemo(() => safeTicketsList.filter(t => t && (t.status === 'OPEN' || t.status === 'IN_PROGRESS')).length, [safeTicketsList])

  const filteredTickets = useMemo(() => {
    if (ticketStatusFilter === 'ALL') return safeTicketsList
    if (ticketStatusFilter === 'ACTIVE') return safeTicketsList.filter(t => t && (t.status === 'OPEN' || t.status === 'IN_PROGRESS'))
    return safeTicketsList.filter(t => t && t.status === ticketStatusFilter)
  }, [safeTicketsList, ticketStatusFilter])

  const filteredApprovals = useMemo(() => {
    if (approvalFilter === 'ALL') return safeApprovalsList
    return safeApprovalsList.filter(a => a && a.status === approvalFilter)
  }, [safeApprovalsList, approvalFilter])

  const dynamicNotifications = useMemo(() => {
    const list = []

    // 1. Pending approvals as notifications
    const safeApprovals = Array.isArray(approvals) ? approvals : []
    safeApprovals.forEach(a => {
      if (!a) return
      const nid = `appr-${a.id}`
      if (clearedNotifications.includes(nid)) return

      if (a.status === 'PENDING') {
        list.push({
          id: nid,
          type: 'approval',
          title: a.requestType === 'INSTITUTE_ONBOARDING' ? 'Campus Onboarding Application' : 'Administrative Directive Petition',
          message: `${a.instituteName || 'Campus'} requested official platform authorization.`,
          time: a.submittedAt ? new Date(a.submittedAt).toLocaleDateString() : 'Awaiting review',
          severity: 'urgent',
          actionTab: 'approvals'
        })
      }
    })

    // 2. Open / in-progress tickets
    const safeTickets = Array.isArray(tickets) ? tickets : []
    safeTickets.forEach(t => {
      if (!t) return
      const nid = `tkt-${t.id}`
      if (clearedNotifications.includes(nid)) return

      if (t.status === 'OPEN' || t.priority === 'High') {
        list.push({
          id: nid,
          type: 'ticket',
          title: `Support Ticket: #${t.ticketNumber || t.id}`,
          message: `${t.instituteName || 'Campus'}: "${t.subject || 'Inquiry'}"`,
          time: t.createdAt ? new Date(t.createdAt).toLocaleDateString() : 'Open',
          severity: t.priority === 'High' ? 'urgent' : 'medium',
          actionTab: 'tickets'
        })
      }
    })

    return list
  }, [approvals, tickets, clearedNotifications])

  const handleClearAllNotifications = () => {
    const allIds = dynamicNotifications.map(n => n.id)
    const updated = Array.from(new Set([...clearedNotifications, ...allIds]))
    setClearedNotifications(updated)
    localStorage.setItem('sms_cleared_notifications', JSON.stringify(updated))
    showToast('All notifications marked as read.')
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_approvals_updated'))
    }
  }

  const handleDismissNotification = (id) => {
    const updated = Array.from(new Set([...clearedNotifications, id]))
    setClearedNotifications(updated)
    localStorage.setItem('sms_cleared_notifications', JSON.stringify(updated))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('sms_approvals_updated'))
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading support ticketing & approval governance queues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
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

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <LifeBuoy className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Support, Governance & Approvals</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Support Desk & Approval Queue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Resolve institute inquiries, review campus affiliation and quota increase petitions, supervise notifications, and manage platform legal content.
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={LifeBuoy}
          title="Active Tickets"
          value={`${openTicketsCount} Unresolved`}
          badge="Campus inquiries"
          badgePositive={openTicketsCount === 0}
          color="blue"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setActiveTab('tickets'); setTicketStatusFilter('ALL'); }}
          onView={() => { setActiveTab('tickets'); setTicketStatusFilter('ACTIVE'); }}
          viewTooltip="View Active Inquiries & Reply"
          onAdd={() => setIsNewTicketModalOpen(true)}
          addTooltip="Create Support Ticket"
        />
        <StatCard
          icon={Clock}
          title="Pending Approvals"
          value={`${pendingApprovalsCount} Requests`}
          badge="Superadmin decision"
          badgePositive={pendingApprovalsCount === 0}
          color="amber"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('approvals')}
          onView={() => setActiveTab('approvals')}
          viewTooltip="Review Pending Approvals"
          onAdd={() => setActiveTab('approvals')}
          addTooltip="Process Approval Queue"
        />
        <StatCard
          icon={CheckCircle}
          title="Resolved Tickets"
          value={`${tickets.filter(t => t.status === 'RESOLVED').length} Tickets`}
          badge="Completed inquiries"
          badgePositive={true}
          color="emerald"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setActiveTab('tickets'); setTicketStatusFilter('RESOLVED'); }}
          onView={() => { setActiveTab('tickets'); setTicketStatusFilter('RESOLVED'); }}
          viewTooltip="View Resolved Archive"
          onAdd={() => setIsNewTicketModalOpen(true)}
          addTooltip="Open New Ticket"
        />
        <StatCard
          icon={Bell}
          title="Notification Stream"
          value="Synchronized"
          badge="Wired to platform bell"
          badgePositive={true}
          color="indigo"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('notifications')}
          onView={() => setActiveTab('notifications')}
          viewTooltip="Inspect Notification Stream"
          onAdd={() => setActiveTab('notifications')}
          addTooltip="Configure System Notifications"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6 overflow-x-auto text-sm font-medium">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'tickets'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Support Tickets ({tickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'approvals'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Approval Queue ({pendingApprovalsCount} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'notifications'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Center</span>
            {dynamicNotifications.length > 0 && (
              <span className="px-1.5 py-0.2 bg-purple-600 text-white text-[10px] rounded-full font-bold">
                {dynamicNotifications.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 border-b-2 flex items-center gap-2 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'content'
                ? 'border-purple-600 text-purple-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Platform Content & CMS</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: SUPPORT TICKETS */}
      {activeTab === 'tickets' && (
        <div className="space-y-3">
          {/* Sub-toolbar with filter pills & Create Ticket */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setTicketStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ticketStatusFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Tickets ({tickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ticketStatusFilter === 'ACTIVE'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Active / Unresolved ({openTicketsCount})
              </button>
              <button
                type="button"
                onClick={() => setTicketStatusFilter('OPEN')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ticketStatusFilter === 'OPEN'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Open ({tickets.filter(t => t.status === 'OPEN').length})
              </button>
              <button
                type="button"
                onClick={() => setTicketStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ticketStatusFilter === 'IN_PROGRESS'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                In Progress ({tickets.filter(t => t.status === 'IN_PROGRESS').length})
              </button>
              <button
                type="button"
                onClick={() => setTicketStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  ticketStatusFilter === 'RESOLVED'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Resolved ({tickets.filter(t => t.status === 'RESOLVED').length})
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsNewTicketModalOpen(true)}
              className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <LifeBuoy className="w-3.5 h-3.5" />
              <span>+ New Ticket</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Ticket #</th>
                  <th className="py-3.5 px-4">Institute & Requester</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4 text-center">Priority</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((tkt) => (
                  <tr key={tkt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {tkt.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{tkt.instituteName}</div>
                      <div className="text-[11px] text-slate-400">{tkt.requesterName} ({tkt.requesterEmail})</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900">{tkt.subject}</div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{tkt.category}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tkt.priority === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : tkt.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tkt.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          tkt.status === 'OPEN'
                            ? 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                            : tkt.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {tkt.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenTicketThread(tkt)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors cursor-pointer ml-auto"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Reply Thread</span>
                      </button>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400">
                      <LifeBuoy className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No support tickets found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Tickets from campus administrators will appear here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {/* Sub-toolbar with filter pills */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setApprovalFilter('PENDING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  approvalFilter === 'PENDING'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Pending Review</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  approvalFilter === 'PENDING' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {pendingApprovalsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setApprovalFilter('APPROVED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  approvalFilter === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Approved</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  approvalFilter === 'APPROVED' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {approvedApprovalsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setApprovalFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  approvalFilter === 'REJECTED'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Declined</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  approvalFilter === 'REJECTED' ? 'bg-rose-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {rejectedApprovalsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setApprovalFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  approvalFilter === 'ALL'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Petitions ({approvals.length})
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Approving an onboarding request automatically activates the campus & credentials.
            </p>
          </div>

          {filteredApprovals.length > 0 ? (
            filteredApprovals.map((appr) => {
            const isPending = appr.status === 'PENDING'
            const isOnboarding = appr.requestType === 'INSTITUTE_ONBOARDING'
            const details = appr.details || {}

            return (
              <div
                key={appr.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-5 sm:p-6 transition-all hover:shadow-md"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {appr.requestType.replace(/_/g, ' ')}
                      </span>
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          appr.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : appr.status === 'APPROVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {appr.status}
                      </span>
                      {details.planTier && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
                          {details.planTier}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{appr.title}</h3>
                    <p className="text-xs text-slate-500">
                      Institute: <span className="font-semibold text-slate-800">{appr.instituteName}</span> • Submitted: {new Date(appr.createdAt).toLocaleDateString()}
                    </p>

                    {/* Rich Details Breakdown for Institute Onboarding Petition */}
                    {isOnboarding ? (
                      <div className="mt-3 p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          {/* Administrator */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Administrator</span>
                            <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                              <User className="w-3.5 h-3.5 text-purple-600" />
                              <span>{details.contactPerson || details.adminName || 'Principal Administrator'}</span>
                            </span>
                          </div>

                          {/* Contact Info */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Contact</span>
                            <div className="flex items-center justify-between text-slate-800 mt-0.5">
                              <span className="font-mono text-[11px] font-medium">{details.email || 'N/A'}</span>
                              {details.email && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(details.email)
                                    setActionToast('Email copied to clipboard!')
                                    setTimeout(() => setActionToast(null), 2500)
                                  }}
                                  className="text-slate-400 hover:text-purple-600 p-0.5"
                                  title="Copy Email"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-slate-600 text-[11px] mt-0.5 font-mono">
                              <span>{details.phone || 'N/A'}</span>
                              {details.phone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(details.phone)
                                    setActionToast('Phone copied to clipboard!')
                                    setTimeout(() => setActionToast(null), 2500)
                                  }}
                                  className="text-slate-400 hover:text-purple-600 p-0.5"
                                  title="Copy Phone"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Location & Wing */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Wing & Location</span>
                            <span className="font-bold text-purple-700 block mt-0.5">
                              {details.wingType || details.wing || 'School Wing'}
                            </span>
                            <span className="text-slate-500 text-[11px] block mt-0.5">
                              {details.city || 'Pakistan'} {details.campusCode ? `(${details.campusCode})` : ''}
                            </span>
                          </div>

                          {/* Admin Password */}
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Admin Password</span>
                            {details.adminPassword ? (
                              <div className="flex items-center justify-between mt-0.5 gap-1">
                                <span className="font-mono text-xs font-bold text-slate-800">
                                  {revealedPasswords[appr.id] ? details.adminPassword : '••••••••••••'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility(appr.id)}
                                    className="p-1 text-slate-400 hover:text-purple-600 cursor-pointer"
                                    title="Toggle visibility"
                                  >
                                    {revealedPasswords[appr.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      navigator.clipboard.writeText(details.adminPassword)
                                      setActionToast('Admin Password copied to clipboard!')
                                      setTimeout(() => setActionToast(null), 2500)
                                    }}
                                    className="p-1 text-slate-400 hover:text-emerald-600 cursor-pointer"
                                    title="Copy Password"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">System Generated</span>
                            )}
                          </div>
                        </div>

                        {details.notes && (
                          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs text-purple-950">
                            <span className="font-bold text-purple-800 text-[11px] block">Additional Instructions or Campus Requirements:</span>
                            <p className="mt-0.5 text-slate-700 leading-relaxed">{details.notes}</p>
                          </div>
                        )}
                      </div>
                    ) : appr.requestType === 'QUOTA_INCREASE' ? (
                      <div className="mt-3 p-3.5 sm:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Capacity</span>
                            <span className="font-bold text-slate-800 mt-0.5 block">
                              {details.currentQuota ? Number(details.currentQuota).toLocaleString() + ' Students' : 'N/A'}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Requested Quota</span>
                            <span className="font-bold text-purple-700 mt-0.5 flex items-center gap-1.5">
                              <span>{details.requestedQuota ? Number(details.requestedQuota).toLocaleString() + ' Students' : 'N/A'}</span>
                              {details.requestedQuota && details.currentQuota && (
                                <span className="text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.2 rounded">
                                  +{Number(details.requestedQuota) - Number(details.currentQuota)}
                                </span>
                              )}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Subscription Tier</span>
                            <span className="font-bold text-emerald-700 mt-0.5 block">
                              {details.plan || 'Standard Tier'}
                            </span>
                          </div>

                          <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Evaluation Status</span>
                            <span className="font-bold text-amber-700 mt-0.5 block">
                              Awaiting Governance Review
                            </span>
                          </div>
                        </div>

                        {details.reason && (
                          <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                            <span className="font-bold text-purple-800 text-[11px] block">Quota Extension Justification:</span>
                            <p className="mt-0.5 text-slate-700 leading-relaxed">{details.reason}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1.5">
                        {Object.entries(details).length > 0 ? (
                          Object.entries(details).map(([k, v]) => (
                            <div key={k} className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                              <span className="text-slate-600 font-mono text-[11px]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-400 italic">No additional request payload parameters.</p>
                        )}
                      </div>
                    )}

                    {appr.reviewerNotes && (
                      <p className="text-xs text-purple-700 mt-2">
                        <strong>Reviewer Decision Note:</strong> {appr.reviewerNotes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isPending && (
                    <div className="flex flex-wrap md:flex-col items-center gap-2 shrink-0 self-end md:self-center">
                      <button
                        onClick={() => handleQuickApprove(appr)}
                        disabled={isProcessingApproval}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize & Approve</span>
                      </button>

                      <button
                        onClick={() => handleQuickReject(appr)}
                        disabled={isProcessingApproval}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>

                      <button
                        onClick={() => {
                          setSelectedApproval(appr)
                          setApprovalNotes('')
                        }}
                        className="px-3 py-1 text-slate-500 hover:text-slate-800 font-medium text-[11px] transition-colors cursor-pointer"
                      >
                        Review Notes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-xs">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                {approvalFilter === 'PENDING' ? 'All Approvals Cleared' : 'No Petitions Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
                {approvalFilter === 'PENDING'
                  ? 'There are no pending administrative petitions or onboarding approvals requiring review right now.'
                  : `No petitions matched the current status filter (${approvalFilter}).`}
              </p>
              {approvalFilter !== 'ALL' && (approvals || []).length > 0 && (
                <button
                  onClick={() => setApprovalFilter('ALL')}
                  className="px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>View All Approvals History ({(approvals || []).length})</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: NOTIFICATION CENTER */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">Notification Center</h3>
              <p className="text-xs text-slate-500">Real-time alerts, support requests, and platform directives</p>
            </div>
            {dynamicNotifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAllNotifications}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mark All as Read ({dynamicNotifications.length})</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {dynamicNotifications.length > 0 ? (
              dynamicNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 transition-all ${
                    notif.severity === 'urgent'
                      ? 'bg-purple-50/70 border-purple-200'
                      : 'bg-amber-50/70 border-amber-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      notif.severity === 'urgent' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {notif.type === 'approval' ? <Bell className="w-4.5 h-4.5" /> : <LifeBuoy className="w-4.5 h-4.5" />}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{notif.title}</span>
                      <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{notif.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveTab(notif.actionTab)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDismissNotification(notif.id)}
                      className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                      title="Dismiss notification"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">All Notifications Cleared</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  You are all caught up! When campus administrators submit petitions or tickets, they will appear here in real-time.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM CONTENT CMS */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Submenu */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-4 space-y-1 h-fit">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block px-3 py-1">
              CMS Pages
            </span>
            {[
              { key: 'terms_of_service', label: 'Terms of Service' },
              { key: 'privacy_policy', label: 'Privacy Policy' },
              { key: 'faqs', label: 'Platform FAQs' },
              { key: 'release_notes', label: 'Release Notes (v2.4.0)' }
            ].map((p) => (
              <button
                key={p.key}
                onClick={() => {
                  setSelectedContentKey(p.key)
                  setIsEditingContent(false)
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  selectedContentKey === p.key
                    ? 'bg-[#f5eeff] text-purple-700'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Content Preview & Editor */}
          <div className="md:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">{contentDoc?.title || 'CMS Document'}</h3>
                <span className="text-xs text-slate-400">Version {contentDoc?.version || '1.0.0'}</span>
              </div>
              <button
                onClick={() => setIsEditingContent(!isEditingContent)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5 text-purple-600" />
                <span>{isEditingContent ? 'Preview Markdown' : 'Edit Document'}</span>
              </button>
            </div>

            {isEditingContent ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    value={contentDraft.title}
                    onChange={(e) => setContentDraft({ ...contentDraft, title: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Markdown Body</label>
                  <textarea
                    rows="12"
                    value={contentDraft.content}
                    onChange={(e) => setContentDraft({ ...contentDraft, content: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingContent(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContent}
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none text-slate-700 space-y-2 whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {contentDoc?.content}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TICKET REPLY THREAD MODAL */}
      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title={`Support Thread: ${selectedTicket?.ticketNumber}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900">{selectedTicket?.instituteName}</span>
              <p className="text-slate-500">{selectedTicket?.subject}</p>
            </div>
            <span className="font-semibold text-purple-700 uppercase">{selectedTicket?.status}</span>
          </div>

          {/* Conversation history */}
          <div className="space-y-3 max-h-64 overflow-y-auto p-2">
            {(selectedTicket?.messages || []).map((msg, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl text-xs space-y-1 ${
                  msg.role === 'Superadmin'
                    ? 'bg-[#f5eeff] text-blue-900 border border-purple-200 ml-6'
                    : 'bg-slate-100 text-slate-800 mr-6'
                }`}
              >
                <div className="flex justify-between font-semibold">
                  <span>{msg.sender} ({msg.role})</span>
                  <span className="text-[10px] text-slate-400 font-normal">{msg.time}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <form onSubmit={handleSendTicketReply} className="space-y-3 pt-3 border-t border-slate-100">
            <textarea
              rows="3"
              required
              placeholder="Type your response to the campus administrator..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-medium">Update Status:</span>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value)}
                  className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg bg-white"
                >
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSendingReply}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSendingReply ? 'Sending...' : 'Send Reply'}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* CREATE NEW SUPPORT TICKET MODAL */}
      {isNewTicketModalOpen && (
        <Modal
          isOpen={isNewTicketModalOpen}
          onClose={() => setIsNewTicketModalOpen(false)}
          title="Create New Campus Support Ticket"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleCreateNewTicket} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Campus / Institute Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Allama Iqbal Campus / Kips College"
                value={newTicketForm.instituteName}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, instituteName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Ticket Subject <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Assistance configuring online fee payment gateway"
                value={newTicketForm.subject}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Category</label>
                <select
                  value={newTicketForm.category}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="General">General Inquiry</option>
                  <option value="Billing & POS">Billing & POS</option>
                  <option value="Academic Operations">Academic Operations</option>
                  <option value="Exams & Grading">Exams & Grading</option>
                  <option value="Attendance & SIS">Attendance & SIS</option>
                  <option value="Security & Access">Security & Access</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase mb-1">Priority</label>
                <select
                  value={newTicketForm.priority}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase mb-1">
                Initial Message / Description <span className="text-rose-500 font-bold">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Describe the inquiry or support requirements..."
                value={newTicketForm.message}
                onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsNewTicketModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Create & Open Ticket</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* APPROVAL DECISION MODAL */}
      <Modal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title="Review Educational Institution Petition"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {selectedApproval?.requestType?.replace(/_/g, ' ')}
              </span>
              <span className="text-xs font-bold text-slate-500">
                ID: {selectedApproval?.id}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-base mt-1">{selectedApproval?.title}</h4>
            <p className="text-xs text-slate-500">Petitioner: <strong className="text-slate-800">{selectedApproval?.instituteName}</strong></p>
          </div>

          {selectedApproval?.requestType === 'INSTITUTE_ONBOARDING' && selectedApproval?.details ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Administrator</span>
                  <span className="font-bold text-slate-800 block mt-0.5">
                    {selectedApproval.details.contactPerson || selectedApproval.details.adminName || 'Principal'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Selected Subscription</span>
                  <span className="font-bold text-purple-700 block mt-0.5">
                    {selectedApproval.details.planTier || 'Standard'}
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Official Email</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono text-slate-800">{selectedApproval.details.email || 'N/A'}</span>
                    {selectedApproval.details.email && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedApproval.details.email)
                          setActionToast('Email copied!')
                          setTimeout(() => setActionToast(null), 2000)
                        }}
                        className="text-slate-400 hover:text-purple-600 p-0.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Mobile / WhatsApp</span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono text-slate-800">{selectedApproval.details.phone || 'N/A'}</span>
                    {selectedApproval.details.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedApproval.details.phone)
                          setActionToast('Phone copied!')
                          setTimeout(() => setActionToast(null), 2000)
                        }}
                        className="text-slate-400 hover:text-purple-600 p-0.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Wing & City</span>
                  <span className="font-medium text-slate-800 block mt-0.5">
                    {selectedApproval.details.wingType || selectedApproval.details.wing || 'School'} ({selectedApproval.details.city || 'Pakistan'})
                  </span>
                </div>

                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admin Password</span>
                  {selectedApproval.details.adminPassword ? (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="font-mono font-bold text-slate-900">
                        {revealedPasswords[selectedApproval.id] ? selectedApproval.details.adminPassword : '••••••••••••'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(selectedApproval.id)}
                          className="p-1 text-slate-400 hover:text-purple-600"
                        >
                          {revealedPasswords[selectedApproval.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(selectedApproval.details.adminPassword)
                            setActionToast('Password copied to clipboard!')
                            setTimeout(() => setActionToast(null), 2000)
                          }}
                          className="p-1 text-slate-400 hover:text-emerald-600"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">System Generated</span>
                  )}
                </div>
              </div>

              {selectedApproval.details.notes && (
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-xs">
                  <span className="font-bold text-purple-800 block">Custom Requirements / Instructions:</span>
                  <p className="mt-0.5 text-slate-700">{selectedApproval.details.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-mono text-slate-800 max-h-48 overflow-y-auto">
              {JSON.stringify(selectedApproval?.details, null, 2)}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Super Administrator Decision Notes / Instructions
            </label>
            <textarea
              rows="2"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="State any conditions or notes for the institutional administrator..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={isProcessingApproval}
              onClick={handleReject}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Decline Petition
            </button>
            <button
              type="button"
              disabled={isProcessingApproval}
              onClick={handleApprove}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Authorize & Approve</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SupportApprovalsView
