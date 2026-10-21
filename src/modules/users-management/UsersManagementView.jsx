import React, { useState } from 'react'
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
  Check
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'

export const UsersManagementView = ({ defaultTab = 'all' }) => {
  const { users, stats, addItem, updateItem, deleteItem, institutes } = useAppData()
  const [activeTab, setActiveTab] = useState(defaultTab) // 'all' | 'roles'
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

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
    } else {
      await addItem('users', formData)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this user?')) {
      await deleteItem('users', id)
    }
  }

  const toggleUserStatus = async (user) => {
    const nextStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    await updateItem('users', user.id, { status: nextStatus })
  }

  const filtered = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.institute && u.institute.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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

        <div className="flex items-center gap-3">
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
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add New User</span>
            </button>
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-500">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
              >
                <option value="ALL">All Roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="institute_admin">Institute Admin</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Institute Affiliation</th>
                  <th className="px-6 py-4">Phone</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length > 0 ? (
                  filtered.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400 font-mono">{u.email}</p>
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
                          {u.role.replace('_', ' ')}
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
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEditModal(u)} className="p-1.5 text-slate-400 hover:text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-rose-600">
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

      {/* Modal */}
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
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-blue-600 rounded-lg">Save User</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UsersManagementView
