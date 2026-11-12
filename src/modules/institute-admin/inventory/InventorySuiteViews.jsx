import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  List,
  Plus,
  Search,
  Menu,
  ChevronDown,
  Edit3,
  Trash2,
  Filter,
  RotateCcw,
  AlertTriangle,
  Percent,
  CheckCircle2,
  Printer,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const fmtPkrDec = (n) =>
  `PKR ${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const DEFAULT_CATEGORIES = [
  { id: 'cat-math', name: 'MATH', description: 'NOTE BOOK' },
  { id: 'cat-diary', name: 'SCHOOL DIARY', description: 'SCHOOL DIARY' },
  { id: 'cat-uniform', name: 'UNIFORM', description: 'SCHOOL TIE' }
]

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

export const InventorySuiteViews = ({
  mode = 'items', // 'categories' | 'items' | 'receive' | 'issue'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { students = [], classes = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const catKey = `sms_campus_inv_categories_${instId}`
  const itemsKey = `sms_campus_inv_items_${instId}`
  const receivesKey = `sms_campus_inv_receives_${instId}`
  const issuesKey = `sms_campus_inv_issues_${instId}`

  const [categories, setCategories] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(catKey) || 'null')
      if (Array.isArray(saved) && saved.length > 0) return saved
    } catch {}
    return DEFAULT_CATEGORIES
  })

  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(itemsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [receives, setReceives] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(receivesKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [issues, setIssues] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(issuesKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem(catKey) || 'null')
      setCategories(Array.isArray(c) && c.length > 0 ? c : DEFAULT_CATEGORIES)
    } catch {
      setCategories(DEFAULT_CATEGORIES)
    }
    try {
      const it = JSON.parse(localStorage.getItem(itemsKey) || '[]')
      setItems(Array.isArray(it) ? it : [])
    } catch {
      setItems([])
    }
    try {
      const r = JSON.parse(localStorage.getItem(receivesKey) || '[]')
      setReceives(Array.isArray(r) ? r : [])
    } catch {
      setReceives([])
    }
    try {
      const iss = JSON.parse(localStorage.getItem(issuesKey) || '[]')
      setIssues(Array.isArray(iss) ? iss : [])
    } catch {
      setIssues([])
    }
  }, [instId, catKey, itemsKey, receivesKey, issuesKey])

  const persistCategories = (next) => {
    setCategories(next)
    try {
      localStorage.setItem(catKey, JSON.stringify(next))
    } catch {}
  }

  const persistItems = (next) => {
    setItems(next)
    try {
      localStorage.setItem(itemsKey, JSON.stringify(next))
    } catch {}
  }

  const persistReceives = (next) => {
    setReceives(next)
    try {
      localStorage.setItem(receivesKey, JSON.stringify(next))
    } catch {}
  }

  const persistIssues = (next) => {
    setIssues(next)
    try {
      localStorage.setItem(issuesKey, JSON.stringify(next))
    } catch {}
  }

  // ==========================
  // CATEGORIES STATE (Pick 1)
  // ==========================
  const [catTab, setCatTab] = useState('all')
  const [catQuery, setCatQuery] = useState('')
  const [appliedCatQuery, setAppliedCatQuery] = useState('')
  const [editingCatId, setEditingCatId] = useState(null)
  const [catForm, setCatForm] = useState({ name: '', description: '' })
  const [catMenuId, setCatMenuId] = useState(null)

  // ==========================
  // ITEMS STATE (Pick 2)
  // ==========================
  const [itemTab, setItemTab] = useState('all')
  const [itemQuery, setItemQuery] = useState('')
  const [appliedItemQuery, setAppliedItemQuery] = useState('')
  const [editingItemId, setEditingItemId] = useState(null)
  const [itemForm, setItemForm] = useState({
    name: '',
    category: '',
    unit: 'Piece',
    costPrice: '0',
    salePrice: '0',
    quantity: '0',
    description: ''
  })
  const [itemMenuId, setItemMenuId] = useState(null)

  // ==========================
  // RECEIVE STOCK STATE (Pick 3)
  // ==========================
  const [recTab, setRecTab] = useState('all')
  const [recQuery, setRecQuery] = useState('')
  const [appliedRecQuery, setAppliedRecQuery] = useState('')
  const [recForm, setRecForm] = useState({
    itemId: '',
    quantity: '10',
    date: new Date().toISOString().slice(0, 10),
    note: ''
  })

  // ==========================
  // ISSUE TO STUDENTS STATE (Picks 4-7)
  // ==========================
  const [issueTab, setIssueTab] = useState('all')
  const [issueFilters, setIssueFilters] = useState({
    from: '',
    to: '',
    search: '',
    classId: 'all',
    studentId: 'all',
    itemId: 'all',
    status: 'all'
  })
  const [appliedIssueFilters, setAppliedIssueFilters] = useState({
    from: '',
    to: '',
    search: '',
    classId: 'all',
    studentId: 'all',
    itemId: 'all',
    status: 'all'
  })
  const [editingIssueId, setEditingIssueId] = useState(null)
  const [issueForm, setIssueForm] = useState({
    classId: 'all',
    studentId: '',
    itemId: '',
    quantity: '1',
    discount: '0',
    date: new Date().toISOString().slice(0, 10),
    status: 'Paid'
  })
  const [viewingReceipt, setViewingReceipt] = useState(null)

  const menuRef = useRef(null)
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setCatMenuId(null)
        setItemMenuId(null)
      }
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const campusClasses = useMemo(
    () => classes.filter((c) => !c.instituteId || c.instituteId === instId),
    [classes, instId]
  )
  const campusStudents = useMemo(
    () => students.filter((s) => !s.instituteId || s.instituteId === instId),
    [students, instId]
  )

  // ==========================
  // RENDER: CATEGORIES (Pick 1)
  // ==========================
  if (mode === 'categories') {
    const filteredCats = categories.filter((c) => {
      const q = appliedCatQuery.trim().toLowerCase()
      if (!q) return true
      return (
        c.name.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
      )
    })

    const handleSaveCat = (e) => {
      e.preventDefault()
      const cleanName = catForm.name.trim()
      if (!cleanName) {
        toast.error('Category name is required.')
        return
      }
      if (editingCatId) {
        persistCategories(
          categories.map((c) =>
            c.id === editingCatId
              ? { ...c, name: cleanName, description: catForm.description.trim() }
              : c
          )
        )
        toast.success(`Category "${cleanName}" updated.`)
      } else {
        persistCategories([
          ...categories,
          { id: `cat-${Date.now()}`, name: cleanName, description: catForm.description.trim() }
        ])
        toast.success(`Category "${cleanName}" added.`)
      }
      setEditingCatId(null)
      setCatForm({ name: '', description: '' })
      setCatTab('all')
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Inventory Categories"
          onBack={() => onRouteChange?.('inst-inventory')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
          <div className="px-5 py-3.5 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Inventory Categories</h2>
          </div>

          <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setCatTab('all')}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                catTab === 'all'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Categories</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingCatId(null)
                setCatForm({ name: '', description: '' })
                setCatTab('create')
              }}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                catTab === 'create'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingCatId ? 'Edit Category' : 'Add Category'}</span>
            </button>
          </div>

          {catTab === 'all' ? (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-xs font-medium text-slate-600">Quick search</span>
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catQuery}
                    onChange={(e) => setCatQuery(e.target.value)}
                    placeholder="Category name or description..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedCatQuery(catQuery)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Search</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-3 w-16">S/N</th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Items Count</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredCats.map((c, idx) => {
                      const count = items.filter((it) => it.category === c.name).length
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{c.name}</td>
                          <td className="py-3 px-3 text-slate-600">{c.description || '—'}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold">
                              {count}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div
                              className="relative inline-block"
                              ref={catMenuId === c.id ? menuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() => setCatMenuId((p) => (p === c.id ? null : c.id))}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {catMenuId === c.id && (
                                <div className="absolute right-0 mt-1 w-32 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCatMenuId(null)
                                      setEditingCatId(c.id)
                                      setCatForm({ name: c.name, description: c.description || '' })
                                      setCatTab('create')
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCatMenuId(null)
                                      persistCategories(categories.filter((x) => x.id !== c.id))
                                      toast.success(`Deleted "${c.name}".`)
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
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveCat} className="p-6 max-w-lg space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={catForm.name}
                  onChange={(e) => setCatForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Description</label>
                <input
                  type="text"
                  value={catForm.description}
                  onChange={(e) => setCatForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
                >
                  {editingCatId ? 'Update Category' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setCatTab('all')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: RECEIVE STOCK (Pick 3)
  // ==========================
  if (mode === 'receive') {
    const filteredReceives = receives.filter((r) => {
      const q = appliedRecQuery.trim().toLowerCase()
      if (!q) return true
      return `${r.itemName} ${r.category} ${r.note} ${r.addedBy}`.toLowerCase().includes(q)
    })

    const handleReceiveSubmit = (e) => {
      e.preventDefault()
      const item = items.find((it) => it.id === recForm.itemId)
      if (!item) {
        toast.error('Please select an inventory item.')
        return
      }
      const qty = Number(recForm.quantity || 0)
      if (qty <= 0) {
        toast.error('Quantity must be greater than 0.')
        return
      }
      persistItems(
        items.map((it) =>
          it.id === item.id ? { ...it, quantity: Number(it.quantity || 0) + qty } : it
        )
      )
      persistReceives([
        {
          id: `REC-${Date.now()}`,
          itemId: item.id,
          itemName: item.name,
          category: item.category,
          quantity: qty,
          date: recForm.date,
          addedBy: 'Admin',
          note: recForm.note.trim() || 'N/A'
        },
        ...receives
      ])
      toast.success(`Received +${qty} ${item.name}.`)
      setRecTab('all')
      setRecForm({ itemId: '', quantity: '10', date: new Date().toISOString().slice(0, 10), note: '' })
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Receive Stock"
          onBack={() => onRouteChange?.('inst-inventory')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Receive Inventory</h2>
            <button
              type="button"
              onClick={() => setRecTab('create')}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Receive Inventory</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setRecTab('all')}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                recTab === 'all'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Transactions</span>
            </button>
            <button
              type="button"
              onClick={() => setRecTab('create')}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                recTab === 'create'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Receive Inventory</span>
            </button>
          </div>

          {recTab === 'all' ? (
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
                <span className="text-xs font-medium text-slate-600">Quick search</span>
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recQuery}
                    onChange={(e) => setRecQuery(e.target.value)}
                    placeholder="Item, category, note, added by..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setAppliedRecQuery(recQuery)}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Filter className="w-3 h-3" />
                  <span>Search</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-3 w-14">S/N</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Added By</th>
                      <th className="py-2.5 px-3">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredReceives.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400">
                          No stock receipt transactions yet.
                        </td>
                      </tr>
                    ) : (
                      filteredReceives.map((r, idx) => (
                        <tr key={r.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{r.itemName}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold">
                              {r.category}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                              +{r.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{formatDisplayDate(r.date)}</td>
                          <td className="py-3 px-3 text-slate-700">{r.addedBy}</td>
                          <td className="py-3 px-3 text-slate-500">{r.note}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReceiveSubmit} className="p-6 max-w-lg space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Item <span className="text-rose-500">*</span>
                </label>
                <select
                  value={recForm.itemId}
                  onChange={(e) => setRecForm((p) => ({ ...p, itemId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select Item...</option>
                  {items.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.name} ({it.category}) — Current: {it.quantity}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={recForm.quantity}
                    onChange={(e) => setRecForm((p) => ({ ...p, quantity: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={recForm.date}
                    onChange={(e) => setRecForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Note</label>
                <input
                  type="text"
                  value={recForm.note}
                  onChange={(e) => setRecForm((p) => ({ ...p, note: e.target.value }))}
                  placeholder="Supplier or batch note"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
                >
                  Save Stock Receipt
                </button>
                <button
                  type="button"
                  onClick={() => setRecTab('all')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: ISSUE TO STUDENTS (Picks 4-7)
  // ==========================
  if (mode === 'issue') {
    const filteredIssues = issues.filter((iss) => {
      if (appliedIssueFilters.from && iss.date < appliedIssueFilters.from) return false
      if (appliedIssueFilters.to && iss.date > appliedIssueFilters.to) return false
      if (appliedIssueFilters.classId !== 'all' && iss.classId !== appliedIssueFilters.classId) {
        return false
      }
      if (appliedIssueFilters.studentId !== 'all' && iss.studentId !== appliedIssueFilters.studentId) {
        return false
      }
      if (appliedIssueFilters.itemId !== 'all' && iss.itemId !== appliedIssueFilters.itemId) {
        return false
      }
      if (appliedIssueFilters.status !== 'all' && iss.status !== appliedIssueFilters.status) {
        return false
      }
      if (appliedIssueFilters.search.trim()) {
        const q = appliedIssueFilters.search.trim().toLowerCase()
        const hay = `${iss.studentName} ${iss.fatherName} ${iss.rollNo} ${iss.admissionNo} ${iss.className} ${iss.itemName}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })

    const issueStats = {
      totalBilled: filteredIssues.reduce((s, i) => s + Number(i.amountDue || 0), 0),
      count: filteredIssues.length,
      cashCollected: filteredIssues
        .filter((i) => i.status === 'Paid')
        .reduce((s, i) => s + Number(i.amountDue || 0), 0),
      paidCount: filteredIssues.filter((i) => i.status === 'Paid').length,
      outstanding: filteredIssues
        .filter((i) => i.status !== 'Paid')
        .reduce((s, i) => s + Number(i.amountDue || 0), 0),
      unpaidCount: filteredIssues.filter((i) => i.status !== 'Paid').length,
      waivers: filteredIssues.reduce((s, i) => s + Number(i.discount || 0), 0),
      waiverCount: filteredIssues.filter((i) => Number(i.discount || 0) > 0).length
    }

    const studentsInFilterClass =
      issueFilters.classId === 'all'
        ? []
        : campusStudents.filter((s) => s.classId === issueFilters.classId)

    const studentsInFormClass =
      issueForm.classId === 'all'
        ? campusStudents
        : campusStudents.filter((s) => s.classId === issueForm.classId)

    const handleSaveIssue = (e) => {
      e.preventDefault()
      const st = campusStudents.find((s) => s.id === issueForm.studentId)
      const item = items.find((it) => it.id === issueForm.itemId)
      if (!st || !item) {
        toast.error('Select a student and an item.')
        return
      }
      const qty = Math.max(1, Number(issueForm.quantity || 1))
      const unitPrice = Number(item.salePrice || 0)
      const discount = Math.max(0, Number(issueForm.discount || 0))
      const amountDue = Math.max(0, qty * unitPrice - discount)
      const cls = campusClasses.find((c) => c.id === st.classId)

      if (editingIssueId) {
        persistIssues(
          issues.map((x) =>
            x.id === editingIssueId
              ? {
                  ...x,
                  studentId: st.id,
                  studentName: st.name,
                  fatherName: st.fatherName || '',
                  rollNo: st.rollNo || st.roll || '',
                  admissionNo: st.admissionNo || st.id,
                  classId: st.classId || '',
                  className: cls?.name || st.className || 'Class',
                  itemId: item.id,
                  itemName: item.name,
                  category: item.category,
                  quantity: qty,
                  unitPrice,
                  discount,
                  amountDue,
                  date: issueForm.date,
                  status: issueForm.status
                }
              : x
          )
        )
        toast.success('Updated inventory issue.')
      } else {
        if (Number(item.quantity || 0) < qty) {
          toast.error(`Only ${item.quantity} ${item.name} in stock.`)
          return
        }
        persistItems(
          items.map((it) =>
            it.id === item.id ? { ...it, quantity: Number(it.quantity || 0) - qty } : it
          )
        )
        persistIssues([
          {
            id: `ISS-${Date.now()}`,
            studentId: st.id,
            studentName: st.name,
            fatherName: st.fatherName || '',
            rollNo: st.rollNo || st.roll || '—',
            admissionNo: st.admissionNo || st.id,
            classId: st.classId || '',
            className: cls?.name || st.className || 'Class',
            itemId: item.id,
            itemName: item.name,
            category: item.category,
            quantity: qty,
            unitPrice,
            discount,
            amountDue,
            date: issueForm.date,
            status: issueForm.status
          },
          ...issues
        ])
        toast.success(`Issued ${qty} x ${item.name} to ${st.name}.`)
      }
      setEditingIssueId(null)
      setIssueTab('all')
    }

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Issue Inventory to Students"
          onBack={() => onRouteChange?.('inst-inventory')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">TOTAL BILLED</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {fmtPkr(issueStats.totalBilled)}
              </p>
              <p className="text-[10px] text-slate-400">{issueStats.count} issues in view</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">CASH COLLECTED</p>
              <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                {fmtPkr(issueStats.cashCollected)}
              </p>
              <p className="text-[10px] text-slate-400">
                {issueStats.paidCount} fully paid · excludes waivers
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">OUTSTANDING</p>
              <p className="text-lg font-extrabold text-rose-600 mt-0.5">
                {fmtPkr(issueStats.outstanding)}
              </p>
              <p className="text-[10px] text-slate-400">
                {issueStats.unpaidCount} with balance due
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-400">WAIVERS / DISCOUNTS</p>
              <p className="text-lg font-extrabold text-cyan-600 mt-0.5">
                {fmtPkr(issueStats.waivers)}
              </p>
              <p className="text-[10px] text-slate-400">
                {issueStats.waiverCount} lines with a discount
              </p>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Issue Inventory to Students</h2>
            <button
              type="button"
              onClick={() => {
                setEditingIssueId(null)
                setIssueTab('create')
              }}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Issue Inventory</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setIssueTab('all')}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                issueTab === 'all'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Issues</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingIssueId(null)
                setIssueTab('create')
              }}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                issueTab === 'create'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingIssueId ? 'Edit Issue' : 'Issue Inventory'}</span>
            </button>
          </div>

          {issueTab === 'all' ? (
            <div className="p-5 space-y-4">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 items-end">
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    FROM
                  </label>
                  <input
                    type="date"
                    value={issueFilters.from}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, from: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    TO
                  </label>
                  <input
                    type="date"
                    value={issueFilters.to}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, to: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    SEARCH
                  </label>
                  <input
                    type="text"
                    value={issueFilters.search}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, search: e.target.value }))}
                    placeholder="Student / class / item / #"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    CLASS
                  </label>
                  <select
                    value={issueFilters.classId}
                    onChange={(e) =>
                      setIssueFilters((p) => ({ ...p, classId: e.target.value, studentId: 'all' }))
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="all">All Classes</option>
                    {campusClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    STUDENT
                  </label>
                  <select
                    value={issueFilters.studentId}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, studentId: e.target.value }))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="all">
                      {issueFilters.classId === 'all' ? 'Select class first' : 'All Students'}
                    </option>
                    {studentsInFilterClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    ITEM
                  </label>
                  <select
                    value={issueFilters.itemId}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, itemId: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="all">All Items</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="lg:col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    STATUS
                  </label>
                  <select
                    value={issueFilters.status}
                    onChange={(e) => setIssueFilters((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="all">All</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
                <div className="lg:col-span-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAppliedIssueFilters({ ...issueFilters })}
                    className="flex-1 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const empty = {
                        from: '',
                        to: '',
                        search: '',
                        classId: 'all',
                        studentId: 'all',
                        itemId: 'all',
                        status: 'all'
                      }
                      setIssueFilters(empty)
                      setAppliedIssueFilters(empty)
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Issues Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-3 w-12">S/N</th>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Quantity</th>
                      <th className="py-2.5 px-3">Unit Price</th>
                      <th className="py-2.5 px-3">Amount Due</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredIssues.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-10 text-center text-slate-400">
                          No inventory issues found. Click{' '}
                          <button
                            type="button"
                            onClick={() => setIssueTab('create')}
                            className="text-sky-600 font-semibold hover:underline cursor-pointer"
                          >
                            + Issue Inventory
                          </button>{' '}
                          to record one.
                        </td>
                      </tr>
                    ) : (
                      filteredIssues.map((iss, idx) => (
                        <tr key={iss.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{iss.studentName}</div>
                            {iss.fatherName && (
                              <div className="text-[10px] text-slate-400">{iss.fatherName}</div>
                            )}
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                Roll No: {iss.rollNo || '—'}
                              </span>
                              <span className="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold">
                                Ad No: {iss.admissionNo}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {iss.className}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-medium text-slate-800">{iss.itemName}</div>
                            <div className="text-[10px] text-slate-400 uppercase">
                              {iss.category}
                            </div>
                          </td>
                          <td className="py-3 px-3">{iss.quantity}</td>
                          <td className="py-3 px-3">{fmtPkrDec(iss.unitPrice)}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">
                            {fmtPkrDec(iss.amountDue)}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            {formatDisplayDate(iss.date)}
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                iss.status === 'Paid'
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-orange-500 text-white'
                              }`}
                            >
                              {iss.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            {iss.status === 'Paid' ? (
                              <button
                                type="button"
                                onClick={() => setViewingReceipt(iss)}
                                className="px-4 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <Receipt className="w-3 h-3" />
                                <span>Receipt</span>
                              </button>
                            ) : (
                              <div className="grid grid-cols-2 gap-1 max-w-[140px] mx-auto">
                                <button
                                  type="button"
                                  onClick={() => setViewingReceipt(iss)}
                                  className="px-2 py-1 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-[10px] font-semibold cursor-pointer"
                                >
                                  Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistIssues(
                                      issues.map((x) =>
                                        x.id === iss.id ? { ...x, status: 'Paid' } : x
                                      )
                                    )
                                    toast.success(`Marked ${iss.studentName}'s issue as Paid.`)
                                  }}
                                  className="px-2 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-semibold cursor-pointer"
                                >
                                  Pay
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingIssueId(iss.id)
                                    setIssueForm({
                                      classId: iss.classId || 'all',
                                      studentId: iss.studentId,
                                      itemId: iss.itemId,
                                      quantity: String(iss.quantity),
                                      discount: String(iss.discount || 0),
                                      date: iss.date,
                                      status: iss.status
                                    })
                                    setIssueTab('create')
                                  }}
                                  className="px-2 py-1 rounded bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-semibold cursor-pointer"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    persistIssues(issues.filter((x) => x.id !== iss.id))
                                    toast.success('Deleted inventory issue.')
                                  }}
                                  className="px-2 py-1 rounded bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-semibold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveIssue} className="p-6 max-w-xl space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Class</label>
                  <select
                    value={issueForm.classId}
                    onChange={(e) =>
                      setIssueForm((p) => ({ ...p, classId: e.target.value, studentId: '' }))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="all">All Classes</option>
                    {campusClasses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Student *</label>
                  <select
                    value={issueForm.studentId}
                    onChange={(e) => setIssueForm((p) => ({ ...p, studentId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select Student...</option>
                    {studentsInFormClass.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.admissionNo || s.rollNo || s.id})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Item *</label>
                  <select
                    value={issueForm.itemId}
                    onChange={(e) => setIssueForm((p) => ({ ...p, itemId: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="">Select Item...</option>
                    {items.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.name} — {fmtPkrDec(it.salePrice)} (Stock: {it.quantity})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    value={issueForm.quantity}
                    onChange={(e) => setIssueForm((p) => ({ ...p, quantity: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">
                    Discount / Waiver (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={issueForm.discount}
                    onChange={(e) => setIssueForm((p) => ({ ...p, discount: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={issueForm.date}
                    onChange={(e) => setIssueForm((p) => ({ ...p, date: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={issueForm.status}
                    onChange={(e) => setIssueForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
                >
                  {editingIssueId ? 'Update Issue' : 'Save & Issue'}
                </button>
                <button
                  type="button"
                  onClick={() => setIssueTab('all')}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Receipt Modal */}
        {viewingReceipt && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Inventory Issue Receipt</h3>
                  <p className="text-[11px] text-slate-500">
                    {instName} • {viewingReceipt.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student</span>
                  <span className="font-semibold text-slate-900">{viewingReceipt.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Item</span>
                  <span className="font-semibold">
                    {viewingReceipt.itemName} × {viewingReceipt.quantity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Amount Due</span>
                  <span className="font-bold text-slate-900">
                    {fmtPkrDec(viewingReceipt.amountDue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold">{viewingReceipt.status}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadSimplePdf({
                      title: `${instName} — Inventory Issue Receipt`,
                      subtitle: `Receipt: ${viewingReceipt.id} | Date: ${formatDisplayDate(viewingReceipt.date)}`,
                      columns: ['Field', 'Value'],
                      rows: [
                        ['Student', viewingReceipt.studentName],
                        ['Item', `${viewingReceipt.itemName} x ${viewingReceipt.quantity}`],
                        ['Amount Due', fmtPkrDec(viewingReceipt.amountDue)],
                        ['Status', viewingReceipt.status]
                      ],
                      filename: `inventory-receipt-${viewingReceipt.id}.pdf`
                    })
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingReceipt(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: INVENTORY ITEMS (Pick 2)
  // ==========================
  const filteredItems = items.filter((it) => {
    const q = appliedItemQuery.trim().toLowerCase()
    if (!q) return true
    return `${it.name} ${it.category} ${it.unit} ${it.description || ''}`
      .toLowerCase()
      .includes(q)
  })

  const handleSaveItem = (e) => {
    e.preventDefault()
    const cleanName = itemForm.name.trim()
    if (!cleanName) {
      toast.error('Item name is required.')
      return
    }
    const payload = {
      name: cleanName,
      category: itemForm.category || categories[0]?.name || 'GENERAL',
      unit: itemForm.unit || 'Piece',
      costPrice: Number(itemForm.costPrice || 0),
      salePrice: Number(itemForm.salePrice || 0),
      quantity: Number(itemForm.quantity || 0),
      description: itemForm.description.trim()
    }
    if (editingItemId) {
      persistItems(items.map((it) => (it.id === editingItemId ? { ...it, ...payload } : it)))
      toast.success(`Updated item "${cleanName}".`)
    } else {
      persistItems([...items, { id: `ITM-${Date.now()}`, ...payload }])
      toast.success(`Added item "${cleanName}".`)
    }
    setEditingItemId(null)
    setItemForm({
      name: '',
      category: categories[0]?.name || '',
      unit: 'Piece',
      costPrice: '0',
      salePrice: '0',
      quantity: '0',
      description: ''
    })
    setItemTab('all')
  }

  return (
    <div className="space-y-4">
      <QuickHeader
        title="Inventory Items"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Inventory Items</h2>
        </div>

        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setItemTab('all')}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
              itemTab === 'all'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>All Items</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingItemId(null)
              setItemForm({
                name: '',
                category: categories[0]?.name || '',
                unit: 'Piece',
                costPrice: '0',
                salePrice: '0',
                quantity: '0',
                description: ''
              })
              setItemTab('create')
            }}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
              itemTab === 'create'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingItemId ? 'Edit Item' : 'Add Item'}</span>
          </button>
        </div>

        {itemTab === 'all' ? (
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <span className="text-xs font-medium text-slate-600">Quick search</span>
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={itemQuery}
                  onChange={(e) => setItemQuery(e.target.value)}
                  placeholder="Name, category, unit, description..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <button
                type="button"
                onClick={() => setAppliedItemQuery(itemQuery)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Filter className="w-3 h-3" />
                <span>Search</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3 w-14">S/N</th>
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Cost Price</th>
                    <th className="py-2.5 px-3">Sale Price</th>
                    <th className="py-2.5 px-3">Current Quantity</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-slate-400">
                        No inventory items added yet. Click{' '}
                        <button
                          type="button"
                          onClick={() => setItemTab('create')}
                          className="text-sky-600 font-semibold hover:underline cursor-pointer"
                        >
                          + Add Item
                        </button>{' '}
                        to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((it, idx) => {
                      const inStock = Number(it.quantity || 0) > 0
                      return (
                        <tr key={it.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{it.name}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-cyan-500 text-white text-[10px] font-bold">
                              {it.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{it.unit}</td>
                          <td className="py-3 px-3 text-slate-700">{fmtPkrDec(it.costPrice)}</td>
                          <td className="py-3 px-3 text-slate-700">{fmtPkrDec(it.salePrice)}</td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-white text-[10px] font-bold ${
                                inStock ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            >
                              {it.quantity}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 rounded text-white text-[10px] font-bold ${
                                inStock ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                            >
                              {inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div
                              className="relative inline-block"
                              ref={itemMenuId === it.id ? menuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() => setItemMenuId((p) => (p === it.id ? null : it.id))}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {itemMenuId === it.id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemMenuId(null)
                                      setEditingItemId(it.id)
                                      setItemForm({
                                        name: it.name,
                                        category: it.category,
                                        unit: it.unit,
                                        costPrice: String(it.costPrice),
                                        salePrice: String(it.salePrice),
                                        quantity: String(it.quantity),
                                        description: it.description || ''
                                      })
                                      setItemTab('create')
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setItemMenuId(null)
                                      persistItems(items.filter((x) => x.id !== it.id))
                                      toast.success(`Deleted "${it.name}".`)
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
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveItem} className="p-6 max-w-xl space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Item Name *</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm((p) => ({ ...p, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Category *</label>
                <select
                  value={itemForm.category}
                  onChange={(e) => setItemForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Unit</label>
                <select
                  value={itemForm.unit}
                  onChange={(e) => setItemForm((p) => ({ ...p, unit: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {['Piece', 'pcs', 'Set', 'Box', 'Pack'].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Current Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.quantity}
                  onChange={(e) => setItemForm((p) => ({ ...p, quantity: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Cost Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.costPrice}
                  onChange={(e) => setItemForm((p) => ({ ...p, costPrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Sale Price (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={itemForm.salePrice}
                  onChange={(e) => setItemForm((p) => ({ ...p, salePrice: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Description</label>
              <input
                type="text"
                value={itemForm.description}
                onChange={(e) => setItemForm((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
              >
                {editingItemId ? 'Update Item' : 'Save Item'}
              </button>
              <button
                type="button"
                onClick={() => setItemTab('all')}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default InventorySuiteViews
