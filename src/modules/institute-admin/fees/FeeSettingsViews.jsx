import React, { useState, useEffect } from 'react'
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
  Pencil,
  Trash2,
  Check,
  Wallet
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

const DEFAULT_FEE_CATEGORIES = [
  { id: 'cat_1', name: 'Registration fee', slug: 'registration_fee', billingCategory: 'Tuition', sortOrder: 1, active: true },
  { id: 'cat_2', name: 'Tuition Fee', slug: 'tuition', billingCategory: 'Tuition', sortOrder: 10, active: true },
  { id: 'cat_3', name: 'Admission Fee', slug: 'admission', billingCategory: 'Admission', sortOrder: 20, active: true },
  { id: 'cat_4', name: 'Arrears', slug: 'arrears', billingCategory: 'Other', sortOrder: 30, active: true },
  { id: 'cat_5', name: 'Transport Fee', slug: 'transport', billingCategory: 'Transport', sortOrder: 35, active: true },
  { id: 'cat_6', name: 'Hostel Fee', slug: 'hostel_fee', billingCategory: 'Other', sortOrder: 40, active: true },
  { id: 'cat_7', name: 'Library Fee', slug: 'library', billingCategory: 'Library', sortOrder: 50, active: true },
  { id: 'cat_8', name: 'Paper Fund', slug: 'paper_fund', billingCategory: 'Other', sortOrder: 60, active: true },
  { id: 'cat_9', name: 'Security Fee', slug: 'security_fee', billingCategory: 'Other', sortOrder: 70, active: true },
  { id: 'cat_10', name: 'Exam Fee', slug: 'exam', billingCategory: 'Exam', sortOrder: 80, active: true },
  { id: 'cat_11', name: 'Stock Payments', slug: 'stock', billingCategory: 'Stock', sortOrder: 90, active: true },
  { id: 'cat_12', name: 'Other', slug: 'other', billingCategory: 'Other', sortOrder: 100, active: true }
]

const DEFAULT_PAYMENT_METHODS = [
  { id: 'pm_1', name: 'EasyPaisa', type: 'Mobile wallet', hasQr: true, details: 'Mobile: 03077238407 Account Title: Mirza Muhammad...', active: true, sortOrder: 0 },
  { id: 'pm_2', name: 'Habib Bank Limited', type: 'Bank transfer', hasQr: false, details: 'Mobile: 03077238407 Account Title: Mirza Muhammad...', active: true, sortOrder: 0 },
  { id: 'pm_3', name: 'JazzCash', type: 'Mobile wallet', hasQr: false, details: 'Mobile: 03077238407 Account Title: Mirza Muhammad...', active: true, sortOrder: 0 }
]

const toSlug = (str) =>
  String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || 'category'

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

const saveJson = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    // ignore storage errors
  }
}

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
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
        onClick={() => onRouteChange?.('inst-fees')}
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
)

export const FeeSettingsViews = ({
  mode = 'categories', // 'categories' | 'payment-methods' | 'invoice-layout'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment
}) => {
  const { logAuditEvent } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'default'
  const catKey = `eims_fee_categories_${instId}`
  const pmKey = `eims_payment_methods_${instId}`
  const layoutKey = `eims_invoice_layout_${instId}`

  // ============================================================================
  // 1. FEE CATEGORIES STATE
  // ============================================================================
  const [categories, setCategories] = useState(() => loadJson(catKey, DEFAULT_FEE_CATEGORIES))
  const [newCat, setNewCat] = useState({ name: '', billingCategory: 'Other', sortOrder: 0, active: true })
  const [editCatModal, setEditCatModal] = useState(null)

  useEffect(() => {
    setCategories(loadJson(catKey, DEFAULT_FEE_CATEGORIES))
  }, [catKey])

  const persistCategories = (updater) => {
    setCategories((prev) => {
      const next = (typeof updater === 'function' ? updater(prev) : updater)
        .slice()
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      saveJson(catKey, next)
      return next
    })
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCat.name.trim()) {
      toast.warning('Category name is required')
      return
    }
    const created = {
      id: `cat_${Date.now()}`,
      name: newCat.name.trim(),
      slug: toSlug(newCat.name),
      billingCategory: newCat.billingCategory,
      sortOrder: Number(newCat.sortOrder || 0),
      active: Boolean(newCat.active)
    }
    persistCategories((prev) => [...prev, created])
    logAuditEvent?.('FEE_CATEGORY_ADDED', `Added fee category ${created.name}`)
    toast.success(`Added fee category "${created.name}"`)
    setNewCat({ name: '', billingCategory: 'Other', sortOrder: 0, active: true })
  }

  // ============================================================================
  // 2. PAYMENT METHODS STATE
  // ============================================================================
  const [paymentMethods, setPaymentMethods] = useState(() => loadJson(pmKey, DEFAULT_PAYMENT_METHODS))
  const [pmModal, setPmModal] = useState(null) // null | { id?, name, type, hasQr, details, active, sortOrder }
  const [pmDeleteTarget, setPmDeleteTarget] = useState(null)

  useEffect(() => {
    setPaymentMethods(loadJson(pmKey, DEFAULT_PAYMENT_METHODS))
  }, [pmKey])

  const persistPaymentMethods = (updater) => {
    setPaymentMethods((prev) => {
      const next = (typeof updater === 'function' ? updater(prev) : updater)
        .slice()
        .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0))
      saveJson(pmKey, next)
      return next
    })
  }

  const handleSavePaymentMethod = (e) => {
    e.preventDefault()
    if (!pmModal?.name?.trim()) {
      toast.warning('Payment method name is required')
      return
    }
    if (pmModal.id) {
      persistPaymentMethods((prev) =>
        prev.map((m) => (m.id === pmModal.id ? { ...pmModal, name: pmModal.name.trim() } : m))
      )
      toast.success(`Updated "${pmModal.name.trim()}"`)
    } else {
      const created = {
        ...pmModal,
        id: `pm_${Date.now()}`,
        name: pmModal.name.trim()
      }
      persistPaymentMethods((prev) => [...prev, created])
      toast.success(`Added payment method "${created.name}"`)
    }
    setPmModal(null)
  }

  // ============================================================================
  // 3. INVOICE LAYOUT STATE
  // ============================================================================
  const [layoutSettings, setLayoutSettings] = useState(() =>
    loadJson(layoutKey, { layout: 'a4', showPaymentDetails: true })
  )

  useEffect(() => {
    setLayoutSettings(loadJson(layoutKey, { layout: 'a4', showPaymentDetails: true }))
  }, [layoutKey])

  const handleSaveLayout = () => {
    saveJson(layoutKey, layoutSettings)
    logAuditEvent?.('INVOICE_LAYOUT_SAVED', `Saved invoice print layout: ${layoutSettings.layout}`)
    toast.success('Invoice layout settings saved')
  }

  // ============================================================================
  // RENDER: FEE CATEGORIES
  // ============================================================================
  if (mode === 'categories') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Fee Categories"
          onBack={() => onRouteChange?.('inst-fees')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[#1e88e5] text-white">
            <div className="flex items-center gap-2 text-sm font-bold">
              <List className="w-4 h-4" />
              Fee Categories
            </div>
            <p className="text-[11px] text-blue-100 mt-0.5">
              Manage charge types for fee setup and individual invoices
            </p>
          </div>

          <div className="p-5 space-y-5">
            {/* Add fee category inline box */}
            <form
              onSubmit={handleAddCategory}
              className="border border-slate-200 rounded-lg p-4 bg-slate-50/40 space-y-3"
            >
              <div className="text-xs font-bold text-slate-800">Add fee category</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.6fr_1.1fr_0.7fr_auto_auto] gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newCat.name}
                    onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Registration Fee"
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Billing category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={newCat.billingCategory}
                    onChange={(e) => setNewCat((p) => ({ ...p, billingCategory: e.target.value }))}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Other">Other</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Admission">Admission</option>
                    <option value="Transport">Transport</option>
                    <option value="Library">Library</option>
                    <option value="Exam">Exam</option>
                    <option value="Stock">Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Sort order</label>
                  <input
                    type="number"
                    value={newCat.sortOrder}
                    onChange={(e) => setNewCat((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 pb-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newCat.active}
                    onChange={(e) => setNewCat((p) => ({ ...p, active: e.target.checked }))}
                    className="rounded border-slate-300 text-slate-800 focus:ring-slate-600"
                  />
                  Active
                </label>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                  title="Add Category"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Categories Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                    <th className="py-2.5 px-3">Name</th>
                    <th className="py-2.5 px-3">Slug</th>
                    <th className="py-2.5 px-3">Billing category</th>
                    <th className="py-2.5 px-3">Sort</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-semibold text-slate-800">{cat.name}</td>
                      <td className="py-3 px-3">
                        <code className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-mono text-[11px]">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-semibold">
                          {cat.billingCategory}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">{cat.sortOrder}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            cat.active ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        >
                          {cat.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setEditCatModal({ ...cat })}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 text-[11px] font-semibold"
                        >
                          <Pencil className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistCategories((prev) =>
                              prev.map((c) => (c.id === cat.id ? { ...c, active: !c.active } : c))
                            )
                            toast.info(`${cat.name} ${cat.active ? 'deactivated' : 'activated'}`)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-orange-300 bg-white hover:bg-orange-50 text-orange-600 text-[11px] font-semibold"
                        >
                          {cat.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Category Modal */}
        {editCatModal && (
          <Modal
            isOpen
            onClose={() => setEditCatModal(null)}
            title="Edit Fee Category"
            maxWidth="max-w-sm"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault()
                persistCategories((prev) =>
                  prev.map((c) =>
                    c.id === editCatModal.id
                      ? { ...editCatModal, name: editCatModal.name.trim(), slug: toSlug(editCatModal.name) }
                      : c
                  )
                )
                toast.success('Fee category updated')
                setEditCatModal(null)
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editCatModal.name}
                  onChange={(e) => setEditCatModal((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Billing category</label>
                  <select
                    value={editCatModal.billingCategory}
                    onChange={(e) => setEditCatModal((p) => ({ ...p, billingCategory: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Other">Other</option>
                    <option value="Tuition">Tuition</option>
                    <option value="Admission">Admission</option>
                    <option value="Transport">Transport</option>
                    <option value="Library">Library</option>
                    <option value="Exam">Exam</option>
                    <option value="Stock">Stock</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort order</label>
                  <input
                    type="number"
                    value={editCatModal.sortOrder}
                    onChange={(e) => setEditCatModal((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditCatModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  // ============================================================================
  // RENDER: PAYMENT METHODS
  // ============================================================================
  if (mode === 'payment-methods') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <QuickHeader
          title="Payment Methods"
          onBack={() => onRouteChange?.('inst-fees')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 bg-[#1e88e5] text-white flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Wallet className="w-4 h-4" />
                Payment Methods
              </div>
              <p className="text-[11px] text-blue-100 mt-0.5">Manage payment methods for fee collection</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setPmModal({
                  name: '',
                  type: 'Mobile wallet',
                  hasQr: false,
                  details: '',
                  active: true,
                  sortOrder: 0
                })
              }
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Payment Method
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-600">
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">QR Code</th>
                  <th className="py-2.5 px-3">Details</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Sort Order</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paymentMethods.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No payment methods configured. Click <strong>+ Add Payment Method</strong>.
                    </td>
                  </tr>
                ) : (
                  paymentMethods.map((pm) => (
                    <tr key={pm.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-3 font-semibold text-slate-800">{pm.name}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] font-semibold">
                          {pm.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            pm.hasQr ? 'bg-emerald-600' : 'bg-slate-500'
                          }`}
                        >
                          {pm.hasQr ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 max-w-xs truncate">{pm.details || '—'}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                            pm.active ? 'bg-emerald-600' : 'bg-slate-400'
                          }`}
                        >
                          {pm.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600">{pm.sortOrder}</td>
                      <td className="py-3.5 px-3 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setPmModal({ ...pm })}
                          title="Edit"
                          className="p-1.5 rounded border border-blue-200 bg-white hover:bg-blue-50 text-blue-600 inline-flex items-center"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPmDeleteTarget(pm)}
                          title="Delete"
                          className="p-1.5 rounded border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 inline-flex items-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Payment Method Modal */}
        {pmModal && (
          <Modal
            isOpen
            onClose={() => setPmModal(null)}
            title={pmModal.id ? 'Edit Payment Method' : 'Add Payment Method'}
            maxWidth="max-w-md"
          >
            <form onSubmit={handleSavePaymentMethod} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Method Name</label>
                <input
                  type="text"
                  required
                  value={pmModal.name}
                  onChange={(e) => setPmModal((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. EasyPaisa, HBL, JazzCash"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Type</label>
                  <select
                    value={pmModal.type}
                    onChange={(e) => setPmModal((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    <option value="Mobile wallet">Mobile wallet</option>
                    <option value="Bank transfer">Bank transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Online gateway">Online gateway</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={pmModal.sortOrder}
                    onChange={(e) => setPmModal((p) => ({ ...p, sortOrder: Number(e.target.value || 0) }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account / Mobile Details</label>
                <textarea
                  rows={2}
                  value={pmModal.details}
                  onChange={(e) => setPmModal((p) => ({ ...p, details: e.target.value }))}
                  placeholder="Account number, IBAN, account title..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex items-center gap-5">
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pmModal.hasQr}
                    onChange={(e) => setPmModal((p) => ({ ...p, hasQr: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  Has QR Code
                </label>
                <label className="inline-flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pmModal.active}
                    onChange={(e) => setPmModal((p) => ({ ...p, active: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600"
                  />
                  Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPmModal(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Save Method
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Payment Method Confirmation */}
        {pmDeleteTarget && (
          <Modal
            isOpen
            onClose={() => setPmDeleteTarget(null)}
            title="Delete Payment Method"
            maxWidth="max-w-sm"
          >
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                Delete <strong className="text-slate-900">{pmDeleteTarget.name}</strong> from payment methods?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPmDeleteTarget(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistPaymentMethods((prev) => prev.filter((m) => m.id !== pmDeleteTarget.id))
                    toast.success('Payment method deleted')
                    setPmDeleteTarget(null)
                  }}
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

  // ============================================================================
  // RENDER: INVOICE LAYOUT
  // ============================================================================
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      <QuickHeader
        title="Invoice Layout"
        onBack={() => onRouteChange?.('inst-fees')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-[#1e88e5] text-white flex items-center gap-2 text-sm font-bold">
          <FileText className="w-4 h-4" />
          Invoice Layout
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <div>
            <h2 className="text-xs font-bold text-slate-900">How should invoices print?</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pick the layout your staff use most. They can still change the layout and copies on the print page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Full A4 page */}
            <button
              type="button"
              onClick={() => setLayoutSettings((p) => ({ ...p, layout: 'a4' }))}
              className={`rounded-xl border-2 p-4 text-left transition-all flex flex-col justify-between ${
                layoutSettings.layout === 'a4'
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
              }`}
            >
              <div className="bg-white border border-slate-200 rounded-lg p-3 h-56 mx-auto w-44 shadow-2xs flex flex-col justify-between text-[7px] text-slate-400">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <div className="font-bold text-slate-700">Institute Name</div>
                  <div className="font-bold text-slate-600">INVOICE</div>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 bg-slate-200 rounded w-3/4" />
                  <div className="h-1.5 bg-slate-100 rounded w-1/2" />
                </div>
                <div className="border border-slate-200 rounded p-1.5 space-y-1">
                  <div className="h-1.5 bg-slate-200 rounded w-full" />
                  <div className="h-1.5 bg-slate-100 rounded w-5/6" />
                  <div className="h-1.5 bg-slate-100 rounded w-2/3" />
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100">
                  <span>Signature</span>
                  <span className="font-bold text-slate-600">Total PKR</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      layoutSettings.layout === 'a4' ? 'border-blue-600' : 'border-slate-400'
                    }`}
                  >
                    {layoutSettings.layout === 'a4' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </span>
                  Full A4 page
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] font-bold">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  One student on each page. The clearest option, with space for a signature.
                </p>
              </div>
            </button>

            {/* 2. Horizontal layout */}
            <button
              type="button"
              onClick={() => setLayoutSettings((p) => ({ ...p, layout: 'horizontal' }))}
              className={`rounded-xl border-2 p-4 text-left transition-all flex flex-col justify-between ${
                layoutSettings.layout === 'horizontal'
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
              }`}
            >
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 h-56 mx-auto w-44 shadow-2xs flex flex-col justify-between text-[7px] text-slate-400">
                <div className="border border-slate-200 rounded p-2 space-y-1.5">
                  <div className="h-1.5 bg-slate-300 rounded w-2/3" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-200 rounded w-1/2" />
                </div>
                <div className="border-t border-dashed border-slate-300" />
                <div className="border border-slate-200 rounded p-2 space-y-1.5">
                  <div className="h-1.5 bg-slate-300 rounded w-2/3" />
                  <div className="h-1.5 bg-slate-100 rounded w-full" />
                  <div className="h-1.5 bg-slate-200 rounded w-1/2" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      layoutSettings.layout === 'horizontal' ? 'border-blue-600' : 'border-slate-400'
                    }`}
                  >
                    {layoutSettings.layout === 'horizontal' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </span>
                  Horizontal layout
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Wide half-page vouchers. Uses less paper. Cut across the dotted line.
                </p>
              </div>
            </button>

            {/* 3. Vertical layout */}
            <button
              type="button"
              onClick={() => setLayoutSettings((p) => ({ ...p, layout: 'vertical' }))}
              className={`rounded-xl border-2 p-4 text-left transition-all flex flex-col justify-between ${
                layoutSettings.layout === 'vertical'
                  ? 'border-blue-500 bg-blue-50/20 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/40'
              }`}
            >
              <div className="bg-white border border-slate-200 rounded-lg p-2.5 h-56 mx-auto w-44 shadow-2xs grid grid-cols-2 gap-1.5">
                {[1, 2, 3, 4].map((q) => (
                  <div key={q} className="border border-slate-200 rounded p-1.5 space-y-1">
                    <div className="h-1.5 bg-blue-500/70 rounded w-full" />
                    <div className="h-1 bg-slate-200 rounded w-3/4" />
                    <div className="h-1 bg-slate-100 rounded w-full" />
                    <div className="h-1 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <span
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      layoutSettings.layout === 'vertical' ? 'border-blue-600' : 'border-slate-400'
                    }`}
                  >
                    {layoutSettings.layout === 'vertical' && (
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                    )}
                  </span>
                  Vertical layout
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Narrow columns. Uses the least paper, but the text is smaller.
                </p>
              </div>
            </button>
          </div>

          <p className="text-[10px] text-slate-400">
            Examples use sample data. A long voucher with 2 students per page gets a full page so it stays readable.
            Other layouts print a long voucher a little smaller.
          </p>

          <div className="border-t border-slate-100 pt-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-900">Payment details</h3>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={layoutSettings.showPaymentDetails}
                onChange={(e) =>
                  setLayoutSettings((p) => ({ ...p, showPaymentDetails: e.target.checked }))
                }
                className="mt-0.5 rounded border-slate-300 text-slate-800 focus:ring-slate-600"
              />
              <div className="text-xs">
                <div className="font-semibold text-slate-800">Show how to pay on invoices</div>
                <div className="text-[11px] text-slate-400">
                  Prints your active payment methods, such as bank account details and QR codes, on receipts and invoices.
                </div>
              </div>
            </label>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleSaveLayout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save Settings
            </button>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-fees')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeeSettingsViews
