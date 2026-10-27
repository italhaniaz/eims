import React, { useState, useEffect } from 'react'
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
  Edit2
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { SupportService } from '../../../services/supportService'

const SupportApprovalsView = () => {
  const [activeTab, setActiveTab] = useState('tickets') // 'tickets', 'approvals', 'notifications', 'content'
  const [tickets, setTickets] = useState([])
  const [approvals, setApprovals] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL')
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

  // Toast
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadAll()
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
      setTickets(t)
      setApprovals(a)
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

  const pendingApprovalsCount = approvals.filter(a => a.status === 'PENDING').length
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

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
          onShowAll={() => setActiveTab('tickets')}
          onView={() => setActiveTab('tickets')}
          viewTooltip="View All Support Tickets"
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
                {(ticketStatusFilter === "ALL" ? tickets : tickets.filter(t => t.status === ticketStatusFilter)).map((tkt) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVAL QUEUE */}
      {activeTab === 'approvals' && (
        <div className="space-y-4">
          {approvals.map((appr) => (
            <div
              key={appr.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {appr.requestType.replace(/_/g, ' ')}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      appr.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : appr.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {appr.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{appr.title}</h3>
                <p className="text-xs text-slate-500">
                  Institute: <span className="font-semibold text-slate-800">{appr.instituteName}</span> • Submitted: {new Date(appr.createdAt).toLocaleDateString()}
                </p>

                {/* Details snippet */}
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-mono text-slate-700 mt-2">
                  {JSON.stringify(appr.details)}
                </div>

                {appr.reviewerNotes && (
                  <p className="text-xs text-purple-700 mt-1">
                    <strong>Reviewer Decision Note:</strong> {appr.reviewerNotes}
                  </p>
                )}
              </div>

              {appr.status === 'PENDING' && (
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  <button
                    onClick={() => {
                      setSelectedApproval(appr)
                      setApprovalNotes('')
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Review Petition
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: NOTIFICATION CENTER */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Notification Center</h3>
              <p className="text-xs text-slate-500">Real-time alerts, security notifications, and platform directives</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-[#f5eeff]/70 border border-purple-200 flex items-start gap-3">
              <Bell className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-950 block">Pending Affiliation Petition</span>
                <p className="text-xs text-purple-800 mt-0.5">
                  Lahore Grammar Collegiate System has submitted an application for multi-campus affiliation.
                </p>
                <span className="text-[10px] text-purple-600 font-semibold mt-1 block">6 hours ago</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-amber-950 block">Quota Surge Petition</span>
                <p className="text-xs text-amber-800 mt-0.5">
                  City School Model Town requested an enrollment cap increase (+500 students).
                </p>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Yesterday at 05:00 PM</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">Session Governance Executed</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  Superadmin executed force logout for remote session on Beaconhouse campus.
                </p>
                <span className="text-[10px] text-slate-400 font-semibold mt-1 block">12 hours ago</span>
              </div>
            </div>
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

      {/* APPROVAL DECISION MODAL */}
      <Modal
        isOpen={!!selectedApproval}
        onClose={() => setSelectedApproval(null)}
        title="Review Affiliation / Quota Petition"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm">{selectedApproval?.title}</h4>
            <p className="text-xs text-slate-500 mt-0.5">Petitioner: {selectedApproval?.instituteName}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] text-xs font-mono text-slate-800">
            {JSON.stringify(selectedApproval?.details, null, 2)}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Super Administrator Decision Notes / Instructions
            </label>
            <textarea
              rows="3"
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="State any conditions or reason for approval/rejection..."
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Authorize & Approve
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SupportApprovalsView
