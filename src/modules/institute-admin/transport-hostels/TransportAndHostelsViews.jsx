import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Bus,
  Plus,
  Edit3,
  Trash2,
  Home,
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Menu,
  Check,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const fmtPkrDec = (n) =>
  `PKR ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

export const TransportAndHostelsViews = ({
  mode = 'transport', // 'transport' | 'hostels'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const routesKey = `sms_campus_transport_routes_${instId}`
  const dormsKey = `sms_campus_hostel_dorms_${instId}`

  const [routes, setRoutes] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(routesKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [dorms, setDorms] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(dormsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem(routesKey) || '[]')
      setRoutes(Array.isArray(r) ? r : [])
    } catch {
      setRoutes([])
    }
    try {
      const d = JSON.parse(localStorage.getItem(dormsKey) || '[]')
      setDorms(Array.isArray(d) ? d : [])
    } catch {
      setDorms([])
    }
  }, [instId, routesKey, dormsKey])

  const persistRoutes = (next) => {
    setRoutes(next)
    try {
      localStorage.setItem(routesKey, JSON.stringify(next))
    } catch {}
  }

  const persistDorms = (next) => {
    setDorms(next)
    try {
      localStorage.setItem(dormsKey, JSON.stringify(next))
    } catch {}
  }

  // Transport Modal State
  const [routeModalOpen, setRouteModalOpen] = useState(false)
  const [editingRouteId, setEditingRouteId] = useState(null)
  const [routeForm, setRouteForm] = useState({
    name: '',
    description: '',
    driver: '',
    vehicle: '',
    suggestedFee: '1500',
    active: true
  })

  // Hostels State
  const [hostelTab, setHostelTab] = useState('all')
  const [dormSearch, setDormSearch] = useState('')
  const [tableFilter, setTableFilter] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('sn')
  const [sortDir, setSortDir] = useState('asc')
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [visibleCols, setVisibleCols] = useState({
    sn: true,
    name: true,
    description: true,
    students: true,
    action: true
  })
  const [openActionId, setOpenActionId] = useState(null)
  const [editingDormId, setEditingDormId] = useState(null)
  const [dormForm, setDormForm] = useState({ name: '', description: '' })
  const [managingDormId, setManagingDormId] = useState(null)
  const [assignStudentId, setAssignStudentId] = useState('')

  const visRef = useRef(null)
  const actionRef = useRef(null)
  useEffect(() => {
    const h = (e) => {
      if (visRef.current && !visRef.current.contains(e.target)) setVisibilityOpen(false)
      if (actionRef.current && !actionRef.current.contains(e.target)) setOpenActionId(null)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const campusStudents = useMemo(
    () => students.filter((s) => !s.instituteId || s.instituteId === instId),
    [students, instId]
  )

  // ==========================
  // RENDER: TRANSPORT ROUTES (Pick 3)
  // ==========================
  if (mode === 'transport') {
    const handleSaveRoute = (e) => {
      e.preventDefault()
      const cleanName = routeForm.name.trim()
      if (!cleanName) {
        toast.error('Route name is required.')
        return
      }
      const payload = {
        name: cleanName,
        description: routeForm.description.trim(),
        driver: routeForm.driver.trim(),
        vehicle: routeForm.vehicle.trim(),
        suggestedFee: Number(routeForm.suggestedFee || 0),
        active: Boolean(routeForm.active)
      }
      if (editingRouteId) {
        persistRoutes(routes.map((r) => (r.id === editingRouteId ? { ...r, ...payload } : r)))
        toast.success(`Updated route "${cleanName}".`)
      } else {
        persistRoutes([...routes, { id: `RT-${Date.now()}`, ...payload }])
        toast.success(`Added route "${cleanName}".`)
      }
      setRouteModalOpen(false)
      setEditingRouteId(null)
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Transport Routes"
          onBack={() => onRouteChange?.('inst-dashboard')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-sky-500 text-white flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Bus className="w-4 h-4" />
                <span>Institute transport routes</span>
              </div>
              <p className="text-[11px] text-sky-100 mt-0.5">
                Driver, vehicle, and route names for assigning students
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingRouteId(null)
                setRouteForm({
                  name: '',
                  description: '',
                  driver: '',
                  vehicle: '',
                  suggestedFee: '1500',
                  active: true
                })
                setRouteModalOpen(true)
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add route</span>
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Driver</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Suggested fee</th>
                  <th className="py-2.5 px-3">Active</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {routes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No transport routes configured yet. Click <strong>+ Add route</strong> to add one.
                    </td>
                  </tr>
                ) : (
                  routes.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{r.name}</div>
                        {r.description && (
                          <div className="text-[11px] text-slate-400">{r.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-700">{r.driver || '—'}</td>
                      <td className="py-3 px-3 text-slate-700">{r.vehicle || '—'}</td>
                      <td className="py-3 px-3 font-medium text-slate-800">
                        {fmtPkrDec(r.suggestedFee)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.active
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {r.active ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingRouteId(r.id)
                              setRouteForm({
                                name: r.name,
                                description: r.description || '',
                                driver: r.driver || '',
                                vehicle: r.vehicle || '',
                                suggestedFee: String(r.suggestedFee || 0),
                                active: Boolean(r.active)
                              })
                              setRouteModalOpen(true)
                            }}
                            className="p-1.5 rounded border border-sky-400 text-sky-600 hover:bg-sky-50 cursor-pointer"
                            title="Edit route"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              persistRoutes(routes.filter((x) => x.id !== r.id))
                              toast.success(`Deleted route "${r.name}".`)
                            }}
                            className="p-1.5 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Route Modal */}
        {routeModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveRoute}
              className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingRouteId ? 'Edit Transport Route' : 'Add Transport Route'}
                </h3>
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Route Name *</label>
                  <input
                    type="text"
                    value={routeForm.name}
                    onChange={(e) => setRouteForm((p) => ({ ...p, name: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={routeForm.description}
                    onChange={(e) => setRouteForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="e.g., Model Town - School"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Driver</label>
                    <input
                      type="text"
                      value={routeForm.driver}
                      onChange={(e) => setRouteForm((p) => ({ ...p, driver: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Vehicle</label>
                    <input
                      type="text"
                      value={routeForm.vehicle}
                      onChange={(e) => setRouteForm((p) => ({ ...p, vehicle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Suggested Fee (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={routeForm.suggestedFee}
                    onChange={(e) => setRouteForm((p) => ({ ...p, suggestedFee: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(routeForm.active)}
                    onChange={(e) => setRouteForm((p) => ({ ...p, active: e.target.checked }))}
                  />
                  <span className="font-semibold text-slate-700">Active route</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRouteModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
                >
                  Save Route
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: HOSTELS & DORMS (Picks 4-5)
  // ==========================
  const totalDormStudents = dorms.reduce(
    (s, d) => s + (Array.isArray(d.studentIds) ? d.studentIds.length : 0),
    0
  )

  const filteredDorms = useMemo(() => {
    const q1 = dormSearch.trim().toLowerCase()
    const q2 = tableFilter.trim().toLowerCase()
    const list = dorms
      .map((d, idx) => ({ ...d, _sn: idx + 1, _count: Array.isArray(d.studentIds) ? d.studentIds.length : 0 }))
      .filter((d) => {
        const hay = `${d.name} ${d.description || ''}`.toLowerCase()
        if (q1 && !hay.includes(q1)) return false
        if (q2 && !hay.includes(q2)) return false
        return true
      })
    return [...list].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'sn') cmp = a._sn - b._sn
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortBy === 'description') cmp = (a.description || '').localeCompare(b.description || '')
      else if (sortBy === 'students') cmp = a._count - b._count
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [dorms, dormSearch, tableFilter, sortBy, sortDir])

  const totalEntries = filteredDorms.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const paginatedDorms = filteredDorms.slice(pageStart, pageStart + pageSize)

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const handleSaveDorm = (e) => {
    e.preventDefault()
    const cleanName = dormForm.name.trim()
    if (!cleanName) {
      toast.error('Hostel/Dorm name is required.')
      return
    }
    if (editingDormId) {
      persistDorms(
        dorms.map((d) =>
          d.id === editingDormId
            ? { ...d, name: cleanName, description: dormForm.description.trim() }
            : d
        )
      )
      toast.success(`Updated "${cleanName}".`)
    } else {
      persistDorms([
        ...dorms,
        {
          id: `DRM-${Date.now()}`,
          name: cleanName,
          description: dormForm.description.trim(),
          studentIds: []
        }
      ])
      toast.success(`Created "${cleanName}".`)
    }
    setEditingDormId(null)
    setDormForm({ name: '', description: '' })
    setHostelTab('all')
  }

  const managingDorm = dorms.find((d) => d.id === managingDormId) || null

  return (
    <div className="space-y-4">
      <QuickHeader
        title="Hostels & Dorms"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      {/* 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-2xs space-y-1">
          <Home className="w-4 h-4 text-sky-500 mx-auto" />
          <div className="text-2xl font-extrabold text-sky-600">{dorms.length}</div>
          <div className="text-[11px] text-slate-500">Total Dormitories</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-2xs space-y-1">
          <Users className="w-4 h-4 text-teal-600 mx-auto" />
          <div className="text-2xl font-extrabold text-teal-600">{totalDormStudents}</div>
          <div className="text-[11px] text-slate-500">Students in Dorms</div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Manage Hostels &amp; Dormitories</h2>
        </div>

        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setHostelTab('all')}
            className={`px-3.5 py-2 text-xs font-semibold border-b-2 -mb-px cursor-pointer ${
              hostelTab === 'all'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Manage Hostels &amp; Dormitories
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingDormId(null)
              setDormForm({ name: '', description: '' })
              setHostelTab('create')
            }}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
              hostelTab === 'create'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingDormId ? 'Edit Hostel/Dorm' : 'Create New Hostel/Dorm'}</span>
          </button>
        </div>

        {hostelTab === 'all' ? (
          <div className="p-5 space-y-4">
            <input
              type="text"
              value={dormSearch}
              onChange={(e) => {
                setDormSearch(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search by dorm name or description..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-200 text-xs"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Filter:</span>
                <div className="relative">
                  <input
                    type="text"
                    value={tableFilter}
                    onChange={(e) => {
                      setTableFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Type to filter..."
                    className="w-48 pl-3 pr-7 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    {[10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={async () => {
                      const lines = [
                        ['S/N', 'Name', 'Description', 'Students'].join('\t'),
                        ...filteredDorms.map((d, i) => [i + 1, d.name, d.description || '-', d._count].join('\t'))
                      ].join('\n')
                      try {
                        await navigator.clipboard.writeText(lines)
                        toast.success('Copied dormitories to clipboard.')
                      } catch {}
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
                      const csv = [
                        ['S/N', 'Name', 'Description', 'Students'].map(esc).join(','),
                        ...filteredDorms.map((d, i) =>
                          [i + 1, d.name, d.description || '-', d._count].map(esc).join(',')
                        )
                      ].join('\n')
                      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url
                      a.download = `hostels-${instId}.csv`
                      a.click()
                      URL.revokeObjectURL(url)
                      toast.success('Exported to Excel (CSV).')
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      downloadSimplePdf({
                        title: `${instName} — Hostels & Dormitories`,
                        subtitle: `Total Dorms: ${dorms.length} | Students: ${totalDormStudents}`,
                        columns: ['S/N', 'Name', 'Description', 'Students'],
                        rows: filteredDorms.map((d, i) => [
                          String(i + 1),
                          d.name,
                          d.description || '-',
                          `${d._count} Students`
                        ]),
                        filename: `hostels-${instId}.pdf`
                      })
                      toast.success('Exported to PDF.')
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    PDF
                  </button>
                  <div className="relative" ref={visRef}>
                    <button
                      type="button"
                      onClick={() => setVisibilityOpen((o) => !o)}
                      className="px-3 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white inline-flex items-center gap-1 rounded-r-lg cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5" />
                      <span>Visibility</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {visibilityOpen && (
                      <div className="absolute right-0 mt-1.5 w-40 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                        {[
                          { key: 'sn', label: 'S/N' },
                          { key: 'name', label: 'Name' },
                          { key: 'description', label: 'Description' },
                          { key: 'students', label: 'Students' },
                          { key: 'action', label: 'Action' }
                        ].map((col) => (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() =>
                              setVisibleCols((p) => ({ ...p, [col.key]: !p[col.key] }))
                            }
                            className="w-full px-3 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                          >
                            <span>{col.label}</span>
                            {visibleCols[col.key] && <Check className="w-3.5 h-3.5 text-sky-600" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700">
                    {visibleCols.sn && (
                      <th className="py-2.5 px-3 w-20">
                        <button
                          type="button"
                          onClick={() => toggleSort('sn')}
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>S/N</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                    )}
                    {visibleCols.name && (
                      <th className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('name')}
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Name</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                    )}
                    {visibleCols.description && (
                      <th className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('description')}
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Description</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                    )}
                    {visibleCols.students && (
                      <th className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={() => toggleSort('students')}
                          className="inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Students</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                    )}
                    {visibleCols.action && <th className="py-2.5 px-3 text-center">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedDorms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400">
                        No hostels or dormitories found.
                      </td>
                    </tr>
                  ) : (
                    paginatedDorms.map((d, idx) => (
                      <tr key={d.id} className="hover:bg-slate-50/70">
                        {visibleCols.sn && (
                          <td className="py-3 px-3 text-slate-500">{pageStart + idx + 1}</td>
                        )}
                        {visibleCols.name && (
                          <td className="py-3 px-3 font-semibold text-slate-900">{d.name}</td>
                        )}
                        {visibleCols.description && (
                          <td className="py-3 px-3 text-slate-600">{d.description || '-'}</td>
                        )}
                        {visibleCols.students && (
                          <td className="py-3 px-3">
                            <button
                              type="button"
                              onClick={() => setManagingDormId(d.id)}
                              className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold cursor-pointer"
                            >
                              {d._count} Students
                            </button>
                          </td>
                        )}
                        {visibleCols.action && (
                          <td className="py-3 px-3 text-center">
                            <div
                              className="relative inline-block"
                              ref={openActionId === d.id ? actionRef : null}
                            >
                              <button
                                type="button"
                                onClick={() => setOpenActionId((p) => (p === d.id ? null : d.id))}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openActionId === d.id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null)
                                      setManagingDormId(d.id)
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Users className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Manage Students</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null)
                                      setEditingDormId(d.id)
                                      setDormForm({ name: d.name, description: d.description || '' })
                                      setHostelTab('create')
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null)
                                      persistDorms(dorms.filter((x) => x.id !== d.id))
                                      toast.success(`Deleted "${d.name}".`)
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
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

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 text-xs text-slate-500">
              <span>
                Showing {totalEntries === 0 ? 0 : pageStart + 1} to{' '}
                {Math.min(pageStart + pageSize, totalEntries)} of {totalEntries} entries
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer ${
                      page === safePage
                        ? 'bg-slate-700 text-white'
                        : 'border border-slate-200 text-slate-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveDorm} className="p-6 max-w-lg space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Hostel / Dormitory Name *
              </label>
              <input
                type="text"
                value={dormForm.name}
                onChange={(e) => setDormForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Description</label>
              <input
                type="text"
                value={dormForm.description}
                onChange={(e) => setDormForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
              >
                {editingDormId ? 'Update Hostel/Dorm' : 'Save Hostel/Dorm'}
              </button>
              <button
                type="button"
                onClick={() => setHostelTab('all')}
                className="px-4 py-2 rounded-lg border border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Manage Dorm Students Modal */}
      {managingDorm && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {managingDorm.name} — Assigned Students
              </h3>
              <button
                type="button"
                onClick={() => setManagingDormId(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={assignStudentId}
                onChange={(e) => setAssignStudentId(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="">Select student to assign...</option>
                {campusStudents
                  .filter((s) => !(managingDorm.studentIds || []).includes(s.id))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.admissionNo || s.id})
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (!assignStudentId) return
                  persistDorms(
                    dorms.map((d) =>
                      d.id === managingDorm.id
                        ? { ...d, studentIds: [...(d.studentIds || []), assignStudentId] }
                        : d
                    )
                  )
                  setAssignStudentId('')
                  toast.success('Student assigned to dormitory.')
                }}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
              >
                Assign
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto divide-y divide-slate-100">
              {(managingDorm.studentIds || []).length === 0 ? (
                <p className="py-6 text-center text-slate-400">No students assigned yet.</p>
              ) : (
                (managingDorm.studentIds || []).map((sid) => {
                  const st = campusStudents.find((s) => s.id === sid)
                  return (
                    <div key={sid} className="py-2 flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{st?.name || sid}</span>
                      <button
                        type="button"
                        onClick={() =>
                          persistDorms(
                            dorms.map((d) =>
                              d.id === managingDorm.id
                                ? {
                                    ...d,
                                    studentIds: (d.studentIds || []).filter((x) => x !== sid)
                                  }
                                : d
                            )
                          )
                        }
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransportAndHostelsViews
