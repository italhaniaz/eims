import React, { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'
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
  ChevronLeft,
  ChevronDown, 
  ChevronUp, 
  Info, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  Eye, 
  EyeOff,
  MessageCircle, 
  ExternalLink,
  Download,
  X,
  Building2,
  Sparkles,
  Copy,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Lock
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { hashPassword } from '../../context/AuthContext'
import { SYSTEM_ROLES, DEFAULT_RBAC_PERMISSIONS, getRoleMeta } from '../../constants/systemRoles'
import Modal from '../../components/common/Modal'

// Export helper for external modules to check active permissions
export const hasPermission = (permId, role) => {
  if (role === 'superadmin') return true
  try {
    const saved = localStorage.getItem('edu_sms_rbac_permissions')
    if (saved) {
      const perms = JSON.parse(saved)
      const target = perms.find(p => p.id === permId)
      if (target && typeof target[role] === 'boolean') {
        return target[role]
      }
    }
  } catch (e) {}
  const fallback = DEFAULT_RBAC_PERMISSIONS.find(p => p.id === permId)
  return fallback ? !!fallback[role] : false
}

export const UsersManagementView = ({ defaultTab = 'all', onRouteChange }) => {
  const { users = [], stats, addItem, updateItem, deleteItem, institutes = [] } = useAppData()
  const [activeTab, setActiveTab] = useState(defaultTab) // 'all' | 'roles'
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ACTIVE') // Default to active users only
  
  // Table sorting & pagination states
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // RBAC search & filter states
  const [rbacSearchQuery, setRbacSearchQuery] = useState('')
  const [rbacCategoryFilter, setRbacCategoryFilter] = useState('ALL')

  // Password visibility toggle in user modal
  const [showModalPassword, setShowModalPassword] = useState(false)

  // Sync activeTab with defaultTab prop from parent router
  useEffect(() => {
    if (defaultTab && defaultTab !== activeTab) {
      setActiveTab(defaultTab)
    }
  }, [defaultTab])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter, statusFilter])

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey)
    if (typeof onRouteChange === 'function') {
      onRouteChange(tabKey === 'roles' ? 'users-roles' : 'users-all')
    }
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Expanded role specifications state (embedded directly inside each individual role card)
  const [expandedRoles, setExpandedRoles] = useState({})

  const handleToggleRoleExpand = (roleId) => {
    setExpandedRoles(prev => ({
      ...prev,
      [roleId]: !prev[roleId]
    }))
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [viewingUser, setViewingUser] = useState(null)
  const [toastMessage, setToastMessage] = useState(null)
  const [activeDropdownUserId, setActiveDropdownUserId] = useState(null)
  const [dropdownCoords, setDropdownCoords] = useState(null)
  const dropdownRef = useRef(null)

  // 1. User filtering logic
  const filtered = useMemo(() => {
    return (users || []).filter(u => {
      const q = searchTerm.toLowerCase().trim()
      const nameMatch = (u.name || '').toLowerCase().includes(q)
      const emailMatch = (u.email || '').toLowerCase().includes(q)
      const instMatch = (u.institute || '').toLowerCase().includes(q)
      const phoneMatch = (u.phone || '').toLowerCase().includes(q)
      const matchesSearch = !q || nameMatch || emailMatch || instMatch || phoneMatch

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

      const isUserActive = (u.status || 'Active').toLowerCase() === 'active'
      const matchesStatus = statusFilter === 'ALL' 
        ? true 
        : statusFilter === 'ACTIVE' 
          ? isUserActive 
          : !isUserActive

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchTerm, roleFilter, statusFilter])

  // 2. Sorting logic
  const sortedUsers = useMemo(() => {
    const list = [...filtered]
    list.sort((a, b) => {
      let valA = (a[sortField] || '').toString().toLowerCase()
      let valB = (b[sortField] || '').toString().toLowerCase()

      if (sortField === 'role') {
        const metaA = getRoleMeta(a.role)?.shortName || a.role || ''
        const metaB = getRoleMeta(b.role)?.shortName || b.role || ''
        valA = metaA.toLowerCase()
        valB = metaB.toLowerCase()
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
    return list
  }, [filtered, sortField, sortDirection])

  // 3. Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / itemsPerPage))
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return sortedUsers.slice(start, start + itemsPerPage)
  }, [sortedUsers, currentPage, itemsPerPage])

  // 4. Active user for floating actions portal
  const activeUser = useMemo(() => {
    if (!activeDropdownUserId) return null
    return (users || []).find(u => u.id === activeDropdownUserId) || (filtered || []).find(u => u.id === activeDropdownUserId) || null
  }, [activeDropdownUserId, users, filtered])

  // Active / Inactive user counts
  const activeUsersCount = useMemo(() => {
    return (users || []).filter(u => (u.status || 'Active').toLowerCase() === 'active').length
  }, [users])

  const inactiveUsersCount = useMemo(() => {
    return (users || []).filter(u => (u.status || 'Active').toLowerCase() !== 'active').length
  }, [users])

  const instituteAdminsCount = useMemo(() => {
    return (users || []).filter(u => u.role === 'institute_admin').length
  }, [users])

  const facultyStaffCount = useMemo(() => {
    return (users || []).filter(u => u.role === 'teacher' || u.role === 'accountant').length
  }, [users])

  // Toggle user actions dropdown popover with viewport coordinate anchoring
  const handleToggleDropdown = (e, userId) => {
    e.stopPropagation()
    if (activeDropdownUserId === userId) {
      setActiveDropdownUserId(null)
      setDropdownCoords(null)
    } else {
      const rect = e.currentTarget.getBoundingClientRect()
      setDropdownCoords({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height
      })
      setActiveDropdownUserId(userId)
    }
  }

  // Close dropdown on outside click, window resize, scroll, or Escape key
  useEffect(() => {
    if (!activeDropdownUserId) return

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setActiveDropdownUserId(null)
        setDropdownCoords(null)
      }
    }

    const handleScrollOrResize = (e) => {
      if (
        e?.type === 'scroll' &&
        dropdownRef.current &&
        (dropdownRef.current === e.target || dropdownRef.current.contains(e.target))
      ) {
        return
      }
      setActiveDropdownUserId(null)
      setDropdownCoords(null)
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdownUserId(null)
        setDropdownCoords(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeDropdownUserId])

  // Calculate dynamic floating position (prevents table overflow clipping & mobile screen overflow)
  const calculateDropdownStyle = () => {
    if (!dropdownCoords || typeof window === 'undefined') return {}

    const isMobile = window.innerWidth < 768
    if (isMobile) {
      return {
        position: 'fixed',
        zIndex: 9999,
        left: '16px',
        right: '16px',
        bottom: '20px',
        maxHeight: '85vh',
        width: 'auto'
      }
    }

    const MENU_WIDTH = 264
    const FULL_HEIGHT = 450
    const windowH = window.innerHeight
    const spaceBelow = windowH - dropdownCoords.bottom - 16
    const spaceAbove = dropdownCoords.top - 16
    const openUpwards = spaceBelow < FULL_HEIGHT && spaceAbove > spaceBelow

    const availableSpace = openUpwards ? spaceAbove : spaceBelow
    const maxHeight = Math.min(FULL_HEIGHT, Math.max(260, availableSpace))

    const style = {
      position: 'fixed',
      zIndex: 9999,
      width: `${MENU_WIDTH}px`,
      right: `${Math.max(16, window.innerWidth - dropdownCoords.right)}px`,
      maxHeight: `${maxHeight}px`
    }

    if (openUpwards) {
      style.bottom = `${Math.max(12, windowH - dropdownCoords.top + 6)}px`
    } else {
      style.top = `${dropdownCoords.bottom + 6}px`
    }

    return style
  }

  const triggerToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Direct WhatsApp Chat Redirect Handler
  const handleWhatsAppRedirect = (user) => {
    const rawPhone = user.phone || ''
    const digits = rawPhone.replace(/\D/g, '')

    if (!digits || digits.length < 7) {
      triggerToast(`No valid phone number registered for "${user.name}". Please edit user to add a contact number.`)
      return
    }

    let waNumber = digits
    if (waNumber.startsWith('0')) {
      waNumber = '92' + waNumber.substring(1)
    } else if (!waNumber.startsWith('92') && waNumber.length === 10 && waNumber.startsWith('3')) {
      waNumber = '92' + waNumber
    }

    const message = encodeURIComponent(`Assalam-o-Alaikum ${user.name}, this is from School Management Platform administration regarding your account (${user.email}).`)
    const waUrl = `https://wa.me/${waNumber}?text=${message}`
    
    window.open(waUrl, '_blank', 'noopener,noreferrer')
    triggerToast(`Opening WhatsApp chat with ${user.name} (+${waNumber})...`)
    setActiveDropdownUserId(null)
  }

  // Neutralize CSV Formula Injection (=, +, -, @, \t, \r)
  const sanitizeCSV = (val) => {
    if (val === null || val === undefined) return '""'
    let str = String(val)
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str
    }
    return `"${str.replace(/"/g, '""')}"`
  }

  // CSV Export Handler
  const handleExportUsersCSV = () => {
    if (!users || users.length === 0) {
      triggerToast('No user records available to export.')
      return
    }

    const headers = ['User ID', 'Full Name', 'Email', 'Role', 'Campus Affiliation', 'Phone Contact', 'Status', 'Last Login']
    const rows = sortedUsers.map(u => [
      sanitizeCSV(u.id || ''),
      sanitizeCSV(u.name || ''),
      sanitizeCSV(u.email || ''),
      sanitizeCSV(u.role || ''),
      sanitizeCSV(u.institute || 'Global HQ'),
      sanitizeCSV(u.phone || ''),
      sanitizeCSV(u.status || 'Active'),
      sanitizeCSV(u.lastLogin || 'Never')
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `platform_users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Exported ${sortedUsers.length} users to CSV.`)
  }

  // Export RBAC Matrix to CSV
  const handleExportRBACCSV = () => {
    if (!permissions || permissions.length === 0) {
      triggerToast('No permission records available to export.')
      return
    }

    const headers = ['Permission ID', 'Category', 'Permission Label', 'Superadmin', 'Institute Admin', 'Teacher', 'Accountant', 'Student', 'Parent']
    const rows = filteredPermissions.map(p => [
      sanitizeCSV(p.id),
      sanitizeCSV(p.category),
      sanitizeCSV(p.label),
      'TRUE',
      p.institute_admin ? 'TRUE' : 'FALSE',
      p.teacher ? 'TRUE' : 'FALSE',
      p.accountant ? 'TRUE' : 'FALSE',
      p.student ? 'TRUE' : 'FALSE',
      p.parent ? 'TRUE' : 'FALSE'
    ])

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `rbac_permissions_matrix_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    triggerToast(`Exported ${filteredPermissions.length} RBAC permissions to CSV.`)
  }

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'institute_admin',
    institute: '',
    phone: '',
    status: 'Active',
    password: ''
  })

  // Roles to display in Educational System Roles Directory (excluding superadmin card)
  const directoryRoles = useMemo(() => SYSTEM_ROLES.filter(r => r.id !== 'superadmin'), [])

  // Roles & Permissions matrix state (with local storage persistence & custom event broadcast)
  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('edu_sms_rbac_permissions')
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error(e)
    }
    return DEFAULT_RBAC_PERMISSIONS
  })

  // Unique categories in RBAC matrix
  const rbacCategories = useMemo(() => {
    return Array.from(new Set(permissions.map(p => p.category))).filter(Boolean)
  }, [permissions])

  // Filtered RBAC permissions
  const filteredPermissions = useMemo(() => {
    return permissions.filter(p => {
      const q = (rbacSearchQuery || '').toLowerCase().trim()
      const matchesSearch = !q || p.label.toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
      const matchesCategory = rbacCategoryFilter === 'ALL' || p.category === rbacCategoryFilter
      return matchesSearch && matchesCategory
    })
  }, [permissions, rbacSearchQuery, rbacCategoryFilter])

  const togglePermission = (permId, role) => {
    if (role === 'superadmin') {
      triggerToast('Superadmin root privileges remain active by default for platform governance.')
      return
    }

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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('edu_sms_permissions_updated', { detail: next }))
        }
      } catch (e) {}
      return next
    })
  }

  const handleResetPermissions = () => {
    if (window.confirm('Reset all roles permissions back to system default settings?')) {
      setPermissions(DEFAULT_RBAC_PERMISSIONS)
      try {
        localStorage.removeItem('edu_sms_rbac_permissions')
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('edu_sms_permissions_updated', { detail: DEFAULT_RBAC_PERMISSIONS }))
        }
      } catch (e) {}
      triggerToast('Permissions successfully restored to system defaults.')
    }
  }

  const openAddModal = () => {
    setEditingUser(null)
    setShowModalPassword(false)
    setFormData({
      name: '',
      email: '',
      role: 'institute_admin',
      institute: institutes[0]?.name || 'Central Headquarters',
      phone: '',
      status: 'Active',
      password: 'Password123!'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setShowModalPassword(false)
    setFormData({
      name: u.name,
      email: u.email,
      role: u.role,
      institute: u.institute || '',
      phone: u.phone || '',
      status: u.status || 'Active',
      password: ''
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanName = (formData.name || '').trim()
    const cleanEmail = (formData.email || '').trim().toLowerCase()

    if (!cleanName || !cleanEmail) {
      triggerToast('Please provide both full name and email address.')
      return
    }

    // Strict RFC email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(cleanEmail)) {
      triggerToast('Please enter a valid RFC-compliant email address (e.g. user@school.edu).')
      return
    }

    // Check for duplicate email collision
    const emailExists = (users || []).some(u => 
      (u.email || '').trim().toLowerCase() === cleanEmail && 
      (!editingUser || u.id !== editingUser.id)
    )
    if (emailExists) {
      triggerToast(`Error: An account with email "${cleanEmail}" already exists. Please use a distinct email.`)
      return
    }

    try {
      const payload = { 
        ...formData,
        name: cleanName,
        email: cleanEmail
      }

      if (payload.password) {
        payload.passwordHash = await hashPassword(payload.password)
      } else if (!editingUser) {
        payload.password = 'Password123!'
        payload.passwordHash = await hashPassword('Password123!')
      }

      if (editingUser) {
        if (!payload.password) {
          delete payload.password
        }
        await updateItem('users', editingUser.id, payload)
        triggerToast(`User "${cleanName}" profile updated successfully.`)
      } else {
        await addItem('users', payload)
        triggerToast(`User "${cleanName}" registered with secure SHA-256 credentials.`)
      }
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save user:', err)
      triggerToast('Failed to save user record.')
    }
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
    if (viewingUser && viewingUser.id === user.id) {
      setViewingUser(prev => ({ ...prev, status: nextStatus }))
    }
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

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-xs text-emerald-700 underline font-semibold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Clean Light SaaS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl font-sans">
            Global access directory, hierarchical security roles, and granular feature permission policies.
          </p>
        </div>

        {activeTab === 'all' && (
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-purple-600/20 transition-all cursor-pointer self-stretch sm:self-auto active:scale-95 whitespace-nowrap"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New User</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium [scrollbar-width:none]">
          <button
            onClick={() => handleTabChange('all')}
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
            onClick={() => handleTabChange('roles')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'roles'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions ({directoryRoles.length})</span>
          </button>
        </nav>
      </div>

      {activeTab === 'all' ? (
        <>
          {/* Top 4 KPI Executive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 items-stretch">
            {/* Card 1: Total Users (Pastel Purple) */}
            <div className="bg-[#f5eeff] border border-purple-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Total Platform Users</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    {users.length}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/80 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-purple-200/50 text-[11px]">
                <span className="font-bold text-purple-700 bg-purple-100/70 px-2 py-0.5 rounded-full">
                  Global Directory
                </span>
                <span className="text-slate-500 font-medium">
                  {filtered.length} Filtered
                </span>
              </div>
            </div>

            {/* Card 2: Active Accounts (Pastel Emerald) */}
            <div className="bg-emerald-50 border border-emerald-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Active Accounts</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    {activeUsersCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/80 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-emerald-200/50 text-[11px]">
                <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{users.length > 0 ? Math.round((activeUsersCount / users.length) * 100) : 100}% Active Rate</span>
                </span>
                <span className="text-slate-500 font-medium">
                  {inactiveUsersCount} Inactive
                </span>
              </div>
            </div>

            {/* Card 3: Institute Administrators (Pastel Blue) */}
            <div className="bg-blue-50 border border-blue-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Campus Leadership</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    {instituteAdminsCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/80 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <School className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-blue-200/50 text-[11px]">
                <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Principals & Admins
                </span>
                <span className="text-slate-500 font-medium">
                  {institutes.length} Campuses
                </span>
              </div>
            </div>

            {/* Card 4: Teachers & Staff (Pastel Amber) */}
            <div className="bg-amber-50 border border-amber-100/90 rounded-2xl p-4 sm:p-5 transition-all duration-200 hover:shadow-sm shadow-2xs flex flex-col justify-between">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 mb-1">Teachers & Staff</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
                    {facultyStaffCount}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/80 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <GraduationCap className="w-5 h-5 stroke-[1.8]" />
                </div>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-amber-200/50 text-[11px]">
                <span className="font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                  Academic Roster
                </span>
                <span className="text-slate-500 font-medium">
                  Teaching & Accounts
                </span>
              </div>
            </div>
          </div>

          {/* Filter, Search & Export Toolbar */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or campus..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-slate-50/60"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Controls & CSV Export */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5">
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
                  <option value="ACTIVE">Active ({activeUsersCount})</option>
                  <option value="ALL">All Statuses ({users.length})</option>
                  <option value="INACTIVE">Inactive ({inactiveUsersCount})</option>
                </select>
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white text-slate-700 cursor-pointer"
                >
                  <option value="ALL">All Roles ({users.length})</option>
                  {SYSTEM_ROLES.map(r => (
                    <option key={r.id} value={r.id}>{r.shortName || r.name}</option>
                  ))}
                </select>
              </div>

              {/* Export CSV Button */}
              <button
                type="button"
                onClick={handleExportUsersCSV}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                title="Export user directory as CSV"
              >
                <Download className="w-3.5 h-3.5 text-purple-600" />
                <span>Export CSV</span>
              </button>

              {/* Reset Filters (Visible if filters active) */}
              {(searchTerm || roleFilter !== 'ALL' || statusFilter !== 'ACTIVE') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('')
                    setRoleFilter('ALL')
                    setStatusFilter('ACTIVE')
                  }}
                  className="px-2.5 py-1.5 text-xs font-semibold text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Desktop Users Table View (Visible on md and up) */}
          <div className="hidden md:block bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-x-auto min-h-[420px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th 
                    onClick={() => handleSort('name')} 
                    className="px-6 py-4 whitespace-nowrap min-w-[220px] cursor-pointer hover:text-purple-700 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>User Details</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('role')} 
                    className="px-6 py-4 whitespace-nowrap min-w-[150px] cursor-pointer hover:text-purple-700 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>System Role</span>
                      {sortField === 'role' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('institute')} 
                    className="px-6 py-4 whitespace-nowrap min-w-[180px] cursor-pointer hover:text-purple-700 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Institute Affiliation</span>
                      {sortField === 'institute' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('phone')} 
                    className="px-6 py-4 whitespace-nowrap min-w-[150px] cursor-pointer hover:text-purple-700 select-none transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Phone Contact</span>
                      {sortField === 'phone' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('status')} 
                    className="px-6 py-4 text-center whitespace-nowrap min-w-[110px] cursor-pointer hover:text-purple-700 select-none transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Status</span>
                      {sortField === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right whitespace-nowrap min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => {
                    const roleMeta = getRoleMeta(u.role)
                    return (
                      <tr key={u.id} className={`hover:bg-slate-50/70 transition-colors ${activeDropdownUserId === u.id ? "relative z-30" : ""}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0">
                              {u.name?.charAt(0) || 'U'}
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
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[200px]">{u.institute || 'Global HQ / Multi-Campus'}</span>
                          </div>
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
                        <td className="px-6 py-4 text-right whitespace-nowrap min-w-[100px]">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Details Eye Button */}
                            <button
                              type="button"
                              onClick={() => setViewingUser(u)}
                              className="w-8 h-8 rounded-xl border border-slate-200 bg-white hover:bg-[#f5eeff] hover:border-purple-300 text-slate-600 hover:text-purple-700 transition-all cursor-pointer shadow-2xs group inline-flex items-center justify-center"
                              title={`View Details: ${u.name}`}
                              aria-label={`View Details for ${u.name}`}
                            >
                              <Eye className="w-4 h-4 text-slate-500 group-hover:text-purple-600 transition-colors" />
                            </button>

                            {/* Settings Actions Button */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleDropdown(e, u.id)}
                              className={`w-8 h-8 rounded-xl border transition-all cursor-pointer inline-flex items-center justify-center shadow-2xs ${
                                activeDropdownUserId === u.id
                                  ? 'bg-[#f5eeff] text-purple-700 border-purple-300 ring-2 ring-purple-500/20 shadow-xs'
                                  : 'bg-white hover:bg-[#f5eeff] text-slate-600 hover:text-purple-700 border-slate-200 hover:border-purple-300'
                              }`}
                              title={`Settings & Actions: ${u.name}`}
                              aria-label="Settings options"
                            >
                              <Settings className={`w-4 h-4 text-purple-600 transition-transform duration-300 ${activeDropdownUserId === u.id ? 'rotate-90' : ''}`} />
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
                          ? 'There are currently no active users matching your criteria. Try changing the status filter to "All Statuses".'
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

          {/* Mobile Users Cards View (Visible on screens < md) */}
          <div className="block md:hidden space-y-3">
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((u) => {
                const roleMeta = getRoleMeta(u.role)
                const isActive = (u.status || 'Active').toLowerCase() === 'active'

                return (
                  <div 
                    key={u.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3 hover:border-purple-200 transition-all"
                  >
                    {/* Top Identity Row */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-bold text-sm uppercase flex items-center justify-center shrink-0 shadow-2xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{u.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleUserStatus(u)}
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all shrink-0 cursor-pointer ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        <span>{u.status || 'Active'}</span>
                      </button>
                    </div>

                    {/* Role & Campus Affiliation Strip */}
                    <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shadow-2xs ${getRoleBadgeStyle(u.role)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${roleMeta?.dotColor || 'bg-purple-600'}`}></span>
                        <span>{roleMeta?.shortName || u.role}</span>
                      </span>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[180px]">{u.institute || 'Global HQ'}</span>
                      </div>
                    </div>

                    {/* Contact Row & Quick Action Buttons */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-slate-500 font-mono truncate">
                        {u.phone || 'No phone'}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {u.phone && (
                          <button
                            type="button"
                            onClick={() => handleWhatsAppRedirect(u)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.4-5.83 2.4-1.46 0-2.89-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.4c0-4.54 3.7-8.24 8.2-8.24m4.53 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                            </svg>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setViewingUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleToggleDropdown(e, u.id)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#f5eeff] text-slate-600 hover:text-purple-700 transition-colors cursor-pointer"
                          title="Actions"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No matching users</p>
                <p className="text-xs text-slate-400 mt-1">Try resetting search or filters.</p>
                <button
                  type="button"
                  onClick={openAddModal}
                  className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-purple-700 transition-all cursor-pointer"
                >
                  Add New User
                </button>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {sortedUsers.length > 0 && (
            <div className="bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                Showing <strong className="text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, sortedUsers.length)}</strong> of <strong className="text-slate-800">{sortedUsers.length}</strong> users
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .map((pageNum, idx, arr) => {
                      const showEllipsisBefore = idx > 0 && pageNum - arr[idx - 1] > 1
                      return (
                        <React.Fragment key={pageNum}>
                          {showEllipsisBefore && <span className="px-1 text-slate-400 text-xs">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentPage === pageNum
                                ? 'bg-purple-600 text-white shadow-xs'
                                : 'text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        </React.Fragment>
                      )
                    })}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Clean Directory Footer Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 pt-1 px-1">
            <span>
              Showing {sortedUsers.length} of {users.length} registered platform users
            </span>
            <span className="text-[11px] text-slate-400">
              Role-Based Access Control Active · Multi-Campus Directory
            </span>
          </div>

          {/* Backdrop overlay for mobile to close dropdown cleanly */}
          {activeDropdownUserId && (
            <div 
              className="fixed inset-0 bg-black/20 z-[9998] transition-opacity cursor-pointer"
              onClick={() => {
                setActiveDropdownUserId(null)
                setDropdownCoords(null)
              }}
            />
          )}

          {/* Floating Portal Action Dropdown Menu */}
          {activeDropdownUserId && activeUser && dropdownCoords && typeof document !== 'undefined' && createPortal(
            <div
              ref={dropdownRef}
              style={calculateDropdownStyle()}
              onWheel={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-[0_20px_50px_rgba(79,70,229,0.18),0_6px_20px_rgba(15,23,42,0.08)] ring-1 ring-black/5 overflow-hidden flex flex-col text-left animate-in fade-in zoom-in-95 duration-150"
            >
              {/* Pinned User Header */}
              <div className="px-3.5 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    User Actions
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    (activeUser.status || 'Active').toLowerCase() === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {activeUser.status || 'Active'}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                    {activeUser.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {activeUser.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {activeUser.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Action Items List */}
              <div 
                className="flex-1 overflow-y-auto overscroll-contain p-1.5 pb-2.5 space-y-0.5 modal-scrollbar"
                style={{ overscrollBehavior: 'contain' }}
              >
                {/* Group 1: Profile & Editing */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    setViewingUser(activeUser)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#f5eeff] hover:text-purple-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold flex-1 text-left">View Profile & Roles</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    openEditModal(activeUser)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#f5eeff] hover:text-purple-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Edit2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold flex-1 text-left">Edit Profile</span>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {/* Group 2: Instant Communications */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    handleWhatsAppRedirect(activeUser)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.4-5.83 2.4-1.46 0-2.89-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.4c0-4.54 3.7-8.24 8.2-8.24m4.53 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">WhatsApp Direct</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-emerald-500 shrink-0" />
                </button>

                <a
                  href={activeUser.phone ? `tel:${activeUser.phone.replace(/[^\d+]/g, '')}` : undefined}
                  onClick={(e) => {
                    if (!activeUser.phone) {
                      e.preventDefault()
                      triggerToast(`No phone contact registered for ${activeUser.name}.`)
                    } else {
                      setActiveDropdownUserId(null)
                      setDropdownCoords(null)
                    }
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">
                      {activeUser.phone ? `Call: ${activeUser.phone}` : 'Direct Phone Call'}
                    </span>
                  </div>
                </a>

                <a
                  href={`mailto:${activeUser.email}`}
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">Send Email</span>
                  </div>
                </a>

                <div className="h-px bg-slate-100 my-1" />

                {/* Group 3: Account Status & Credentials */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    toggleUserStatus(activeUser)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">
                      {(activeUser.status || 'Active').toLowerCase() === 'active' ? 'Deactivate User' : 'Activate User'}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    triggerToast(`Password reset link dispatched to ${activeUser.email}.`)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">Reset Password</span>
                  </div>
                </button>

                <div className="h-px bg-slate-100 my-1" />

                {/* Group 4: Dangerous Action */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveDropdownUserId(null)
                    setDropdownCoords(null)
                    handleDelete(activeUser.id, activeUser.name)
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer group"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Trash2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <span className="font-bold block truncate">Delete Account</span>
                  </div>
                </button>
              </div>
            </div>,
            document.body
          )}
        </>
      ) : (
        /* Roles & Permissions Matrix Tab */
        <div className="space-y-6">
          {/* Role Architecture Directory */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <span>Educational System Roles Directory</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Comprehensive definition of the {directoryRoles.length} core platform roles, their operational scopes, and authority boundaries
                </p>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {directoryRoles.length} System Roles
                </span>
              </div>
            </div>

            {/* Responsive Self-Contained Role Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4.5 items-start">
              {directoryRoles.map((r) => {
                const isExpanded = !!expandedRoles[r.id]
                const IconComponent = r.icon
                const userCount = (users || []).filter(u => u.role === r.id).length

                return (
                  <div
                    key={r.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-purple-300 shadow-md ring-2 ring-purple-500/10'
                        : 'border-slate-200/80 hover:border-purple-200 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    <div
                      className={`p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3 transition-colors ${
                        isExpanded ? 'bg-slate-50/60' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2.5 sm:p-3 rounded-2xl transition-transform ${r.badgeClass} shrink-0`}>
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                              {r.name}
                            </h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap inline-flex items-center ${r.badgeClass}`}>
                              {r.tierLevel}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                            <span className="font-semibold text-slate-700">{r.shortName}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-slate-500">{r.category}</span>
                            <span className="text-slate-300">•</span>
                            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-purple-700 bg-purple-50/80 border border-purple-100 px-2 py-0.5 rounded-md">
                              {userCount} Active {userCount === 1 ? 'Account' : 'Accounts'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleRoleExpand(r.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                            isExpanded
                              ? 'bg-purple-600 text-white shadow-xs hover:bg-purple-700 ring-2 ring-purple-300'
                              : 'bg-purple-50 text-purple-700 hover:bg-purple-600 hover:text-white border border-purple-200'
                          }`}
                          title={isExpanded ? `Hide ${r.shortName} Specifications` : `View ${r.shortName} Specifications`}
                          aria-label={isExpanded ? `Hide ${r.shortName} Specifications` : `View ${r.shortName} Specifications`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Viewing Specs' : 'Inspect'}</span>
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 border-t border-slate-100 space-y-4 animate-in fade-in duration-200">
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <span className="font-bold text-slate-700">Scope of Authority: </span>
                            <span className="text-slate-600 font-medium">{r.scope}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Assigned: <strong className="text-slate-800 font-bold">{userCount} Active Accounts</strong>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {r.summary}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                          <div className="bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-100/80 space-y-2">
                            <h4 className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Authorized Responsibilities & Privileges</span>
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-600">
                              {r.responsibilities.map((resp, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                                  <span className="leading-tight">{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100/80 space-y-2">
                            <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Access Boundaries & Governance Safeguards</span>
                            </h4>
                            <ul className="space-y-1.5 text-xs text-slate-600">
                              {r.limitations.map((lim, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                                  <span className="leading-tight">{lim}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                          <span className="text-slate-400">
                            Official platform governance specifications for {r.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleRoleExpand(r.id)}
                            className="text-purple-600 hover:text-purple-800 font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                            <span>Collapse Specifications</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
                className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg font-bold text-[10px] border border-slate-300 transition-all shadow-2xs cursor-pointer"
                title="Reset all role permissions back to factory defaults"
              >
                Reset Defaults
              </button>
            </div>
          </div>

          {/* Granular RBAC Matrix */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-purple-600" />
                  <span>Granular Role-Based Access Control (RBAC) Matrix</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure feature privileges across all system roles. Superadmin holds root privileges by default.
                </p>
              </div>

              {/* RBAC Search & Filter Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search permissions..."
                    value={rbacSearchQuery}
                    onChange={(e) => setRbacSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-slate-50/60"
                  />
                  {rbacSearchQuery && (
                    <button onClick={() => setRbacSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <select
                  value={rbacCategoryFilter}
                  onChange={(e) => setRbacCategoryFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                >
                  <option value="ALL">All Categories</option>
                  {rbacCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportRBACCSV}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Export RBAC Matrix to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Export Matrix</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto relative">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 w-72 sticky left-0 bg-slate-50 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
                      Permission Policy
                    </th>
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
                  {filteredPermissions.length > 0 ? (
                    filteredPermissions.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-6 py-3.5 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)]">
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
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
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
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
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
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
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
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
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
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No permissions match your search or filter</p>
                        <p className="text-xs text-slate-400 mt-1">Try resetting the keyword or selecting "All Categories".</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View User Details */}
      {viewingUser && (
        <Modal
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          title="User Profile & System Role Specifications"
          maxWidth="max-w-2xl"
        >
          {(() => {
            const roleMeta = getRoleMeta(viewingUser.role)
            const RoleIcon = roleMeta?.icon || ShieldCheck
            const isActive = (viewingUser.status || 'Active').toLowerCase() === 'active'

            return (
              <div className="space-y-5">
                {/* 1. Profile Identity Header Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-purple-50/80 via-slate-50 to-indigo-50/60 border border-purple-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md uppercase shrink-0">
                      {viewingUser.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-base font-bold text-slate-900">{viewingUser.name}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(viewingUser.role)}`}>
                          {roleMeta?.shortName || viewingUser.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{viewingUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleUserStatus(viewingUser)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        isActive 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                      title="Click to toggle active status"
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span>{isActive ? 'Account Active' : 'Account Inactive'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Key Attributes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* System Role */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">System Role & Level</span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className={`p-1.5 rounded-lg ${roleMeta?.badgeClass || 'bg-purple-100 text-purple-700'}`}>
                        <RoleIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{roleMeta?.name || 'System User'}</p>
                        <p className="text-[10px] text-slate-500">{roleMeta?.tierLevel || 'Standard Access'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Campus / Institute */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campus Affiliation</span>
                    <div className="flex items-center gap-2 pt-0.5">
                      <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                        <Building className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">{viewingUser.institute || 'Global HQ / Multi-Campus'}</p>
                        <p className="text-[10px] text-slate-500">{viewingUser.institute ? 'Assigned Institute Branch' : 'Platform Central Administration'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Phone Contact */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone & WhatsApp Contact</span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-800">
                          {viewingUser.phone || 'No phone registered'}
                        </span>
                      </div>
                      {viewingUser.phone && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppRedirect(viewingUser)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold border border-emerald-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Chat on WhatsApp"
                          >
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2m.01 1.67c4.54 0 8.24 3.7 8.24 8.24 0 2.2-.86 4.28-2.42 5.84-1.56 1.56-3.64 2.4-5.83 2.4-1.46 0-2.89-.39-4.14-1.13l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 01-1.26-4.4c0-4.54 3.7-8.24 8.2-8.24m4.53 11.64c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                          <a
                            href={`tel:${viewingUser.phone.replace(/[^\d+]/g, '')}`}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Call Phone"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email & Auth */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email & Communication</span>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-800 truncate">
                          {viewingUser.email}
                        </span>
                      </div>
                      <a
                        href={`mailto:${viewingUser.email}`}
                        className="px-2 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 rounded-lg text-[10px] font-bold border border-sky-200 transition-colors inline-flex items-center gap-1 cursor-pointer shrink-0"
                        title="Send Email"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. Role Authority Scope & Responsibilities */}
                {roleMeta && (
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600" />
                        <span>Authority Scope & Responsibilities</span>
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {roleMeta.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {roleMeta.summary}
                    </p>
                    {roleMeta.responsibilities && roleMeta.responsibilities.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/70">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                          Assigned Capabilities
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {roleMeta.responsibilities.slice(0, 4).map((resp, i) => (
                            <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-snug">{resp}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        const targetUser = viewingUser
                        setViewingUser(null)
                        openEditModal(targetUser)
                      }}
                      className="px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-initial shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerToast(`Password reset link dispatched to ${viewingUser.email}.`)
                      }}
                      className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Reset Password</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewingUser(null)}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )
          })()}
        </Modal>
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

          {!editingUser && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Password</label>
              <div className="relative">
                <input
                  type={showModalPassword ? 'text' : 'password'}
                  value={formData.password || 'Password123!'}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm font-mono"
                  placeholder="Initial temporary password"
                />
                <button
                  type="button"
                  onClick={() => setShowModalPassword(!showModalPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showModalPassword ? 'Hide password' : 'Show password'}
                >
                  {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">User will be prompted to reset password on first login.</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)} 
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer"
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
