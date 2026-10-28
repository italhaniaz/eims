import React, { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield,
  ShieldCheck, 
  Mail, 
  Phone, 
  Building,
  CheckCircle,
  XCircle,
  Check,
  KeyRound,
  School,
  BookOpen,
  Calculator,
  GraduationCap,
  HeartHandshake,
  ChevronRight,
  Info,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { SYSTEM_ROLES, DEFAULT_RBAC_PERMISSIONS, getRoleMeta } from '../../constants/systemRoles'
import Modal from '../../components/common/Modal'

export const UsersManagementView = ({ defaultTab = 'all' }) => {
  const { users = [], stats, addItem, updateItem, deleteItem, institutes = [] } = useAppData()
  const [activeTab, setActiveTab] = useState(defaultTab) // 'all' | 'roles'
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ACTIVE') // Default to active users only
  const [selectedRoleCard, setSelectedRoleCard] = useState('superadmin')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: '',
    status: 'Active'
  })

  // Roles & Permissions matrix state (with local storage persistence)
  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('edu_sms_rbac_permissions')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_RBAC_PERMISSIONS
  })

  const togglePermission = (permId, role) => {
    // 1. Superadmin permissions remain active by default for platform governance
    if (role === 'superadmin') {
      triggerToast('Superadmin root privileges remain active by default for platform governance.')
      return
    }

    // 2. Superadmin has full authority to modify permissions for all roles
    setPermissions(prev => {
      const next = prev.map(p => {
        if (p.id === permId) {
          const nextVal = !p[role]
          const roleMeta = SYSTEM_ROLES.find(r => r.id === role)
          const roleLabel = roleMeta ? roleMeta.shortName : role.replace('_', ' ').toUpperCase()
          triggerToast(`${roleLabel}: ${nextVal ? 'Granted' : 'Revoked'} "${p.label}"`)
          return { ...p, [role]: nextVal }
        }
        return p
      })
      try {
        localStorage.setItem('edu_sms_rbac_permissions', JSON.stringify(next))
      } catch (e) {}
      return next
    })
  }

  const handleResetPermissions = () => {
    if (window.confirm('Reset all roles permissions back to system default settings?')) {
      setPermissions(DEFAULT_RBAC_PERMISSIONS)
      try {
        localStorage.removeItem('edu_sms_rbac_permissions')
      } catch (e) {}
      triggerToast('Permissions successfully restored to system defaults.')
    }
  }

  const openAddModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      role: 'institute_admin',
      institute: institutes[0]?.name || 'Central Headquarters',
      phone: '',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      institute: u.institute || '',
      phone: u.phone || '',
      status: u.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    if (editingUser) {
      await updateItem('users', editingUser.id, formData)
      triggerToast(`User "${formData.name}" profile updated.`)
    } else {
      await addItem('users', formData)
      triggerToast(`User "${formData.name}" registered successfully.`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete user account "${name || 'User'}"?`)) {
      await deleteItem('users', id)
      triggerToast('User account deleted.')
    }
  }

  const toggleUserStatus = async (user) => {
    const isCurrentlyActive = (user.status || 'Active').toLowerCase() === 'active'
    const nextStatus = isCurrentlyActive ? 'Inactive' : 'Active'
    await updateItem('users', user.id, { status: nextStatus })
    triggerToast(`User "${user.name}" status updated to ${nextStatus}${statusFilter === 'ACTIVE' && nextStatus === 'Inactive' ? ' (moved to Inactive view)' : ''}.`)
  }

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'institute_admin':
        return 'bg-[#f5eeff] text-purple-700 border-purple-200'
      case 'teacher':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'accountant':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'student':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200'
      case 'parent':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200'
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200'
    }
  }

  // Active / Inactive user counts
  const activeUsersCount = (users || []).filter(u => (u.status || 'Active').toLowerCase() === 'active').length
  const inactiveUsersCount = (users || []).filter(u => (u.status || 'Active').toLowerCase() !== 'active').length

  // User filtering logic (Search, Role, and Status: Default to Active Only as requested)
  const filtered = (users || []).filter(u => {
    const nameMatch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const instMatch = (u.institute || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSearch = nameMatch || emailMatch || instMatch

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

    const isUserActive = (u.status || 'Active').toLowerCase() === 'active'
    const matchesStatus = statusFilter === 'ALL' 
      ? true 
      : statusFilter === 'ACTIVE' 
        ? isUserActive 
        : !isUserActive

    return matchesSearch && matchesRole && matchesStatus
  })

  const activeRoleDetails = SYSTEM_ROLES.find(r => r.id === selectedRoleCard) || SYSTEM_ROLES[0]
  const ActiveRoleIcon = activeRoleDetails.icon

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-700 underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Access Control & Security</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Users & Role Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Global access directory, hierarchical security roles, and granular feature permission policies.
          </p>
        </div>

        {activeTab === 'all' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>
              {statusFilter === 'ACTIVE'
                ? `Active Users (${filtered.length})`
                : statusFilter === 'INACTIVE'
                ? `Inactive Users (${filtered.length})`
                : `All Platform Users (${users.length})`}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'roles'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions ({SYSTEM_ROLES.length})</span>
          </button>
        </nav>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search user by name, email, or school affiliation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Filter: Default to Active Only */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20 ${
                    statusFilter === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : statusFilter === 'INACTIVE'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  <option value="ACTIVE">Active Users ({activeUsersCount})</option>
                  <option value="ALL">All Users ({users.length})</option>
                  <option value="INACTIVE">Inactive Users ({inactiveUsersCount})</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter by Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Roles ({filtered.length})</option>
                  {SYSTEM_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.shortName || r.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">User Details</th>
                  <th className="px-6 py-4 whitespace-nowrap">System Role</th>
                  <th className="px-6 py-4 whitespace-nowrap">Institute Affiliation</th>
                  <th className="px-6 py-4 whitespace-nowrap">Phone Contact</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map(u => {
                    const roleMeta = getRoleMeta(u.role)
                    return (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase shadow-2xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap shadow-2xs ${getRoleBadgeStyle(u.role)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleMeta?.dotColor || 'bg-purple-600'}`}></span>
                            <span>{roleMeta?.shortName || (u.role ? u.role.replace('_', ' ') : 'User')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {u.institute || 'Global HQ'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                          {u.phone || '—'}
                        </td>
                        <td className="px-6 py-4 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u)}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                              (u.status || 'Active').toLowerCase() === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Click to toggle status"
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${(u.status || 'Active').toLowerCase() === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                            <span>{u.status || 'Active'}</span>
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => openEditModal(u)} 
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id, u.name)} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">
                        {statusFilter === 'ACTIVE' 
                          ? 'No Active Users Found' 
                          : statusFilter === 'INACTIVE' 
                          ? 'No Inactive Users Found' 
                          : 'No Users Found'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        {statusFilter === 'ACTIVE'
                          ? 'There are currently no active users matching your criteria. Try changing the status filter to "All Users".'
                          : 'Register institute administrators, teachers, accountants, or platform managers.'}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-3">
                        {statusFilter !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Show All Users
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={openAddModal}
                          className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-purple-700 transition-all active:scale-95 cursor-pointer"
                        >
                          Add New User
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Roles & Permissions Matrix Tab */
        <div className="space-y-6">
          {/* Role Architecture Directory (6 Standard Roles) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>Educational System Roles Directory</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive definition of the 6 core platform roles, their operational scopes, and authority boundaries
                </p>
              </div>
            </div>

            {/* Horizontal Role Selector Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {SYSTEM_ROLES.map((r) => {
                const isSelected = selectedRoleCard === r.id
                const IconComponent = r.icon
                const userCount = users.filter(u => u.role === r.id).length

                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRoleCard(r.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-white border-purple-600 shadow-md ring-2 ring-purple-500/20' 
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <div className={`p-2 rounded-xl ${r.badgeClass}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          {userCount} Users
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-tight">
                        {r.shortName}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                        {r.category}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className={`font-semibold ${isSelected ? 'text-purple-600' : 'text-slate-400'}`}>
                        {isSelected ? 'Viewing' : 'Inspect'}
                      </span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Selected Role Deep-Dive Specification Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${activeRoleDetails.badgeClass}`}>
                    <ActiveRoleIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        {activeRoleDetails.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center ${activeRoleDetails.badgeClass}`}>
                        {activeRoleDetails.tierLevel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong>Scope of Authority:</strong> {activeRoleDetails.scope}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <span>Currently Assigned: </span>
                  <strong className="text-slate-800 font-bold font-mono">
                    {users.filter(u => u.role === activeRoleDetails.id).length} Active Accounts
                  </strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {activeRoleDetails.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Core Responsibilities & Privileges */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Authorized Responsibilities & Privileges</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {activeRoleDetails.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Boundaries & Access Limitations */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/70 space-y-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Access Boundaries & Governance Safeguards</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {activeRoleDetails.limitations.map((lim, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        <span>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information Strip */}
          <div className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-800">Platform Access Governance & Privilege Delegation:</span>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Superadmin holds master authority to grant or revoke any operational privilege for <strong>Institute Admin</strong>, <strong>Teacher</strong>, <strong>Accountant</strong>, <strong>Student</strong>, and <strong>Parent</strong>.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 bg-purple-100/70 text-purple-800 rounded-lg font-mono font-bold text-[10px] border border-purple-200">
                Superadmin: Master Control
              </span>
              <span className="px-2.5 py-1 bg-purple-100/70 text-purple-800 rounded-lg font-mono font-bold text-[10px] border border-purple-200">
                Configurable RBAC
              </span>
              <button
                type="button"
                onClick={handleResetPermissions}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] border border-slate-300 transition-all shadow-2xs"
                title="Reset all role permissions back to factory defaults"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Role-Based Access Control (RBAC) Interactive Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Granular Role-Based Access Control (RBAC) Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure feature privileges across all system roles. Superadmin holds root privileges by default.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Live Dynamic Enforcement</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 w-72">Permission Policy</th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-purple-700 font-bold">Superadmin</span>
                        <span className="text-[10px] text-purple-600/80 font-medium">Root Authority</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center text-purple-700">Institute Admin</th>
                    <th className="px-4 py-4 text-center text-emerald-700">Teacher</th>
                    <th className="px-4 py-4 text-center text-amber-700">Accountant</th>
                    <th className="px-4 py-4 text-center text-indigo-700">Student</th>
                    <th className="px-4 py-4 text-center text-cyan-700">Parent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-slate-800">{p.label}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5 mt-0.5">
                          <span>{p.category}</span>
                        </div>
                      </td>
                      
                      {/* Superadmin: Active by Default */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'superadmin')}
                          className="w-7 h-7 rounded-lg inline-flex items-center justify-center bg-purple-600 text-white shadow-xs hover:bg-purple-700 transition-all border border-purple-700 cursor-default"
                          title="Superadmin Root Access (Active by Default)"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </td>

                      {/* Institute Admin */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'institute_admin')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            p.institute_admin 
                              ? 'bg-purple-600 text-white shadow-xs hover:bg-purple-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          }`}
                          title={`Institute Admin: ${p.institute_admin ? 'Granted' : 'Revoked'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>

                      {/* Teacher */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'teacher')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            p.teacher 
                              ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          }`}
                          title={`Teacher: ${p.teacher ? 'Granted' : 'Revoked'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>

                      {/* Accountant */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'accountant')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            p.accountant 
                              ? 'bg-amber-600 text-white shadow-xs hover:bg-amber-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          }`}
                          title={`Accountant: ${p.accountant ? 'Granted' : 'Revoked'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>

                      {/* Student */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'student')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            p.student 
                              ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          }`}
                          title={`Student: ${p.student ? 'Granted' : 'Revoked'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>

                      {/* Parent */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => togglePermission(p.id, 'parent')}
                          className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all ${
                            p.parent 
                              ? 'bg-cyan-600 text-white shadow-xs hover:bg-cyan-700' 
                              : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                          }`}
                          title={`Parent: ${p.parent ? 'Granted' : 'Revoked'}`}
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create / Edit User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit User: ${editingUser.name}` : 'Register New System User'}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              placeholder="e.g. Dr. Shahida Parveen, Hamza Farooq"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address (Login ID)</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
              placeholder="e.g. user@schoolms.edu"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Assigned Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white font-medium"
              >
                {SYSTEM_ROLES.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Campus / Institute</label>
            {institutes && institutes.length > 0 ? (
              <select
                value={formData.institute}
                onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-white"
              >
                <option value="">Central Headquarters (Global / Superadmin)</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name} ({inst.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.institute}
                onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                placeholder="Main Campus"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors"
            >
              {editingUser ? 'Update Profile' : 'Save User'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsersManagementView