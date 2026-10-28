import React, { useState, useMemo } from 'react'
import { 
  LayoutGrid,
  List,
  Building2, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  MapPin, 
  Mail, 
  Phone, 
  Eye, 
  School, 
  Award, 
  Users, 
  Download, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Sparkles,
  Upload,
  FileCode,
  Database,
  RefreshCw,
  KeyRound,
  AlertTriangle,
  Archive,
  RotateCcw,
  Check,
  UserCheck,
  ShieldAlert,
  Palette,
  Globe,
  Sliders,
  Calendar,
  X,
  Lock,
  GraduationCap,
  Copy
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { PlatformService, PLATFORM_MODULES, SUBSCRIPTION_PLANS } from '../../../services/platformService'

export const InstitutesView = () => {
  const { 
    institutes = [], 
    divisions = [], 
    districts = [], 
    examinationBodies = [], 
    users = [],
    auditLogs = [],
    recentActivity = [],
    addItem, 
    updateItem, 
    deleteItem, 
    exportData, 
    importData, 
    validateBackup, 
    rollbackLastRestore,
    logAuditEvent,
    refreshData
  } = useAppData()

  const { user, login } = useAuth()
  const { toast } = useToast()

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')
  const [lifecycleFilter, setLifecycleFilter] = useState('ALL') // ALL, Active, Suspended, Archived
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table' // ALL, School, College, University

  // Sorting & Pagination
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  // Modals
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [wizardStep, setWizardStep] = useState(1)
  const [editingInstitute, setEditingInstitute] = useState(null)
  const [viewingDetails, setViewingDetails] = useState(null)
  const [detailsTab, setDetailsTab] = useState('overview') // overview, campuses, admins, modules, plan, activity

  // Suspension Modal
  const [suspensionTarget, setSuspensionTarget] = useState(null)
  const [suspensionReason, setSuspensionReason] = useState('')

  // Password Reset Modal
  // Campus Administrator Credentials State
  const [credentialsModal, setCredentialsModal] = useState(null)
  const [credentialsForm, setCredentialsForm] = useState({
    adminName: '',
    adminEmail: '',
    password: '',
    showPassword: true
  })
  const [copiedState, setCopiedState] = useState(false)
  const [newlyCreatedCreds, setNewlyCreatedCreds] = useState(null)

  const [passwordResetTarget, setPasswordResetTarget] = useState(null)
  const [newAdminPassword, setNewAdminPassword] = useState('')

  // Disaster Recovery Modal
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false)
  const [backupInspectionReport, setBackupInspectionReport] = useState(null)
  const [selectedBackupPayload, setSelectedBackupPayload] = useState(null)

  // ----------------------------------------------------
  // Onboarding Wizard Form State (5 Steps)
  // ----------------------------------------------------
  const initialWizardState = {
    // Step 1: Demographics & Type
    type: 'School', // School, College, University, Custom
    planType: 'SCHOOL',
    enabledTiers: ['school'],
    name: '',
    code: '',
    affiliatedBoard: examinationBodies[0]?.code || 'BISE Lahore',
    divisionId: divisions[0]?.id || '',
    districtId: districts[0]?.id || '',
    principal: '',
    // Step 2: Campuses
    city: 'Lahore',
    province: 'Punjab',
    address: '',
    campuses: [
      { name: 'Main Campus', city: 'Lahore', address: '' }
    ],
    // Step 3: Branding & Identity
    slug: '',
    primaryColor: '#2563eb',
    logoUrl: '',
    email: '',
    phone: '',
    // Step 4: Administrator Account
    adminName: '',
    adminEmail: '',
    adminPassword: 'Password123!',
    adminPhone: '',
    // Step 5: Subscription Plan
    planTier: 'Pro',
    quotaStudents: 1500,
    quotaUsers: 50,
    quotaCampuses: 3,
    quotaStorageMb: 2048,
    enabledModules: {
      students: true,
      fees: true,
      payroll: true,
      exams: true,
      library: true,
      transport: true,
      hostel: false,
      admissions: true,
      communication: true,
      inventory: false
    }
  }

  const [wizardData, setWizardData] = useState(initialWizardState)

  // Auto-generate code and slug when name changes in Wizard
  const handleWizardNameChange = (name) => {
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
    const codePrefix = wizardData.type === 'University' ? 'UNI' : wizardData.type === 'College' ? 'COL' : 'SCH'
    const generatedCode = wizardData.code || `${codePrefix}-${Math.floor(100 + Math.random() * 900)}`
    
    setWizardData(prev => ({
      ...prev,
      name,
      slug: prev.slug ? prev.slug : generatedSlug,
      code: prev.code ? prev.code : generatedCode,
      adminEmail: prev.adminEmail ? prev.adminEmail : (generatedSlug ? `admin@${generatedSlug}.edu` : '')
    }))
  }

  const openOnboardingWizard = () => {
    setWizardData({
      ...initialWizardState,
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      divisionId: divisions[0]?.id || '',
      districtId: districts[0]?.id || '',
      affiliatedBoard: examinationBodies[0]?.code || 'BISE Lahore'
    })
    setWizardStep(1)
    setIsWizardOpen(true)
  }

  const handleNextStep = () => {
    if (wizardStep === 1) {
      if (!wizardData.name || !wizardData.code) {
        toast.error('Please provide Institute Name and Unique Code')
        return
      }
      // Check duplicate code
      const isDuplicate = institutes.some(i => i.code?.toLowerCase() === wizardData.code.trim().toLowerCase())
      if (isDuplicate) {
        toast.error(`Institute Code "${wizardData.code}" is already in use!`)
        return
      }
    } else if (wizardStep === 4) {
      if (!wizardData.adminEmail || !wizardData.adminPassword) {
        toast.error('Please enter Administrator Email and Secure Password')
        return
      }
    }
    setWizardStep(prev => Math.min(prev + 1, 5))
  }

  const handlePrevStep = () => {
    setWizardStep(prev => Math.max(prev - 1, 1))
  }

  const handleCompleteWizard = async () => {
    try {
      await PlatformService.onboardInstitute(wizardData)
      refreshData()
      setIsWizardOpen(false)
      setNewlyCreatedCreds({
        name: wizardData.name,
        code: wizardData.code,
        planTier: wizardData.planTier,
        adminName: wizardData.adminName || `${wizardData.name} Administrator`,
        adminEmail: wizardData.adminEmail || `admin@${wizardData.slug || 'campus'}.edu`,
        password: wizardData.adminPassword || 'admin123'
      })
      toast.success(`Institute "${wizardData.name}" onboarded successfully with initial admin account!`)
    } catch (e) {
      toast.error(e.message || 'Failed to complete onboarding')
    }
  }

  // ----------------------------------------------------
  // Lifecycle Actions (Activate, Suspend, Archive, Restore)
  // ----------------------------------------------------
  const handleLifecycleChange = async (inst, action) => {
    if (action === 'Suspend') {
      setSuspensionTarget(inst)
      setSuspensionReason('')
      return
    }

    if (action === 'Archive') {
      if (!window.confirm(`Are you sure you want to archive "${inst.name}"? Active classes will be locked.`)) {
        return
      }
    }

    try {
      await PlatformService.updateInstituteLifecycle(inst.id, action)
      refreshData()
      toast.success(`Institute "${inst.name}" set to ${action.toUpperCase()} successfully.`)
    } catch (err) {
      toast.error(err.message || 'Lifecycle update failed')
    }
  }

  const confirmSuspension = async () => {
    if (!suspensionReason.trim()) {
      toast.error('Mandatory: Please provide a reason for suspension.')
      return
    }

    try {
      await PlatformService.updateInstituteLifecycle(suspensionTarget.id, 'Suspend', suspensionReason.trim())
      refreshData()
      toast.warning(`Institute "${suspensionTarget.name}" has been SUSPENDED. Access revoked.`)
      setSuspensionTarget(null)
      setSuspensionReason('')
    } catch (err) {
      toast.error(err.message || 'Suspension failed')
    }
  }

  // ----------------------------------------------------
  // Impersonation / Direct Delegation
  // ----------------------------------------------------
  const handleImpersonate = async (inst) => {
    if (inst.lifecycleStatus === 'Suspended' || inst.status === 'Suspended') {
      toast.error('Cannot impersonate into a Suspended Institute. Reactivate the campus first.')
      return
    }

    try {
      await PlatformService.startImpersonation(inst, user)
      login('institute_admin', `admin@${inst.slug || 'campus'}.edu`)
      toast.info(`Now impersonating "${inst.name}". A 60-minute delegation session is active.`)
    } catch (err) {
      toast.error(err.message || 'Failed to initiate impersonation session')
    }
  }

  // ----------------------------------------------------
  // Password Reset
  // ----------------------------------------------------
  const handleOpenCredentialsModal = (inst) => {
    const creds = PlatformService.getAdminCredentials(inst.id)
    setCredentialsModal(inst)
    setCredentialsForm({
      adminName: creds.adminName,
      adminEmail: creds.adminEmail,
      password: creds.password,
      showPassword: true
    })
    setCopiedState(false)
  }

  const handleCopyCredentials = (inst, form) => {
    const text = `🏫 Educational Institute Management System (EIMS)
📍 Campus: ${inst?.name} (${inst?.code})
📋 Plan: ${inst?.planTier || 'School Plan'}
👤 Admin Name: ${form.adminName}
📧 Login Email: ${form.adminEmail}
🔑 Password: ${form.password}
🌐 Login URL: https://eims-app.vercel.app/`

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
    }
    setCopiedState(true)
    toast.success('Campus login credentials copied to clipboard!')
    setTimeout(() => setCopiedState(false), 3000)
  }

  const handleSaveCredentials = async (e) => {
    e.preventDefault()
    if (!credentialsModal) return
    try {
      await PlatformService.saveAdminCredentials(credentialsModal.id, {
        adminName: credentialsForm.adminName,
        adminEmail: credentialsForm.adminEmail,
        password: credentialsForm.password
      })
      refreshData()
      toast.success(`Administrator credentials for "${credentialsModal.name}" updated successfully!`)
      setCredentialsModal(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update credentials')
    }
  }

  const handleResetPassword = async () => {
    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }

    try {
      await PlatformService.resetAdminPassword(passwordResetTarget.id, newAdminPassword)
      refreshData()
      toast.success(`Administrator password for "${passwordResetTarget.name}" has been reset.`)
      setPasswordResetTarget(null)
      setNewAdminPassword('')
    } catch (err) {
      toast.error(err.message || 'Password reset failed')
    }
  }

  // ----------------------------------------------------
  // Edit Institute Basic
  // ----------------------------------------------------
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    city: '',
    province: 'Punjab',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliatedBoard: 'BISE Lahore',
    type: 'School'
  })

  const openEditModal = (inst) => {
    setEditingInstitute(inst)
    setEditFormData({
      name: inst.name || '',
      code: inst.code || '',
      city: inst.city || 'Lahore',
      province: inst.province || 'Punjab',
      principal: inst.principal || '',
      email: inst.email || '',
      phone: inst.phone || '',
      address: inst.address || '',
      affiliatedBoard: inst.affiliatedBoard || 'BISE Lahore',
      type: inst.type || 'School'
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editFormData.name || !editFormData.code) {
      toast.error('Name and Code are required.')
      return
    }

    const payload = {
      ...editFormData,
      code: editFormData.code.trim().toUpperCase()
    }

    await updateItem('institutes', editingInstitute.id, payload)
    toast.success(`Institute "${editFormData.name}" profile updated.`)
    setEditingInstitute(null)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}"? This action cannot be undone.`)) {
      await deleteItem('institutes', id)
      toast.success(`Institute removed from directory.`)
    }
  }

  // ----------------------------------------------------
  // Filtering & Sorting
  // ----------------------------------------------------
  const filteredAndSorted = useMemo(() => {
    const list = institutes.filter(inst => {
      const matchesSearch = 
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((inst.city || inst.address) && (inst.city || inst.address).toLowerCase().includes(searchTerm.toLowerCase()))

      const instLifecycle = inst.lifecycleStatus || (inst.status === 'Suspended' ? 'Suspended' : 'Active')
      const matchesLifecycle = lifecycleFilter === 'ALL' || instLifecycle.toLowerCase() === lifecycleFilter.toLowerCase()

      const instType = inst.type || 'School'
      const matchesType = typeFilter === 'ALL' || instType.toLowerCase() === typeFilter.toLowerCase()

      return matchesSearch && matchesLifecycle && matchesType
    })

    return list.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [institutes, searchTerm, lifecycleFilter, typeFilter, sortField, sortDirection])

  const totalInstitutes = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalInstitutes / pageSize))
  const paginatedInstitutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Export to CSV
  const exportInstitutesCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No institutes to export.')
      return
    }

    const headers = ['Institute Name', 'Code', 'Type', 'City', 'Province', 'Principal', 'Email', 'Phone', 'Affiliated Board', 'Status', 'Lifecycle', 'Plan']
    const rows = filteredAndSorted.map(inst => [
      `"${inst.name || ''}"`,
      `"${inst.code || ''}"`,
      `"${inst.type || 'School'}"`,
      `"${inst.city || ''}"`,
      `"${inst.province || ''}"`,
      `"${inst.principal || ''}"`,
      `"${inst.email || ''}"`,
      `"${inst.phone || ''}"`,
      `"${inst.affiliatedBoard || ''}"`,
      `"${inst.status || 'Active'}"`,
      `"${inst.lifecycleStatus || 'Active'}"`,
      `"${inst.planTier || 'Enterprise'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `institutes_directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} institutes to CSV.`)
  }

  // Backup handlers
  const handleDownloadSnapshot = () => {
    const snapshot = exportData()
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(snapshot, null, 2))}`
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', jsonString)
    downloadAnchor.setAttribute('download', `eims_campus_snapshot_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    toast.success('Verified campus snapshot package downloaded!')
  }

  const handleBackupFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        const report = validateBackup(parsed)
        if (report.valid) {
          setBackupInspectionReport(report)
          setSelectedBackupPayload(report.dataPayload)
          toast.success('Backup package schema validated and verified!')
        } else {
          setBackupInspectionReport(null)
          setSelectedBackupPayload(null)
          toast.error(report.error || 'Invalid backup file structure.')
        }
      } catch (err) {
        setBackupInspectionReport(null)
        setSelectedBackupPayload(null)
        toast.error('Corrupted JSON file. Unable to parse.')
      }
    }
    reader.readAsText(file)
  }

  const handleApplyRestore = () => {
    if (!selectedBackupPayload) return
    importData(selectedBackupPayload)
    toast.success('Campus database restored and verified successfully!')
    setIsBackupModalOpen(false)
    setBackupInspectionReport(null)
    setSelectedBackupPayload(null)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-600" />
              <span>Campus Directory & Global Lifecycle</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Institutes & Campuses
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Global governance of schools, colleges, chartered universities, and multi-tenant registered campuses.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={exportInstitutesCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold border border-slate-200/80 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            title="Export institutes to CSV"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 border border-purple-200/60 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            title="One-Click Campus Snapshot & Disaster Recovery"
          >
            <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Disaster Recovery</span>
          </button>

          <button
            onClick={openOnboardingWizard}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            title="Launch Campus Onboarding Wizard"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Onboard Campus</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-purple-600 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.2]" />
          <input
            type="text"
            placeholder="Search by institute name, code, or city..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-full bg-[#f8fafc] border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={lifecycleFilter}
              onChange={(e) => {
                setLifecycleFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 font-medium">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="School">School</option>
              <option value="College">College</option>
              <option value="University">University</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-purple-700 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs font-bold bg-[#f5eeff] text-purple-700 border border-purple-100 px-3.5 py-2 rounded-xl whitespace-nowrap">
            Total: {totalInstitutes}
          </span>
        </div>
      </div>

      {/* Institutes Cards Grid */}
      {paginatedInstitutes.length > 0 ? (
        <div className="space-y-6">
          
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {paginatedInstitutes.map((inst) => {
              const instLifecycle = inst.lifecycleStatus || (inst.status === 'Suspended' ? 'Suspended' : 'Active')
              const isSuspended = instLifecycle === 'Suspended'
              const isArchived = instLifecycle === 'Archived'

              return (
                <div 
                  key={inst.id} 
                  className={`bg-white rounded-3xl border transition-all flex flex-col justify-between overflow-hidden shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-md ${
                    isSuspended ? 'border-rose-300 ring-1 ring-rose-200 bg-rose-50/10' :
                    isArchived ? 'border-slate-200 opacity-80 bg-slate-50/40' : 'border-slate-100'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 flex items-center justify-center font-bold text-lg shadow-2xs shrink-0">
                        {inst.type === 'University' ? (
                          <GraduationCap className="w-6 h-6" />
                        ) : inst.type === 'College' ? (
                          <Building2 className="w-6 h-6" />
                        ) : (
                          <School className="w-6 h-6" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap justify-end">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5eeff] text-purple-700 border border-purple-200">
                          {inst.type || 'School'}
                        </span>
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                          {inst.code}
                        </span>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          isArchived ? 'bg-slate-100 text-slate-600 border-slate-300' :
                          'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {instLifecycle}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-4 leading-snug line-clamp-1">{inst.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{inst.address || `${inst.city || 'City'}, ${inst.province || 'Punjab'}`}</span>
                    </p>

                    {/* Suspension Notice Banner if suspended */}
                    {isSuspended && (
                      <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-[11px] uppercase tracking-wider">Account Suspended</p>
                          <p className="text-[11px] text-rose-700 mt-0.5">{inst.suspensionReason || 'Administrative suspension in effect.'}</p>
                        </div>
                      </div>
                    )}

                    {/* Details Summary */}
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Head / Principal:</span>
                        <span className="font-medium text-slate-700 truncate max-w-[170px]">{inst.principal || 'In-Charge Principal'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Admin Account:</span>
                        <button
                          type="button"
                          onClick={() => handleOpenCredentialsModal(inst)}
                          className="font-mono text-[11px] text-purple-700 bg-[#f5eeff] hover:bg-[#ede0fe] px-2 py-0.5 rounded font-semibold truncate max-w-[170px] cursor-pointer flex items-center gap-1"
                          title="Click to view full login password"
                        >
                          <span>admin@{inst.slug || inst.code?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'campus'}.edu</span>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Plan Tier:</span>
                        <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {inst.planTier || 'Enterprise'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Affiliation:</span>
                        <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px] truncate max-w-[170px]">
                          {inst.affiliatedBoard || 'Board Affiliated'}
                        </span>
                      </div>
                    </div>

                    {/* Stats badges */}
                    <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Enrolled Students</span>
                        <span className="text-sm font-bold text-slate-800">{inst.totalStudents || 0}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg text-center">
                        <span className="block text-[10px] text-slate-400 uppercase font-semibold">Faculty & Staff</span>
                        <span className="text-sm font-bold text-slate-800">{inst.totalTeachers || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex flex-col gap-2">
                    {/* Primary Row: View Profile & Impersonate */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setViewingDetails(inst)
                          setDetailsTab('overview')
                        }}
                        className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 text-xs font-semibold transition-colors cursor-pointer flex-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>

                      <button
                        onClick={() => handleImpersonate(inst)}
                        disabled={isSuspended}
                        className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer flex-1"
                        title="1-Click Direct Delegation / Impersonation (60 min session)"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Login as Admin</span>
                      </button>
                    </div>

                    {/* Secondary Row: Lifecycle Actions */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        {isSuspended ? (
                          <button
                            onClick={() => handleLifecycleChange(inst, 'Activate')}
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                            title="Reactivate Institute Access"
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLifecycleChange(inst, 'Suspend')}
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                            title="Suspend Institute (Requires Reason)"
                          >
                            Suspend
                          </button>
                        )}

                        {isArchived ? (
                          <button
                            onClick={() => handleLifecycleChange(inst, 'Restore')}
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors"
                            title="Restore Archived Institute"
                          >
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLifecycleChange(inst, 'Archive')}
                            className="px-2 py-0.5 rounded text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors"
                            title="Archive Campus"
                          >
                            Archive
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenCredentialsModal(inst)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white transition-colors cursor-pointer"
                          title="View / Set Admin Login Credentials"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                        <button
                          onClick={() => openEditModal(inst)}
                          className="p-1 text-slate-400 hover:text-purple-600 rounded hover:bg-white transition-colors"
                          title="Edit Basic Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inst.id, inst.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors"
                          title="Delete Institute"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            </div>
          ) : (
            /* Clean Data Table matching reference */
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold text-[11px] uppercase tracking-wider bg-slate-50/50">
                      <th className="py-3.5 px-4">Campus & Code</th>
                      <th className="py-3.5 px-4">Tier & Plan</th>
                      <th className="py-3.5 px-4">Principal / Head</th>
                      <th className="py-3.5 px-4 text-center">Students / Faculty</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {paginatedInstitutes.map((inst) => {
                      const instLifecycle = inst.lifecycleStatus || (inst.status === 'Suspended' ? 'Suspended' : 'Active')
                      const isSuspended = instLifecycle === 'Suspended'
                      const isArchived = instLifecycle === 'Archived'

                      return (
                        <tr 
                          key={inst.id}
                          className="hover:bg-purple-50/20 transition-colors group cursor-pointer"
                          onClick={() => {
                            setViewingDetails(inst)
                            setDetailsTab('overview')
                          }}
                        >
                          {/* Campus & Code */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                                {inst.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 group-hover:text-purple-700 transition-colors text-sm line-clamp-1">
                                  {inst.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-[10px] text-slate-400 font-semibold">{inst.code}</span>
                                  <span className="text-[10px] text-slate-400">• {inst.city || 'Central Region'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Tier & Plan */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100">
                                {inst.type || 'School'}
                              </span>
                              <span className="text-[11px] text-slate-500 font-medium">{inst.planTier || 'School Plan'}</span>
                            </div>
                          </td>

                          {/* Principal */}
                          <td className="py-4 px-4 text-slate-700 font-medium">
                            <span className="truncate block max-w-[160px]">{inst.principal || 'In-Charge Principal'}</span>
                            <span className="text-[10px] text-slate-400">{inst.email || '—'}</span>
                          </td>

                          {/* Students / Staff */}
                          <td className="py-4 px-4 text-center">
                            <span className="font-bold text-slate-800 text-xs">{inst.totalStudents || 0}</span>
                            <span className="text-[10px] text-slate-400 block">{inst.totalTeachers || 0} faculty</span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              isSuspended ? 'bg-rose-50 text-rose-700 border-rose-200' :
                              isArchived ? 'bg-slate-100 text-slate-600 border-slate-300' :
                              'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isSuspended ? 'bg-rose-500' : isArchived ? 'bg-slate-400' : 'bg-emerald-500'}`}></span>
                              {instLifecycle}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setViewingDetails(inst)
                                  setDetailsTab('overview')
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleImpersonate(inst)}
                                disabled={isSuspended}
                                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Login</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
              <div>
                Showing Page <span className="font-semibold text-slate-700">{currentPage}</span> of <span className="font-semibold text-slate-700">{totalPages}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded font-semibold ${
                      currentPage === page
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Institutes Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            No institutes matched your filter criteria. Launch the Onboarding Wizard to register a new campus.
          </p>
          <button
            onClick={openOnboardingWizard}
            className="mt-4 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Onboarding Wizard</span>
          </button>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 1. ONBOARDING WIZARD MODAL (5 Steps) */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        title={`Institute Onboarding Wizard - Step ${wizardStep} of 5`}
      >
        <div className="space-y-5">
          {/* Progress Indicators */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
            <span className={`font-bold ${wizardStep === 1 ? 'text-purple-600' : 'text-slate-400'}`}>1. Type & Profile</span>
            <span className={`font-bold ${wizardStep === 2 ? 'text-purple-600' : 'text-slate-400'}`}>2. Campuses</span>
            <span className={`font-bold ${wizardStep === 3 ? 'text-purple-600' : 'text-slate-400'}`}>3. Branding</span>
            <span className={`font-bold ${wizardStep === 4 ? 'text-purple-600' : 'text-slate-400'}`}>4. Administrator</span>
            <span className={`font-bold ${wizardStep === 5 ? 'text-purple-600' : 'text-slate-400'}`}>5. Plan & Quotas</span>
          </div>

          {/* Step 1: Type & Profile */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Educational Tier / Institute Plan Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'School', label: 'School Plan', icon: School, defaultTiers: ['school'], planName: 'School Plan', color: 'text-purple-600' },
                    { id: 'College', label: 'College Plan', icon: Building2, defaultTiers: ['college'], planName: 'College Plan', color: 'text-indigo-600' },
                    { id: 'University', label: 'University Plan', icon: GraduationCap, defaultTiers: ['undergraduate'], planName: 'University Plan', color: 'text-purple-600' },
                    { id: 'Custom', label: 'Custom Hybrid', icon: Layers, defaultTiers: ['school', 'college'], planName: 'Custom Hybrid Plan', color: 'text-amber-600' }
                  ].map((tierItem) => {
                    const TierIcon = tierItem.icon
                    const isSelected = wizardData.type === tierItem.id
                    return (
                      <button
                        key={tierItem.id}
                        type="button"
                        onClick={() => setWizardData({ 
                          ...wizardData, 
                          type: tierItem.id,
                          planType: tierItem.id.toUpperCase(),
                          planTier: tierItem.planName,
                          enabledTiers: tierItem.defaultTiers
                        })}
                        className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                          isSelected 
                            ? 'border-purple-600 bg-[#f5eeff] text-purple-800 font-bold ring-2 ring-purple-500/20' 
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <TierIcon className={`w-5 h-5 ${tierItem.color}`} />
                        <span className="text-xs font-semibold">{tierItem.label}</span>
                      </button>
                    )
                  })}
                </div>

                {/* Custom Plan: Multi-Wing Checkbox Configuration */}
                {wizardData.type === 'Custom' && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-3 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Select Active Educational Wings for this Custom Client
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'school', label: 'School Wing', desc: 'Primary & High School (K-10)', icon: School },
                        { id: 'college', label: 'College Wing', desc: 'Intermediate (F.Sc, ICS, FA, A-Levels)', icon: Building2 },
                        { id: 'undergraduate', label: 'Undergraduates Wing', desc: '4-Year BS Degrees & Semesters', icon: GraduationCap }
                      ].map(wing => {
                        const WingIcon = wing.icon
                        const isChecked = (wizardData.enabledTiers || ['school', 'college']).includes(wing.id)
                        return (
                          <label key={wing.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer hover:border-slate-300">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const current = wizardData.enabledTiers || ['school', 'college']
                                let updated
                                if (current.includes(wing.id)) {
                                  if (current.length > 1) updated = current.filter(t => t !== wing.id)
                                  else updated = current
                                } else {
                                  updated = [...current, wing.id]
                                }
                                setWizardData({ ...wizardData, enabledTiers: updated })
                              }}
                              className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                            />
                            <WingIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">{wing.label}</span>
                              <span className="text-[10px] text-slate-400 block">{wing.desc}</span>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beaconhouse Central High School"
                  value={wizardData.name}
                  onChange={(e) => handleWizardNameChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Unique Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHS-001"
                    value={wizardData.code}
                    onChange={(e) => setWizardData({ ...wizardData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Head / Principal</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Shahida Parveen"
                    value={wizardData.principal}
                    onChange={(e) => setWizardData({ ...wizardData, principal: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Examination Board</label>
                  <select
                    value={wizardData.affiliatedBoard}
                    onChange={(e) => setWizardData({ ...wizardData, affiliatedBoard: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {examinationBodies.length > 0 ? (
                      examinationBodies.map(ex => <option key={ex.id} value={ex.code || ex.name}>{ex.name}</option>)
                    ) : (
                      <>
                        <option value="BISE Lahore">BISE Lahore</option>
                        <option value="Federal Board (FBISE)">Federal Board (FBISE)</option>
                        <option value="Cambridge Assessment (CAIE)">Cambridge Assessment (CAIE)</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Regional Division</label>
                  <select
                    value={wizardData.divisionId}
                    onChange={(e) => setWizardData({ ...wizardData, divisionId: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {divisions.length > 0 ? (
                      divisions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                    ) : (
                      <option value="lhr">Lahore Division</option>
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campuses */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Primary Campus City *</label>
                  <input
                    type="text"
                    value={wizardData.city}
                    onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Province / State</label>
                  <input
                    type="text"
                    value={wizardData.province}
                    onChange={(e) => setWizardData({ ...wizardData, province: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Head Campus Physical Address *</label>
                <input
                  type="text"
                  placeholder="e.g. Gulberg III, Main Boulevard, Lahore"
                  value={wizardData.address}
                  onChange={(e) => setWizardData({ ...wizardData, address: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {/* Additional Campuses */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Additional Branch Campuses ({wizardData.campuses.length})</span>
                  <button
                    type="button"
                    onClick={() => {
                      const count = wizardData.campuses.length + 1
                      setWizardData({
                        ...wizardData,
                        campuses: [
                          ...wizardData.campuses,
                          { name: `Branch Campus #${count}`, city: wizardData.city, address: '' }
                        ]
                      })
                    }}
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Branch</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {wizardData.campuses.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="font-semibold text-slate-700 w-1/3 truncate">{c.name}</span>
                      <span className="text-slate-500 w-1/3 truncate">{c.city}</span>
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setWizardData({
                              ...wizardData,
                              campuses: wizardData.campuses.filter((_, idx) => idx !== i)
                            })
                          }}
                          className="text-rose-500 hover:text-rose-700 ml-auto p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Identity & Branding */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subdomain / URL Slug *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-xs text-slate-500 font-mono">
                    https://
                  </span>
                  <input
                    type="text"
                    placeholder="beacon-central"
                    value={wizardData.slug}
                    onChange={(e) => setWizardData({ ...wizardData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 focus:outline-none font-mono"
                  />
                  <span className="px-3 py-2 bg-slate-100 border border-l-0 border-slate-200 rounded-r-lg text-xs text-slate-500 font-mono">
                    .sms.edu
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={wizardData.primaryColor}
                    onChange={(e) => setWizardData({ ...wizardData, primaryColor: e.target.value })}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-slate-200 p-0.5"
                  />
                  <span className="font-mono text-xs text-slate-700 font-semibold">{wizardData.primaryColor}</span>
                  <div className="flex items-center gap-1.5 ml-auto">
                    {['#2563eb', '#7c3aed', '#059669', '#dc2626', '#0284c7'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setWizardData({ ...wizardData, primaryColor: c })}
                        className="w-6 h-6 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Email</label>
                  <input
                    type="email"
                    placeholder="info@campus.edu"
                    value={wizardData.email}
                    onChange={(e) => setWizardData({ ...wizardData, email: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Phone</label>
                  <input
                    type="tel"
                    placeholder="+92 42 35789012"
                    value={wizardData.phone}
                    onChange={(e) => setWizardData({ ...wizardData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Primary Administrator Account */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#f5eeff]/80 border border-purple-200 rounded-xl text-xs text-purple-800">
                <span className="font-bold">Initial Administrator Account:</span> This user will receive root administrative privileges to oversee student admissions, staff payroll, and daily campus routines for this institute.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Administrator Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Shahida Parveen (Principal)"
                  value={wizardData.adminName}
                  onChange={(e) => setWizardData({ ...wizardData, adminName: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Administrator Official Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.beacon@sms.edu"
                  value={wizardData.adminEmail}
                  onChange={(e) => setWizardData({ ...wizardData, adminEmail: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Initial Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={wizardData.adminPassword}
                  onChange={(e) => setWizardData({ ...wizardData, adminPassword: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>
          )}

          {/* Step 5: Subscription Plan & Quotas */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Select Subscription Plan</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setWizardData({
                        ...wizardData,
                        planTier: plan.name,
                        quotaStudents: plan.maxStudents,
                        quotaUsers: plan.maxUsers,
                        quotaCampuses: plan.maxCampuses,
                        quotaStorageMb: plan.storageMB
                      })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        wizardData.planTier === plan.name
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold block">{plan.name}</span>
                      <span className="text-[11px] text-indigo-700 font-semibold block mt-1">
                        PKR {plan.pricePKR.toLocaleString()}/mo
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        Up to {plan.maxStudents.toLocaleString()} students
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quota Summary Box */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block mb-2">Allocated Quota Limits</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Max Students</span>
                    <span className="font-bold text-slate-800">{wizardData.quotaStudents}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Max Users</span>
                    <span className="font-bold text-slate-800">{wizardData.quotaUsers}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Campuses</span>
                    <span className="font-bold text-slate-800">{wizardData.quotaCampuses}</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Cloud Storage</span>
                    <span className="font-bold text-slate-800">{wizardData.quotaStorageMb} MB</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handlePrevStep}
              disabled={wizardStep === 1}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteWizard}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
              >
                Complete Onboarding & Launch Campus
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* ---------------------------------------------------- */}
      {/* 2. SUSPENSION REASON MODAL */}
      {/* ---------------------------------------------------- */}
      {suspensionTarget && (
        <Modal
          isOpen={Boolean(suspensionTarget)}
          onClose={() => setSuspensionTarget(null)}
          title={`Suspend Institute: ${suspensionTarget.name}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Mandatory Suspension Protocol</p>
                <p className="mt-0.5">
                  Suspending this institute will revoke login access for all teachers, students, and campus administrators. You must state an official regulatory or financial reason.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                Official Suspension Reason *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Non-payment of platform SaaS licensing subscription for Q3 2026, or pending provincial education board inspection."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                className="w-full p-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSuspensionTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSuspension}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-all"
              >
                Confirm Suspension
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3.1 FULL CREDENTIALS & ACCOUNT MANAGEMENT MODAL */}
      {credentialsModal && (
        <Modal
          isOpen={Boolean(credentialsModal)}
          onClose={() => setCredentialsModal(null)}
          title={`Campus Admin Account & Login Credentials: ${credentialsModal.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveCredentials} className="space-y-4">
            <div className="p-3.5 bg-indigo-50/80 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-3">
              <KeyRound className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Institute Administrator Account</span>
                These credentials grant direct login access to the <strong>{credentialsModal.name}</strong> portal ({credentialsModal.planTier || 'School Plan'}).
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Administrator Full Name</label>
              <input
                type="text"
                required
                value={credentialsForm.adminName}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, adminName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Login Email / Username *</label>
              <input
                type="email"
                required
                value={credentialsForm.adminEmail}
                onChange={(e) => setCredentialsForm({ ...credentialsForm, adminEmail: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-600 uppercase">Login Password *</label>
                <button
                  type="button"
                  onClick={() => {
                    const randomPass = 'Pass@' + Math.floor(1000 + Math.random() * 9000)
                    setCredentialsForm({ ...credentialsForm, password: randomPass })
                  }}
                  className="text-[11px] text-indigo-600 hover:underline font-semibold"
                >
                  Generate Strong
                </button>
              </div>
              <div className="relative">
                <input
                  type={credentialsForm.showPassword ? 'text' : 'password'}
                  required
                  value={credentialsForm.password}
                  onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setCredentialsForm({ ...credentialsForm, showPassword: !credentialsForm.showPassword })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded bg-slate-100"
                >
                  {credentialsForm.showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Quick Copy Box */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-700 block">Ready to Send to Client</span>
                <span className="text-[10px] text-slate-400">Copy formatted text for WhatsApp or Email</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCredentials(credentialsModal, credentialsForm)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                  copiedState 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 shadow-2xs'
                }`}
              >
                {copiedState ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedState ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCredentialsModal(null)
                  handleImpersonate(credentialsModal)
                }}
                className="px-3 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                Direct Login as Admin
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCredentialsModal(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* 3.2 NEWLY CREATED CREDENTIALS SUCCESS DIALOG */}
      {newlyCreatedCreds && (
        <Modal
          isOpen={Boolean(newlyCreatedCreds)}
          onClose={() => setNewlyCreatedCreds(null)}
          title="Campus Successfully Created & Credentials Ready!"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-1">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-sm font-bold text-emerald-950 mt-1">{newlyCreatedCreds.name}</h3>
              <p className="text-xs text-emerald-800">
                Institute registered with <strong>{newlyCreatedCreds.planTier || 'School Plan'}</strong>. Initial administrator account is active.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Name:</span>
                <span className="font-semibold text-slate-800">{newlyCreatedCreds.adminName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Login Email:</span>
                <span className="font-mono font-bold text-purple-700 bg-[#f5eeff] px-2 py-0.5 rounded">{newlyCreatedCreds.adminEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="font-mono font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded">{newlyCreatedCreds.password}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Portal URL:</span>
                <span className="text-slate-600 font-mono text-[11px]">https://eims-app.vercel.app/</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyCredentials(newlyCreatedCreds, newlyCreatedCreds)}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Login Credentials to Send to Client</span>
            </button>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setNewlyCreatedCreds(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 3. PASSWORD RESET MODAL */}
      {/* ---------------------------------------------------- */}
      {passwordResetTarget && (
        <Modal
          isOpen={Boolean(passwordResetTarget)}
          onClose={() => setPasswordResetTarget(null)}
          title={`Reset Admin Password: ${passwordResetTarget.name}`}
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Enter a new secure password for the designated campus administrator account.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">New Password *</label>
              <input
                type="text"
                required
                placeholder="Minimum 6 characters"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPasswordResetTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
              >
                Reset Password
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 4. INSTITUTE DETAIL MODAL (6 TABS) */}
      {/* ---------------------------------------------------- */}
      {viewingDetails && (
        <Modal
          isOpen={Boolean(viewingDetails)}
          onClose={() => setViewingDetails(null)}
          title={`Institute Overview: ${viewingDetails.name}`}
        >
          <div className="space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-1 text-xs overflow-x-auto">
              {['overview', 'campuses', 'admins', 'modules', 'plan', 'activity'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setDetailsTab(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors ${
                    detailsTab === tab ? 'bg-[#f5eeff] text-purple-700 border border-purple-200' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab 1: Overview */}
            {detailsTab === 'overview' && (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                      {viewingDetails.code}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{viewingDetails.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{viewingDetails.address || viewingDetails.city}</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    {viewingDetails.lifecycleStatus || viewingDetails.status || 'Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Principal / Head</span>
                    <span className="font-semibold text-slate-800">{viewingDetails.principal || 'In-Charge Principal'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Board Affiliation</span>
                    <span className="font-semibold text-purple-700">{viewingDetails.affiliatedBoard || 'BISE Lahore'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Official Email</span>
                    <span className="font-semibold text-purple-600 truncate block">{viewingDetails.email || '—'}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Contact Phone</span>
                    <span className="font-semibold text-slate-800">{viewingDetails.phone || '—'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Campuses */}
            {detailsTab === 'campuses' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Campuses and branch locations operating under this institute:</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800">Main Campus</span>
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">HQ</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{viewingDetails.address || `${viewingDetails.city}, Pakistan`}</p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">{viewingDetails.code}-MAIN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Admins */}
            {detailsTab === 'admins' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Designated administrative accounts registered for this campus:</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {users.filter(u => u.instituteId === viewingDetails.id || u.institute === viewingDetails.name).length > 0 ? (
                    users.filter(u => u.instituteId === viewingDetails.id || u.institute === viewingDetails.name).map(adm => (
                      <div key={adm.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{adm.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{adm.email}</p>
                        </div>
                        <button
                          onClick={() => {
                            setPasswordResetTarget(viewingDetails)
                            setNewAdminPassword('')
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                        >
                          Reset Password
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      No admin user directly mapped yet. Initial admin created during onboarding wizard.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 4: Modules */}
            {detailsTab === 'modules' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Feature flags & modules enabled for this campus:</p>
                <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                  {PLATFORM_MODULES.map(m => (
                    <div key={m.key} className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{m.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 5: Plan */}
            {detailsTab === 'plan' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-600 uppercase">Current Subscription Tier</span>
                    <h4 className="text-sm font-bold text-indigo-950 mt-0.5">{viewingDetails.planTier || 'Enterprise Apex'}</h4>
                  </div>
                  <span className="font-bold text-indigo-700 bg-white px-3 py-1 rounded-lg shadow-2xs">Active Plan</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Max Enrolled Students</span>
                    <span className="font-bold text-slate-800 text-sm">{viewingDetails.quotaStudents || 1500}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Max User Accounts</span>
                    <span className="font-bold text-slate-800 text-sm">{viewingDetails.quotaUsers || 50}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 6: Activity */}
            {detailsTab === 'activity' && (
              <div className="space-y-2">
                <p className="text-xs text-slate-500">Audit trail of actions and lifecycle events for this institute:</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {auditLogs.filter(l => (l.action && l.action.includes(viewingDetails.name)) || (l.action && l.action.includes(viewingDetails.id))).length > 0 ? (
                    auditLogs.filter(l => (l.action && l.action.includes(viewingDetails.name)) || (l.action && l.action.includes(viewingDetails.id))).map((lg, i) => (
                      <div key={i} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                        <p className="font-semibold text-slate-800">{lg.action}</p>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{lg.timestamp} • By {lg.user}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                      No institute-specific audit logs logged yet.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
              >
                Close Profile
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. EDIT BASIC MODAL */}
      {/* ---------------------------------------------------- */}
      {editingInstitute && (
        <Modal
          isOpen={Boolean(editingInstitute)}
          onClose={() => setEditingInstitute(null)}
          title={`Edit Profile: ${editingInstitute.name}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute Official Name *</label>
              <input
                type="text"
                required
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 font-mono uppercase focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Type</label>
                <select
                  value={editFormData.type}
                  onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                >
                  <option value="School">School</option>
                  <option value="College">College</option>
                  <option value="University">University</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Principal / Head</label>
                <input
                  type="text"
                  value={editFormData.principal}
                  onChange={(e) => setEditFormData({ ...editFormData, principal: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City</label>
                <input
                  type="text"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingInstitute(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 6. DISASTER RECOVERY MODAL */}
      {/* ---------------------------------------------------- */}
      <Modal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        title="Campus Database Disaster Recovery & Snapshots"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Export a full JSON snapshot of all campuses, or verify and restore a verified disaster recovery package.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSnapshot}
              className="flex-1 py-2.5 px-4 bg-[#f5eeff] text-purple-700 hover:bg-[#ede0fe] rounded-xl text-xs font-bold border border-purple-200 flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download Snapshot</span>
            </button>
            <label className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all">
              <Upload className="w-4 h-4" />
              <span>Verify Backup File</span>
              <input type="file" accept=".json" onChange={handleBackupFileUpload} className="hidden" />
            </label>
          </div>

          {backupInspectionReport && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 space-y-2">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Backup Schema Verified & Ready for Restore</span>
              </p>
              <button
                onClick={handleApplyRestore}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all"
              >
                Apply Restore & Overwrite Records
              </button>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsBackupModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InstitutesView
