import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  Users,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Search,
  List,
  Plus,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Menu,
  ChevronDown,
  User,
  Check,
  X,
  Trash2,
  Pencil,
  Wallet
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatTimestamp = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const day = String(d.getDate()).padStart(2, '0')
  const mon = SHORT_MONTHS[d.getMonth()]
  const yr = d.getFullYear()
  let hrs = d.getHours()
  const mins = String(d.getMinutes()).padStart(2, '0')
  const ampm = hrs >= 12 ? 'PM' : 'AM'
  hrs = hrs % 12 || 12
  return `${day} ${mon} ${yr}, ${String(hrs).padStart(2, '0')}:${mins} ${ampm}`
}

const normalizeKey = (name, phone) => {
  const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  if (!cleanName && !cleanPhone) return ''
  return cleanPhone ? `${cleanName}__${cleanPhone.slice(-10)}` : cleanName
}

const getStorageKey = (instId) => `eims_parents_registry_${instId || 'default'}`

const loadRegistry = (instId) => {
  try {
    const raw = localStorage.getItem(getStorageKey(instId))
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const saveRegistry = (instId, list) => {
  try {
    localStorage.setItem(getStorageKey(instId), JSON.stringify(list))
  } catch {
    // ignore storage quota errors
  }
}

export const ParentsGuardiansView = ({
  currentInstitute,
  onRouteChange,
  onOpenProfile,
  onOpenQuickPayment
}) => {
  const { students = [], updateItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || !s.instituteId || s.instituteId === currentInstitute.id) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const [registry, setRegistry] = useState(() => loadRegistry(instId))

  useEffect(() => {
    setRegistry(loadRegistry(instId))
  }, [instId])

  const persistRegistry = (updater) => {
    setRegistry((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveRegistry(instId, next)
      return next
    })
  }

  // UI state
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'create'
  const [kpiFilter, setKpiFilter] = useState('all') // 'all' | 'with_students' | 'without_students' | 'with_contact'
  const [searchQuery, setSearchQuery] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' })
  const [openMenuId, setOpenMenuId] = useState(null)

  // Modals
  const [linkChildParent, setLinkChildParent] = useState(null)
  const [childSearch, setChildSearch] = useState('')
  const [editParentModal, setEditParentModal] = useState(null)
  const [creditModalParent, setCreditModalParent] = useState(null)
  const [creditAmountInput, setCreditAmountInput] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  // Create New Parent tab state
  const [createForm, setCreateForm] = useState({
    name: '',
    relation: 'Parent',
    phone: '',
    email: '',
    cnic: '',
    address: '',
    familyCredit: '0',
    linkedStudentIds: []
  })
  const [createChildSearch, setCreateChildSearch] = useState('')

  // Close action dropdown on outside click
  useEffect(() => {
    if (!openMenuId) return
    const close = () => setOpenMenuId(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [openMenuId])

  // Build unified parent/guardian records combining registry + student records
  const parentsList = useMemo(() => {
    const map = new Map()

    // Seed from persisted registry first
    for (const reg of registry) {
      if (reg.deleted) continue
      const key = reg.id || normalizeKey(reg.name, reg.phone)
      if (!key) continue
      map.set(key, {
        id: key,
        name: reg.name || 'Unnamed Guardian',
        relation: reg.relation || 'Parent',
        phone: reg.phone || '',
        email: reg.email || '',
        cnic: reg.cnic || '',
        address: reg.address || '',
        photoUrl: reg.photoUrl || '',
        familyCredit: Number(reg.familyCredit || 0),
        portalStatus: reg.portalStatus || null, // { label, timestamp }
        linkedStudents: [],
        explicitStudentIds: Array.isArray(reg.linkedStudentIds) ? reg.linkedStudentIds : [],
        isCustom: true
      })
    }

    // Group students by guardian/father
    for (const s of instStudents) {
      // Check if explicitly linked to a registry parent
      let matchedKey = null
      for (const [k, entry] of map.entries()) {
        if (entry.explicitStudentIds.includes(s.id) || (s.parentId && s.parentId === k)) {
          matchedKey = k
          break
        }
      }

      const rawName = (s.guardianName || s.fatherName || '').trim()
      const rawPhone = (s.guardianPhone || s.fatherPhone || s.parentPhone || s.phone || '').trim()
      const rawEmail = (s.guardianEmail || s.parentEmail || '').trim()

      if (!matchedKey) {
        if (!rawName) continue
        const nKey = normalizeKey(rawName, rawPhone)
        // Check if a registry entry exists with matching normalized key
        for (const [k, entry] of map.entries()) {
          if (normalizeKey(entry.name, entry.phone) === nKey) {
            matchedKey = k
            break
          }
        }
        if (!matchedKey) {
          matchedKey = `par_${nKey}`
        }
      }

      const existingReg = registry.find((r) => r.id === matchedKey)
      if (existingReg?.deleted) continue

      if (!map.has(matchedKey)) {
        map.set(matchedKey, {
          id: matchedKey,
          name: rawName,
          relation: s.guardianRelation || 'Parent',
          phone: rawPhone,
          email: rawEmail,
          cnic: s.guardianCnic || '',
          address: s.address || '',
          photoUrl: '',
          familyCredit: Number(s.familyCredit || 0),
          portalStatus: null,
          linkedStudents: [],
          explicitStudentIds: [],
          isCustom: false
        })
      }

      const target = map.get(matchedKey)
      if (!target.phone && rawPhone) target.phone = rawPhone
      if (!target.email && rawEmail) target.email = rawEmail
      if (!target.familyCredit && s.familyCredit) target.familyCredit = Number(s.familyCredit || 0)
      if (!target.linkedStudents.some((st) => st.id === s.id)) {
        target.linkedStudents.push(s)
      }
    }

    return Array.from(map.values())
  }, [registry, instStudents])

  // KPI metrics
  const kpis = useMemo(() => {
    const total = parentsList.length
    const withStudents = parentsList.filter((p) => p.linkedStudents.length > 0).length
    const withoutStudents = parentsList.filter((p) => p.linkedStudents.length === 0).length
    const withContact = parentsList.filter((p) => Boolean(p.phone?.trim() || p.email?.trim())).length
    return { total, withStudents, withoutStudents, withContact }
  }, [parentsList])

  // Filtered & sorted rows
  const filteredParents = useMemo(() => {
    let list = parentsList

    if (kpiFilter === 'with_students') {
      list = list.filter((p) => p.linkedStudents.length > 0)
    } else if (kpiFilter === 'without_students') {
      list = list.filter((p) => p.linkedStudents.length === 0)
    } else if (kpiFilter === 'with_contact') {
      list = list.filter((p) => Boolean(p.phone?.trim() || p.email?.trim()))
    }

    const q = searchQuery.trim().toLowerCase()
    if (q) {
      list = list.filter((p) => {
        if (p.name.toLowerCase().includes(q)) return true
        if ((p.phone || '').toLowerCase().includes(q)) return true
        if ((p.email || '').toLowerCase().includes(q)) return true
        if (
          p.linkedStudents.some(
            (s) =>
              (s.name || '').toLowerCase().includes(q) ||
              (s.rollNumber || '').toLowerCase().includes(q)
          )
        ) {
          return true
        }
        return false
      })
    }

    const sorted = [...list].sort((a, b) => {
      const dir = sortConfig.dir === 'asc' ? 1 : -1
      switch (sortConfig.key) {
        case 'students':
          return (a.linkedStudents.length - b.linkedStudents.length) * dir
        case 'contact':
          return (a.phone || a.email || '').localeCompare(b.phone || b.email || '') * dir
        case 'credit':
          return (a.familyCredit - b.familyCredit) * dir
        case 'portal': {
          const av = a.portalStatus?.label || ''
          const bv = b.portalStatus?.label || ''
          return av.localeCompare(bv) * dir
        }
        case 'name':
        default:
          return a.name.localeCompare(b.name) * dir
      }
    })

    return sorted
  }, [parentsList, kpiFilter, searchQuery, sortConfig])

  // Pagination
  const totalEntries = filteredParents.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const startIdx = totalEntries === 0 ? 0 : (safePage - 1) * pageSize
  const paginatedRows = filteredParents.slice(startIdx, startIdx + pageSize)
  const showingFrom = totalEntries === 0 ? 0 : startIdx + 1
  const showingTo = Math.min(startIdx + pageSize, totalEntries)

  useEffect(() => {
    setCurrentPage(1)
  }, [kpiFilter, searchQuery, pageSize])

  const toggleSort = (key) => {
    setSortConfig((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    )
  }

  // Upsert parent override/entry into registry
  const upsertRegistryEntry = (parentObj, patch) => {
    persistRegistry((prev) => {
      const idx = prev.findIndex((r) => r.id === parentObj.id)
      const base =
        idx >= 0
          ? prev[idx]
          : {
              id: parentObj.id,
              name: parentObj.name,
              relation: parentObj.relation || 'Parent',
              phone: parentObj.phone || '',
              email: parentObj.email || '',
              cnic: parentObj.cnic || '',
              address: parentObj.address || '',
              photoUrl: parentObj.photoUrl || '',
              familyCredit: parentObj.familyCredit || 0,
              portalStatus: parentObj.portalStatus || null,
              linkedStudentIds: parentObj.linkedStudents.map((s) => s.id)
            }
      const updated = { ...base, ...patch }
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [updated, ...prev]
    })
  }

  // Portal login dispatch handlers (Welcome SMS / Login SMS / Login Email)
  const handlePortalDispatch = (parent, channelType) => {
    if (channelType === 'email' && !parent.email?.trim()) {
      toast.warning(`No email address on file for ${parent.name}`)
      return
    }
    if ((channelType === 'welcome_sms' || channelType === 'login_sms') && !parent.phone?.trim()) {
      toast.warning(`No phone number on file for ${parent.name}`)
      return
    }

    const labelMap = {
      welcome_sms: 'Welcome SMS sent',
      login_sms: 'Login SMS sent',
      email: 'Login Email sent'
    }
    const label = labelMap[channelType] || 'Portal login sent'
    const timestamp = formatTimestamp(new Date())

    upsertRegistryEntry(parent, { portalStatus: { label, timestamp } })
    logAuditEvent?.('PARENT_PORTAL_INVITE', `${label} to ${parent.name}`, {
      parentId: parent.id,
      channel: channelType
    })
    toast.success(`${label} to ${parent.name}`)
  }

  // Link or unlink a student with a parent
  const handleToggleLinkStudent = async (parent, student) => {
    const isLinked = parent.linkedStudents.some((s) => s.id === student.id)
    if (isLinked) {
      const nextIds = parent.linkedStudents.filter((s) => s.id !== student.id).map((s) => s.id)
      upsertRegistryEntry(parent, { linkedStudentIds: nextIds })
      try {
        await updateItem('students', student.id, {
          parentId: null,
          guardianName: '',
          fatherName: student.fatherName === parent.name ? '' : student.fatherName
        })
      } catch {
        // local state already updated
      }
      toast.info(`Unlinked ${student.name} from ${parent.name}`)
    } else {
      const nextIds = [...new Set([...parent.linkedStudents.map((s) => s.id), student.id])]
      upsertRegistryEntry(parent, { linkedStudentIds: nextIds })
      try {
        await updateItem('students', student.id, {
          parentId: parent.id,
          fatherName: student.fatherName || parent.name,
          guardianName: parent.name,
          guardianRelation: parent.relation || 'Parent',
          fatherPhone: parent.phone || student.fatherPhone || '',
          parentEmail: parent.email || student.parentEmail || ''
        })
      } catch {
        // local state already updated
      }
      toast.success(`Linked ${student.name} to ${parent.name}`)
    }
  }

  // Save edited parent details
  const handleSaveEditParent = async (e) => {
    e.preventDefault()
    if (!editParentModal?.name?.trim()) {
      toast.error('Parent / Guardian name is required')
      return
    }
    upsertRegistryEntry(editParentModal, {
      name: editParentModal.name.trim(),
      relation: editParentModal.relation || 'Parent',
      phone: editParentModal.phone.trim(),
      email: editParentModal.email.trim(),
      cnic: editParentModal.cnic.trim(),
      address: editParentModal.address.trim()
    })

    // Sync contact updates to linked students
    for (const st of editParentModal.linkedStudents || []) {
      try {
        await updateItem('students', st.id, {
          guardianName: editParentModal.name.trim(),
          fatherName: editParentModal.name.trim(),
          fatherPhone: editParentModal.phone.trim() || st.fatherPhone,
          parentEmail: editParentModal.email.trim() || st.parentEmail
        })
      } catch {
        // continue
      }
    }

    toast.success(`Updated ${editParentModal.name.trim()}`)
    setEditParentModal(null)
  }

  // Save Family Credit adjustment
  const handleSaveCredit = async (e) => {
    e.preventDefault()
    if (!creditModalParent) return
    const val = Math.max(0, Number(creditAmountInput || 0))
    upsertRegistryEntry(creditModalParent, { familyCredit: val })
    for (const st of creditModalParent.linkedStudents || []) {
      try {
        await updateItem('students', st.id, { familyCredit: val })
      } catch {
        // continue
      }
    }
    toast.success(`Family Credit updated to PKR ${val.toLocaleString()} for ${creditModalParent.name}`)
    setCreditModalParent(null)
  }

  // Create New Parent handler
  const handleCreateParent = async (e) => {
    e.preventDefault()
    if (!createForm.name.trim()) {
      toast.error('Please enter Parent / Guardian full name')
      return
    }
    const newId = `par_custom_${Date.now()}`
    const newEntry = {
      id: newId,
      name: createForm.name.trim(),
      relation: createForm.relation || 'Parent',
      phone: createForm.phone.trim(),
      email: createForm.email.trim(),
      cnic: createForm.cnic.trim(),
      address: createForm.address.trim(),
      photoUrl: '',
      familyCredit: Math.max(0, Number(createForm.familyCredit || 0)),
      portalStatus: null,
      linkedStudentIds: createForm.linkedStudentIds
    }

    persistRegistry((prev) => [newEntry, ...prev])

    for (const sid of createForm.linkedStudentIds) {
      try {
        await updateItem('students', sid, {
          parentId: newId,
          guardianName: newEntry.name,
          fatherName: newEntry.name,
          guardianRelation: newEntry.relation,
          fatherPhone: newEntry.phone,
          parentEmail: newEntry.email
        })
      } catch {
        // continue
      }
    }

    logAuditEvent?.('PARENT_CREATED', `Created parent ${newEntry.name}`, { parentId: newId })
    toast.success(`Parent "${newEntry.name}" created`)
    setCreateForm({
      name: '',
      relation: 'Parent',
      phone: '',
      email: '',
      cnic: '',
      address: '',
      familyCredit: '0',
      linkedStudentIds: []
    })
    setCreateChildSearch('')
    setActiveTab('all')
  }

  // Delete parent handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    upsertRegistryEntry(deleteTarget, { deleted: true, linkedStudentIds: [] })
    for (const st of deleteTarget.linkedStudents || []) {
      try {
        await updateItem('students', st.id, {
          parentId: null,
          guardianName: ''
        })
      } catch {
        // continue
      }
    }
    toast.success(`Removed ${deleteTarget.name} from Parents & Guardians`)
    setDeleteTarget(null)
  }

  // Pagination page numbers helper
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    const pages = [1]
    if (safePage > 3) pages.push('...')
    const start = Math.max(2, safePage - 1)
    const end = Math.min(totalPages - 1, safePage + 1)
    for (let i = start; i <= end; i += 1) pages.push(i)
    if (safePage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }, [totalPages, safePage])

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Page Header & Quick Action Pills */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Parents &amp; Guardians</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-students')}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Enrollment
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Add Payment
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees-invoices')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            Generate Invoice
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-finance-expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Manage Expense
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-comm-sms')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send SMS
          </button>
        </div>
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => {
            setKpiFilter('all')
            setActiveTab('all')
          }}
          className={`flex items-center gap-3.5 p-4 rounded-xl bg-white text-left transition-all ${
            kpiFilter === 'all'
              ? 'border-2 border-blue-400 shadow-sm ring-2 ring-blue-100'
              : 'border border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Parents</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{kpis.total}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFilter('with_students')
            setActiveTab('all')
          }}
          className={`flex items-center gap-3.5 p-4 rounded-xl bg-white text-left transition-all ${
            kpiFilter === 'with_students'
              ? 'border-2 border-emerald-400 shadow-sm ring-2 ring-emerald-100'
              : 'border border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">With Students</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{kpis.withStudents}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFilter('without_students')
            setActiveTab('all')
          }}
          className={`flex items-center gap-3.5 p-4 rounded-xl bg-white text-left transition-all ${
            kpiFilter === 'without_students'
              ? 'border-2 border-orange-400 shadow-sm ring-2 ring-orange-100'
              : 'border border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Without Students</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{kpis.withoutStudents}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setKpiFilter('with_contact')
            setActiveTab('all')
          }}
          className={`flex items-center gap-3.5 p-4 rounded-xl bg-white text-left transition-all ${
            kpiFilter === 'with_contact'
              ? 'border-2 border-cyan-400 shadow-sm ring-2 ring-cyan-100'
              : 'border border-slate-200 hover:border-slate-300 shadow-sm'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">With Contact</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{kpis.withContact}</p>
          </div>
        </button>
      </div>

      {/* Main Directory Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Tabs */}
        <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 inline-flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            All Parents
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`pb-3 inline-flex items-center gap-1.5 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Parent
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateParent} className="p-6 max-w-3xl space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Create New Parent / Guardian</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add a parent or guardian account and optionally link existing students.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Muhammad Khalid"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Relation</label>
                <select
                  value={createForm.relation}
                  onChange={(e) => setCreateForm((p) => ({ ...p, relation: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Parent">Parent</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 03001234567"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. parent@example.com"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CNIC / National ID</label>
                <input
                  type="text"
                  value={createForm.cnic}
                  onChange={(e) => setCreateForm((p) => ({ ...p, cnic: e.target.value }))}
                  placeholder="e.g. 35202-1234567-1"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Family Credit (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={createForm.familyCredit}
                  onChange={(e) => setCreateForm((p) => ({ ...p, familyCredit: e.target.value }))}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Home Address</label>
              <input
                type="text"
                value={createForm.address}
                onChange={(e) => setCreateForm((p) => ({ ...p, address: e.target.value }))}
                placeholder="Street, sector, city"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="border border-slate-200 rounded-lg p-3.5 space-y-2.5 bg-slate-50/60">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-700">
                  Link Existing Students ({createForm.linkedStudentIds.length} selected)
                </span>
                <input
                  type="text"
                  value={createChildSearch}
                  onChange={(e) => setCreateChildSearch(e.target.value)}
                  placeholder="Search student name or roll..."
                  className="px-2.5 py-1 text-xs rounded border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-56"
                />
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 bg-white rounded border border-slate-200">
                {instStudents
                  .filter((st) => {
                    const q = createChildSearch.trim().toLowerCase()
                    if (!q) return true
                    return (
                      (st.name || '').toLowerCase().includes(q) ||
                      (st.rollNumber || '').toLowerCase().includes(q)
                    )
                  })
                  .slice(0, 30)
                  .map((st) => {
                    const checked = createForm.linkedStudentIds.includes(st.id)
                    return (
                      <label
                        key={st.id}
                        className="flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setCreateForm((p) => ({
                                ...p,
                                linkedStudentIds: checked
                                  ? p.linkedStudentIds.filter((id) => id !== st.id)
                                  : [...p.linkedStudentIds, st.id]
                              }))
                            }
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium text-slate-800">{st.name}</span>
                          <span className="text-slate-400">({st.className || 'N/A'})</span>
                        </div>
                        <span className="text-[11px] text-slate-400">Roll: {st.rollNumber || '—'}</span>
                      </label>
                    )
                  })}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                Create Parent
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Filter & Show Toolbar */}
            <div className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-slate-600">Filter:</span>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to filter..."
                    className="w-56 sm:w-64 pl-3 pr-8 py-1.5 text-xs rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2.5 py-1.5 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                    <th className="py-3 px-4 w-16">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        S/N
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-3 w-20 text-center">Photo</th>
                    <th className="py-3 px-4 min-w-[160px]">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Parent / Guardian
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 min-w-[190px]">
                      <button
                        type="button"
                        onClick={() => toggleSort('students')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Linked students
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 min-w-[180px]">
                      <button
                        type="button"
                        onClick={() => toggleSort('contact')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Contact
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 min-w-[120px]">
                      <button
                        type="button"
                        onClick={() => toggleSort('credit')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Family Credit
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 min-w-[210px]">
                      <button
                        type="button"
                        onClick={() => toggleSort('portal')}
                        className="inline-flex items-center gap-1 hover:text-slate-900"
                      >
                        Portal login
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </button>
                    </th>
                    <th className="py-3 px-4 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No parents or guardians match the current filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((parent, idx) => {
                      const serial = startIdx + idx + 1
                      const count = parent.linkedStudents.length
                      const previewNames = parent.linkedStudents.slice(0, 2)
                      const extraCount = Math.max(0, count - 2)
                      const hasCredit = Number(parent.familyCredit || 0) > 0
                      const hasEmail = Boolean(parent.email?.trim())
                      const hasPhone = Boolean(parent.phone?.trim())

                      return (
                        <tr key={parent.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* S/N */}
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{serial}</td>

                          {/* Photo */}
                          <td className="py-3.5 px-3 text-center">
                            {parent.photoUrl ? (
                              <img
                                src={parent.photoUrl}
                                alt={parent.name}
                                className="w-9 h-9 rounded-full object-cover mx-auto border border-slate-200"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center mx-auto shadow-sm">
                                <User className="w-5 h-5" />
                              </div>
                            )}
                          </td>

                          {/* Parent / Guardian */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => setEditParentModal({ ...parent })}
                              className="text-left group"
                            >
                              <div className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                                {parent.name}
                              </div>
                              <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600 border border-slate-200">
                                {parent.relation || 'Parent'}
                              </span>
                            </button>
                          </td>

                          {/* Linked students */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1.5">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  count > 0
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                {count} {count === 1 ? 'student' : 'students'}
                              </span>

                              {count > 0 && (
                                <div className="text-[11px] text-slate-600 leading-snug">
                                  {previewNames.map((st, sIdx) => (
                                    <React.Fragment key={st.id}>
                                      {sIdx > 0 && ', '}
                                      <button
                                        type="button"
                                        onClick={() => onOpenProfile?.(st.id)}
                                        className="hover:text-blue-600 hover:underline font-medium"
                                      >
                                        {st.name}
                                      </button>
                                    </React.Fragment>
                                  ))}
                                  {extraCount > 0 && (
                                    <span className="text-slate-400"> +{extraCount} more</span>
                                  )}
                                </div>
                              )}

                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setChildSearch('')
                                    setLinkChildParent(parent)
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-[11px] font-semibold transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add child
                                </button>
                              </div>
                            </div>
                          </td>

                          {/* Contact */}
                          <td className="py-3.5 px-4">
                            {hasPhone || hasEmail ? (
                              <div className="space-y-1 text-[11px] text-slate-600">
                                {hasPhone && (
                                  <div className="flex items-center gap-1.5">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="font-medium text-slate-700">{parent.phone}</span>
                                  </div>
                                )}
                                {hasEmail && (
                                  <div className="flex items-center gap-1.5">
                                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span className="truncate max-w-[180px]">{parent.email}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] italic text-slate-400">No phone or email</span>
                            )}
                          </td>

                          {/* Family Credit */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => {
                                setCreditAmountInput(String(parent.familyCredit || 0))
                                setCreditModalParent(parent)
                              }}
                              title="Click to adjust family credit"
                              className={`text-xs font-semibold hover:underline ${
                                hasCredit ? 'text-emerald-600' : 'text-slate-600'
                              }`}
                            >
                              PKR {Number(parent.familyCredit || 0).toLocaleString()}
                            </button>
                          </td>

                          {/* Portal login */}
                          <td className="py-3.5 px-4">
                            <div className="w-[190px] space-y-1">
                              <div className="grid grid-cols-2 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handlePortalDispatch(parent, 'welcome_sms')}
                                  className="px-2 py-0.5 rounded border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-[10px] font-semibold transition-colors"
                                >
                                  Welcome SMS
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handlePortalDispatch(parent, 'login_sms')}
                                  className="px-2 py-0.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-[10px] font-semibold transition-colors"
                                >
                                  Login SMS
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => handlePortalDispatch(parent, 'email')}
                                className={`w-full px-2 py-0.5 rounded border text-[10px] font-semibold transition-colors ${
                                  hasEmail
                                    ? 'border-cyan-200 bg-white hover:bg-cyan-50 text-cyan-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                Login Email
                              </button>
                              {parent.portalStatus && (
                                <div className="mt-1 px-2 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] leading-tight">
                                  <div className="flex items-center gap-1 font-semibold">
                                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                    {parent.portalStatus.label}
                                  </div>
                                  <div className="text-[9px] text-emerald-700 pl-4">
                                    {parent.portalStatus.timestamp}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 px-4 text-center relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setOpenMenuId((prev) => (prev === parent.id ? null : parent.id))
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded hover:bg-slate-100 text-slate-600 transition-colors"
                              aria-label="Row actions"
                            >
                              <Menu className="w-4 h-4" />
                              <ChevronDown className="w-3 h-3" />
                            </button>

                            {openMenuId === parent.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-6 top-11 z-30 w-44 bg-white rounded-lg border border-slate-200 shadow-lg py-1 text-left text-xs"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setEditParentModal({ ...parent })
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-slate-400" />
                                  Edit Parent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setChildSearch('')
                                    setLinkChildParent(parent)
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                >
                                  <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                                  Add / Link Child
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setCreditAmountInput(String(parent.familyCredit || 0))
                                    setCreditModalParent(parent)
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                                >
                                  <Wallet className="w-3.5 h-3.5 text-slate-400" />
                                  Adjust Family Credit
                                </button>
                                <div className="my-1 border-t border-slate-100" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null)
                                    setDeleteTarget(parent)
                                  }}
                                  className="w-full px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Parent
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing {showingFrom} to {showingTo} of {totalEntries} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-7 h-7 rounded flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {pageNumbers.map((pg, i) =>
                  pg === '...' ? (
                    <span key={`ellipsis_${i}`} className="px-1.5 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-colors ${
                        safePage === pg
                          ? 'bg-slate-800 text-white'
                          : 'border border-transparent text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {pg}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-7 h-7 rounded flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add / Link Child Modal */}
      {linkChildParent && (
        <Modal
          isOpen
          onClose={() => setLinkChildParent(null)}
          title={`Link Students — ${linkChildParent.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={childSearch}
                onChange={(e) => setChildSearch(e.target.value)}
                placeholder="Search student by name, roll no, or class..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {instStudents
                .filter((st) => {
                  const q = childSearch.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (st.name || '').toLowerCase().includes(q) ||
                    (st.rollNumber || '').toLowerCase().includes(q) ||
                    (st.className || '').toLowerCase().includes(q)
                  )
                })
                .slice(0, 40)
                .map((st) => {
                  const currentParentObj = parentsList.find((p) => p.id === linkChildParent.id) || linkChildParent
                  const isLinked = currentParentObj.linkedStudents.some((x) => x.id === st.id)
                  return (
                    <div key={st.id} className="px-3 py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-slate-800">{st.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {st.className || 'N/A'} • Roll: {st.rollNumber || '—'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleLinkStudent(currentParentObj, st)}
                        className={`px-3 py-1 rounded text-[11px] font-semibold border transition-colors ${
                          isLinked
                            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isLinked ? 'Unlink' : 'Link Child'}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Parent Modal */}
      {editParentModal && (
        <Modal
          isOpen
          onClose={() => setEditParentModal(null)}
          title="Edit Parent / Guardian"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSaveEditParent} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editParentModal.name}
                onChange={(e) => setEditParentModal((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Relation</label>
                <select
                  value={editParentModal.relation || 'Parent'}
                  onChange={(e) => setEditParentModal((p) => ({ ...p, relation: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Guardian">Guardian</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editParentModal.phone || ''}
                  onChange={(e) => setEditParentModal((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={editParentModal.email || ''}
                onChange={(e) => setEditParentModal((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">CNIC</label>
              <input
                type="text"
                value={editParentModal.cnic || ''}
                onChange={(e) => setEditParentModal((p) => ({ ...p, cnic: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={editParentModal.address || ''}
                onChange={(e) => setEditParentModal((p) => ({ ...p, address: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditParentModal(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Adjust Family Credit Modal */}
      {creditModalParent && (
        <Modal
          isOpen
          onClose={() => setCreditModalParent(null)}
          title={`Family Credit — ${creditModalParent.name}`}
          maxWidth="max-w-sm"
        >
          <form onSubmit={handleSaveCredit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Family Credit Balance (PKR)</label>
              <input
                type="number"
                min="0"
                required
                value={creditAmountInput}
                onChange={(e) => setCreditAmountInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setCreditModalParent(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Update Credit
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Delete Parent / Guardian"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              Are you sure you want to remove <strong className="text-slate-900">{deleteTarget.name}</strong> from
              Parents &amp; Guardians? Linked students will remain enrolled.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default ParentsGuardiansView
