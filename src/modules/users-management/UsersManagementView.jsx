import React, { useState, useMemo } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Building, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Check,
  Download,
  Key,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  Sparkles,
  ShieldAlert
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const UsersManagementView = ({ defaultTab = 'all' }) => {
  const { users = [], stats, addItem, updateItem, deleteItem, institutes = [], logAuditEvent } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState(defaultTab) // 'all' | 'roles'
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  // Emergency Temporary PIN modal state
  const [temporaryPinModal, setTemporaryPinModal] = useState(null)
  const [generatedPin, setGeneratedPin] = useState('')

  // Pagination & Sorting state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: '',
    status: 'Active'
  })

  // Roles & Permissions matrix state
  const [permissions, setPermissions] = useState([
    { id: 'perm-1', label: 'Access Superadmin Dashboard', superadmin: true, institute_admin: false, teacher: false },
    { id: 'perm-2', label: 'Manage Administrative Divisions & Districts', superadmin: true, institute_admin: false, teacher: false },
    { id: 'perm-3', label: 'Create & Register New Institutes', superadmin: true, institute_admin: false, teacher: false },
    { id: 'perm-4', label: 'Manage Campus Student Admissions', superadmin: true, institute_admin: true, teacher: false },
    { id: 'perm-5', label: 'Record Daily Student Attendance', superadmin: true, institute_admin: true, teacher: true },
    { id: 'perm-6', label: 'Generate Fee Challans & Collect Payment', superadmin: true, institute_admin: true, teacher: false },
    { id: 'perm-7', label: 'Configure System Academics & Subjects', superadmin: true, institute_admin: true, teacher: false },
    { id: 'perm-8', label: 'Database Backup & Supabase Settings', superadmin: true, institute_admin: false, teacher: false },
  ])

  const togglePermission = (permId, role) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permId) {
        return { ...p, [role]: !p[role] }
      }
      return p
    }))
    toast.success('Access policy permission updated.')
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
      toast.success(`User "${formData.name}" updated successfully!`)
    } else {
      await addItem('users', formData)
      toast.success(`User "${formData.name}" registered successfully!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete user "${name || 'User'}" permanently?`)) {
      await deleteItem('users', id)
      toast.info('User removed from directory.')
    }
  }

  const toggleUserStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    await updateItem('users', user.id, { status: nextStatus })
    toast.info(`Status for ${user.name} changed to ${nextStatus}.`)
  }

  const handleIssueTemporaryPin = (u) => {
    const pin = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedPin(pin)
    setTemporaryPinModal(u)
    if (logAuditEvent) {
      logAuditEvent(`Issued Temporary Access PIN for ${u.name}`, u.email, 'Success')
    }
  }

  const handleCopyPin = () => {
    const textToCopy = `School MS Temporary Access PIN for ${temporaryPinModal?.name} (${temporaryPinModal?.email}):\nPIN: ${generatedPin}\nValidity: 24 Hours. Please change password immediately upon login.`
    navigator.clipboard.writeText(textToCopy)
    toast.success('Temporary PIN and access instructions copied to clipboard!')
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filtered = useMemo(() => {
    return users.filter(u => {
      const s = searchTerm.toLowerCase()
      const matchesSearch = 
        (u.name || '').toLowerCase().includes(s) ||
        (u.email || '').toLowerCase().includes(s) ||
        (u.institute && u.institute.toLowerCase().includes(s))
      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [users, searchTerm, roleFilter])

  const sortedUsers = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filtered, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [sortedUsers, currentPage, pageSize])

  const handleExportUsers = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      ['ID', 'Full Name', 'Email Address', 'Role', 'Institute Affiliation', 'Phone', 'Status'],
      ...sortedUsers.map(u => [
        `"${u.id}"`,
        `"${(u.name || '').replace(/"/g, '""')}"`,
        `"${u.email || ''}"`,
        `"${u.role || ''}"`,
        `"${(u.institute || 'Global HQ').replace(/"/g, '""')}"`,
        `"${u.phone || ''}"`,
        `"${u.status || 'Active'}"`
      ])
    ].map(e => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Users_Directory_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Users roster exported as CSV!')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global access directory across all institutes ({users.length} total platform users)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'roles' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Roles & Permissions
            </button>
          </div>

          {activeTab === 'all' && (
            <>
              <button
                onClick={handleExportUsers}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-all"
                title="Export Users CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            </>
          )}
        </div>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Filter and Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, or school..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white font-medium text-slate-700"
              >
                <option value="ALL">All Roles ({users.length})</option>
                <option value="superadmin">Superadmin</option>
                <option value="institute_admin">Institute Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th 
                      onClick={() => handleSort('name')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>User</span>
                        {sortField === 'name' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('role')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Role</span>
                        {sortField === 'role' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4">Institute Affiliation</th>
                    <th className="px-6 py-4">Phone</th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Status</span>
                        {sortField === 'status' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-blue-600" /> : <ArrowDown className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-300" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {u.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 text-xs sm:text-sm">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase ${
                            u.role === 'superadmin' 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                              : u.role === 'institute_admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {u.role ? u.role.replace('_', ' ') : 'USER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                          {u.institute || 'Global HQ'}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {u.phone || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserStatus(u)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                            }`}
                            title="Click to toggle status"
                          >
                            {u.status || 'Active'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleIssueTemporaryPin(u)} 
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Issue Emergency Temporary PIN"
                            >
                              <Key className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => openEditModal(u)} 
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit user profile"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDelete(u.id, u.name)} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">0 Users Found</p>
                        <p className="text-xs text-slate-400 mt-1">Click the "Add New User" button to register administrators, teachers, and staff members.</p>
                        <button
                          onClick={openAddModal}
                          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow hover:bg-blue-700"
                        >
                          Add First User Now
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {sortedUsers.length > 0 && (
              <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
                <div>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, sortedUsers.length)}</strong> of <strong>{sortedUsers.length}</strong> registered users
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                  
                  <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Roles & Permissions Matrix Tab */
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Role-Based Access Control (RBAC)</h3>
              <p className="text-xs text-slate-500">Configure feature permissions for system roles</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-100">
              Auto-saved
            </span>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Permission Name</th>
                <th className="px-6 py-4 text-center">Superadmin</th>
                <th className="px-6 py-4 text-center">Institute Admin</th>
                <th className="px-6 py-4 text-center">Teacher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-6 py-4 font-medium text-slate-800">{p.label}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePermission(p.id, 'superadmin')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                        p.superadmin ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePermission(p.id, 'institute_admin')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                        p.institute_admin ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => togglePermission(p.id, 'teacher')}
                      className={`w-6 h-6 rounded-md inline-flex items-center justify-center transition-colors ${
                        p.teacher ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Profile' : 'Create New User'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. Asad Rehman"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              placeholder="e.g. asad@sms.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">User Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="superadmin">Superadmin</option>
                <option value="institute_admin">Institute Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Institute</label>
            {institutes && institutes.length > 0 ? (
              <select
                value={formData.institute}
                onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="">Central Headquarters (Global)</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name} ({inst.code})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.institute}
                onChange={(e) => setFormData({ ...formData, institute: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
                placeholder="Beaconhouse Central High School"
              />
            )}
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">Save User</button>
          </div>
        </form>
      </Modal>

      {/* Emergency Temporary PIN Modal */}
      {temporaryPinModal && (
        <Modal
          isOpen={!!temporaryPinModal}
          onClose={() => setTemporaryPinModal(null)}
          title="Emergency Temporary Access PIN"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
              <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900">
                <span className="font-bold block">One-Time Password (OTP) Generated</span>
                <span className="text-slate-600 text-[11px]">
                  Use this temporary credential for operator account recovery. This PIN expires in 24 hours.
                </span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-2">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Temporary Login PIN</span>
              <div className="text-3xl font-black font-mono tracking-widest text-indigo-600 select-all">
                {generatedPin}
              </div>
              <div className="text-xs text-slate-600 pt-1">
                Account: <strong>{temporaryPinModal.name}</strong> ({temporaryPinModal.email})
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setTemporaryPinModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>

              <button
                type="button"
                onClick={handleCopyPin}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy PIN & Instructions</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default UsersManagementView