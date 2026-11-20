import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Key,
  RotateCcw,
  Check,
  X,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Building2,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Info,
  CheckCircle2,
  Power,
  Settings,
  Sliders,
  DollarSign,
  Activity,
  Layers,
  Megaphone,
  UserCheck,
  UserX,
  CreditCard,
  Database
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import {
  AdminControlService,
  PLATFORM_TEAM_PERMISSIONS_REGISTRY,
  ALL_TEAM_PERMISSION_IDS,
  PLATFORM_ROLE_PRESETS
} from '../../../services/adminControlService'

const COUNTRY_CODES = [
  { code: '+92', flag: '🇵🇰', country: 'Pakistan' },
  { code: '+44', flag: '🇬🇧', country: 'United Kingdom' },
  { code: '+1', flag: '🇺🇸', country: 'United States' },
  { code: '+971', flag: '🇦🇪', country: 'UAE' },
  { code: '+966', flag: '🇸🇦', country: 'Saudi Arabia' },
  { code: '+61', flag: '🇦🇺', country: 'Australia' }
]

const CATEGORY_ICON_MAP = {
  'Campuses & Tenancy': Building2,
  'Subscriptions & Billing': CreditCard,
  'Institute Feature Matrix': Sliders,
  'Personnel & Internal Team': Users,
  'Security & Platform Governance': Database,
  'Broadcasts & Communications': Megaphone
}

export const AdminTeamControlView = ({ onRouteChange }) => {
  const { institutes = [], refreshData } = useAppData()
  const { toast } = useToast()

  // Team Roster State
  const [teamMembers, setTeamMembers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL') // ALL, Active, Suspended
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Permissions Editor Modal State
  const [selectedMemberForPermissions, setSelectedMemberForPermissions] = useState(null)
  const [currentMemberPermissions, setCurrentMemberPermissions] = useState([])
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [isSavingPermissions, setIsSavingPermissions] = useState(false)

  // Add / Edit Member Modal State
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState(null)
  const [memberForm, setMemberForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+92',
    mobile: '',
    role: 'Onboarding Manager',
    status: 'Active',
    isAllCampuses: true,
    selectedCampuses: []
  })
  const [formErrors, setFormErrors] = useState({})

  // Delete Confirmation Modal
  const [deleteTargetMember, setDeleteTargetMember] = useState(null)

  // Reset Credentials Modal
  const [resetTargetMember, setResetTargetMember] = useState(null)
  const [temporaryCreds, setTemporaryCreds] = useState(null)

  // Load Team Roster
  const loadTeam = () => {
    setIsRefreshing(true)
    try {
      const list = AdminControlService.getPlatformTeamMembers()
      setTeamMembers([...list])
    } catch (e) {
      console.error(e)
    } finally {
      setTimeout(() => setIsRefreshing(false), 200)
    }
  }

  useEffect(() => {
    loadTeam()
    const handleSync = () => loadTeam()
    window.addEventListener('sms_platform_team_updated', handleSync)
    window.addEventListener('storage', handleSync)
    return () => {
      window.removeEventListener('sms_platform_team_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // Filtered Roster
  const filteredTeam = useMemo(() => {
    return teamMembers.filter(m => {
      const term = searchTerm.toLowerCase().trim()
      const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase()
      const matchesSearch = !term ||
        fullName.includes(term) ||
        (m.email && m.email.toLowerCase().includes(term)) ||
        (m.mobile && m.mobile.includes(term)) ||
        (m.role && m.role.toLowerCase().includes(term))

      const matchesRole = roleFilter === 'ALL' || m.role === roleFilter
      const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [teamMembers, searchTerm, roleFilter, statusFilter])

  // Open Granular Permissions Editor
  const handleOpenPermissionsEditor = (member) => {
    setSelectedMemberForPermissions(member)
    setCurrentMemberPermissions(Array.isArray(member.permissions) ? [...member.permissions] : [])
    setIsPermissionsModalOpen(true)
  }

  // Toggle Single Permission in Editor
  const handleToggleSinglePermission = (permId) => {
    setCurrentMemberPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(p => p !== permId)
      } else {
        return [...prev, permId]
      }
    })
  }

  // Toggle All Permissions in a Category
  const handleToggleCategory = (categoryPermissions = []) => {
    const ids = categoryPermissions.map(p => p.id)
    const allPresent = ids.every(id => currentMemberPermissions.includes(id))

    if (allPresent) {
      // Remove all in category
      setCurrentMemberPermissions(prev => prev.filter(id => !ids.includes(id)))
    } else {
      // Add all missing
      setCurrentMemberPermissions(prev => {
        const set = new Set([...prev, ...ids])
        return Array.from(set)
      })
    }
  }

  // Apply Role Preset to Permissions Editor
  const handleApplyRolePreset = (presetName) => {
    const preset = PLATFORM_ROLE_PRESETS.find(p => p.name === presetName)
    if (preset) {
      setCurrentMemberPermissions([...preset.permissions])
      toast.info(`Applied "${presetName}" permission template (${preset.permissions.length} items).`)
    }
  }

  // Save Permissions
  const handleSavePermissions = () => {
    if (!selectedMemberForPermissions) return
    setIsSavingPermissions(true)
    try {
      AdminControlService.updateTeamMemberPermissions(
        selectedMemberForPermissions.id,
        currentMemberPermissions,
        'Super Administrator'
      )
      loadTeam()
      toast.success(`Access permissions updated for "${selectedMemberForPermissions.firstName} ${selectedMemberForPermissions.lastName}"!`)
      setIsPermissionsModalOpen(false)
    } catch (err) {
      toast.error('Failed to update team permissions.')
    } finally {
      setIsSavingPermissions(false)
    }
  }

  // Toggle Team Member Active / Suspended
  const handleToggleStatus = (member) => {
    if (member.isSuperAdmin) {
      toast.warning('The primary Super Administrator account cannot be suspended.')
      return
    }

    const nextStatus = member.status === 'Active' ? 'Suspended' : 'Active'
    const confirmMsg = nextStatus === 'Suspended'
      ? `Suspend access for "${member.firstName} ${member.lastName}"? They will be locked out of the platform console immediately.`
      : `Reactivate access for "${member.firstName} ${member.lastName}"?`

    if (!window.confirm(confirmMsg)) return

    const res = AdminControlService.toggleTeamMemberStatus(member.id, 'Super Administrator')
    if (res.success) {
      loadTeam()
      toast.success(`Team member status updated to ${res.nextStatus}!`)
    } else {
      toast.error(res.error || 'Failed to update status.')
    }
  }

  // Open Add / Edit Modal
  const handleOpenAddModal = () => {
    setEditingMemberId(null)
    setMemberForm({
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+92',
      mobile: '',
      role: 'Onboarding Manager',
      status: 'Active',
      isAllCampuses: true,
      selectedCampuses: []
    })
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  const handleOpenEditModal = (member) => {
    setEditingMemberId(member.id)
    const isAll = (member.assignedScope || '').includes('All Campuses')
    setMemberForm({
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      email: member.email || '',
      countryCode: member.countryCode || '+92',
      mobile: member.mobile || '',
      role: member.role || 'Onboarding Manager',
      status: member.status || 'Active',
      isAllCampuses: isAll,
      selectedCampuses: !isAll && member.assignedScope ? member.assignedScope.split(',').map(s => s.trim()) : []
    })
    setFormErrors({})
    setIsAddEditModalOpen(true)
  }

  // Save Member Form
  const handleSaveMemberForm = (e) => {
    e.preventDefault()
    const errs = {}
    if (!memberForm.firstName.trim()) errs.firstName = 'First name is required.'
    if (!memberForm.lastName.trim()) errs.lastName = 'Last name is required.'
    if (!memberForm.email.trim() || !memberForm.email.includes('@')) errs.email = 'Valid corporate email is required.'
    if (!memberForm.mobile.trim()) errs.mobile = 'Mobile number is required.'

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }

    const assignedScope = memberForm.isAllCampuses || memberForm.selectedCampuses.length === 0
      ? 'All Campuses (Platform-wide)'
      : memberForm.selectedCampuses.join(', ')

    // Determine default permissions if new member
    let initialPerms = [...ALL_TEAM_PERMISSION_IDS]
    if (!editingMemberId) {
      const preset = PLATFORM_ROLE_PRESETS.find(p => p.name === memberForm.role)
      if (preset) initialPerms = [...preset.permissions]
    }

    const payload = {
      ...(editingMemberId ? { id: editingMemberId } : {}),
      firstName: memberForm.firstName.trim(),
      lastName: memberForm.lastName.trim(),
      email: memberForm.email.trim().toLowerCase(),
      countryCode: memberForm.countryCode,
      mobile: memberForm.mobile.trim(),
      role: memberForm.role,
      status: memberForm.status,
      assignedScope,
      ...(editingMemberId ? {} : { permissions: initialPerms })
    }

    AdminControlService.savePlatformTeamMember(payload, 'Super Administrator')
    loadTeam()
    toast.success(editingMemberId ? 'Team member updated successfully!' : 'New team member added successfully!')
    setIsAddEditModalOpen(false)
  }

  // Delete Member Action
  const handleConfirmDelete = () => {
    if (!deleteTargetMember) return
    const res = AdminControlService.deletePlatformTeamMember(deleteTargetMember.id, 'Super Administrator')
    if (res.success) {
      loadTeam()
      toast.success(`Removed team member "${deleteTargetMember.firstName} ${deleteTargetMember.lastName}"!`)
      setDeleteTargetMember(null)
    } else {
      toast.error(res.error || 'Failed to remove team member.')
    }
  }

  // Reset Credentials Action
  const handleResetCredentials = (member) => {
    const tempPass = `SecPass-${Math.random().toString(36).slice(-6)}-${Date.now().toString().slice(-3)}!`
    setTemporaryCreds({
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      temporaryPassword: tempPass,
      sessionRevokedAt: new Date().toLocaleTimeString()
    })
    setResetTargetMember(member)
    toast.success(`Active sessions revoked and fresh temporary access key generated for ${member.firstName}!`)
  }

  // Summary Counts
  const totalStaff = teamMembers.length
  const activeCount = teamMembers.filter(m => m.status === 'Active').length
  const suspendedCount = teamMembers.filter(m => m.status === 'Suspended').length

  return (
    <div className="space-y-6 pb-12 max-w-[1600px] mx-auto text-slate-800 dark:text-slate-100">
      {/* 1. TOP HEADER & BREADCRUMBS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <span className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400" onClick={() => onRouteChange?.('dashboard')}>
              Platform Console
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="cursor-pointer hover:text-purple-600 dark:hover:text-purple-400" onClick={() => onRouteChange?.('users-all')}>
              Personnel Management
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-purple-600 dark:text-purple-400 font-bold">Admin &amp; Team Control</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-heading">
                Admin &amp; Platform Team Control
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Govern internal Super Admin staff members, define specialized operational roles, and enforce granular capability gates.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>

          <button
            type="button"
            onClick={() => {
              loadTeam()
              refreshData?.()
              toast.info('Team roster and permission cache refreshed.')
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Refresh Roster"
          >
            <RotateCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. STAT SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Internal Team</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{totalStaff}</span>
            <span className="text-[10px] text-slate-400">staff members</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Super Admin operational roster</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Operators</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{activeCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">online &amp; authorized</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {totalStaff > 0 ? Math.round((activeCount / totalStaff) * 100) : 100}% workforce active
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Suspended / Inactive</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{suspendedCount}</span>
            <span className="text-[10px] text-slate-400">locked out</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Revoked platform access</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Granular Gates</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-heading">{ALL_TEAM_PERMISSION_IDS.length}</span>
            <span className="text-[10px] text-slate-400">discrete gates</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across 6 platform categories</p>
        </div>
      </div>

      {/* 3. ROSTER SEARCH & FILTERS */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search team member by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            {['ALL', 'Active', 'Suspended'].map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-2xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none"
          >
            <option value="ALL">All Operational Roles</option>
            {PLATFORM_ROLE_PRESETS.map(r => (
              <option key={r.name} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. TEAM MEMBERS ROSTER TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto dark-scroll">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Operator / Staff Member</th>
                <th className="py-3 px-4">Operational Role</th>
                <th className="py-3 px-4">Campus Governance Scope</th>
                <th className="py-3 px-4">Granted Permissions</th>
                <th className="py-3 px-4 text-center">Account Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredTeam.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-purple-400" />
                    <p className="font-bold">No platform team members found.</p>
                    <p className="text-xs mt-1">Try resetting the search bar or role filters.</p>
                  </td>
                </tr>
              ) : (
                filteredTeam.map(member => {
                  const permsCount = Array.isArray(member.permissions) ? member.permissions.length : 0
                  const totalPerms = ALL_TEAM_PERMISSION_IDS.length
                  const isSuper = Boolean(member.isSuperAdmin)
                  const isActive = member.status === 'Active'
                  const initials = `${member.firstName?.[0] || 'S'}${member.lastName?.[0] || 'A'}`.toUpperCase()

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${member.avatarColor || 'from-purple-600 to-indigo-600'} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs`}>
                            {initials}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                              <span>{member.firstName} {member.lastName}</span>
                              {isSuper && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                                  Primary
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{member.email}</span>
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{member.countryCode} {member.mobile}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${
                          isSuper
                            ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : member.role === 'Onboarding Manager'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : member.role === 'Billing & Finance Officer'
                                ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          <span>{member.role}</span>
                        </span>
                      </td>

                      {/* Campus Scope */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate font-semibold" title={member.assignedScope}>
                            {member.assignedScope || 'All Campuses (Platform-wide)'}
                          </span>
                        </div>
                      </td>

                      {/* Permissions Progress Pill */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {isSuper ? 'Full Oversight' : `${permsCount} / ${totalPerms} Allowed`}
                            </span>
                            <span className="text-slate-400 font-mono text-[10px]">
                              {Math.round((permsCount / totalPerms) * 100)}%
                            </span>
                          </div>
                          <div className="w-28 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                permsCount >= totalPerms
                                  ? 'bg-purple-600'
                                  : permsCount > 10
                                    ? 'bg-emerald-500'
                                    : 'bg-amber-500'
                              }`}
                              style={{ width: `${(permsCount / totalPerms) * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(member)}
                          disabled={isSuper}
                          title={isSuper ? 'Primary Super Admin status cannot be altered' : `Click to ${isActive ? 'Suspend' : 'Activate'}`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isSuper
                              ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 opacity-90 cursor-default'
                              : isActive
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 hover:bg-rose-100 hover:text-rose-800 cursor-pointer'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 hover:bg-emerald-100 hover:text-emerald-800 cursor-pointer'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          <span>{isActive ? 'Active' : 'Suspended'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenPermissionsEditor(member)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                            title="Configure Granular Capability Switches"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Access Gates</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(member)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Edit Profile"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleResetCredentials(member)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                            title="Revoke Sessions & Reset Credentials"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          {!isSuper && (
                            <button
                              type="button"
                              onClick={() => setDeleteTargetMember(member)}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-500" />
            <span>All platform operators inherit role-based capability boundaries strictly enforced at runtime.</span>
          </div>

          <div className="text-[11px] text-slate-400">
            Showing {filteredTeam.length} of {teamMembers.length} platform team members
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL 1: GRANULAR CAPABILITY & PERMISSION GATES EDITOR */}
      {/* ------------------------------------------------------------- */}
      {isPermissionsModalOpen && selectedMemberForPermissions && (
        <Modal
          isOpen={isPermissionsModalOpen}
          onClose={() => setIsPermissionsModalOpen(false)}
          title={`Configure Access Gates • ${selectedMemberForPermissions.firstName} ${selectedMemberForPermissions.lastName}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-5 text-xs">
            {/* Header / Preset Bar */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-purple-950 dark:text-purple-100">
                    {selectedMemberForPermissions.firstName} {selectedMemberForPermissions.lastName}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                    {selectedMemberForPermissions.role}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                  Corporate Email: <strong>{selectedMemberForPermissions.email}</strong> • Assigned Scope: <strong>{selectedMemberForPermissions.assignedScope}</strong>
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mr-1">
                  Preset:
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentMemberPermissions([...ALL_TEAM_PERMISSION_IDS])}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-purple-300 text-purple-700 dark:text-purple-300 font-bold text-[11px] cursor-pointer"
                >
                  Full Access
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyRolePreset('Onboarding Manager')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Onboarding Lead
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyRolePreset('Billing & Finance Officer')}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Billing Officer
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMemberPermissions([])}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 border border-rose-300 text-rose-700 dark:text-rose-300 font-bold text-[11px] cursor-pointer"
                >
                  Revoke All
                </button>
              </div>
            </div>

            {/* 6 Permission Categories Grid */}
            <div className="space-y-4 max-h-[58vh] overflow-y-auto dark-scroll pr-1.5">
              {PLATFORM_TEAM_PERMISSIONS_REGISTRY.map(cat => {
                const Icon = CATEGORY_ICON_MAP[cat.category] || ShieldCheck
                const categoryPerms = cat.permissions
                const allSelected = categoryPerms.every(p => currentMemberPermissions.includes(p.id))
                const someSelected = categoryPerms.some(p => currentMemberPermissions.includes(p.id)) && !allSelected

                return (
                  <div key={cat.category} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3">
                    {/* Category Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                          {cat.category}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({categoryPerms.filter(p => currentMemberPermissions.includes(p.id)).length} / {categoryPerms.length} allowed)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleCategory(categoryPerms)}
                        className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                      >
                        {allSelected ? 'Deselect Category' : 'Select All in Category'}
                      </button>
                    </div>

                    {/* Permissions Grid inside category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {categoryPerms.map(perm => {
                        const isGranted = currentMemberPermissions.includes(perm.id)
                        return (
                          <div
                            key={perm.id}
                            onClick={() => handleToggleSinglePermission(perm.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                              isGranted
                                ? 'bg-white dark:bg-slate-900 border-purple-400 dark:border-purple-700 shadow-2xs'
                                : 'bg-white/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 hover:bg-white'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {perm.label}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                                {perm.description}
                              </p>
                              <span className="font-mono text-[9px] text-slate-400 block pt-0.5">
                                id: {perm.id}
                              </span>
                            </div>

                            <button
                              type="button"
                              className={`relative inline-flex h-4 w-8 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none mt-1 ${
                                isGranted ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  isGranted ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 text-[11px]">
                <strong>{currentMemberPermissions.length}</strong> of <strong>{ALL_TEAM_PERMISSION_IDS.length}</strong> system permissions enabled
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPermissionsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSavingPermissions}
                  onClick={handleSavePermissions}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingPermissions ? 'Saving Rules...' : 'Save Access Rules'}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT TEAM MEMBER MODAL */}
      {/* ------------------------------------------------------------- */}
      {isAddEditModalOpen && (
        <Modal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingMemberId ? 'Edit Team Member Profile' : 'Add New Platform Team Member'}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSaveMemberForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Olivia"
                  value={memberForm.firstName}
                  onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
                />
                {formErrors.firstName && <span className="text-rose-500 text-[10px]">{formErrors.firstName}</span>}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bennett"
                  value={memberForm.lastName}
                  onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
                />
                {formErrors.lastName && <span className="text-rose-500 text-[10px]">{formErrors.lastName}</span>}
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Corporate Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. olivia.bennett@smartms.edu"
                value={memberForm.email}
                onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500 font-mono"
              />
              {formErrors.email && <span className="text-rose-500 text-[10px]">{formErrors.email}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Country</label>
                <select
                  value={memberForm.countryCode}
                  onChange={(e) => setMemberForm({ ...memberForm, countryCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {COUNTRY_CODES.map(c => (
                    <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Mobile Contact *</label>
                <input
                  type="text"
                  required
                  placeholder="3008472910"
                  value={memberForm.mobile}
                  onChange={(e) => setMemberForm({ ...memberForm, mobile: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:border-purple-500"
                />
                {formErrors.mobile && <span className="text-rose-500 text-[10px]">{formErrors.mobile}</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Assigned Operational Role</label>
                <select
                  value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  {PLATFORM_ROLE_PRESETS.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Account Status</label>
                <select
                  value={memberForm.status}
                  onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none"
                >
                  <option value="Active">Active (Granted Console Access)</option>
                  <option value="Suspended">Suspended (Locked Out)</option>
                </select>
              </div>
            </div>

            {/* Campus Governance Scope */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">Campus Governance Jurisdiction</label>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="allCampusesCheckbox"
                  checked={memberForm.isAllCampuses}
                  onChange={(e) => setMemberForm({ ...memberForm, isAllCampuses: e.target.checked })}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="allCampusesCheckbox" className="text-xs font-semibold cursor-pointer">
                  All Campuses (Unrestricted Platform-wide Scope)
                </label>
              </div>

              {!memberForm.isAllCampuses && (
                <div className="mt-2 space-y-1 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 max-h-32 overflow-y-auto dark-scroll">
                  {institutes.map(i => {
                    const isSelected = memberForm.selectedCampuses.includes(i.name)
                    return (
                      <div key={i.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`campus_${i.id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            const copy = [...memberForm.selectedCampuses]
                            if (e.target.checked) copy.push(i.name)
                            else {
                              const idx = copy.indexOf(i.name)
                              if (idx >= 0) copy.splice(idx, 1)
                            }
                            setMemberForm({ ...memberForm, selectedCampuses: copy })
                          }}
                          className="w-3.5 h-3.5 rounded text-purple-600"
                        />
                        <label htmlFor={`campus_${i.id}`} className="text-[11px] cursor-pointer truncate">
                          {i.name} ({i.code})
                        </label>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-600/20 cursor-pointer"
              >
                {editingMemberId ? 'Save Profile Changes' : 'Confirm & Add Member'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 3: DELETE CONFIRMATION MODAL */}
      {/* ------------------------------------------------------------- */}
      {deleteTargetMember && (
        <Modal
          isOpen={Boolean(deleteTargetMember)}
          onClose={() => setDeleteTargetMember(null)}
          title="Remove Team Member?"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-rose-950 dark:text-rose-100">
                  Delete {deleteTargetMember.firstName} {deleteTargetMember.lastName}?
                </p>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                  This operator will immediately lose all console capabilities.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetMember(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm cursor-pointer"
              >
                Delete Member
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL 4: TEMPORARY CREDENTIALS AFTER SESSION RESET */}
      {/* ------------------------------------------------------------- */}
      {resetTargetMember && temporaryCreds && (
        <Modal
          isOpen={Boolean(resetTargetMember)}
          onClose={() => {
            setResetTargetMember(null)
            setTemporaryCreds(null)
          }}
          title="Security Credentials Reset Successfully"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950 dark:text-emerald-100">
                  All active sessions revoked for {temporaryCreds.name}
                </p>
                <p className="text-[10px] text-emerald-800 dark:text-emerald-300">
                  Session tokens purged at {temporaryCreds.sessionRevokedAt}.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Account:</span>
                <span className="font-bold text-slate-800 dark:text-white">{temporaryCreds.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">One-Time Temp Key:</span>
                <span className="font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded">
                  {temporaryCreds.temporaryPassword}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(
                    `Temporary Password: ${temporaryCreds.temporaryPassword}\nLogin: ${temporaryCreds.email}`
                  )
                  toast.success('Temporary credentials copied to clipboard!')
                  setResetTargetMember(null)
                  setTemporaryCreds(null)
                }}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xs cursor-pointer"
              >
                Copy &amp; Dismiss
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default AdminTeamControlView
