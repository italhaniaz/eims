import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Plus,
  Search,
  RotateCw,
  Columns,
  Download,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  CheckCircle2,
  X,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react'
import {
  DEFAULT_PERMISSION_GROUPS,
  MockPersonnelService
} from './mockPersonnelData'

export default function RoleManagementView({ onNavigateToStaff }) {
  // Navigation / View modes: 'list' | 'create' | 'edit' | 'show'
  const [viewMode, setViewMode] = useState('list')
  const [selectedRole, setSelectedRole] = useState(null)

  // Roles State
  const [roles, setRoles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortAsc, setSortAsc] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Dropdown & Modal states
  const [openActionId, setOpenActionId] = useState(null)
  const [showColumnsMenu, setShowColumnsMenu] = useState(false)
  const [visibleColumns, setVisibleColumns] = useState({
    no: true,
    name: true,
    action: true
  })
  const [deleteConfirmRole, setDeleteConfirmRole] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)

  // Form State (for Create & Edit)
  const [formRoleName, setFormRoleName] = useState('')
  const [formPermissions, setFormPermissions] = useState([])
  const [formErrors, setFormErrors] = useState({})

  const actionMenuRef = useRef(null)
  const columnsMenuRef = useRef(null)

  // Load roles on mount
  const refreshRoles = () => {
    setIsRefreshing(true)
    const list = MockPersonnelService.getRoles()
    setRoles([...list])
    setTimeout(() => setIsRefreshing(false), 300)
  }

  useEffect(() => {
    refreshRoles()
    const handleUpdate = () => {
      setRoles([...MockPersonnelService.getRoles()])
    }
    window.addEventListener('sms_personnel_roles_updated', handleUpdate)
    return () => window.removeEventListener('sms_personnel_roles_updated', handleUpdate)
  }, [])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null)
      }
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target)) {
        setShowColumnsMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Filtered & Sorted Roles
  const displayedRoles = useMemo(() => {
    let result = [...roles]
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      result = result.filter(r => r.name.toLowerCase().includes(q))
    }
    result.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name)
      return sortAsc ? cmp : -cmp
    })
    return result
  }, [roles, searchTerm, sortAsc])

  // Collect all permission IDs
  const allPermissionIds = useMemo(() => {
    const ids = []
    DEFAULT_PERMISSION_GROUPS.forEach(g => {
      g.permissions.forEach(p => ids.push(p.id))
    })
    return ids
  }, [])

  // Form Handlers
  const handleOpenCreate = () => {
    setSelectedRole(null)
    setFormRoleName('')
    setFormPermissions([])
    setFormErrors({})
    setViewMode('create')
  }

  const handleOpenEdit = (role) => {
    setSelectedRole(role)
    setFormRoleName(role.name)
    setFormPermissions([...(role.permissions || [])])
    setFormErrors({})
    setOpenActionId(null)
    setViewMode('edit')
  }

  const handleOpenShow = (role) => {
    setSelectedRole(role)
    setOpenActionId(null)
    setViewMode('show')
  }

  const handleToggleAllPermissions = (e) => {
    if (e.target.checked) {
      setFormPermissions([...allPermissionIds])
    } else {
      setFormPermissions([])
    }
  }

  const handleToggleGroup = (group, checked) => {
    const groupPermIds = group.permissions.map(p => p.id)
    if (checked) {
      setFormPermissions(prev => Array.from(new Set([...prev, ...groupPermIds])))
    } else {
      setFormPermissions(prev => prev.filter(id => !groupPermIds.includes(id)))
    }
  }

  const handleToggleSinglePermission = (permId) => {
    setFormPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(id => id !== permId)
      } else {
        return [...prev, permId]
      }
    })
  }

  const handleResetForm = () => {
    if (viewMode === 'edit' && selectedRole) {
      setFormRoleName(selectedRole.name)
      setFormPermissions([...(selectedRole.permissions || [])])
    } else {
      setFormRoleName('')
      setFormPermissions([])
    }
    setFormErrors({})
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    if (!formRoleName.trim()) {
      setFormErrors({ name: 'Role name is required' })
      return
    }

    const payload = {
      id: selectedRole?.id,
      name: formRoleName.trim(),
      permissions: formPermissions
    }

    MockPersonnelService.saveRole(payload)
    showToast(selectedRole ? `Role "${formRoleName}" updated successfully!` : `Role "${formRoleName}" created successfully!`)
    setViewMode('list')
  }

  const handleDeleteRole = (role) => {
    MockPersonnelService.deleteRole(role.id)
    setDeleteConfirmRole(null)
    showToast(`Role "${role.name}" was deleted successfully.`)
  }

  const handleExportCSV = () => {
    const headers = ['NO.', 'NAME', 'PERMISSIONS_COUNT', 'PERMISSIONS']
    const rows = displayedRoles.map((r, i) => [
      i + 1,
      `"${r.name.replace(/"/g, '""')}"`,
      r.permissions?.length || 0,
      `"${(r.permissions || []).join(', ')}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `roles_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported roles list to CSV')
  }

  const isAllSelected = allPermissionIds.length > 0 && allPermissionIds.every(id => formPermissions.includes(id))

  // ==========================================
  // VIEW MODE: CREATE / EDIT ROLE FORM (Screenshot 2)
  // ==========================================
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-up">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {viewMode === 'create' ? 'Create new role' : 'Edit role'}
          </h1>
          <button
            onClick={() => setViewMode('list')}
            className="px-5 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* Role Name Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formRoleName}
                onChange={(e) => {
                  setFormRoleName(e.target.value)
                  if (formErrors.name) setFormErrors({})
                }}
                placeholder="e.g. Onboarding Manager"
                className={`w-full px-4 py-2.5 rounded-lg border text-sm transition-colors bg-white dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.name
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.name}</p>
              )}
            </div>

            {/* Select All Checkbox */}
            <div className="pt-2">
              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleAllPermissions}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Select all
                </span>
              </label>
            </div>

            {/* Permissions Header */}
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Permissions:
              </h2>

              {/* Permission Groups */}
              <div className="space-y-6">
                {DEFAULT_PERMISSION_GROUPS.map((group, groupIndex) => {
                  const groupPermIds = group.permissions.map(p => p.id)
                  const isGroupAllSelected = groupPermIds.every(id => formPermissions.includes(id))
                  const isGroupSomeSelected = !isGroupAllSelected && groupPermIds.some(id => formPermissions.includes(id))

                  return (
                    <div key={group.key} className="space-y-3">
                      {/* Group Header Checkbox */}
                      <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isGroupAllSelected}
                          ref={el => {
                            if (el) el.indeterminate = isGroupSomeSelected
                          }}
                          onChange={(e) => handleToggleGroup(group, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                        />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {group.label}
                        </span>
                      </label>

                      {/* Permissions List Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 pl-1">
                        {group.permissions.map((perm) => {
                          const isChecked = formPermissions.includes(perm.id)
                          return (
                            <label
                              key={perm.id}
                              className="inline-flex items-center gap-2.5 cursor-pointer select-none py-1 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSinglePermission(perm.id)}
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                              />
                              <span className="text-xs sm:text-[13px] font-normal leading-tight break-all">
                                {perm.label}
                              </span>
                            </label>
                          )
                        })}
                      </div>

                      {/* Divider line between groups */}
                      {groupIndex < DEFAULT_PERMISSION_GROUPS.length - 1 && (
                        <hr className="border-slate-200 dark:border-slate-800 mt-5 mb-5" />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetForm}
                className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW MODE: SHOW ROLE VIEW (Screenshot 3)
  // ==========================================
  if (viewMode === 'show' && selectedRole) {
    // Filter groups that have permissions assigned for this role
    const activeGroups = DEFAULT_PERMISSION_GROUPS.map(group => {
      const perms = group.permissions.filter(p => (selectedRole.permissions || []).includes(p.id))
      return {
        ...group,
        assignedPerms: perms
      }
    }).filter(g => g.assignedPerms.length > 0)

    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Show role
          </h1>
          <button
            onClick={() => setViewMode('list')}
            className="px-5 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            Back
          </button>
        </div>

        {/* Read-Only Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8">
          {/* Role Name */}
          <div className="mb-6">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Name:{' '}
            </span>
            <span className="text-sm sm:text-base text-slate-700 dark:text-slate-200 font-medium">
              {selectedRole.name}
            </span>
          </div>

          {/* Grouped Permissions */}
          {activeGroups.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No permissions currently assigned to this role.
            </div>
          ) : (
            <div className="space-y-6">
              {activeGroups.map((group, groupIndex) => (
                <div key={group.key} className="space-y-3.5">
                  {/* Group header with arrow */}
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                    <span className="text-slate-900 dark:text-white text-base">➔</span>
                    <span>{group.label}</span>
                  </div>

                  {/* Permissions with checkmark indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1 pl-1">
                    {group.assignedPerms.map((perm) => (
                      <div
                        key={perm.id}
                        className="inline-flex items-center gap-2 py-1 text-slate-800 dark:text-slate-200"
                      >
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-slate-900 dark:bg-emerald-500 text-white shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                        <span className="text-xs sm:text-[13px] font-normal break-all">
                          {perm.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider line between groups */}
                  {groupIndex < activeGroups.length - 1 && (
                    <hr className="border-slate-200 dark:border-slate-800 mt-5 mb-5" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ==========================================
  // VIEW MODE: ROLE LIST (Screenshot 1)
  // ==========================================
  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmRole && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Role</h3>
                <p className="text-xs text-slate-500">Confirm permanent removal</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete the role <strong className="text-slate-900 dark:text-white">"{deleteConfirmRole.name}"</strong>? Any staff members assigned to this role will need to be reassigned.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmRole(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteRole(deleteConfirmRole)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm"
              >
                Yes, Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Role management
        </h1>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 rounded-lg bg-[#1E3A5F] hover:bg-[#152a45] text-white text-sm font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
        >
          Create new role
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Card Top Action Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-end gap-2.5">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
              className="w-48 sm:w-64 px-3.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Refresh Icon Button */}
          <button
            onClick={refreshRoles}
            title="Refresh roles"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Column Toggle Menu */}
          <div className="relative" ref={columnsMenuRef}>
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              title="Toggle columns"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Columns className="w-4 h-4" />
              <span className="text-[10px] text-slate-400">▼</span>
            </button>
            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 z-20 space-y-1">
                <span className="text-xs font-semibold px-2 py-1 block text-slate-400">Columns</span>
                <label className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.no}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, no: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  <span>NO.</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.name}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, name: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  <span>NAME</span>
                </label>
                <label className="flex items-center gap-2 px-2 py-1 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded">
                  <input
                    type="checkbox"
                    checked={visibleColumns.action}
                    onChange={(e) => setVisibleColumns({ ...visibleColumns, action: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-blue-600"
                  />
                  <span>ACTION</span>
                </label>
              </div>
            )}
          </div>

          {/* Export Dropdown / Button */}
          <button
            onClick={handleExportCSV}
            title="Export CSV"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span className="text-[10px] text-slate-400">▼</span>
          </button>
        </div>

        {/* Roles Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-t border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {visibleColumns.no && (
                  <th className="py-3 px-5 w-16 text-center">NO.</th>
                )}
                {visibleColumns.name && (
                  <th className="py-3 px-5">
                    <button
                      onClick={() => setSortAsc(!sortAsc)}
                      className="inline-flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <span>NAME</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </button>
                  </th>
                )}
                {visibleColumns.action && (
                  <th className="py-3 px-5 text-right w-24">ACTION</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {displayedRoles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-slate-500 text-sm">
                    No roles found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                displayedRoles.map((role, index) => (
                  <tr
                    key={role.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* NO. */}
                    {visibleColumns.no && (
                      <td className="py-3.5 px-5 text-center text-slate-700 dark:text-slate-300 font-medium">
                        {index + 1}
                      </td>
                    )}

                    {/* NAME */}
                    {visibleColumns.name && (
                      <td className="py-3.5 px-5 text-slate-900 dark:text-white font-medium">
                        {role.name}
                      </td>
                    )}

                    {/* ACTION Dropdown Button (⋮) */}
                    {visibleColumns.action && (
                      <td className="py-3.5 px-5 text-right relative">
                        <div className="inline-block" ref={openActionId === role.id ? actionMenuRef : null}>
                          <button
                            onClick={() => setOpenActionId(openActionId === role.id ? null : role.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Dropdown Menu */}
                          {openActionId === role.id && (
                            <div className="absolute right-5 top-11 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 animate-fade-in text-left">
                              <button
                                onClick={() => handleOpenShow(role)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-blue-500" />
                                <span>View</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(role)}
                                className="w-full px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-amber-500" />
                                <span>Edit</span>
                              </button>
                              <button
                                onClick={() => {
                                  setOpenActionId(null)
                                  setDeleteConfirmRole(role)
                                }}
                                className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing 1 to {displayedRoles.length} of {displayedRoles.length} rows
          </span>
        </div>
      </div>
    </div>
  )
}
