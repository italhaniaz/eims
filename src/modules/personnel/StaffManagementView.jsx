import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Users,
  Search,
  RotateCw,
  Download,
  Upload,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Building,
  Mail,
  Phone,
  Calendar,
  Check,
  Power
} from 'lucide-react'
import {
  AVAILABLE_SCHOOLS,
  COUNTRY_CODES,
  MockPersonnelService
} from './mockPersonnelData'

// Palette of colors for school pill tags
const SCHOOL_BADGE_COLORS = [
  'bg-[#19436B] text-white',           // Navy (like Maplewood Academy)
  'bg-[#0FA483] text-white',           // Teal (like Riverside Public School)
  'bg-[#1E88E5] text-white',           // Blue (like Greenwood International)
  'bg-[#7C3AED] text-white',           // Purple
  'bg-[#D97706] text-white',           // Amber
  'bg-[#0D9488] text-white'            // Dark Teal
]

const getSchoolBadgeColor = (name) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i)
    hash |= 0
  }
  const index = Math.abs(hash) % SCHOOL_BADGE_COLORS.length
  return SCHOOL_BADGE_COLORS[index]
}

export default function StaffManagementView({ onNavigateToRoles }) {
  // Staff & Roles state
  const [staffList, setStaffList] = useState([])
  const [roles, setRoles] = useState([])
  const [activeTab, setActiveTab] = useState('Active') // 'Active' | 'Inactive'
  const [searchTerm, setSearchTerm] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState(null)

  // Editing state
  const [editingStaffId, setEditingStaffId] = useState(null)

  // Form State
  const [formRole, setFormRole] = useState('')
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formCountryCode, setFormCountryCode] = useState('+44')
  const [formMobile, setFormMobile] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImagePreview, setFormImagePreview] = useState(null)
  const [formDob, setFormDob] = useState('')
  const [formAssignedSchools, setFormAssignedSchools] = useState([])
  const [formErrors, setFormErrors] = useState({})

  // Dropdown states
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)

  const fileInputRef = useRef(null)
  const schoolDropdownRef = useRef(null)
  const countryDropdownRef = useRef(null)
  const formCardRef = useRef(null)

  // Load staff & roles
  const loadData = () => {
    setIsRefreshing(true)
    const stf = MockPersonnelService.getStaff()
    const rls = MockPersonnelService.getRoles()
    setStaffList([...stf])
    setRoles([...rls])
    if (!formRole && rls.length > 0) {
      setFormRole(rls[0].name)
    }
    setTimeout(() => setIsRefreshing(false), 250)
  }

  useEffect(() => {
    loadData()
    const handleStaffUpdate = () => {
      setStaffList([...MockPersonnelService.getStaff()])
    }
    const handleRoleUpdate = () => {
      const rls = MockPersonnelService.getRoles()
      setRoles([...rls])
    }
    window.addEventListener('sms_personnel_staff_updated', handleStaffUpdate)
    window.addEventListener('sms_personnel_roles_updated', handleRoleUpdate)
    return () => {
      window.removeEventListener('sms_personnel_staff_updated', handleStaffUpdate)
      window.removeEventListener('sms_personnel_roles_updated', handleRoleUpdate)
    }
  }, [])

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target)) {
        setIsSchoolDropdownOpen(false)
      }
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Active / Inactive counts
  const activeCount = useMemo(() => staffList.filter(s => s.status === 'Active').length, [staffList])
  const inactiveCount = useMemo(() => staffList.filter(s => s.status === 'Inactive').length, [staffList])

  // Filtered staff rows
  const displayedStaff = useMemo(() => {
    return staffList.filter(s => {
      const matchesTab = s.status === activeTab
      if (!matchesTab) return false
      if (!searchTerm.trim()) return true
      const q = searchTerm.toLowerCase()
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
      const matchesName = fullName.includes(q)
      const matchesEmail = s.email?.toLowerCase().includes(q)
      const matchesRole = s.role?.toLowerCase().includes(q)
      const matchesMobile = `${s.countryCode} ${s.mobile}`.includes(q)
      const matchesSchool = (s.schools || []).some(sch => sch.toLowerCase().includes(q))
      return matchesName || matchesEmail || matchesRole || matchesMobile || matchesSchool
    })
  }, [staffList, activeTab, searchTerm])

  // Form Handlers
  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormImage(file.name)
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormImagePreview(event.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddSchool = (schoolName) => {
    if (!formAssignedSchools.includes(schoolName)) {
      setFormAssignedSchools(prev => [...prev, schoolName])
    }
    setIsSchoolDropdownOpen(false)
  }

  const handleRemoveSchool = (schoolName) => {
    setFormAssignedSchools(prev => prev.filter(s => s !== schoolName))
  }

  const handleResetForm = () => {
    setEditingStaffId(null)
    setFormRole(roles.length > 0 ? roles[0].name : '')
    setFormFirstName('')
    setFormLastName('')
    setFormCountryCode('+44')
    setFormMobile('')
    setFormEmail('')
    setFormImage('')
    setFormImagePreview(null)
    setFormDob('')
    setFormAssignedSchools([])
    setFormErrors({})
  }

  const handleEditStaff = (staff) => {
    setEditingStaffId(staff.id)
    setFormRole(staff.role || (roles[0]?.name || ''))
    setFormFirstName(staff.firstName || '')
    setFormLastName(staff.lastName || '')
    setFormCountryCode(staff.countryCode || '+44')
    setFormMobile(staff.mobile || '')
    setFormEmail(staff.email || '')
    setFormImage(staff.image || '')
    setFormImagePreview(null)
    setFormDob(staff.dob || '')
    setFormAssignedSchools([...(staff.schools || [])])
    setFormErrors({})

    if (formCardRef.current) {
      formCardRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSubmitForm = (e) => {
    e.preventDefault()
    const errors = {}
    if (!formRole.trim()) errors.role = 'Role is required'
    if (!formFirstName.trim()) errors.firstName = 'First name is required'
    if (!formLastName.trim()) errors.lastName = 'Last name is required'
    if (!formMobile.trim()) errors.mobile = 'Mobile number is required'
    if (!formEmail.trim()) {
      errors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formEmail)) {
      errors.email = 'Valid email is required'
    }
    if (!formDob) errors.dob = 'Date of birth is required'

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      id: editingStaffId || undefined,
      role: formRole,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      countryCode: formCountryCode,
      mobile: formMobile.trim(),
      email: formEmail.trim(),
      image: formImage || 'avatar-placeholder.png',
      imagePreview: formImagePreview || undefined,
      dob: formDob,
      schools: formAssignedSchools,
      status: 'Active'
    }

    MockPersonnelService.saveStaff(payload)
    showToast(editingStaffId ? 'Staff member updated successfully!' : 'New staff member created successfully!')
    handleResetForm()
  }

  const handleToggleStatus = (staffId) => {
    MockPersonnelService.toggleStaffStatus(staffId)
    showToast('Staff status updated!')
  }

  const handleDeleteStaff = (staff) => {
    MockPersonnelService.deleteStaff(staff.id)
    setDeleteConfirmStaff(null)
    showToast(`Staff member "${staff.firstName} ${staff.lastName}" deleted.`)
  }

  const handleExportCSV = () => {
    const headers = ['NO.', 'NAME', 'ROLE', 'EMAIL', 'MOBILE', 'ASSIGNED_SCHOOLS', 'STATUS', 'DOB']
    const rows = displayedStaff.map((s, i) => [
      i + 1,
      `"${s.firstName} ${s.lastName}"`,
      `"${s.role}"`,
      `"${s.email}"`,
      `"${s.countryCode} ${s.mobile}"`,
      `"${(s.schools || []).join('; ')}"`,
      `"${s.status}"`,
      `"${s.dob}"`
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `staff_${activeTab.toLowerCase()}_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported ${activeTab} staff to CSV`)
  }

  const selectedCountryObj = COUNTRY_CODES.find(c => c.code === formCountryCode) || COUNTRY_CODES[0]
  const unassignedSchools = AVAILABLE_SCHOOLS.filter(s => !formAssignedSchools.includes(s))

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Staff</h3>
                <p className="text-xs text-slate-500">Confirm permanent removal</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirmStaff.firstName} {deleteConfirmStaff.lastName}</strong>? Their login access and school assignments will be revoked.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmStaff(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteStaff(deleteConfirmStaff)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-sm"
              >
                Yes, Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
          Manage staff
        </h1>
        {onNavigateToRoles && (
          <button
            onClick={onNavigateToRoles}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Configure Roles & Permissions</span>
            <span>→</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* CARD 1: CREATE / EDIT STAFF FORM (Screenshot 4) */}
      {/* ========================================================= */}
      <div
        ref={formCardRef}
        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-6">
          {editingStaffId ? 'Edit Staff Member' : 'Create Staff'}
        </h2>

        <form onSubmit={handleSubmitForm} className="space-y-6">
          {/* 3-Column Responsive Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Roles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Roles <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formRole}
                  onChange={(e) => {
                    setFormRole(e.target.value)
                    if (formErrors.role) setFormErrors(prev => ({ ...prev, role: null }))
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 cursor-pointer ${
                    formErrors.role
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                  }`}
                >
                  {roles.length === 0 && (
                    <option value="">No roles available (Create a role first)</option>
                  )}
                  {roles.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-3 pointer-events-none text-slate-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
              {formErrors.role && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.role}</p>
              )}
            </div>

            {/* 2. First name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                First name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formFirstName}
                onChange={(e) => {
                  setFormFirstName(e.target.value)
                  if (formErrors.firstName) setFormErrors(prev => ({ ...prev, firstName: null }))
                }}
                placeholder="Olivia"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.firstName
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.firstName && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.firstName}</p>
              )}
            </div>

            {/* 3. Last name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Last name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formLastName}
                onChange={(e) => {
                  setFormLastName(e.target.value)
                  if (formErrors.lastName) setFormErrors(prev => ({ ...prev, lastName: null }))
                }}
                placeholder="Bennett"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.lastName
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.lastName && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.lastName}</p>
              )}
            </div>

            {/* 4. Mobile with Country Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Mobile <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-visible focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                {/* Country Code Dropdown */}
                <div className="relative shrink-0" ref={countryDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-r border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer rounded-l-lg"
                  >
                    <span>{selectedCountryObj.flag}</span>
                    <span className="font-medium text-xs sm:text-sm">{selectedCountryObj.code}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {isCountryDropdownOpen && (
                    <div className="absolute left-0 top-11 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 max-h-56 overflow-y-auto">
                      {COUNTRY_CODES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => {
                            setFormCountryCode(c.code)
                            setIsCountryDropdownOpen(false)
                          }}
                          className="w-full px-3 py-2 text-left text-xs sm:text-sm flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <span>{c.flag}</span>
                            <span>{c.country}</span>
                          </span>
                          <span className="font-semibold text-slate-500">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Number Input */}
                <input
                  type="text"
                  value={formMobile}
                  onChange={(e) => {
                    setFormMobile(e.target.value)
                    if (formErrors.mobile) setFormErrors(prev => ({ ...prev, mobile: null }))
                  }}
                  placeholder="7700900789"
                  className="w-full px-3 py-2.5 text-sm bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              {formErrors.mobile && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.mobile}</p>
              )}
            </div>

            {/* 5. Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => {
                  setFormEmail(e.target.value)
                  if (formErrors.email) setFormErrors(prev => ({ ...prev, email: null }))
                }}
                placeholder="olivia.bennett@example.com"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.email
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.email && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.email}</p>
              )}
            </div>

            {/* 6. Image (308*338px) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Image <span className="text-sky-500 text-[11px] font-normal">(308*338px)</span>
              </label>
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                <input
                  type="text"
                  readOnly
                  value={formImage || 'avatar-placeholder.png'}
                  placeholder="avatar-olivia-bennett.png"
                  className="w-full px-3.5 py-2.5 text-xs text-slate-600 dark:text-slate-300 bg-transparent focus:outline-none truncate"
                />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#152a45] text-white text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </div>

            {/* 7. Date of birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Date of birth <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={formDob}
                onChange={(e) => {
                  setFormDob(e.target.value)
                  if (formErrors.dob) setFormErrors(prev => ({ ...prev, dob: null }))
                }}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                  formErrors.dob
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              {formErrors.dob && (
                <p className="mt-1 text-xs text-rose-500">{formErrors.dob}</p>
              )}
            </div>

            {/* 8. Assign schools (spans 2 columns on lg) */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Assign schools
                </label>
                {unassignedSchools.length > 0 && (
                  <div className="relative" ref={schoolDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsSchoolDropdownOpen(!isSchoolDropdownOpen)}
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add School</span>
                    </button>

                    {isSchoolDropdownOpen && (
                      <div className="absolute right-0 top-6 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl py-1 z-30 max-h-52 overflow-y-auto">
                        <span className="text-[11px] font-semibold px-3 py-1.5 block text-slate-400 uppercase tracking-wider">
                          Available Schools
                        </span>
                        {unassignedSchools.map(school => (
                          <button
                            key={school}
                            type="button"
                            onClick={() => handleAddSchool(school)}
                            className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer flex items-center justify-between"
                          >
                            <span>{school}</span>
                            <Plus className="w-3.5 h-3.5 text-blue-500" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pill Tagger Container */}
              <div className="min-h-[46px] p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-wrap items-center gap-2">
                {formAssignedSchools.length === 0 ? (
                  <span className="text-xs text-slate-400 italic px-2">
                    No schools assigned yet. Click "Add School" to link institutes.
                  </span>
                ) : (
                  formAssignedSchools.map(school => (
                    <span
                      key={school}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold shadow-xs ${getSchoolBadgeColor(school)}`}
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveSchool(school)}
                        className="hover:opacity-75 focus:outline-none cursor-pointer"
                        title="Remove school"
                      >
                        <X className="w-3 h-3 stroke-[3]" />
                      </button>
                      <span>{school}</span>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Form Action Buttons (Bottom Right) */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
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
              {editingStaffId ? 'Update Staff' : 'Submit'}
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: STAFF LIST TABLE (ACTIVE & INACTIVE TABS) */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Top Header: Tabs & Action Search */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('Active')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'Active'
                  ? 'bg-[#1E3A5F] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Active</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'Active' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {activeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Inactive')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'Inactive'
                  ? 'bg-[#1E3A5F] text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Inactive</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === 'Inactive' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {inactiveCount}
              </span>
            </button>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search staff, role, email..."
                className="w-48 sm:w-64 px-3.5 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={loadData}
              title="Refresh staff"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Staff Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-4 text-center w-14">NO.</th>
                <th className="py-3.5 px-4">STAFF</th>
                <th className="py-3.5 px-4">ROLE</th>
                <th className="py-3.5 px-4">CONTACT</th>
                <th className="py-3.5 px-4">ASSIGNED SCHOOLS</th>
                <th className="py-3.5 px-4 text-center">STATUS</th>
                <th className="py-3.5 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {displayedStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-sm">
                    No {activeTab.toLowerCase()} staff found.
                  </td>
                </tr>
              ) : (
                displayedStaff.map((staff, index) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* NO. */}
                    <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                      {index + 1}
                    </td>

                    {/* STAFF (Photo / Avatar + Full Name + Email) */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
                          {staff.imagePreview ? (
                            <img src={staff.imagePreview} alt={staff.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{staff.firstName[0]}{staff.lastName[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white leading-tight">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {staff.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
                        {staff.role}
                      </span>
                    </td>

                    {/* CONTACT (Mobile) */}
                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{staff.countryCode} {staff.mobile}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>DOB: {staff.dob}</span>
                      </div>
                    </td>

                    {/* ASSIGNED SCHOOLS */}
                    <td className="py-3.5 px-4 max-w-xs">
                      {(!staff.schools || staff.schools.length === 0) ? (
                        <span className="text-xs text-slate-400 italic">None assigned</span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {staff.schools.map(school => (
                            <span
                              key={school}
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${getSchoolBadgeColor(school)}`}
                            >
                              {school}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* STATUS */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(staff.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          staff.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{staff.status}</span>
                      </button>
                    </td>

                    {/* ACTION */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEditStaff(staff)}
                          title="Edit Staff"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmStaff(staff)}
                          title="Delete Staff"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing 1 to {displayedStaff.length} of {displayedStaff.length} rows ({activeTab})
          </span>
        </div>
      </div>
    </div>
  )
}
