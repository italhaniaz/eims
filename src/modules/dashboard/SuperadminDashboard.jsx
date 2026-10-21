import React, { useState } from 'react'
import { 
  Users, 
  Building2, 
  TrendingUp, 
  ArrowUpRight, 
  UserPlus, 
  FileText, 
  ListFilter, 
  Settings,
  Plus,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  AlertCircle,
  FolderPlus,
  School,
  Radio,
  Send,
  Eye,
  AlertTriangle,
  X,
  ShieldCheck,
  GraduationCap
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import Modal from '../../components/common/Modal'
import { useAppData } from '../../context/AppDataContext'

export const SuperadminDashboard = ({ onRouteChange, onOpenSettings }) => {
  const { 
    stats, 
    recentActivity, 
    addItem, 
    generateReport, 
    sendCommunicationBlast, 
    institutes,
    notices = []
  } = useAppData()
  
  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false)
  const urgentNotice = (notices || []).find(n => n.category === 'Urgent' || n.priority === 'Urgent' || n.pinned)
  
  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isInstituteModalOpen, setIsInstituteModalOpen] = useState(false)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  
  // Feedback toast state
  const [feedbackToast, setFeedbackToast] = useState(null)
  const [reportSuccess, setReportSuccess] = useState(false)

  // User form data
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: ''
  })

  // Institute form data
  const [newInstituteData, setNewInstituteData] = useState({
    name: '',
    code: '',
    city: '',
    address: '',
    email: '',
    phone: ''
  })

  // Broadcast form data
  const [broadcastData, setBroadcastData] = useState({
    title: '',
    channel: 'SMS',
    recipientGroup: 'All Active Users',
    message: ''
  })

  const triggerToast = (msg) => {
    setFeedbackToast(msg)
    setTimeout(() => setFeedbackToast(null), 3500)
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUserData.name || !newUserData.email) return

    await addItem('users', {
      name: newUserData.name,
      email: newUserData.email,
      role: newUserData.role,
      institute: newUserData.institute || 'Central Headquarters',
      phone: newUserData.phone || '+92 300 0000000',
      status: 'Active',
      lastLogin: 'Just now'
    })

    setIsUserModalOpen(false)
    setNewUserData({
      name: '',
      email: '',
      role: 'institute_admin',
      institute: '',
      phone: ''
    })
    triggerToast('New user account created and permissions activated!')
  }

  const handleCreateInstitute = async (e) => {
    e.preventDefault()
    if (!newInstituteData.name || !newInstituteData.code) return

    await addItem('institutes', {
      name: newInstituteData.name,
      code: newInstituteData.code.toUpperCase(),
      city: newInstituteData.city || 'Central District',
      address: newInstituteData.address || `${newInstituteData.name} Campus, Central District`,
      email: newInstituteData.email || 'info@campus.edu',
      phone: newInstituteData.phone || '+92 300 0000000',
      studentsCount: 0,
      teachersCount: 0,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0]
    })

    setIsInstituteModalOpen(false)
    setNewInstituteData({
      name: '',
      code: '',
      city: '',
      address: '',
      email: '',
      phone: ''
    })
    triggerToast('New institute registered successfully in the system database!')
  }

  const handleSendBroadcast = (e) => {
    e.preventDefault()
    if (!broadcastData.message) return

    if (sendCommunicationBlast) {
      sendCommunicationBlast(broadcastData)
    } else {
      addItem('recentActivity', {
        text: `Sent ${broadcastData.channel} broadcast to ${broadcastData.recipientGroup}`,
        time: 'Just now'
      })
    }

    setIsBroadcastModalOpen(false)
    setBroadcastData({
      title: '',
      channel: 'SMS',
      recipientGroup: 'All Active Users',
      message: ''
    })
    triggerToast('Broadcast announcement sent to active platform sessions!')
  }

  const handleGenerateReport = () => {
    generateReport()
    setReportSuccess(true)
    setTimeout(() => setReportSuccess(false), 3500)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Report Success Toast */}
      {reportSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium">Audit CSV report downloaded & platform activity recorded successfully!</span>
          </div>
          <button 
            onClick={() => setReportSuccess(false)}
            className="text-xs text-emerald-700 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* General Action Feedback Toast */}
      {feedbackToast && (
        <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium">{feedbackToast}</span>
          </div>
          <button 
            onClick={() => setFeedbackToast(null)}
            className="text-xs text-blue-700 underline font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Critical Emergency Directive Alert Banner */}
      {urgentNotice && !isNoticeDismissed && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in border border-rose-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 text-amber-200">
                  PLATFORM DIRECTIVE • URGENT BROADCAST
                </span>
                <span className="text-xs text-white/80">{urgentNotice.date}</span>
              </div>
              <h3 className="text-sm font-bold mt-0.5 leading-snug">{urgentNotice.title}</h3>
              <p className="text-xs text-white/90 line-clamp-1 mt-0.5">{urgentNotice.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onRouteChange('announcements')}
              className="px-3.5 py-1.5 bg-white text-rose-900 rounded-lg text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
            >
              View Directives
            </button>
            <button
              onClick={() => setIsNoticeDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
              title="Dismiss Directive"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Fresh System State Guidance Notice if 0 items */}
      {stats.totalUsers === 0 && stats.totalInstitutes === 0 && (
        <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white border border-blue-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(37,99,235,0.05)]">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
              0
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">Fresh System State (0 Initial Entries)</p>
                <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100/70 text-blue-700">
                  Ready for Data
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Start entering new institutes, academic programs, and users to build your system records.</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setIsInstituteModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm hover:shadow transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <School className="w-3.5 h-3.5" />
              <span>Add First Institute</span>
            </button>
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 active:scale-[0.98]"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Add First User</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Stat Cards - Enhanced with Action Footer Bar (Show all + Eye View + Plus Add) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          color="blue"
          icon={Users}
          badge={stats.totalUsers > 0 ? `${stats.totalUsers} registered` : '0 registered'}
          badgePositive={stats.totalUsers > 0}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('users-all')}
          onView={() => onRouteChange('users-all')}
          viewTooltip="View All Registered Users"
          onAdd={() => setIsUserModalOpen(true)}
          addTooltip="Create New User"
        />

        <StatCard
          title="Total Institutes"
          value={stats.totalInstitutes}
          color="indigo"
          icon={Building2}
          badge={stats.totalInstitutes > 0 ? `${stats.totalInstitutes} registered` : '0 registered'}
          badgePositive={stats.totalInstitutes > 0}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('institutes')}
          onView={() => onRouteChange('institutes')}
          viewTooltip="View All Institutes & Campuses"
          onAdd={() => setIsInstituteModalOpen(true)}
          addTooltip="Register New Institute"
        />

        <StatCard
          title="Active Sessions"
          value={stats.activeSessions ? stats.activeSessions.toLocaleString() : '0'}
          color="emerald"
          icon={TrendingUp}
          badge={stats.activeSessions > 0 ? `+${stats.activeSessions * 2}% live` : 'Real-time'}
          badgePositive={true}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('audit-logs')}
          onView={() => onRouteChange('audit-logs')}
          viewTooltip="Inspect Live Security Audit Logs"
          onAdd={() => setIsBroadcastModalOpen(true)}
          addTooltip="Broadcast Message to Active Sessions"
        />

        <StatCard
          title="Growth Rate"
          value={stats.growthRate || '0.0%'}
          color="amber"
          icon={ArrowUpRight}
          badge={stats.totalInstitutes > 0 ? '+5.4% YoY' : 'Real-time'}
          badgePositive={true}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('finance')}
          onView={() => onRouteChange('finance')}
          viewTooltip="View Financial & Growth Analytics"
          onAdd={handleGenerateReport}
          addTooltip="Generate & Download Growth Audit Report"
        />
      </div>

      {/* Main Two Columns: Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Recent Activity (Takes 7 of 12 columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Recent Activity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your platform activity over the last 30 days</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full font-mono">
              {recentActivity.length} events logged
            </span>
          </div>

          {/* Activity items with status indicators */}
          <div className="divide-y divide-slate-100">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.slice(0, 6).map((act, idx) => (
                <div 
                  key={act.id || idx}
                  className="py-3.5 flex items-center justify-between text-sm group hover:bg-slate-50/70 px-2.5 rounded-lg transition-colors"
                >
                  <span className="text-slate-700 font-medium text-xs sm:text-sm">{act.text}</span>
                  <div className="flex items-center gap-2.5 shrink-0 ml-3">
                    <span className="text-[11px] text-slate-400">{act.time}</span>
                    <span 
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: act.dotColor || '#3b82f6' }}
                    ></span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-1">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-700">No activity recorded yet</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Whenever you add, update, or remove entries in any module, real-time activity logs will display here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions (Takes 5 of 12 columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Quick Actions</h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shortcuts</span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Roles & Permissions (RBAC Matrix) */}
            <button
              onClick={() => onRouteChange('users-roles')}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-indigo-400 hover:shadow-sm text-slate-700 font-medium text-sm transition-all duration-150 group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-indigo-600 transition-colors truncate">
                    Roles & RBAC Matrix
                  </span>
                  <span className="block text-[11px] text-slate-400 font-normal truncate">
                    Manage 6 platform roles & permission policies
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* 2. Generate Executive Report */}
            <button
              onClick={handleGenerateReport}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-emerald-400 hover:shadow-sm text-slate-700 font-medium text-sm transition-all duration-150 group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Download className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-emerald-600 transition-colors truncate">
                    Generate Executive Report
                  </span>
                  <span className="block text-[11px] text-slate-400 font-normal truncate">
                    Download multi-campus audit CSV snapshot
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* 3. Broadcast Announcement */}
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-blue-400 hover:shadow-sm text-slate-700 font-medium text-sm transition-all duration-150 group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Radio className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-blue-600 transition-colors truncate">
                    Broadcast Announcement
                  </span>
                  <span className="block text-[11px] text-slate-400 font-normal truncate">
                    Instant alert dispatch to active sessions
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* 4. Academic Programs & Boards */}
            <button
              onClick={() => onRouteChange('programs')}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-purple-400 hover:shadow-sm text-slate-700 font-medium text-sm transition-all duration-150 group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-purple-600 group-hover:text-white">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-purple-600 transition-colors truncate">
                    Academic Programs & Boards
                  </span>
                  <span className="block text-[11px] text-slate-400 font-normal truncate">
                    Configure global degrees, boards & streams
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </button>

            {/* 5. Platform Settings */}
            <button
              onClick={onOpenSettings}
              className="w-full flex items-center justify-between p-3 sm:p-3.5 rounded-xl bg-slate-50/80 hover:bg-white border border-slate-200/70 hover:border-slate-400 hover:shadow-sm text-slate-700 font-medium text-sm transition-all duration-150 group active:scale-[0.99] text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 transition-colors group-hover:bg-slate-700 group-hover:text-white">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm group-hover:text-slate-900 transition-colors truncate">
                    Platform Settings
                  </span>
                  <span className="block text-[11px] text-slate-400 font-normal truncate">
                    Global platform configurations & preferences
                  </span>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 ml-2" />
            </button>
          </div>
        </div>

      </div>

      {/* Quick Modal 1: Create New User */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Create New System User"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Dr. Salman Qureshi"
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. salman.q@sms.edu"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Role</label>
              <select
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option value="superadmin">Superadmin</option>
                <option value="institute_admin">Institute Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+92 300 1234567"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Institute</label>
            {institutes && institutes.length > 0 ? (
              <select
                value={newUserData.institute}
                onChange={(e) => setNewUserData({ ...newUserData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
              >
                <option value="">Select an Institute...</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name} ({inst.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                placeholder="Central Headquarters / Global"
                value={newUserData.institute}
                onChange={(e) => setNewUserData({ ...newUserData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUserModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Modal 2: Register New Institute */}
      <Modal
        isOpen={isInstituteModalOpen}
        onClose={() => setIsInstituteModalOpen(false)}
        title="Register New Institute Campus"
      >
        <form onSubmit={handleCreateInstitute} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute / School Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Oxford Grammar School - Main Campus"
              value={newInstituteData.name}
              onChange={(e) => setNewInstituteData({ ...newInstituteData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Code</label>
              <input
                type="text"
                required
                placeholder="e.g. OXF-001"
                value={newInstituteData.code}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City / Region</label>
              <input
                type="text"
                required
                placeholder="e.g. Lahore"
                value={newInstituteData.city}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, city: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Address</label>
            <input
              type="text"
              placeholder="e.g. Sector H-12, Education Avenue"
              value={newInstituteData.address}
              onChange={(e) => setNewInstituteData({ ...newInstituteData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Email</label>
              <input
                type="email"
                placeholder="admin@oxford.edu"
                value={newInstituteData.email}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                placeholder="+92 300 9876543"
                value={newInstituteData.phone}
                onChange={(e) => setNewInstituteData({ ...newInstituteData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsInstituteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
            >
              Register Institute
            </button>
          </div>
        </form>
      </Modal>

      {/* Quick Modal 3: Broadcast Notification to Active Sessions */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Announcement to Active Sessions"
      >
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800">
            <Radio className="w-4 h-4 text-emerald-600 shrink-0 animate-pulse" />
            <span>This broadcast message will be dispatched immediately across active user sessions.</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Channel</label>
              <select
                value={broadcastData.channel}
                onChange={(e) => setBroadcastData({ ...broadcastData, channel: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="Portal Alert">In-App Alert</option>
                <option value="SMS">SMS Gateway</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Email">Email Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Recipient Group</label>
              <select
                value={broadcastData.recipientGroup}
                onChange={(e) => setBroadcastData({ ...broadcastData, recipientGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm bg-white"
              >
                <option value="All Active Users">All Active Users</option>
                <option value="Campus Administrators">Campus Administrators</option>
                <option value="Teachers & Faculty">Teachers & Faculty</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Announcement Message</label>
            <textarea
              required
              rows={4}
              placeholder="e.g. System notice: Scheduled database optimization will take place tonight at 11:00 PM."
              value={broadcastData.message}
              onChange={(e) => setBroadcastData({ ...broadcastData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Broadcast</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default SuperadminDashboard
