import React, { useState, useMemo, useEffect } from 'react'
import { 
  Boxes, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Wrench, 
  Archive, 
  Building2, 
  Tag, 
  Edit2, 
  Trash2, 
  X, 
  DollarSign,
  PackageCheck,
  RotateCcw,
  Printer
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

const INITIAL_INVENTORY = [
  { id: 'INV-101', name: 'Dell Core i7 Computer Terminals', category: 'IT & Lab Equipment', room: 'Computer Lab 1', quantity: 24, unitCost: 85000, condition: 'Good', status: 'In Service', purchaseDate: '2025-08-15', custodian: 'Mr. Asim Riaz' },
  { id: 'INV-102', name: 'Compound Optical Microscopes (1000x)', category: 'Science & Biology Labs', room: 'Biology Lab 2', quantity: 18, unitCost: 42000, condition: 'Good', status: 'In Service', purchaseDate: '2025-09-02', custodian: 'Dr. Nadia Hashmi' },
  { id: 'INV-103', name: 'Epson Interactive Multimedia Projectors', category: 'IT & Lab Equipment', room: 'Auditorium Hall', quantity: 4, unitCost: 145000, condition: 'Needs Repair', status: 'Maintenance', purchaseDate: '2024-11-20', custodian: 'Campus Admin' },
  { id: 'INV-104', name: 'Student Dual Wooden Desks & Chairs', category: 'Classroom Furniture', room: 'Classrooms Block B', quantity: 120, unitCost: 14500, condition: 'Good', status: 'In Service', purchaseDate: '2025-01-10', custodian: 'Estate Officer' },
  { id: 'INV-105', name: 'Chemistry Reagent Glassware Set', category: 'Science & Biology Labs', room: 'Chemistry Lab', quantity: 35, unitCost: 8500, condition: 'Good', status: 'In Service', purchaseDate: '2025-09-12', custodian: 'Ms. Ayesha Siddiqa' },
  { id: 'INV-106', name: 'Heavy Duty Photocopier & Network Scanner', category: 'Office Equipment', room: 'Campus Exam Cell', quantity: 2, unitCost: 280000, condition: 'Fair', status: 'In Service', purchaseDate: '2024-03-14', custodian: 'Exam Incharge' },
  { id: 'INV-107', name: 'Cricket & Football Sports Gear Kits', category: 'Sports & Physical', room: 'Sports Complex', quantity: 15, unitCost: 22000, condition: 'Good', status: 'In Service', purchaseDate: '2025-10-01', custodian: 'Coach Rashid' },
  { id: 'INV-108', name: 'A4 Printing Paper & Examination Answer Sheets', category: 'Consumables & Stationery', room: 'Central Store', quantity: 250, unitCost: 1800, condition: 'New', status: 'In Stock', purchaseDate: '2026-02-10', custodian: 'Store Keeper' }
]

export const CampusInventoryView = ({ currentInstitute, initialTab = 'items' }) => {
  const { students = [] } = useAppData()
  const { toast } = useToast()
  const instituteId = currentInstitute?.id || 'inst-1'
  const storageKey = `sms_campus_inventory_${instituteId}`
  const catStorageKey = `sms_campus_inv_categories_${instituteId}`
  const ledgerStorageKey = `sms_campus_inv_ledger_${instituteId}`

  const [activeTab, setActiveTab] = useState(initialTab || 'items') // 'categories' | 'items' | 'receive' | 'issue' | 'reports'
  useEffect(() => {
    if (initialTab) setActiveTab(initialTab)
  }, [initialTab])

  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(catStorageKey)
      if (saved) return JSON.parse(saved)
    } catch (_) {}
    return [
      { id: 'CAT-1', name: 'IT & Lab Equipment', description: 'Computers, projectors & digital equipment' },
      { id: 'CAT-2', name: 'Science & Biology Labs', description: 'Microscopes, glassware & lab chemicals' },
      { id: 'CAT-3', name: 'Classroom Furniture', description: 'Student desks, chairs & whiteboards' },
      { id: 'CAT-4', name: 'Office Equipment', description: 'Printers, photocopiers & admin hardware' },
      { id: 'CAT-5', name: 'Sports & Physical', description: 'Cricket, football & PT equipment kits' },
      { id: 'CAT-6', name: 'Consumables & Stationery', description: 'Paper, notebooks, diaries & uniforms' }
    ]
  })
  const [newCatForm, setNewCatForm] = useState({ name: '', description: '' })

  const [stockTransactions, setStockTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(ledgerStorageKey)
      return saved ? JSON.parse(saved) : []
    } catch (_) { return [] }
  })

  const [receiveForm, setReceiveForm] = useState({ itemId: '', quantity: 10, supplier: '', refNo: '', date: new Date().toISOString().split('T')[0] })
  const [issueForm, setIssueForm] = useState({ itemId: '', studentId: '', quantity: 1, remarks: '' })

  const campusStudents = useMemo(
    () => students.filter(s => !s.instituteId || s.instituteId === instituteId),
    [students, instituteId]
  )

  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : INITIAL_INVENTORY
    } catch {
      return INITIAL_INVENTORY
    }
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCondition, setSelectedCondition] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    category: 'IT & Lab Equipment',
    room: '',
    quantity: 1,
    unitCost: '',
    condition: 'Good',
    status: 'In Service',
    custodian: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })

  const saveItems = (newItems) => {
    setItems(newItems)
    try {
      localStorage.setItem(storageKey, JSON.stringify(newItems))
    } catch (e) {
      console.error(e)
    }
  }

  const categories = useMemo(
    () => ['All', ...customCategories.map(c => c.name)],
    [customCategories]
  )

  const saveCategories = (next) => {
    setCustomCategories(next)
    try { localStorage.setItem(catStorageKey, JSON.stringify(next)) } catch (_) {}
  }

  const saveStockTxn = (next) => {
    setStockTransactions(next)
    try { localStorage.setItem(ledgerStorageKey, JSON.stringify(next)) } catch (_) {}
  }

  const handleAddCategory = (e) => {
    e.preventDefault()
    if (!newCatForm.name.trim()) return
    const next = [...customCategories, { id: `CAT-${Date.now()}`, name: newCatForm.name.trim(), description: newCatForm.description.trim() || 'School store category' }]
    saveCategories(next)
    setNewCatForm({ name: '', description: '' })
    toast?.success?.('Inventory category added.')
  }

  const handleReceiveStock = (e) => {
    e.preventDefault()
    const qty = Math.max(1, Number(receiveForm.quantity) || 0)
    const target = items.find(i => i.id === receiveForm.itemId)
    if (!target) { toast?.error?.('Select an inventory item.'); return }
    saveItems(items.map(i => i.id === target.id ? { ...i, quantity: Number(i.quantity || 0) + qty } : i))
    saveStockTxn([{ id: `GRN-${Date.now()}`, type: 'RECEIVE', itemId: target.id, itemName: target.name, quantity: qty, party: receiveForm.supplier || 'Vendor Supply', refNo: receiveForm.refNo || 'GRN', date: receiveForm.date }, ...stockTransactions])
    toast?.success?.(`Received +${qty} units of ${target.name}.`)
    setReceiveForm({ itemId: '', quantity: 10, supplier: '', refNo: '', date: new Date().toISOString().split('T')[0] })
  }

  const handleIssueToStudent = (e) => {
    e.preventDefault()
    const qty = Math.max(1, Number(issueForm.quantity) || 0)
    const target = items.find(i => i.id === issueForm.itemId)
    const student = campusStudents.find(s => s.id === issueForm.studentId)
    if (!target || !student) { toast?.error?.('Select both an item and an enrolled student.'); return }
    if (Number(target.quantity || 0) < qty) { toast?.error?.(`Only ${target.quantity} units available in stock.`); return }
    saveItems(items.map(i => i.id === target.id ? { ...i, quantity: Number(i.quantity || 0) - qty } : i))
    saveStockTxn([{ id: `ISS-${Date.now()}`, type: 'ISSUE', itemId: target.id, itemName: target.name, quantity: qty, party: `${student.name} (${student.className || 'Student'})`, refNo: issueForm.remarks || 'Student Issue', date: new Date().toISOString().split('T')[0] }, ...stockTransactions])
    toast?.success?.(`Issued ${qty}x ${target.name} to ${student.name}.`)
    setIssueForm({ itemId: '', studentId: '', quantity: 1, remarks: '' })
  }

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.custodian && item.custodian.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory
      const matchesCond = selectedCondition === 'All' || item.condition === selectedCondition
      return matchesSearch && matchesCat && matchesCond
    })
  }, [items, searchQuery, selectedCategory, selectedCondition])

  // Summary Metrics
  const totalQuantity = useMemo(() => items.reduce((acc, curr) => acc + Number(curr.quantity || 0), 0), [items])
  const totalValuation = useMemo(() => items.reduce((acc, curr) => acc + (Number(curr.quantity || 0) * Number(curr.unitCost || 0)), 0), [items])
  const maintenanceCount = useMemo(() => items.filter(i => i.status === 'Maintenance' || i.condition === 'Needs Repair').length, [items])
  const inServiceRate = useMemo(() => items.length ? Math.round(((items.length - maintenanceCount) / items.length) * 100) : 100, [items, maintenanceCount])

  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      name: '',
      category: 'IT & Lab Equipment',
      room: '',
      quantity: 1,
      unitCost: '',
      condition: 'Good',
      status: 'In Service',
      custodian: '',
      purchaseDate: new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      room: item.room,
      quantity: item.quantity,
      unitCost: item.unitCost,
      condition: item.condition,
      status: item.status,
      custodian: item.custodian || '',
      purchaseDate: item.purchaseDate || new Date().toISOString().split('T')[0]
    })
    setIsModalOpen(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this item from the inventory registry?')) {
      const updated = items.filter(i => i.id !== id)
      saveItems(updated)
      toast?.success?.('Inventory asset item removed successfully.')
    }
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.room.trim()) {
      toast?.error?.('Please provide an asset item name and assigned location/room.')
      return
    }

    if (editingItem) {
      const updated = items.map(i => i.id === editingItem.id ? { ...i, ...formData } : i)
      saveItems(updated)
      toast?.success?.(`Asset "${formData.name}" updated successfully.`)
    } else {
      const newItem = {
        id: `INV-${Math.floor(100 + Math.random() * 900)}`,
        ...formData
      }
      saveItems([newItem, ...items])
      toast?.success?.(`New asset "${formData.name}" recorded in campus inventory.`)
    }
    setIsModalOpen(false)
  }

  const handleExportCSV = () => {
    const header = 'Asset ID,Item Name,Category,Room/Location,Quantity,Unit Cost (PKR),Total Value (PKR),Condition,Status,Custodian\n'
    const rows = filteredItems.map(i => 
      `"${i.id}","${i.name}","${i.category}","${i.room}",${i.quantity},${i.unitCost},${i.quantity * i.unitCost},"${i.condition}","${i.status}","${i.custodian || ''}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Campus_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast?.success?.('Campus inventory CSV report downloaded.')
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Boxes className="w-3.5 h-3.5 text-purple-300" />
              <span>Campus Services • Asset & Equipment Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Inventory & Asset Management
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Real-time audit registry for computer labs, scientific apparatus, classroom furniture, sports kits, and consumable stores.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Sheet</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Stock / Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inventory Items</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalQuantity}</h3>
            <span className="text-[11px] text-purple-600 font-medium">{items.length} distinct asset codes</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <PackageCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Asset Valuation</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">PKR {(Number(totalValuation || 0) / 1000000).toFixed(2)}M</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Capital asset book value</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Operational Health</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{inServiceRate}%</h3>
            <span className="text-[11px] text-emerald-600 font-medium">Fully deployed in rooms</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Maintenance / Issues</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{maintenanceCount}</h3>
            <span className="text-[11px] text-amber-600 font-medium">Under repair / overhaul</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Module Tabs */}
      <div className="bg-white rounded-2xl p-1.5 border border-slate-200/80 shadow-2xs flex flex-wrap items-center gap-1">
        {[
          { id: 'categories', label: 'Categories' },
          { id: 'items', label: 'Items' },
          { id: 'receive', label: 'Receive Stock' },
          { id: 'issue', label: 'Issue to Students' },
          { id: 'reports', label: 'Inventory Reports' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === tab.id ? 'bg-purple-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <form onSubmit={handleAddCategory} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              placeholder="New Category Name (e.g. Uniforms)"
              value={newCatForm.name}
              onChange={(e) => setNewCatForm({ ...newCatForm, name: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <input
              type="text"
              placeholder="Category Description"
              value={newCatForm.description}
              onChange={(e) => setNewCatForm({ ...newCatForm, description: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer">
              + Add Category
            </button>
          </form>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[11px] uppercase text-slate-600">
                <tr>
                  <th className="py-3 px-4">S/N</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Items Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customCategories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-600">{cat.description}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-bold text-[11px]">
                        {items.filter(i => i.category === cat.name).length}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => saveCategories(customCategories.filter(c => c.id !== cat.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Receive Stock Tab */}
      {activeTab === 'receive' && (
        <div className="space-y-4">
          <form onSubmit={handleReceiveStock} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Inventory Item *</label>
              <select required value={receiveForm.itemId} onChange={(e) => setReceiveForm({ ...receiveForm, itemId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <option value="">Select Item</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} (Stock: {i.quantity})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity Received *</label>
              <input type="number" min="1" required value={receiveForm.quantity} onChange={(e) => setReceiveForm({ ...receiveForm, quantity: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Vendor / Supplier</label>
              <input type="text" placeholder="Supplier name" value={receiveForm.supplier} onChange={(e) => setReceiveForm({ ...receiveForm, supplier: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">GRN / Invoice Ref</label>
              <input type="text" placeholder="GRN-2026-01" value={receiveForm.refNo} onChange={(e) => setReceiveForm({ ...receiveForm, refNo: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer">
              Receive Stock
            </button>
          </form>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[11px] uppercase text-slate-600">
                <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Item</th><th className="py-3 px-4">Qty</th><th className="py-3 px-4">Supplier</th><th className="py-3 px-4">Ref</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockTransactions.filter(t => t.type === 'RECEIVE').length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">No stock intake entries recorded yet.</td></tr>
                ) : stockTransactions.filter(t => t.type === 'RECEIVE').map(t => (
                  <tr key={t.id}><td className="py-2.5 px-4">{t.date}</td><td className="py-2.5 px-4 font-semibold">{t.itemName}</td><td className="py-2.5 px-4 text-emerald-700 font-bold">+{t.quantity}</td><td className="py-2.5 px-4">{t.party}</td><td className="py-2.5 px-4 font-mono">{t.refNo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue to Students Tab */}
      {activeTab === 'issue' && (
        <div className="space-y-4">
          <form onSubmit={handleIssueToStudent} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Student *</label>
              <select required value={issueForm.studentId} onChange={(e) => setIssueForm({ ...issueForm, studentId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <option value="">Select Student</option>
                {campusStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.className || 'Enrolled'})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Inventory Item *</label>
              <select required value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <option value="">Select Item</option>
                {items.map(i => <option key={i.id} value={i.id}>{i.name} (Avail: {i.quantity})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Quantity *</label>
              <input type="number" min="1" required value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Remarks</label>
              <input type="text" placeholder="Uniform / Stationery" value={issueForm.remarks} onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs" />
            </div>
            <button type="submit" className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer">
              Issue Stock
            </button>
          </form>
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-[11px] uppercase text-slate-600">
                <tr><th className="py-3 px-4">Date</th><th className="py-3 px-4">Student</th><th className="py-3 px-4">Item</th><th className="py-3 px-4">Qty</th><th className="py-3 px-4">Notes</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stockTransactions.filter(t => t.type === 'ISSUE').length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-400">No items issued to students yet.</td></tr>
                ) : stockTransactions.filter(t => t.type === 'ISSUE').map(t => (
                  <tr key={t.id}><td className="py-2.5 px-4">{t.date}</td><td className="py-2.5 px-4 font-semibold">{t.party}</td><td className="py-2.5 px-4">{t.itemName}</td><td className="py-2.5 px-4 text-rose-600 font-bold">-{t.quantity}</td><td className="py-2.5 px-4">{t.refNo}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory Reports Tab */}
      {activeTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Valuation by Category</h3>
            {customCategories.map(cat => {
              const catItems = items.filter(i => i.category === cat.name)
              const catVal = catItems.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitCost || 0), 0)
              return (
                <div key={cat.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <span className="font-semibold text-slate-700">{cat.name} ({catItems.length})</span>
                  <span className="font-mono font-bold text-slate-900">PKR {catVal.toLocaleString()}</span>
                </div>
              )
            })}
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Low Stock &amp; Maintenance Alerts</h3>
            {items.filter(i => Number(i.quantity) < 10 || i.status === 'Maintenance').length === 0 ? (
              <p className="text-xs text-slate-400 py-4">All inventory stock levels and asset conditions are healthy.</p>
            ) : items.filter(i => Number(i.quantity) < 10 || i.status === 'Maintenance').map(i => (
              <div key={i.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                <div>
                  <span className="font-semibold text-slate-800">{i.name}</span>
                  <span className="block text-[11px] text-slate-400">{i.room}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 font-bold">Qty: {i.quantity} • {i.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {activeTab === 'items' && (<>
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by asset code, name, room, or custodian..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="All">All Conditions</option>
              <option value="New">Brand New</option>
              <option value="Good">Good Condition</option>
              <option value="Fair">Fair / Minor Wear</option>
              <option value="Needs Repair">Needs Repair</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-purple-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200/80 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Asset ID & Item Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Room / Department</th>
                <th className="py-3.5 px-4">Qty & Cost</th>
                <th className="py-3.5 px-4">Total Value</th>
                <th className="py-3.5 px-4">Condition</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No inventory assets match your search</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your filters or click "Add Stock / Asset".</p>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="font-bold">{item.name}</div>
                      <div className="font-mono text-[10px] text-purple-600 mt-0.5">{item.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px] border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{item.room}</div>
                      <div className="text-[10px] text-slate-400">{item.custodian || 'Unassigned'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div><span className="font-bold text-slate-900">{item.quantity}</span> units</div>
                      <div className="text-[10px] text-slate-400">@ PKR {Number(item.unitCost).toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      PKR {(Number(item.quantity) * Number(item.unitCost)).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.condition === 'New' || item.condition === 'Good' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : item.condition === 'Fair' 
                          ? 'bg-amber-50 text-amber-700 border-amber-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        item.status === 'In Service' ? 'text-emerald-600' :
                        item.status === 'Maintenance' ? 'text-amber-600' : 'text-blue-600'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Asset Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete from Registry"
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
      </>)}

      {/* Modal: Add / Edit Asset */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItem ? 'Edit Asset Record' : 'Record New Campus Asset'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset / Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dell Core i7 Desktop Computer"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Asset Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    {categories.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Room / Lab *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Lab 2, Hall A"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unit Cost (PKR)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 85000"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Physical Condition</label>
                  <select
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="New">Brand New</option>
                    <option value="Good">Good Condition</option>
                    <option value="Fair">Fair / Minor Wear</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Deployment Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:outline-none"
                  >
                    <option value="In Service">In Service / Active</option>
                    <option value="In Stock">In Storage Stock</option>
                    <option value="Maintenance">Under Maintenance</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custodian / Responsible Staff</label>
                  <input
                    type="text"
                    placeholder="e.g. Lab Assistant Tariq / Head of Science"
                    value={formData.custodian}
                    onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm"
                >
                  {editingItem ? 'Save Changes' : 'Record Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusInventoryView
