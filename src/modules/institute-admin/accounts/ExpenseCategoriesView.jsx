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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Menu,
  Edit3,
  Trash2,
  Check
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const DEFAULT_CATEGORY_DETAILS = [
  { id: 'cat-1', name: 'Furniture Expense', description: 'School Furniture' },
  { id: 'cat-2', name: 'Utility Bills', description: 'Monthly' }
]

const loadCategoryDetails = (instId) => {
  const detailKey = `sms_campus_exp_category_details_${instId}`
  const namesKey = `sms_campus_exp_categories_${instId}`
  try {
    const savedDetails = localStorage.getItem(detailKey)
    if (savedDetails) {
      const parsed = JSON.parse(savedDetails)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  try {
    const savedNames = localStorage.getItem(namesKey)
    if (savedNames) {
      const names = JSON.parse(savedNames)
      if (Array.isArray(names) && names.length > 0) {
        return names.map((name, idx) => ({
          id: `cat-${idx + 1}`,
          name: String(name),
          description:
            name === 'Furniture Expense'
              ? 'School Furniture'
              : name === 'Utility Bills'
                ? 'Monthly'
                : ''
        }))
      }
    }
  } catch {}
  return DEFAULT_CATEGORY_DETAILS
}

export const ExpenseCategoriesView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const detailKey = `sms_campus_exp_category_details_${instId}`
  const namesKey = `sms_campus_exp_categories_${instId}`

  const [categories, setCategories] = useState(() => loadCategoryDetails(instId))
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'create'
  const [filterText, setFilterText] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState('sn') // 'sn' | 'name' | 'description'
  const [sortDir, setSortDir] = useState('asc')
  const [openActionId, setOpenActionId] = useState(null)
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [visibleCols, setVisibleCols] = useState({
    sn: true,
    name: true,
    description: true,
    action: true
  })

  // Create / Edit form state
  const [editingId, setEditingId] = useState(null)
  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const visibilityRef = useRef(null)
  const actionMenuRef = useRef(null)

  useEffect(() => {
    setCategories(loadCategoryDetails(instId))
  }, [instId])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (visibilityRef.current && !visibilityRef.current.contains(e.target)) {
        setVisibilityOpen(false)
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setOpenActionId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const persistCategories = (next) => {
    setCategories(next)
    try {
      localStorage.setItem(detailKey, JSON.stringify(next))
      localStorage.setItem(namesKey, JSON.stringify(next.map((c) => c.name)))
    } catch {}
  }

  const filteredAndSorted = useMemo(() => {
    const q = filterText.trim().toLowerCase()
    const withIndex = categories.map((c, idx) => ({ ...c, _sn: idx + 1 }))
    const filtered = q
      ? withIndex.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            (c.description || '').toLowerCase().includes(q)
        )
      : withIndex

    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortBy === 'sn') cmp = a._sn - b._sn
      else if (sortBy === 'name') cmp = a.name.localeCompare(b.name)
      else if (sortBy === 'description') {
        cmp = (a.description || '').localeCompare(b.description || '')
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [categories, filterText, sortBy, sortDir])

  const totalEntries = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalEntries / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const paginatedRows = filteredAndSorted.slice(pageStart, pageStart + pageSize)

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortDir('asc')
    }
  }

  const handleCopy = async () => {
    const lines = [
      ['S/N', 'Name', 'Description'].join('\t'),
      ...filteredAndSorted.map((c, idx) => [idx + 1, c.name, c.description || ''].join('\t'))
    ].join('\n')
    try {
      await navigator.clipboard.writeText(lines)
      toast.success(`Copied ${filteredAndSorted.length} expense categories to clipboard.`)
    } catch {
      toast.error('Clipboard permission denied.')
    }
  }

  const handleExportExcel = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [
      ['S/N', 'Name', 'Description'].map(esc).join(','),
      ...filteredAndSorted.map((c, idx) =>
        [idx + 1, c.name, c.description || ''].map(esc).join(',')
      )
    ].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `expense-categories-${instId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Expense categories exported to Excel (CSV).')
  }

  const handleExportPdf = () => {
    downloadSimplePdf({
      title: `${currentInstitute?.name || 'Institute'} — Expense Categories`,
      subtitle: `Total categories: ${filteredAndSorted.length}`,
      columns: ['S/N', 'Name', 'Description'],
      rows: filteredAndSorted.map((c, idx) => [
        String(idx + 1),
        c.name,
        c.description || '—'
      ]),
      filename: `expense-categories-${instId}.pdf`
    })
    toast.success('Expense categories exported to PDF.')
  }

  const startCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormDesc('')
    setActiveTab('create')
  }

  const startEdit = (cat) => {
    setOpenActionId(null)
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormDesc(cat.description || '')
    setActiveTab('create')
  }

  const handleSaveCategory = (e) => {
    e.preventDefault()
    const cleanName = formName.trim()
    const cleanDesc = formDesc.trim()
    if (!cleanName) {
      toast.error('Category name is required.')
      return
    }
    const duplicate = categories.some(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase() && c.id !== editingId
    )
    if (duplicate) {
      toast.error(`Category "${cleanName}" already exists.`)
      return
    }

    if (editingId) {
      const next = categories.map((c) =>
        c.id === editingId ? { ...c, name: cleanName, description: cleanDesc } : c
      )
      persistCategories(next)
      toast.success(`Category "${cleanName}" updated.`)
    } else {
      const next = [
        ...categories,
        {
          id: `cat-${Date.now()}`,
          name: cleanName,
          description: cleanDesc
        }
      ]
      persistCategories(next)
      toast.success(`Category "${cleanName}" created.`)
    }

    setEditingId(null)
    setFormName('')
    setFormDesc('')
    setActiveTab('all')
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    const next = categories.filter((c) => c.id !== deleteTarget.id)
    persistCategories(next)
    toast.success(`Deleted category "${deleteTarget.name}".`)
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Expense Categories</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts')}
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
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-comm-sms'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Expense Categories</h2>
        </div>

        {/* Sub-tabs: All Categories | + New Category */}
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>All Categories</span>
          </button>
          <button
            type="button"
            onClick={startCreate}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px transition-colors cursor-pointer ${
              activeTab === 'create'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingId ? 'Edit Category' : 'New Category'}</span>
          </button>
        </div>

        {activeTab === 'all' ? (
          <div className="p-5 space-y-4">
            {/* Toolbar: Filter | Show + Copy / Excel / PDF / Visibility */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Filter:</span>
                <div className="relative">
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => {
                      setFilterText(e.target.value)
                      setCurrentPage(1)
                    }}
                    placeholder="Type to filter..."
                    className="w-52 pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-600">Show:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value))
                      setCurrentPage(1)
                    }}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-sky-500"
                  >
                    {[10, 25, 50, 100].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="inline-flex items-center rounded-lg border border-slate-200 overflow-visible bg-white">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    Copy
                  </button>
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    Excel
                  </button>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 border-r border-slate-200 cursor-pointer"
                  >
                    PDF
                  </button>
                  <div className="relative" ref={visibilityRef}>
                    <button
                      type="button"
                      onClick={() => setVisibilityOpen((o) => !o)}
                      className="px-3 py-1.5 text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white inline-flex items-center gap-1.5 rounded-r-lg cursor-pointer"
                    >
                      <Menu className="w-3.5 h-3.5" />
                      <span>Visibility</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    {visibilityOpen && (
                      <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                        {[
                          { key: 'sn', label: 'S/N' },
                          { key: 'name', label: 'Name' },
                          { key: 'description', label: 'Description' },
                          { key: 'action', label: 'Action' }
                        ].map((col) => (
                          <button
                            key={col.key}
                            type="button"
                            onClick={() =>
                              setVisibleCols((prev) => ({ ...prev, [col.key]: !prev[col.key] }))
                            }
                            className="w-full px-3.5 py-1.5 text-left hover:bg-slate-50 flex items-center justify-between text-slate-700 cursor-pointer"
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-700">
                    {visibleCols.sn && (
                      <th className="py-2.5 px-3 w-28">
                        <button
                          type="button"
                          onClick={() => toggleSort('sn')}
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
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
                          className="inline-flex items-center gap-1.5 hover:text-slate-900 cursor-pointer"
                        >
                          <span>Description</span>
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </th>
                    )}
                    {visibleCols.action && (
                      <th className="py-2.5 px-3 text-center w-36">Action</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {paginatedRows.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        No expense categories found.{' '}
                        <button
                          type="button"
                          onClick={startCreate}
                          className="text-sky-600 font-semibold hover:underline cursor-pointer"
                        >
                          + New Category
                        </button>
                      </td>
                    </tr>
                  ) : (
                    paginatedRows.map((cat, idx) => (
                      <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                        {visibleCols.sn && (
                          <td className="py-3 px-3 text-slate-600">{pageStart + idx + 1}</td>
                        )}
                        {visibleCols.name && (
                          <td className="py-3 px-3 font-medium text-slate-800">{cat.name}</td>
                        )}
                        {visibleCols.description && (
                          <td className="py-3 px-3 text-slate-600">{cat.description || '—'}</td>
                        )}
                        {visibleCols.action && (
                          <td className="py-3 px-3 text-center">
                            <div
                              className="relative inline-block"
                              ref={openActionId === cat.id ? actionMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenActionId((prev) => (prev === cat.id ? null : cat.id))
                                }
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                                title="Actions"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {openActionId === cat.id && (
                                <div className="absolute right-0 mt-1 w-36 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => startEdit(cat)}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionId(null)
                                      setDeleteTarget(cat)
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

            {/* Footer: Showing X to Y of Z entries | Pagination */}
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
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
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
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Tab: + New Category / Edit Category */
          <form onSubmit={handleSaveCategory} className="p-6 max-w-xl space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Utility Bills"
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={3}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Optional description (e.g., Monthly operational utility expenses)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer transition-colors"
              >
                {editingId ? 'Update Category' : 'Save Category'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setFormName('')
                  setFormDesc('')
                  setActiveTab('all')
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Delete Expense Category</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-900">{deleteTarget.name}</span>? Existing
              expense records will keep their text label.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExpenseCategoriesView
