import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  Settings,
  Edit3,
LayoutGrid,
  List,
  Building2, 
  Plus, 
  Search, 
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
  ChevronDown,
  ArrowLeft,
  ArrowRight,
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
  ShieldAlert,
  Palette,
  Globe,
  Sliders,
  Filter,
  Calendar,
  X,
  Lock,
  GraduationCap,
  Copy
} from 'lucide-react'
import { 
  GEOGRAPHIC_REGISTRY,
  getAvailableCountries,
  getCountryDivisions,
  getCountryBoards,
  getCountryProvinces,
  getProvinceCities,
  getProvinceCapital,
  getPhonePlaceholder
} from '../../../data/geographicData'
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

  // Tier cards visibility filter for Wizard Step 1 (Checkboxes to tick/untick cards to display on screen)
  const [visibleTierCards, setVisibleTierCards] = useState(['School', 'College', 'University', 'Custom'])
  const [showTierFilterPopover, setShowTierFilterPopover] = useState(false)
  const tierFilterPopoverRef = useRef(null)

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tierFilterPopoverRef.current && !tierFilterPopoverRef.current.contains(event.target)) {
        setShowTierFilterPopover(false)
      }
    }
    if (showTierFilterPopover) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTierFilterPopover])

  // Toggle visibility of individual tier cards
  const toggleTierCardVisibility = (tierId) => {
    setVisibleTierCards(prev => {
      const next = prev.includes(tierId)
        ? prev.filter(t => t !== tierId)
        : [...prev, tierId]
      
      // If currently selected tier is now hidden, select the first visible one
      if (!next.includes(wizardData.type) && next.length > 0) {
        handleTierSelection(next[0])
      }
      return next
    })
  }
  const [editingInstitute, setEditingInstitute] = useState(null)
  const [viewingDetails, setViewingDetails] = useState(null)
  const [detailsTab, setDetailsTab] = useState('overview') // overview, campuses, admins, modules, plan, activity

  // Track last viewed institute ID to prevent resetting tab on module toggle updates
  const lastViewedInstituteId = useRef(null)
  useEffect(() => {
    if (viewingDetails?.id && viewingDetails.id !== lastViewedInstituteId.current) {
      lastViewedInstituteId.current = viewingDetails.id
      setDetailsTab('overview')
      setModuleSearchTerm('')
    } else if (!viewingDetails) {
      lastViewedInstituteId.current = null
      setModuleSearchTerm('')
    }
  }, [viewingDetails?.id])

  const handleDetailTabChange = (targetTab) => {
    setDetailsTab(targetTab)
  }

  // Modules Tab State in Institute Overview Modal
  const [moduleSearchTerm, setModuleSearchTerm] = useState('')
  const [isAddCustomModuleOpen, setIsAddCustomModuleOpen] = useState(false)
  const [customModuleForm, setCustomModuleForm] = useState({
    name: '',
    category: 'General Operations',
    description: ''
  })

  // Helper to determine if a module is currently active for viewingDetails
  const isModuleActiveForCampus = (moduleKey) => {
    if (!viewingDetails) return true
    if (Array.isArray(viewingDetails.enabledModules)) {
      return viewingDetails.enabledModules.includes(moduleKey)
    }
    // Default all standard platform modules are active
    return true
  }

  // Combined list of standard modules + institute-specific custom modules
  const allModulesForViewing = useMemo(() => {
    if (!viewingDetails) return PLATFORM_MODULES
    const standard = PLATFORM_MODULES.map(m => ({ ...m, isCustom: false }))
    const custom = (viewingDetails.customModules || []).map(m => ({ ...m, isCustom: true }))
    return [...standard, ...custom]
  }, [viewingDetails])

  const filteredModulesForViewing = useMemo(() => {
    const term = moduleSearchTerm.toLowerCase().trim()
    if (!term) return allModulesForViewing
    return allModulesForViewing.filter(m => 
      m.name.toLowerCase().includes(term) ||
      (m.category && m.category.toLowerCase().includes(term)) ||
      (m.description && m.description.toLowerCase().includes(term))
    )
  }, [allModulesForViewing, moduleSearchTerm])

  const activeModulesCount = useMemo(() => {
    return allModulesForViewing.filter(m => isModuleActiveForCampus(m.key)).length
  }, [allModulesForViewing, viewingDetails?.enabledModules])

  // Toggle single module (enable/add or disable/remove)
  const handleToggleModuleForCampus = async (moduleKey) => {
    if (!viewingDetails) return
    const isCurrentlyActive = isModuleActiveForCampus(moduleKey)
    const nextState = !isCurrentlyActive

    const standardKeys = PLATFORM_MODULES.map(m => m.key)
    const customKeys = (viewingDetails.customModules || []).map(m => m.key)
    const allAvailableKeys = [...standardKeys, ...customKeys]

    let updatedEnabledList
    if (Array.isArray(viewingDetails.enabledModules)) {
      if (nextState) {
        updatedEnabledList = [...viewingDetails.enabledModules, moduleKey]
      } else {
        updatedEnabledList = viewingDetails.enabledModules.filter(k => k !== moduleKey)
      }
    } else {
      if (nextState) {
        updatedEnabledList = allAvailableKeys
      } else {
        updatedEnabledList = allAvailableKeys.filter(k => k !== moduleKey)
      }
    }

    const updatedInstitute = {
      ...viewingDetails,
      enabledModules: updatedEnabledList
    }
    setViewingDetails(updatedInstitute)

    try {
      await PlatformService.toggleInstituteModule(viewingDetails.id, moduleKey, nextState)
      if (updateItem) {
        await updateItem('institutes', viewingDetails.id, { enabledModules: updatedEnabledList })
      }
      if (refreshData) {
        refreshData()
      }
      const moduleName = PLATFORM_MODULES.find(m => m.key === moduleKey)?.name ||
        (viewingDetails.customModules || []).find(m => m.key === moduleKey)?.name || moduleKey
      toast.success(`Module "${moduleName}" ${nextState ? 'ENABLED & ADDED' : 'DISABLED & REMOVED'} for "${viewingDetails.name}"!`)
    } catch (err) {
      console.error('Failed to toggle module:', err)
      toast.error('Failed to update module state')
    }
  }

  // Quick Action: Enable All or Reset to Core
  const handleQuickToggleAllModules = async (enableAll = true) => {
    if (!viewingDetails) return
    const standardKeys = PLATFORM_MODULES.map(m => m.key)
    const customKeys = (viewingDetails.customModules || []).map(m => m.key)
    const allAvailableKeys = [...standardKeys, ...customKeys]

    const updatedEnabledList = enableAll ? allAvailableKeys : ['students', 'fees', 'exams'] // core academic essentials

    const updatedInstitute = {
      ...viewingDetails,
      enabledModules: updatedEnabledList
    }
    setViewingDetails(updatedInstitute)

    try {
      if (updateItem) {
        await updateItem('institutes', viewingDetails.id, { enabledModules: updatedEnabledList })
      }
      if (refreshData) {
        refreshData()
      }
      toast.success(enableAll ? 'All feature modules ENABLED for this campus!' : 'Optional modules REMOVED/DISABLED (Core academic intact)!')
    } catch (err) {
      toast.error('Failed to update modules')
    }
  }

  // Add a new custom module
  const handleCreateCustomModule = async (e) => {
    e.preventDefault()
    if (!customModuleForm.name.trim() || !viewingDetails) return

    const sanitizedKey = 'custom_' + customModuleForm.name.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now()
    const newModuleObj = {
      key: sanitizedKey,
      name: customModuleForm.name.trim(),
      category: customModuleForm.category || 'General Operations',
      description: customModuleForm.description?.trim() || 'Custom administrative feature module',
      enabled: true,
      isCustom: true
    }

    const updatedCustom = [...(viewingDetails.customModules || []), newModuleObj]
    const existingEnabled = Array.isArray(viewingDetails.enabledModules)
      ? viewingDetails.enabledModules
      : PLATFORM_MODULES.map(m => m.key)
    const updatedEnabled = [...existingEnabled, sanitizedKey]

    const updatedInstitute = {
      ...viewingDetails,
      customModules: updatedCustom,
      enabledModules: updatedEnabled
    }
    setViewingDetails(updatedInstitute)
    setIsAddCustomModuleOpen(false)
    setCustomModuleForm({ name: '', category: 'General Operations', description: '' })

    try {
      if (updateItem) {
        await updateItem('institutes', viewingDetails.id, {
          customModules: updatedCustom,
          enabledModules: updatedEnabled
        })
      }
      if (refreshData) {
        refreshData()
      }
      toast.success(`Custom module "${newModuleObj.name}" created and enabled for "${viewingDetails.name}"!`)
    } catch (err) {
      toast.error('Failed to create custom module')
    }
  }

  // Permanently delete a custom module
  const handleDeleteCustomModule = async (moduleKey, moduleName) => {
    if (!viewingDetails) return
    const updatedCustom = (viewingDetails.customModules || []).filter(m => m.key !== moduleKey)
    const updatedEnabled = (viewingDetails.enabledModules || []).filter(k => k !== moduleKey)

    const updatedInstitute = {
      ...viewingDetails,
      customModules: updatedCustom,
      enabledModules: updatedEnabled
    }
    setViewingDetails(updatedInstitute)

    try {
      if (updateItem) {
        await updateItem('institutes', viewingDetails.id, {
          customModules: updatedCustom,
          enabledModules: updatedEnabled
        })
      }
      if (refreshData) {
        refreshData()
      }
      toast.success(`Custom module "${moduleName}" permanently removed!`)
    } catch (err) {
      toast.error('Failed to delete custom module')
    }
  }

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
    country: 'Pakistan',
    affiliatedBoard: 'BISE Lahore (Board of Intermediate & Secondary Education)',
    divisionId: 'div-lhr',
    districtId: '',
    principal: '',
    // Step 2: Campuses
    city: 'Lahore',
    province: 'Punjab',
    customCity: '',
    address: '',
    campuses: [
      { name: 'Main Campus', city: 'Lahore', address: '' }
    ],
    // Step 3: Branding & Identity
    slug: '',
    primaryColor: '#2563eb',
    logoUrl: '',
    email: '',
    phoneDialCode: '+92',
    phoneNumber: '',
    phone: '',
    // Step 4: Administrator Account
    adminName: '',
    adminEmail: '',
    adminPassword: 'Password123!',
    adminPhone: '',
    // Step 5: Subscription Plan
    planTier: 'School Plan',
    quotaStudents: 1500,
    quotaUsers: 50,
    quotaCampuses: 2,
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

  // Tier to Plan Mapping for Automatic Detection & Quota Initialization
  const tierPlanMapping = {
    School: { planName: 'School Plan', maxStudents: 1500, maxUsers: 50, maxCampuses: 2, storageMB: 2048, prefix: 'SCH', defaultTiers: ['school'] },
    College: { planName: 'College Plan', maxStudents: 3000, maxUsers: 100, maxCampuses: 3, storageMB: 5120, prefix: 'COL', defaultTiers: ['college'] },
    University: { planName: 'University Plan', maxStudents: 10000, maxUsers: 250, maxCampuses: 5, storageMB: 10240, prefix: 'UNI', defaultTiers: ['undergraduate'] },
    Custom: { planName: 'Custom Hybrid Plan', maxStudents: 25000, maxUsers: 150, maxCampuses: 4, storageMB: 8192, prefix: 'HYB', defaultTiers: ['school', 'college'] }
  }

  const [wizardData, setWizardData] = useState(initialWizardState)
  const [wizardErrors, setWizardErrors] = useState({})
  const [isCustomCityMode, setIsCustomCityMode] = useState(false)

  // Geographic calculations for wizardData
  const currentCountryConfig = useMemo(() => {
    return GEOGRAPHIC_REGISTRY[wizardData.country] || GEOGRAPHIC_REGISTRY['Pakistan']
  }, [wizardData.country])

  const availableProvinces = useMemo(() => {
    return Object.keys(currentCountryConfig.provinces || {})
  }, [currentCountryConfig])

  const availableCities = useMemo(() => {
    const prov = wizardData.province || availableProvinces[0]
    return currentCountryConfig.provinces?.[prov]?.cities || []
  }, [currentCountryConfig, wizardData.province, availableProvinces])

  const currentCapitalCity = useMemo(() => {
    const prov = wizardData.province || availableProvinces[0]
    return currentCountryConfig.provinces?.[prov]?.capitalCity || availableCities[0] || 'Lahore'
  }, [currentCountryConfig, wizardData.province, availableCities, availableProvinces])

  // Country selection handler - Cascades to boards, divisions, province and city
  const handleWizardCountryChange = (selectedCountry) => {
    const countryConfig = GEOGRAPHIC_REGISTRY[selectedCountry] || GEOGRAPHIC_REGISTRY['Pakistan']
    const firstDivision = countryConfig.divisions[0]?.id || ''
    const firstBoard = countryConfig.boards[0]?.name || countryConfig.boards[0]?.code || ''
    const availableProvincesList = Object.keys(countryConfig.provinces || {})
    const firstProvince = availableProvincesList[0] || 'Punjab'
    const provinceConfig = countryConfig.provinces?.[firstProvince]
    const firstCity = provinceConfig?.capitalCity || provinceConfig?.cities?.[0] || 'Lahore'
    const newDialCode = countryConfig.phoneCode || '+92'

    setIsCustomCityMode(false)
    setWizardData(prev => ({
      ...prev,
      country: selectedCountry,
      divisionId: firstDivision,
      affiliatedBoard: firstBoard,
      province: firstProvince,
      city: firstCity,
      customCity: '',
      phoneDialCode: newDialCode,
      phone: prev.phoneNumber ? `${newDialCode} ${prev.phoneNumber}` : '',
      campuses: prev.campuses.map((c, i) => i === 0 ? { ...c, city: firstCity } : c)
    }))

    if (wizardErrors.country) setWizardErrors(prev => ({ ...prev, country: null }))
  }

  // Phone country calling code change handler
  const handlePhoneDialCodeChange = (newDialCode) => {
    setWizardData(prev => ({
      ...prev,
      phoneDialCode: newDialCode,
      phone: prev.phoneNumber ? `${newDialCode} ${prev.phoneNumber}` : ''
    }))
    if (wizardErrors.phone) setWizardErrors(prev => ({ ...prev, phone: null }))
  }

  // Local phone number input handler (Max 10 digits, or 11 digits if starting with 0)
  const handlePhoneNumberChange = (val) => {
    const digits = val.replace(/\D/g, '')
    const maxDigits = digits.startsWith('0') ? 11 : 10
    const cleaned = digits.slice(0, maxDigits)

    const dialCode = wizardData.phoneDialCode || '+92'
    const fullPhone = cleaned ? `${dialCode} ${cleaned}` : ''

    setWizardData(prev => ({
      ...prev,
      phoneNumber: cleaned,
      phone: fullPhone
    }))
    if (wizardErrors.phone) setWizardErrors(prev => ({ ...prev, phone: null }))
  }

  // Province selection handler in Step 2 - Auto-detects primary/capital city and updates city dropdown
  const handleWizardProvinceChange = (selectedProvince) => {
    const autoDetectedCity = getProvinceCapital(wizardData.country || 'Pakistan', selectedProvince)
    setIsCustomCityMode(false)
    setWizardData(prev => ({
      ...prev,
      province: selectedProvince,
      city: autoDetectedCity,
      customCity: '',
      campuses: prev.campuses.map((c, i) => i === 0 ? { ...c, city: autoDetectedCity } : c)
    }))

    if (wizardErrors.province) setWizardErrors(prev => ({ ...prev, province: null }))
    if (wizardErrors.city) setWizardErrors(prev => ({ ...prev, city: null }))
  }

  // City selection handler in Step 2
  const handleWizardCityChange = (selectedCity) => {
    setWizardData(prev => ({
      ...prev,
      city: selectedCity,
      customCity: '',
      campuses: prev.campuses.map((c, i) => i === 0 ? { ...c, city: selectedCity } : c)
    }))
    if (wizardErrors.city) setWizardErrors(prev => ({ ...prev, city: null }))
  }

  // Custom city text input handler
  const handleCustomCityChange = (cityName) => {
    setWizardData(prev => ({
      ...prev,
      city: cityName,
      customCity: cityName,
      campuses: prev.campuses.map((c, i) => i === 0 ? { ...c, city: cityName } : c)
    }))
    if (wizardErrors.city) setWizardErrors(prev => ({ ...prev, city: null }))
  }

  // Tier selection handler - auto-syncs plan, code prefix and quota limits
  const handleTierSelection = (selectedTierId) => {
    const config = tierPlanMapping[selectedTierId] || tierPlanMapping.School
    setWizardData(prev => ({
      ...prev,
      type: selectedTierId,
      planType: selectedTierId.toUpperCase(),
      planTier: config.planName,
      quotaStudents: config.maxStudents || 1500,
      quotaUsers: config.maxUsers,
      quotaCampuses: config.maxCampuses,
      quotaStorageMb: config.storageMB,
      enabledTiers: config.defaultTiers,
      code: prev.code && !prev.code.startsWith('SCH-') && !prev.code.startsWith('COL-') && !prev.code.startsWith('UNI-') && !prev.code.startsWith('HYB-')
        ? prev.code
        : `${config.prefix}-${Math.floor(100 + Math.random() * 900)}`
    }))
    if (wizardErrors.enabledTiers) setWizardErrors(prev => ({ ...prev, enabledTiers: null }))
  }

  // Auto-generate code and slug when name changes in Wizard
  const handleWizardNameChange = (name) => {
    const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 30)
    const codePrefix = wizardData.type === 'University' ? 'UNI' : wizardData.type === 'College' ? 'COL' : wizardData.type === 'Custom' ? 'HYB' : 'SCH'
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
    const defaultCountry = 'Pakistan'
    const countryConfig = GEOGRAPHIC_REGISTRY[defaultCountry]
    const defaultProvince = Object.keys(countryConfig.provinces)[0]
    const defaultCity = countryConfig.provinces[defaultProvince].capitalCity
    const defaultDialCode = countryConfig.phoneCode || '+92'
    setIsCustomCityMode(false)
    setWizardData({
      ...initialWizardState,
      country: defaultCountry,
      province: defaultProvince,
      city: defaultCity,
      customCity: '',
      phoneDialCode: defaultDialCode,
      phoneNumber: '',
      phone: '',
      planTier: 'School Plan',
      quotaStudents: 1500,
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      divisionId: countryConfig.divisions[0]?.id || 'div-lhr',
      districtId: '',
      affiliatedBoard: countryConfig.boards[0]?.name || countryConfig.boards[0]?.code || 'BISE Lahore',
      campuses: [
        { name: 'Main Campus', city: defaultCity, address: '' }
      ]
    })
    setWizardErrors({})
    setWizardStep(1)
    setIsWizardOpen(true)
  }

  // Auto-launch Onboarding Wizard if redirected from Dashboard shortcut
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldOpenWizard = sessionStorage.getItem('open_campus_wizard') === 'true'
      if (shouldOpenWizard) {
        sessionStorage.removeItem('open_campus_wizard')
        openOnboardingWizard()
      }
    }
  }, [])

  const handleNextStep = () => {
    const errors = {}

    if (wizardStep === 1) {
      if (!wizardData.country?.trim()) {
        errors.country = 'Country / Jurisdiction is required'
      }
      if (!wizardData.name?.trim()) {
        errors.name = 'Official Institute Name is required'
      }
      if (!wizardData.code?.trim()) {
        errors.code = 'Unique Institute Code is required'
      } else {
        const isDuplicate = institutes.some(i => i.code?.toLowerCase() === wizardData.code.trim().toLowerCase())
        if (isDuplicate) {
          errors.code = `Institute Code "${wizardData.code}" is already in use!`
        }
      }
      if (!wizardData.principal?.trim()) {
        errors.principal = 'Head / Principal Name is required'
      }
      if (wizardData.type === 'Custom' && (!wizardData.enabledTiers || wizardData.enabledTiers.length === 0)) {
        errors.enabledTiers = 'Please select at least one educational wing'
      }

      if (Object.keys(errors).length > 0) {
        setWizardErrors(errors)
        const firstError = Object.values(errors)[0]
        toast.error(firstError)
        return
      }
    } else if (wizardStep === 2) {
      if (!wizardData.province?.trim()) {
        errors.province = 'Province / State is required'
      }
      if (!wizardData.city?.trim()) {
        errors.city = 'Primary Campus City is required'
      }
      if (!wizardData.address?.trim()) {
        errors.address = 'Head Campus Physical Address is required'
      }

      if (Object.keys(errors).length > 0) {
        setWizardErrors(errors)
        const firstError = Object.values(errors)[0]
        toast.error(firstError)
        return
      }
    } else if (wizardStep === 3) {
      // Step 3: Contact Details - Official Phone is strictly required!
      const digitsOnly = (wizardData.phoneNumber || '').replace(/\D/g, '')
      if (!digitsOnly) {
        errors.phone = 'Official Phone Number is required'
      } else if (digitsOnly.startsWith('0')) {
        if (digitsOnly.length !== 11) {
          errors.phone = 'Phone number with leading 0 must be 11 digits (e.g. 03006543298)'
        }
      } else {
        if (digitsOnly.length !== 10) {
          errors.phone = 'Phone number must be 10 digits (e.g. 3006543298)'
        }
      }

      if (Object.keys(errors).length > 0) {
        setWizardErrors(errors)
        const firstError = Object.values(errors)[0]
        toast.error(firstError)
        return
      }
    } else if (wizardStep === 4) {
      if (!wizardData.adminName?.trim()) {
        errors.adminName = 'Administrator Full Name is required'
      }
      if (!wizardData.adminEmail?.trim()) {
        errors.adminEmail = 'Administrator Official Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wizardData.adminEmail.trim())) {
        errors.adminEmail = 'Please provide a valid Administrator Email address'
      }
      if (!wizardData.adminPassword?.trim()) {
        errors.adminPassword = 'Initial Temporary Password is required'
      } else if (wizardData.adminPassword.length < 6) {
        errors.adminPassword = 'Password must be at least 6 characters'
      }

      if (Object.keys(errors).length > 0) {
        setWizardErrors(errors)
        const firstError = Object.values(errors)[0]
        toast.error(firstError)
        return
      }
    }

    setWizardErrors({})
    setWizardStep(prev => Math.min(prev + 1, 5))
  }

  const handlePrevStep = () => {
    setWizardErrors({})
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
  // Edit Institute - Comprehensive Full Profile Suite
  // ----------------------------------------------------
  const [editFormData, setEditFormData] = useState({
    name: '',
    code: '',
    type: 'School',
    principal: '',
    country: 'Pakistan',
    affiliatedBoard: 'BISE Lahore',
    divisionId: 'div-lhr',
    province: 'Punjab',
    city: 'Lahore',
    customCity: '',
    address: '',
    phoneDialCode: '+92',
    phoneNumber: '',
    phone: '',
    email: '',
    planTier: 'School Plan',
    quotaStudents: 1500,
    quotaUsers: 50,
    quotaCampuses: 2,
    quotaStorageMb: 2048,
    lifecycleStatus: 'Active'
  })
  const [editTab, setEditTab] = useState('profile')
  const [isEditCustomCity, setIsEditCustomCity] = useState(false)

  // Geographic calculations for Edit Modal
  const editCountryConfig = useMemo(() => {
    return GEOGRAPHIC_REGISTRY[editFormData.country] || GEOGRAPHIC_REGISTRY['Pakistan']
  }, [editFormData.country])

  const editProvinces = useMemo(() => {
    return Object.keys(editCountryConfig.provinces || {})
  }, [editCountryConfig])

  const editCities = useMemo(() => {
    const prov = editFormData.province || editProvinces[0]
    return editCountryConfig.provinces?.[prov]?.cities || []
  }, [editCountryConfig, editFormData.province, editProvinces])

  const openEditModal = (inst) => {
    setEditingInstitute(inst)
    const country = inst.country || 'Pakistan'
    const countryConfig = GEOGRAPHIC_REGISTRY[country] || GEOGRAPHIC_REGISTRY['Pakistan']
    const dialCode = countryConfig.phoneCode || '+92'
    
    // Parse phone into dial code and local number
    let localPhone = inst.phone || ''
    if (localPhone.startsWith(dialCode)) {
      localPhone = localPhone.replace(dialCode, '').trim()
    } else {
      const matched = getAvailableCountries().find(c => localPhone.startsWith(c.phoneCode))
      if (matched) {
        localPhone = localPhone.replace(matched.phoneCode, '').trim()
      }
    }

    const province = inst.province || Object.keys(countryConfig.provinces || {})[0] || 'Punjab'
    const city = inst.city || countryConfig.provinces?.[province]?.capitalCity || 'Lahore'
    const availableCitiesList = countryConfig.provinces?.[province]?.cities || []
    const isCustomCity = city && !availableCitiesList.includes(city)

    setEditFormData({
      name: inst.name || '',
      code: inst.code || '',
      type: inst.type || 'School',
      principal: inst.principal || '',
      country: country,
      affiliatedBoard: inst.affiliatedBoard || countryConfig.boards[0]?.name || 'BISE Lahore',
      divisionId: inst.divisionId || countryConfig.divisions[0]?.id || 'div-lhr',
      province: province,
      city: city,
      customCity: isCustomCity ? city : '',
      address: inst.address || '',
      phoneDialCode: dialCode,
      phoneNumber: localPhone,
      phone: inst.phone || '',
      email: inst.email || '',
      planTier: inst.planTier || tierPlanMapping[inst.type || 'School']?.planName || 'School Plan',
      quotaStudents: inst.quotaStudents || 1500,
      quotaUsers: inst.quotaUsers || 50,
      quotaCampuses: inst.quotaCampuses || 2,
      quotaStorageMb: inst.quotaStorageMb || 2048,
      lifecycleStatus: inst.lifecycleStatus || inst.status || 'Active',
      enabledModules: Array.isArray(inst.enabledModules) ? inst.enabledModules : PLATFORM_MODULES.map(m => m.key),
      customModules: inst.customModules || []
    })
    setIsEditCustomCity(Boolean(isCustomCity))
    setEditTab('profile')
  }

  const handleEditCountryChange = (selectedCountry) => {
    const countryConfig = GEOGRAPHIC_REGISTRY[selectedCountry] || GEOGRAPHIC_REGISTRY['Pakistan']
    const firstDivision = countryConfig.divisions[0]?.id || ''
    const firstBoard = countryConfig.boards[0]?.name || countryConfig.boards[0]?.code || ''
    const availableProvincesList = Object.keys(countryConfig.provinces || {})
    const firstProvince = availableProvincesList[0] || 'Punjab'
    const provinceConfig = countryConfig.provinces?.[firstProvince]
    const firstCity = provinceConfig?.capitalCity || provinceConfig?.cities?.[0] || 'Lahore'
    const newDialCode = countryConfig.phoneCode || '+92'

    setIsEditCustomCity(false)
    setEditFormData(prev => ({
      ...prev,
      country: selectedCountry,
      divisionId: firstDivision,
      affiliatedBoard: firstBoard,
      province: firstProvince,
      city: firstCity,
      customCity: '',
      phoneDialCode: newDialCode,
      phone: prev.phoneNumber ? `${newDialCode} ${prev.phoneNumber}` : ''
    }))
  }

  const handleEditProvinceChange = (selectedProvince) => {
    const autoDetectedCity = getProvinceCapital(editFormData.country || 'Pakistan', selectedProvince)
    setIsEditCustomCity(false)
    setEditFormData(prev => ({
      ...prev,
      province: selectedProvince,
      city: autoDetectedCity,
      customCity: ''
    }))
  }

  const handleEditCityChange = (selectedCity) => {
    setEditFormData(prev => ({
      ...prev,
      city: selectedCity,
      customCity: ''
    }))
  }

  const handleEditCustomCityChange = (cityName) => {
    setEditFormData(prev => ({
      ...prev,
      city: cityName,
      customCity: cityName
    }))
  }

  const handleEditPhoneChange = (val) => {
    const digits = val.replace(/\D/g, '')
    const maxDigits = digits.startsWith('0') ? 11 : 10
    const cleaned = digits.slice(0, maxDigits)

    const dialCode = editFormData.phoneDialCode || '+92'
    const fullPhone = cleaned ? `${dialCode} ${cleaned}` : ''

    setEditFormData(prev => ({
      ...prev,
      phoneNumber: cleaned,
      phone: fullPhone
    }))
  }

  const handleEditTierChange = (selectedTier) => {
    const config = tierPlanMapping[selectedTier] || tierPlanMapping.School
    setEditFormData(prev => ({
      ...prev,
      type: selectedTier,
      planTier: config.planName
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editFormData.name?.trim()) {
      toast.error('Institute Official Name is required.')
      return
    }
    if (!editFormData.code?.trim()) {
      toast.error('Institute Code is required.')
      return
    }
    if (!editFormData.principal?.trim()) {
      toast.error('Head / Principal Name is required.')
      return
    }

    const fullPhone = editFormData.phoneNumber?.trim()
      ? `${editFormData.phoneDialCode || '+92'} ${editFormData.phoneNumber.trim()}`
      : editFormData.phone || ''

    const payload = {
      ...editingInstitute,
      ...editFormData,
      name: editFormData.name.trim(),
      code: editFormData.code.trim().toUpperCase(),
      phone: fullPhone,
      quotaStudents: Number(editFormData.quotaStudents) || 1500,
      quotaUsers: Number(editFormData.quotaUsers) || 50,
      quotaCampuses: Number(editFormData.quotaCampuses) || 2,
      quotaStorageMb: Number(editFormData.quotaStorageMb) || 2048,
      status: editFormData.lifecycleStatus || 'Active',
      lifecycleStatus: editFormData.lifecycleStatus || 'Active'
    }

    await updateItem('institutes', editingInstitute.id, payload)
    toast.success(`Institute "${editFormData.name}" updated successfully.`)
    setEditingInstitute(null)
  }

  const handleEditNext = (e) => {
    if (e) e.preventDefault()
    if (editTab === 'profile') {
      if (!editFormData.name?.trim()) {
        toast.error('Institute Official Name is required.')
        return
      }
      if (!editFormData.code?.trim()) {
        toast.error('Institute Code is required.')
        return
      }
      if (!editFormData.principal?.trim()) {
        toast.error('Head / Principal Name is required.')
        return
      }
    }
    const tabSequence = ['profile', 'location', 'contact', 'plan']
    const idx = tabSequence.indexOf(editTab)
    if (idx < tabSequence.length - 1) {
      setEditTab(tabSequence[idx + 1])
    }
  }

  const handleEditPrev = () => {
    const tabSequence = ['profile', 'location', 'contact', 'plan']
    const idx = tabSequence.indexOf(editTab)
    if (idx > 0) {
      setEditTab(tabSequence[idx - 1])
    }
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
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/80 shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            title="Export institutes to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openOnboardingWizard}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
            title="Launch Campus Onboarding Wizard"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
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
                    {/* Primary Row: View Details */}
                    <div>
                      <button
                        onClick={() => {
                          setViewingDetails(inst)
                          setDetailsTab('overview')
                        }}
                        className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 hover:text-purple-800 text-xs font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <Eye className="w-4 h-4 stroke-[2.2]" />
                        <span>View Details</span>
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

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(inst)}
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                          title="Campus Settings & Edit Profile"
                        >
                          <Settings className="w-3 h-3 text-purple-600" />
                          <span>Settings</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCredentialsModal(inst)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-white transition-colors cursor-pointer"
                          title="View / Set Admin Login Credentials"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(inst.id, inst.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors cursor-pointer"
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
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(inst)}
                                className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                                title="Campus Settings & Edit Profile"
                              >
                                <Settings className="w-3.5 h-3.5 text-purple-600" />
                                <span>Settings</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setViewingDetails(inst)
                                  setDetailsTab('overview')
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] text-purple-700 hover:text-purple-800 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View Details</span>
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs overflow-x-auto gap-2">
            <span className={`font-bold shrink-0 ${wizardStep === 1 ? 'text-purple-600' : 'text-slate-400'}`}>1. Type & Profile</span>
            <span className={`font-bold shrink-0 ${wizardStep === 2 ? 'text-purple-600' : 'text-slate-400'}`}>2. Campuses</span>
            <span className={`font-bold shrink-0 ${wizardStep === 3 ? 'text-purple-600' : 'text-slate-400'}`}>3. Contact Details</span>
            <span className={`font-bold shrink-0 ${wizardStep === 4 ? 'text-purple-600' : 'text-slate-400'}`}>4. Administrator</span>
            <span className={`font-bold shrink-0 ${wizardStep === 5 ? 'text-purple-600' : 'text-slate-400'}`}>5. Plan & Quotas</span>
          </div>

          {/* Step 1: Type & Profile */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>Educational Tier / Institute Plan Type</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  
                  {/* Multi-Checkbox Filter Popover for Tier Cards (Tick to display on screen, untick to hide) */}
                  <div className="relative shrink-0" ref={tierFilterPopoverRef}>
                    <button
                      type="button"
                      onClick={() => setShowTierFilterPopover(!showTierFilterPopover)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer shadow-2xs ${
                        showTierFilterPopover
                          ? 'bg-purple-50 border-purple-400 text-purple-700 ring-2 ring-purple-500/20'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                      title="Filter which plan cards to display on screen"
                    >
                      <Filter className="w-3.5 h-3.5 text-purple-600" />
                      <span>Filter Cards</span>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full">
                        {visibleTierCards.length}/4
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showTierFilterPopover ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Floating Popover with Checkboxes */}
                    {showTierFilterPopover && (
                      <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-purple-100 z-50 p-2.5 space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 px-1">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Show / Hide Cards
                          </span>
                          <div className="flex items-center gap-1.5 text-[10px]">
                            <button
                              type="button"
                              onClick={() => setVisibleTierCards(['School', 'College', 'University', 'Custom'])}
                              className="text-purple-600 hover:underline font-bold cursor-pointer"
                            >
                              All
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              onClick={() => {
                                setVisibleTierCards(['School'])
                                handleTierSelection('School')
                              }}
                              className="text-slate-500 hover:underline font-medium cursor-pointer"
                            >
                              Reset
                            </button>
                          </div>
                        </div>

                        {/* Checkbox Options for each tier card */}
                        <div className="space-y-1">
                          {[
                            { id: 'School', label: 'School Plan', icon: School, color: 'text-purple-600', badge: 'K-10' },
                            { id: 'College', label: 'College Plan', icon: Building2, color: 'text-indigo-600', badge: '11-12' },
                            { id: 'University', label: 'University Plan', icon: GraduationCap, color: 'text-purple-600', badge: 'BS' },
                            { id: 'Custom', label: 'Custom Hybrid', icon: Layers, color: 'text-amber-600', badge: 'Multi' }
                          ].map(item => {
                            const ItemIcon = item.icon
                            const isChecked = visibleTierCards.includes(item.id)
                            return (
                              <label
                                key={item.id}
                                className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer transition-colors text-xs select-none ${
                                  isChecked ? 'bg-purple-50/70 text-purple-900 font-semibold' : 'hover:bg-slate-50 text-slate-600'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => toggleTierCardVisibility(item.id)}
                                    className="w-3.5 h-3.5 text-purple-600 rounded border-slate-300 focus:ring-purple-500 cursor-pointer"
                                  />
                                  <ItemIcon className={`w-3.5 h-3.5 ${item.color} shrink-0`} />
                                  <span>{item.label}</span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                                  {item.badge}
                                </span>
                              </label>
                            )
                          })}
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 px-1 text-[10px] text-slate-400 text-center">
                          Tick cards to display on screen, untick to hide.
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dynamically Filtered Tier Cards Displayed On Screen */}
                {(() => {
                  const allTierCards = [
                    { id: 'School', label: 'School Plan', icon: School, color: 'text-purple-600' },
                    { id: 'College', label: 'College Plan', icon: Building2, color: 'text-indigo-600' },
                    { id: 'University', label: 'University Plan', icon: GraduationCap, color: 'text-purple-600' },
                    { id: 'Custom', label: 'Custom Hybrid', icon: Layers, color: 'text-amber-600' }
                  ]
                  const displayedCards = allTierCards.filter(card => visibleTierCards.includes(card.id))

                  if (displayedCards.length === 0) {
                    return (
                      <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 animate-in fade-in">
                        <Filter className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">All plan cards are currently hidden</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Please tick at least one card in the Filter above to display it on screen.</p>
                        <button
                          type="button"
                          onClick={() => setVisibleTierCards(['School', 'College', 'University', 'Custom'])}
                          className="mt-3 px-3.5 py-1.5 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-xl transition-colors cursor-pointer"
                        >
                          Show All Cards
                        </button>
                      </div>
                    )
                  }

                  const gridColsClass = 
                    displayedCards.length === 4 ? 'grid-cols-2 sm:grid-cols-4' :
                    displayedCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' :
                    displayedCards.length === 2 ? 'grid-cols-2' :
                    'grid-cols-1 max-w-sm mx-auto'

                  return (
                    <div className={`grid ${gridColsClass} gap-3 transition-all`}>
                      {displayedCards.map((tierItem) => {
                        const TierIcon = tierItem.icon
                        const isSelected = wizardData.type === tierItem.id
                        return (
                          <button
                            key={tierItem.id}
                            type="button"
                            onClick={() => handleTierSelection(tierItem.id)}
                            className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                              isSelected 
                                ? 'border-purple-600 bg-[#f5eeff] text-purple-800 font-bold ring-2 ring-purple-500/20 shadow-2xs' 
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <TierIcon className={`w-5 h-5 ${tierItem.color}`} />
                            <span className="text-xs font-semibold">{tierItem.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  )
                })()}

                {/* Custom Plan: Multi-Wing Checkbox Configuration */}
                {wizardData.type === 'Custom' && (
                  <div className={`p-3 rounded-xl border mt-3 space-y-2 ${wizardErrors.enabledTiers ? 'bg-rose-50/30 border-rose-300 ring-2 ring-rose-200/50' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Select Active Educational Wings for this Custom Client <span className="text-rose-500 font-bold">*</span>
                      </span>
                      {wizardErrors.enabledTiers && (
                        <span className="text-[11px] text-rose-600 font-semibold">{wizardErrors.enabledTiers}</span>
                      )}
                    </div>
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
                                if (wizardErrors.enabledTiers) setWizardErrors(prev => ({ ...prev, enabledTiers: null }))
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Official Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beaconhouse Central High School"
                  value={wizardData.name}
                  onChange={(e) => {
                    handleWizardNameChange(e.target.value)
                    if (wizardErrors.name) setWizardErrors(prev => ({ ...prev, name: null }))
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    wizardErrors.name 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                      : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                {wizardErrors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Unique Code <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHS-001"
                    value={wizardData.code}
                    onChange={(e) => {
                      setWizardData({ ...wizardData, code: e.target.value.toUpperCase() })
                      if (wizardErrors.code) setWizardErrors(prev => ({ ...prev, code: null }))
                    }}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border font-mono uppercase transition-all focus:outline-none focus:ring-2 ${
                      wizardErrors.code 
                        ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                        : 'border-slate-200 focus:ring-purple-500/20'
                    }`}
                  />
                  {wizardErrors.code && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.code}</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1 flex items-center gap-1">
                    <span>Head / Principal</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Shahida Parveen"
                    value={wizardData.principal}
                    onChange={(e) => {
                      setWizardData({ ...wizardData, principal: e.target.value })
                      if (wizardErrors.principal) setWizardErrors(prev => ({ ...prev, principal: null }))
                    }}
                    className={`w-full px-3.5 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                      wizardErrors.principal 
                        ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                        : 'border-slate-200 focus:ring-purple-500/20'
                    }`}
                  />
                  {wizardErrors.principal && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.principal}</p>
                  )}
                </div>
              </div>

              {/* Country Selection */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>Country / Geographic Jurisdiction</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[11px] text-purple-700 font-medium bg-[#f5eeff] px-2 py-0.5 rounded-md border border-purple-200/60 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-purple-600" />
                    <span>Auto-configures Boards & Divisions</span>
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={wizardData.country || 'Pakistan'}
                    onChange={(e) => handleWizardCountryChange(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border bg-white transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 ${
                      wizardErrors.country 
                        ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                        : 'border-slate-200 hover:border-slate-300 focus:ring-purple-500/20 text-slate-800'
                    }`}
                  >
                    {getAvailableCountries().map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {wizardErrors.country && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.country}</p>
                )}
              </div>

              {/* Dynamic Regional Division & Examination Board (Driven by Selected Country) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                      <span>Affiliated Examination Board</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {getCountryBoards(wizardData.country).length} Boards
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={wizardData.affiliatedBoard}
                      onChange={(e) => setWizardData({ ...wizardData, affiliatedBoard: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none pr-8 cursor-pointer text-slate-800"
                    >
                      {getCountryBoards(wizardData.country).map(b => (
                        <option key={b.id || b.code} value={b.name || b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                      <span>Regional Division</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {getCountryDivisions(wizardData.country).length} Divisions
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={wizardData.divisionId}
                      onChange={(e) => setWizardData({ ...wizardData, divisionId: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 appearance-none pr-8 cursor-pointer text-slate-800"
                    >
                      {getCountryDivisions(wizardData.country).map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Campuses */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              {/* Province / State & Primary Campus City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Province / State (Dropdown populated based on Step 1 Country) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                      <span>Province / State</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 font-semibold">
                      {wizardData.country || 'Pakistan'}
                    </span>
                  </div>
                  <div className="relative">
                    <select
                      value={wizardData.province || availableProvinces[0]}
                      onChange={(e) => handleWizardProvinceChange(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border bg-white appearance-none pr-8 cursor-pointer transition-all focus:outline-none focus:ring-2 ${
                        wizardErrors.province 
                          ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                          : 'border-slate-200 hover:border-slate-300 focus:ring-purple-500/20 text-slate-800'
                      }`}
                    >
                      {availableProvinces.map(provName => (
                        <option key={provName} value={provName}>
                          {provName}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  {wizardErrors.province && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.province}</p>
                  )}
                </div>

                {/* 2. Primary Campus City (Dropdown List of Cities with Clean Toggle) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase flex items-center gap-1">
                      <span>Primary Campus City</span>
                      <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const nextMode = !isCustomCityMode
                        setIsCustomCityMode(nextMode)
                        if (!nextMode && !availableCities.includes(wizardData.city)) {
                          handleWizardCityChange(currentCapitalCity || availableCities[0] || 'Lahore')
                        }
                      }}
                      className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold cursor-pointer transition-colors"
                    >
                      {isCustomCityMode ? '← Choose from list' : '+ Enter custom city'}
                    </button>
                  </div>

                  {!isCustomCityMode ? (
                    <div className="relative">
                      <select
                        value={availableCities.includes(wizardData.city) ? wizardData.city : '__CUSTOM__'}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__CUSTOM__') {
                            setIsCustomCityMode(true)
                          } else {
                            handleWizardCityChange(val)
                          }
                        }}
                        className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border bg-white appearance-none pr-8 cursor-pointer transition-all focus:outline-none focus:ring-2 ${
                          wizardErrors.city 
                            ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                            : 'border-slate-200 hover:border-slate-300 focus:ring-purple-500/20 text-slate-800'
                        }`}
                      >
                        {availableCities.map(cityName => (
                          <option key={cityName} value={cityName}>
                            {cityName}
                          </option>
                        ))}
                        <option value="__CUSTOM__">+ Other / Enter Custom City...</option>
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder={`e.g. ${availableCities[0] || 'Kasur'}`}
                        value={wizardData.city}
                        onChange={(e) => handleCustomCityChange(e.target.value)}
                        className={`w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                          wizardErrors.city 
                            ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                            : 'border-slate-200 focus:ring-purple-500/20 text-slate-800'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCityMode(false)
                          handleWizardCityChange(currentCapitalCity || availableCities[0] || 'Lahore')
                        }}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 cursor-pointer transition-colors"
                        title="Return to standard city dropdown list"
                      >
                        List
                      </button>
                    </div>
                  )}

                  {wizardErrors.city && (
                    <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.city}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Head Campus Physical Address <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gulberg III, Main Boulevard, Lahore"
                  value={wizardData.address}
                  onChange={(e) => {
                    setWizardData({ ...wizardData, address: e.target.value })
                    if (wizardErrors.address) setWizardErrors(prev => ({ ...prev, address: null }))
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    wizardErrors.address 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                      : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                {wizardErrors.address && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.address}</p>
                )}
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
                    className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
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
                          className="text-rose-500 hover:text-rose-700 ml-auto p-1 cursor-pointer"
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

          {/* Step 3: Campus Contact Information (Subdomain & Brand Color Removed As Requested) */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              <div className="p-3 bg-[#f5eeff]/80 border border-purple-200 rounded-xl text-xs text-purple-800 flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Official Campus Contact:</span>
                  <p className="mt-0.5 text-slate-600">
                    Official phone number is strictly required for campus registration, platform alerts, and administrative communications.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Official Phone <span className="text-rose-500 font-bold">*</span>
                </label>

                {/* Fixed Country Dial Code Prefix + Phone Number Input Group */}
                <div className={`flex rounded-lg border bg-white transition-all shadow-2xs ${
                  wizardErrors.phone 
                    ? 'border-rose-400 ring-2 ring-rose-200/50' 
                    : 'border-slate-200 hover:border-slate-300 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500'
                }`}>
                  {/* Fixed Country Dial Code Prefix (Auto-Fixed from Step 1 Country Selection) */}
                  <div className="shrink-0 px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 rounded-l-lg flex items-center gap-1.5 select-none text-slate-700 font-bold text-xs" title={`Auto-fixed for ${wizardData.country || 'Pakistan'}`}>
                    <span className="font-mono text-purple-700 font-bold">{wizardData.phoneDialCode || '+92'}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({wizardData.country || 'Pakistan'})</span>
                  </div>

                  {/* Local Phone Number Input */}
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 3006543298 or 03006543298"
                      value={wizardData.phoneNumber || ''}
                      maxLength={(wizardData.phoneNumber || '').startsWith('0') ? 11 : 10}
                      onChange={(e) => handlePhoneNumberChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-transparent border-none outline-none placeholder:text-slate-400 placeholder:font-normal font-mono tracking-wide"
                    />
                    {wizardData.phoneNumber && (
                      <span className="text-[10px] font-mono text-slate-400 pr-3 select-none shrink-0">
                        {(wizardData.phoneNumber || '').length}/{(wizardData.phoneNumber || '').startsWith('0') ? 11 : 10}
                      </span>
                    )}
                  </div>
                </div>

                {wizardErrors.phone ? (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.phone}</p>
                ) : (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Enter 10 digits (e.g. 3006543298) or 11 digits with leading 0 (e.g. 03006543298)
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Official Email <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. info@campus.edu"
                  value={wizardData.email}
                  onChange={(e) => setWizardData({ ...wizardData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-1">Optional contact email for general public inquiries</p>
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
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Administrator Full Name <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Shahida Parveen (Principal)"
                  value={wizardData.adminName}
                  onChange={(e) => {
                    setWizardData({ ...wizardData, adminName: e.target.value })
                    if (wizardErrors.adminName) setWizardErrors(prev => ({ ...prev, adminName: null }))
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    wizardErrors.adminName 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                      : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                {wizardErrors.adminName && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.adminName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Administrator Official Email <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.beacon@sms.edu"
                  value={wizardData.adminEmail}
                  onChange={(e) => {
                    setWizardData({ ...wizardData, adminEmail: e.target.value })
                    if (wizardErrors.adminEmail) setWizardErrors(prev => ({ ...prev, adminEmail: null }))
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border transition-all focus:outline-none focus:ring-2 ${
                    wizardErrors.adminEmail 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                      : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                {wizardErrors.adminEmail && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.adminEmail}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Initial Temporary Password <span className="text-rose-500 font-bold">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={wizardData.adminPassword}
                  onChange={(e) => {
                    setWizardData({ ...wizardData, adminPassword: e.target.value })
                    if (wizardErrors.adminPassword) setWizardErrors(prev => ({ ...prev, adminPassword: null }))
                  }}
                  className={`w-full px-3.5 py-2 text-xs rounded-lg border font-mono transition-all focus:outline-none focus:ring-2 ${
                    wizardErrors.adminPassword 
                      ? 'border-rose-400 bg-rose-50/20 ring-2 ring-rose-200/50' 
                      : 'border-slate-200 focus:ring-purple-500/20'
                  }`}
                />
                {wizardErrors.adminPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium">{wizardErrors.adminPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Subscription Plan & Quotas */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Subscription Plan
                  </label>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                    <Lock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auto-Locked to Tier ({wizardData.type || 'School'})</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const isMatchedTier = plan.type === wizardData.type
                    return (
                      <div
                        key={plan.id}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isMatchedTier
                            ? 'border-purple-600 bg-[#f5eeff] text-purple-900 ring-2 ring-purple-500/20 font-bold shadow-xs cursor-default'
                            : 'border-slate-200 bg-slate-50/50 text-slate-400 opacity-40 select-none cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1">
                          <span className="text-xs font-bold leading-tight">{plan.name}</span>
                          {isMatchedTier ? (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-purple-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-[9px] font-medium text-slate-400 bg-slate-200/60 px-1.5 py-0.5 rounded">
                              Locked
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] font-bold block mt-1 ${isMatchedTier ? 'text-purple-700' : 'text-slate-400'}`}>
                          PKR {plan.pricePKR.toLocaleString()}/mo
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1 font-medium">
                          Up to {plan.maxStudents ? `${plan.maxStudents.toLocaleString()} seats` : 'Unlimited seats'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quota Summary & Custom Student Allocation Box */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Allocated Quota Limits
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>No Upper Cap · Unlimited Scalability</span>
                  </span>
                </div>

                {/* Custom Student Quota Input + Preset Tags */}
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <span>Custom Student Enrollment Limit</span>
                        <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <span className="text-[11px] text-slate-500 block mt-0.5">
                        Enter any custom seat count (no limit) or choose from quick preset tags
                      </span>
                    </div>

                    {/* Interactive Number Input */}
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <input
                        type="number"
                        min="1"
                        step="100"
                        value={wizardData.quotaStudents ?? 1500}
                        onChange={(e) => {
                          const raw = e.target.value === '' ? '' : parseInt(e.target.value, 10)
                          if (raw === '') {
                            setWizardData({ ...wizardData, quotaStudents: '' })
                          } else {
                            const val = Math.max(raw, 0)
                            setWizardData({ ...wizardData, quotaStudents: val })
                          }
                        }}
                        onBlur={() => {
                          if (wizardData.quotaStudents === '' || wizardData.quotaStudents < 1) {
                            setWizardData({ ...wizardData, quotaStudents: 1500 })
                          }
                        }}
                        className="w-32 px-3 py-1.5 text-xs font-extrabold text-slate-900 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-slate-50/50"
                      />
                    </div>
                  </div>

                  {/* Preset Quick Select Tags (Flexible & Scalable Presets) */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 mr-1">Quick Select:</span>
                    {[1500, 3000, 5000, 10000, 25000, 50000].map((tagVal) => {
                      const isSelected = Number(wizardData.quotaStudents) === tagVal
                      return (
                        <button
                          key={tagVal}
                          type="button"
                          onClick={() => setWizardData({ ...wizardData, quotaStudents: tagVal })}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-purple-600 text-white shadow-xs ring-2 ring-purple-500/20 scale-105'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 hover:border-slate-300'
                          }`}
                        >
                          {tagVal.toLocaleString()}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Additional Quota Metrics */}
                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Max Staff & Users</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{wizardData.quotaUsers || 50}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Branch Campuses</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{wizardData.quotaCampuses || 3}</span>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-2xs">
                    <span className="text-[10px] text-slate-400 block font-medium">Cloud Storage</span>
                    <span className="text-sm font-extrabold text-slate-800 mt-0.5 block">{wizardData.quotaStorageMb || 2048} MB</span>
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
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>

            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteWizard}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap"
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

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
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
            {/* Tabs Header with Direct Edit Action Button */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 text-xs gap-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {['overview', 'campuses', 'admins', 'modules', 'plan', 'activity'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleDetailTabChange(tab)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                      detailsTab === tab ? 'bg-[#f5eeff] text-purple-700 border border-purple-200' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Direct Edit Button (Directly opens full edit modal) */}
              <button
                type="button"
                onClick={() => {
                  const targetInst = viewingDetails
                  setViewingDetails(null)
                  openEditModal(targetInst)
                }}
                className="px-3 py-1.5 rounded-lg font-bold text-xs text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/90 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
                title="Edit this campus profile, location, contacts and quotas"
              >
                <Edit3 className="w-3.5 h-3.5 text-purple-600" />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Tab 1: Overview (Read-Only) */}
            {detailsTab === 'overview' && (
              <div className="space-y-3">
                {/* Header Card (Name, Address, Code, Status) */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold">
                        {viewingDetails.code}
                      </span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        (viewingDetails.lifecycleStatus || viewingDetails.status) === 'Suspended'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {viewingDetails.lifecycleStatus || viewingDetails.status || 'Active'}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 mt-1">{viewingDetails.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{viewingDetails.address || viewingDetails.city || 'Campus Address'}</span>
                    </p>
                  </div>
                </div>

                {/* 4 Details Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* Principal / Head */}
                  <div className="p-3 rounded-xl border bg-white border-slate-200">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Principal / Head
                    </label>
                    <span className="font-bold text-slate-800 text-sm block">
                      {viewingDetails.principal || '—'}
                    </span>
                  </div>

                  {/* Board Affiliation */}
                  <div className="p-3 rounded-xl border bg-white border-slate-200">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Board Affiliation
                    </label>
                    <span className="font-bold text-purple-700 text-sm block">
                      {viewingDetails.affiliatedBoard || 'BISE Gujranwala'}
                    </span>
                  </div>

                  {/* Official Email */}
                  <div className="p-3 rounded-xl border bg-white border-slate-200">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Official Email
                    </label>
                    <span className="font-semibold text-purple-600 truncate block font-mono text-xs">
                      {viewingDetails.email || '—'}
                    </span>
                  </div>

                  {/* Contact Phone */}
                  <div className="p-3 rounded-xl border bg-white border-slate-200">
                    <label className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                      Contact Phone
                    </label>
                    <span className="font-semibold text-slate-800 block font-mono text-xs">
                      {viewingDetails.phone || '—'}
                    </span>
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

            {/* Tab 4: Modules (Super Admin Add / Remove & Feature Governance) */}
            {detailsTab === 'modules' && (
              <div className="space-y-3">
                {/* Header Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">Campus Capabilities & Feature Flags</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        activeModulesCount === allModulesForViewing.length
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}>
                        {activeModulesCount} of {allModulesForViewing.length} Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Super Admin can toggle modules to activate or remove capabilities for this campus.
                    </p>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQuickToggleAllModules(true)}
                      className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
                      title="Enable all modules for this campus"
                    >
                      Enable All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickToggleAllModules(false)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Keep only core academic modules"
                    >
                      Disable Optional
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddCustomModuleOpen(true)}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-all shadow-2xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Module</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar for Modules */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search modules by name, feature or category..."
                    value={moduleSearchTerm}
                    onChange={(e) => setModuleSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200/80 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                  {moduleSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setModuleSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Modules Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                  {filteredModulesForViewing.map(m => {
                    const isEnabled = isModuleActiveForCampus(m.key)

                    return (
                      <div
                        key={m.key}
                        className={`p-3 rounded-xl border transition-all ${
                          isEnabled
                            ? 'bg-white border-slate-200/90 shadow-2xs hover:border-purple-200'
                            : 'bg-slate-50/70 border-dashed border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                                m.isCustom
                                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                                  : m.category === 'Finance'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : m.category === 'Core Academic'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {m.category || 'Module'}
                              </span>
                              {m.isCustom && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1 rounded">Custom</span>
                              )}
                            </div>
                            <h5 className={`font-bold text-xs truncate ${isEnabled ? 'text-slate-900' : 'text-slate-500 line-through'}`}>
                              {m.name}
                            </h5>
                            {m.description && (
                              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{m.description}</p>
                            )}
                          </div>

                          {/* Toggle & Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            {m.isCustom && (
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomModule(m.key, m.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Delete this custom module"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleModuleForCampus(m.key)}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                                isEnabled
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 hover:shadow-emerald-200/50'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200 hover:text-slate-700'
                              }`}
                              title={isEnabled ? 'Click to disable / remove module' : 'Click to enable / add module'}
                            >
                              <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                              <span>{isEnabled ? 'Active' : 'Disabled'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
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

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewingDetails(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Close Profile
              </button>

              <div className="flex items-center gap-2">
                {detailsTab !== 'overview' && (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['overview', 'campuses', 'admins', 'modules', 'plan', 'activity']
                      const currentIndex = tabs.indexOf(detailsTab)
                      if (currentIndex > 0) setDetailsTab(tabs[currentIndex - 1])
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}

                {/* Next or Done button */}
                {detailsTab !== 'activity' ? (
                  <button
                    type="button"
                    onClick={() => {
                      const tabs = ['overview', 'campuses', 'admins', 'modules', 'plan', 'activity']
                      const currentIndex = tabs.indexOf(detailsTab)
                      if (currentIndex < tabs.length - 1) setDetailsTab(tabs[currentIndex + 1])
                    }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setViewingDetails(null)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Done
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* ADD CUSTOM MODULE MODAL */}
      {/* ---------------------------------------------------- */}
      {isAddCustomModuleOpen && viewingDetails && (
        <Modal
          isOpen={isAddCustomModuleOpen}
          onClose={() => setIsAddCustomModuleOpen(false)}
          title={`Add Custom Feature Module: ${viewingDetails.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateCustomModule} className="space-y-3.5 text-xs">
            <p className="text-slate-500 text-[11px]">
              Create and attach a specialized capability module for this campus. It will instantly activate and show up on the campus ledger.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Module Name <span className="text-rose-500 font-bold">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alumni Network & Mentorship Portal"
                value={customModuleForm.name}
                onChange={(e) => setCustomModuleForm({ ...customModuleForm, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Module Category
              </label>
              <select
                value={customModuleForm.category}
                onChange={(e) => setCustomModuleForm({ ...customModuleForm, category: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
              >
                <option value="Academic Operations">Academic Operations</option>
                <option value="Finance & Accounts">Finance & Accounts</option>
                <option value="Security & Access">Security & Access</option>
                <option value="Student Logistics">Student Logistics</option>
                <option value="Community & Portal">Community & Portal</option>
                <option value="Custom Operations">Custom Operations</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of what this module handles for this campus..."
                value={customModuleForm.description}
                onChange={(e) => setCustomModuleForm({ ...customModuleForm, description: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddCustomModuleOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add & Enable Module</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ---------------------------------------------------- */}
      {/* 5. EDIT INSTITUTE MODAL (FULL EDITING SUITE) */}
      {/* ---------------------------------------------------- */}
      {editingInstitute && (
        <Modal
          isOpen={Boolean(editingInstitute)}
          onClose={() => setEditingInstitute(null)}
          title={`Edit Profile: ${editingInstitute.name}`}
          maxWidth="max-w-2xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-slate-100 pb-2.5 text-xs gap-1.5 overflow-x-auto">
              {[
                { id: 'profile', label: '1. Profile & Tier', icon: Building2 },
                { id: 'location', label: '2. Location & Campus', icon: MapPin },
                { id: 'contact', label: '3. Contact Details', icon: Phone },
                { id: 'plan', label: '4. Plan & Quotas', icon: Layers }
              ].map(t => {
                const TabIcon = t.icon
                const isActive = editTab === t.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEditTab(t.id)}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                )
              })}
            </div>

            {/* TAB 1: Demographics & Region */}
            {editTab === 'profile' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Institute Official Name <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Unique Code <span className="text-rose-500 font-bold">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.code}
                      onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Educational Tier / Plan Type
                    </label>
                    <select
                      value={editFormData.type}
                      onChange={(e) => handleEditTierChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      <option value="School">School Plan</option>
                      <option value="College">College Plan</option>
                      <option value="University">University Plan</option>
                      <option value="Custom">Custom Hybrid</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <span>Head / Principal Name</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Shahida Parveen"
                    value={editFormData.principal}
                    onChange={(e) => setEditFormData({ ...editFormData, principal: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Country / Geographic Jurisdiction
                  </label>
                  <select
                    value={editFormData.country}
                    onChange={(e) => handleEditCountryChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                  >
                    {getAvailableCountries().map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Affiliated Examination Board
                    </label>
                    <select
                      value={editFormData.affiliatedBoard}
                      onChange={(e) => setEditFormData({ ...editFormData, affiliatedBoard: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      {getCountryBoards(editFormData.country).map(b => (
                        <option key={b.id || b.code} value={b.name || b.code}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Regional Division
                    </label>
                    <select
                      value={editFormData.divisionId}
                      onChange={(e) => setEditFormData({ ...editFormData, divisionId: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      {getCountryDivisions(editFormData.country).map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Campus & Location */}
            {editTab === 'location' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase">Province / State</label>
                      <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 font-semibold">
                        {editFormData.country}
                      </span>
                    </div>
                    <select
                      value={editFormData.province}
                      onChange={(e) => handleEditProvinceChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      {editProvinces.map(provName => (
                        <option key={provName} value={provName}>{provName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase">Primary Campus City</label>
                      <button
                        type="button"
                        onClick={() => {
                          const next = !isEditCustomCity
                          setIsEditCustomCity(next)
                          if (!next && !editCities.includes(editFormData.city)) {
                            handleEditCityChange(editCities[0] || 'Lahore')
                          }
                        }}
                        className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold cursor-pointer"
                      >
                        {isEditCustomCity ? '← Choose from list' : '+ Custom city'}
                      </button>
                    </div>

                    {!isEditCustomCity ? (
                      <select
                        value={editCities.includes(editFormData.city) ? editFormData.city : '__CUSTOM__'}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__CUSTOM__') {
                            setIsEditCustomCity(true)
                          } else {
                            handleEditCityChange(val)
                          }
                        }}
                        className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                      >
                        {editCities.map(cityName => (
                          <option key={cityName} value={cityName}>{cityName}</option>
                        ))}
                        <option value="__CUSTOM__">+ Other / Enter Custom City...</option>
                      </select>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editFormData.city}
                          onChange={(e) => handleEditCustomCityChange(e.target.value)}
                          placeholder="Enter custom city"
                          className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditCustomCity(false)
                            handleEditCityChange(editCities[0] || 'Lahore')
                          }}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0 cursor-pointer"
                        >
                          List
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Head Campus Physical Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="e.g. Main Boulevard, Gulberg III"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Contact Details */}
            {editTab === 'contact' && (
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Official Phone
                  </label>
                  <div className="flex rounded-lg border border-slate-200 bg-white shadow-2xs focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500">
                    <div className="shrink-0 px-3.5 py-2.5 bg-slate-50 border-r border-slate-200 rounded-l-lg flex items-center gap-1.5 select-none text-slate-700 font-bold text-xs">
                      <span className="font-mono text-purple-700 font-bold">{editFormData.phoneDialCode || '+92'}</span>
                      <span className="text-[10px] text-slate-400 font-medium">({editFormData.country})</span>
                    </div>
                    <input
                      type="tel"
                      value={editFormData.phoneNumber || ''}
                      maxLength={(editFormData.phoneNumber || '').startsWith('0') ? 11 : 10}
                      onChange={(e) => handleEditPhoneChange(e.target.value)}
                      placeholder="e.g. 3006543298 or 03006543298"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-transparent border-none outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Official Email <span className="text-slate-400 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    placeholder="e.g. info@campus.edu"
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: Plan & Quotas */}
            {editTab === 'plan' && (
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Subscription Plan Tier
                    </label>
                    <select
                      value={editFormData.planTier}
                      onChange={(e) => setEditFormData({ ...editFormData, planTier: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      {SUBSCRIPTION_PLANS.map(p => (
                        <option key={p.id} value={p.name}>{p.name} (PKR {p.pricePKR.toLocaleString()}/mo)</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                      Lifecycle Status
                    </label>
                    <select
                      value={editFormData.lifecycleStatus}
                      onChange={(e) => setEditFormData({ ...editFormData, lifecycleStatus: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                    >
                      <option value="Active">Active (Operational)</option>
                      <option value="Suspended">Suspended (Access Revoked)</option>
                      <option value="Archived">Archived (Locked)</option>
                    </select>
                  </div>
                </div>

                {/* Quota Limits Box */}
                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <span>Student Enrollment Quota</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        step="100"
                        value={editFormData.quotaStudents}
                        onChange={(e) => {
                          const val = e.target.value === '' ? '' : Math.max(parseInt(e.target.value, 10), 0)
                          setEditFormData({ ...editFormData, quotaStudents: val })
                        }}
                        className="w-28 px-2 py-1 text-xs font-extrabold text-slate-900 border border-slate-300 rounded-md text-center focus:outline-none bg-white"
                      />
                    </div>

                    {/* Quick Preset Tags */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-400 font-semibold mr-1">Presets:</span>
                      {[1500, 2000, 2500, 3000].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setEditFormData({ ...editFormData, quotaStudents: val })}
                          className={`px-2.5 py-0.5 text-xs font-bold rounded transition-all cursor-pointer ${
                            Number(editFormData.quotaStudents) === val
                              ? 'bg-purple-600 text-white shadow-2xs'
                              : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {val.toLocaleString()} {val === 3000 && '(Max)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Max Staff & Users</label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        value={editFormData.quotaUsers}
                        onChange={(e) => setEditFormData({ ...editFormData, quotaUsers: parseInt(e.target.value, 10) || 50 })}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-md bg-white text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Branch Campuses</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editFormData.quotaCampuses}
                        onChange={(e) => setEditFormData({ ...editFormData, quotaCampuses: parseInt(e.target.value, 10) || 2 })}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-md bg-white text-center focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">Cloud Storage (MB)</label>
                      <input
                        type="number"
                        min="512"
                        step="512"
                        value={editFormData.quotaStorageMb}
                        onChange={(e) => setEditFormData({ ...editFormData, quotaStorageMb: parseInt(e.target.value, 10) || 2048 })}
                        className="w-full px-2 py-1 text-xs font-bold text-slate-800 border border-slate-200 rounded-md bg-white text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer with Save & Continue Step-by-Step Flow */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingInstitute(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                {editTab !== 'profile' && (
                  <button
                    type="button"
                    onClick={handleEditPrev}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editTab !== 'plan' ? (
                  <>
                    <button
                      type="submit"
                      className="px-4 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200/80 rounded-lg transition-all cursor-pointer hidden sm:inline-flex"
                      title="Save changes and close"
                    >
                      Save & Close
                    </button>
                    <button
                      type="button"
                      onClick={handleEditNext}
                      className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Save & Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="submit"
                    className="px-6 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                )}
              </div>
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
