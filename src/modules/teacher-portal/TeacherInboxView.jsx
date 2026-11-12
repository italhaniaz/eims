import React, { useState, useMemo } from 'react'
import {
  Inbox as InboxIcon,
  Send,
  Plus,
  Search,
  Bell,
  User,
  MessageSquare,
  Calendar,
  BookMarked,
  Megaphone,
  CheckSquare,
  FileEdit,
  Wallet,
  ArrowLeft,
  X,
  CheckCheck
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'

export default function TeacherInboxView({
  onBack,
  onNavigate,
  onOpenModal,
  teacherName = 'Teacher'
}) {
  const { toast } = useToast()

  // Conversations State (Defaults to 0 empty state as in screenshot)
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem('teacher_portal_inbox')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {}
    return []
  })

  // Selected conversation ID
  const [selectedChatId, setSelectedChatId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [replyText, setReplyText] = useState('')

  // New Message Modal
  const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false)
  const [newMsgForm, setNewMsgForm] = useState({
    recipient: 'Principal / Administration',
    role: 'Admin',
    subject: '',
    message: ''
  })

  // Filtered conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations
    return conversations.filter(
      (c) =>
        c.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [conversations, searchQuery])

  // Active chat
  const activeChat = useMemo(() => {
    return conversations.find((c) => c.id === selectedChatId)
  }, [conversations, selectedChatId])

  // Send New Conversation
  const handleStartConversation = (e) => {
    e.preventDefault()
    if (!newMsgForm.message.trim()) {
      toast?.error?.('Please enter a message.')
      return
    }

    const newChat = {
      id: `chat-${Date.now()}`,
      contactName: newMsgForm.recipient,
      role: newMsgForm.role,
      subject: newMsgForm.subject || 'General Inquiry',
      lastMessage: newMsgForm.message.trim(),
      updatedAt: 'Just now',
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: teacherName,
          text: newMsgForm.message.trim(),
          timestamp: 'Just now',
          isMe: true
        }
      ]
    }

    const updated = [newChat, ...conversations]
    setConversations(updated)
    try {
      localStorage.setItem('teacher_portal_inbox', JSON.stringify(updated))
    } catch {}

    setSelectedChatId(newChat.id)
    setIsNewMessageModalOpen(false)
    setNewMsgForm({
      recipient: 'Principal / Administration',
      role: 'Admin',
      subject: '',
      message: ''
    })
    toast?.success?.(`Message sent to ${newChat.contactName}!`)
  }

  // Send Reply
  const handleSendReply = (e) => {
    e.preventDefault()
    if (!replyText.trim() || !activeChat) return

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: teacherName,
      text: replyText.trim(),
      timestamp: 'Just now',
      isMe: true
    }

    const updated = conversations.map((c) => {
      if (c.id === activeChat.id) {
        return {
          ...c,
          lastMessage: replyText.trim(),
          updatedAt: 'Just now',
          messages: [...(c.messages || []), newMsg]
        }
      }
      return c
    })

    setConversations(updated)
    try {
      localStorage.setItem('teacher_portal_inbox', JSON.stringify(updated))
    } catch {}
    setReplyText('')
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/70 dark:bg-slate-950">
      {/* ========================================================= */}
      {/* 1. SUB-HEADER BAR */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-2xs">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 font-black text-sm text-slate-900 dark:text-white">
            <InboxIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Inbox</span>
          </div>
          <button
            onClick={onBack}
            className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 flex items-center gap-1.5 transition-colors mt-0.5 cursor-pointer text-left w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Top Quick Links Bar */}
        <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => onNavigate ? onNavigate('assignments') : onOpenModal && onOpenModal('assignments')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('announcements') : onOpenModal && onOpenModal('announcements')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Announcements</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('mark-attendance') : onOpenModal && onOpenModal('mark-attendance')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Mark Attendance</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('marks-entry') : onOpenModal && onOpenModal('marks-entry')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Marks Entry</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('timetable') : onOpenModal && onOpenModal('timetable')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetables & Exam Schedules</span>
          </button>
          <button
            onClick={() => onNavigate ? onNavigate('my-transactions') : onOpenModal && onOpenModal('salary')}
            className="flex items-center gap-1.5 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>My Salary</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN SCROLL CONTAINER */}
      {/* ========================================================= */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden flex flex-col min-h-[500px]">
          {/* Header Row matching screenshot 2 */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <InboxIcon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Inbox
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsNewMessageModalOpen(true)}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('notifications')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Notifications
              </button>
            </div>
          </div>

          {/* TWO-COLUMN SPLIT LAYOUT MATCHING SCREENSHOT 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 dark:divide-slate-800">
            {/* Left Column: Conversations List (lg:col-span-4) */}
            <div className="lg:col-span-4 p-4 space-y-3 flex flex-col">
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  CONVERSATIONS
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name..."
                    className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Conversations List / Empty state */}
              <div className="flex-1 overflow-y-auto space-y-1 pt-1">
                {filteredConversations.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-left">
                    No conversations yet. Click <strong>Send Message</strong> to start.
                  </p>
                ) : (
                  filteredConversations.map((chat) => (
                    <button
                      key={chat.id}
                      type="button"
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer flex items-start gap-3 ${
                        selectedChatId === chat.id
                          ? 'bg-sky-50 dark:bg-sky-950/50 border border-sky-200 dark:border-sky-800'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300 shrink-0">
                        {chat.contactName.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {chat.contactName}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {chat.updatedAt}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {chat.lastMessage}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Chat Content (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col justify-between p-6">
              {!activeChat ? (
                /* Empty state matching screenshot 2 */
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Select a conversation
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Choose a chat on the left, or send a new message.
                    </p>
                  </div>

                  <div className="my-auto py-16 text-center text-xs text-slate-400">
                    Select a conversation or click <strong>Send Message</strong>
                  </div>
                </div>
              ) : (
                /* Active Chat Thread */
                <div className="flex-1 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        {activeChat.contactName}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {activeChat.role} • Subject: {activeChat.subject}
                      </p>
                    </div>
                  </div>

                  {/* Messages Bubble List */}
                  <div className="flex-1 overflow-y-auto space-y-3 py-2">
                    {activeChat.messages?.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                            msg.isMe
                              ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.text}</p>
                          <span className={`text-[10px] block text-right ${msg.isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input Box */}
                  <form onSubmit={handleSendReply} className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply message..."
                      className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                    <button
                      type="submit"
                      className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. SEND NEW MESSAGE MODAL */}
      {/* ========================================================= */}
      {isNewMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-sky-600" />
                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Send New Message
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsNewMessageModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStartConversation} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Recipient
                </label>
                <select
                  value={newMsgForm.recipient}
                  onChange={(e) => {
                    const role = e.target.value.includes('Parent') ? 'Parent' : 'Admin'
                    setNewMsgForm({ ...newMsgForm, recipient: e.target.value, role })
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
                >
                  <option value="Principal / Administration">Principal / Administration (Admin)</option>
                  <option value="Younus Baig (Parent of Carl)">Younus Baig (Parent of Carl Blanchard)</option>
                  <option value="Abubakar (Parent of Ariyan)">Abubakar (Parent of Ariyan)</option>
                  <option value="Gul (Parent of Nur)">Gul (Parent of Nur)</option>
                  <option value="All Nursery Parents">Broadcast to All Nursery Parents</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={newMsgForm.subject}
                  onChange={(e) => setNewMsgForm({ ...newMsgForm, subject: e.target.value })}
                  placeholder="e.g. Student Progress Update, Leave Discussion..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-extrabold uppercase text-slate-400 block tracking-wider">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  required
                  value={newMsgForm.message}
                  onChange={(e) => setNewMsgForm({ ...newMsgForm, message: e.target.value })}
                  placeholder="Write your message here..."
                  className="w-full text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
