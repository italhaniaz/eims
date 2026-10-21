import React, { useState, useMemo } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  BookOpen,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Receipt,
  DollarSign,
  Printer,
  CheckCircle2,
  Building2,
  School,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const TeachersView = ({ currentInstitute }) => {
  const { teachers = [], institutes = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)
  const [selectedSalaryTeacher, setSelectedSalaryTeacher] = useState(null)
  const [salaryMonth, setSalaryMonth] = useState('October 2026')

  // Sorting & Pagination
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)

  const [formData, setFormData] = useState({
    name: '',
    empId: '',
    designation: 'Senior Teacher',
    department: 'Sciences',
    phone: '',
    email: '',
    basicSalary: 65000,
    allowance: 15000,
    deductions: 3500,
    bankAccount: 'PK72HABB000192837465',
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingTeacher(null)
    setFormData({
      name: '',
      empId: `EMP-${Math.floor(10 + Math.random() * 90)}`,
      designation: 'Senior Teacher',
      department: 'Sciences',
      phone: '',
      email: '',
      basicSalary: 65000,
      allowance: 15000,
      deductions: 3500,
      bankAccount: `PK${Math.floor(10 + Math.random() * 89)}HABB000${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (t) => {
    setEditingTeacher(t)
    setFormData({
      name: t.name || '',
      empId: t.empId || '',
      designation: t.designation || 'Senior Teacher',
      department: t.department || 'Sciences',
      phone: t.phone || '',
      email: t.email || '',
      basicSalary: t.basicSalary || 65000,
      allowance: t.allowance || 15000,
      deductions: t.deductions || 3500,
      bankAccount: t.bankAccount || 'PK72HABB000192837465',
      status: t.status || 'Active'
    })
    setIsModalOpen(true)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.empId.trim()) {
      toast.error('Faculty Name and Employee ID are required.')
      return
    }

    // Check duplicate employee ID
    const isDuplicate = teachers.some(t => 
      t.empId?.toLowerCase() === formData.empId.toLowerCase() && 
      (!editingTeacher || t.id !== editingTeacher.id)
    )
    if (isDuplicate) {
      toast.error(`Employee ID "${formData.empId}" is already assigned to another faculty member.`)
      return
    }

    const payload = {
      ...formData,
      basicSalary: Number(formData.basicSalary || 0),
      allowance: Number(formData.allowance || 0),
      deductions: Number(formData.deductions || 0),
      netSalary: Number(formData.basicSalary || 0) + Number(formData.allowance || 0) - Number(formData.deductions || 0),
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingTeacher) {
      await updateItem('teachers', editingTeacher.id, payload)
      toast.success(`Faculty profile for ${formData.name} updated successfully!`)
    } else {
      await addItem('teachers', payload)
      toast.success(`Faculty member ${formData.name} registered!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from faculty records?`)) {
      await deleteItem('teachers', id)
      toast.info(`Faculty member ${name} removed.`)
    }
  }

  // Export Faculty CSV
  const exportTeachersCSV = () => {
    if (teachers.length === 0) {
      toast.warning('No faculty members available to export.')
      return
    }

    const headers = ['Employee ID', 'Name', 'Designation', 'Department', 'Phone', 'Email', 'Basic Salary', 'Allowances', 'Deductions', 'Net Salary', 'Status']
    const rows = teachers.map(t => [
      `"${t.empId || ''}"`,
      `"${t.name || ''}"`,
      `"${t.designation || ''}"`,
      `"${t.department || ''}"`,
      `"${t.phone || ''}"`,
      `"${t.email || ''}"`,
      `"${t.basicSalary || 65000}"`,
      `"${t.allowance || 15000}"`,
      `"${t.deductions || 3500}"`,
      `"${(t.basicSalary || 65000) + (t.allowance || 15000) - (t.deductions || 3500)}"`,
      `"${t.status || 'Active'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Faculty_Roster_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Faculty roster exported to CSV.')
  }

  // Filtered & Sorted
  const filtered = useMemo(() => {
    return teachers.filter(t => {
      const matchInst = !t.instituteId || t.instituteId === currentInstitute?.id
      if (!matchInst) return false
      const term = searchTerm.toLowerCase()
      return (
        t.name?.toLowerCase().includes(term) ||
        t.empId?.toLowerCase().includes(term) ||
        t.department?.toLowerCase().includes(term) ||
        t.designation?.toLowerCase().includes(term)
      )
    }).sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase()
      const valB = (b[sortField] || '').toString().toLowerCase()
      return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    })
  }, [teachers, currentInstitute?.id, searchTerm, sortField, sortDirection])

  const totalTeachers = filtered.length
  const totalPages = Math.ceil(totalTeachers / pageSize) || 1
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Staff Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Department allocations, academic faculty directory, staff compensation payroll, and printable monthly pay slips
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportTeachersCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Export faculty roster to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Teacher</span>
          </button>
        </div>
      </div>

      {/* Search and Sorting toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, employee ID, or department..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Sort:</span>
            <button
              onClick={() => handleSort('name')}
              className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                sortField === 'name' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>Name</span>
              {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>
            <button
              onClick={() => handleSort('department')}
              className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                sortField === 'department' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>Dept</span>
              {sortField === 'department' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>
          </div>

          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg whitespace-nowrap">
            Total: {totalTeachers}
          </span>
        </div>
      </div>

      {/* Faculty Cards Grid */}
      {paginatedTeachers.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTeachers.map((t) => {
              const basic = t.basicSalary || 65000
              const allow = t.allowance || 15000
              const ded = t.deductions || 3500
              const net = basic + allow - ded

              return (
                <div 
                  key={t.id} 
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        {t.name.charAt(0)}
                      </div>
                      <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold border border-slate-200">
                        {t.empId}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 mt-3 text-base">{t.name}</h3>
                    <p className="text-xs text-emerald-600 font-semibold">{t.designation}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.department} Department</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t.phone || 'No phone registered'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-mono font-semibold text-slate-700">Net Pay: Rs. {net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedSalaryTeacher(t)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Generate Official Monthly Salary Slip"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Pay Slip</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => openEditModal(t)} 
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                        title="Edit Faculty Member"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(t.id, t.name)} 
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete Faculty Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

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
                        ? 'bg-emerald-600 text-white'
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
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Faculty Members Found</h3>
          <p className="text-xs text-slate-400 mt-1">Get started by clicking the "Add New Teacher" button above.</p>
        </div>
      )}

      {/* Add / Edit Faculty Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Faculty Details & Compensation' : 'Register New Faculty Member'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Dr. Shahida Parveen"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Employee ID (Unique) *</label>
              <input
                type="text"
                required
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="EMP-01"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Designation</label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Senior Lecturer / Principal"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Sciences">Sciences</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English & Languages">English & Languages</option>
                <option value="Social Sciences">Social Sciences</option>
                <option value="Administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Resigned">Resigned</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="+92 3XX-XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="teacher@sms.edu"
              />
            </div>
          </div>

          {/* Salary Structure Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Faculty Salary Package (PKR)
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Basic Pay</label>
                <input
                  type="number"
                  min="0"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Allowances</label>
                <input
                  type="number"
                  min="0"
                  value={formData.allowance}
                  onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">Deductions (Tax/PF)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Disbursement Bank Account (IBAN)</label>
              <input
                type="text"
                value={formData.bankAccount}
                onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-200 font-mono bg-white"
                placeholder="PK72HABB000192837465"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow transition-all"
            >
              {editingTeacher ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Monthly Salary Slip Modal */}
      {selectedSalaryTeacher && (
        <Modal
          isOpen={Boolean(selectedSalaryTeacher)}
          onClose={() => setSelectedSalaryTeacher(null)}
          title="Official Faculty Monthly Salary Slip / Pay Voucher"
        >
          <div className="space-y-4">
            <div 
              id="printable-salary-slip"
              className="p-6 bg-white border-2 border-slate-300 rounded-2xl space-y-4 print:border-black"
            >
              {/* Slip Header */}
              <div className="text-center border-b pb-4">
                <School className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {currentInstitute?.name || institutes[0]?.name || 'CENTRAL HIGH SCHOOL'}
                </h3>
                <p className="text-xs text-slate-500">Finance & Payroll Disbursement Department</p>
                <div className="mt-2 inline-flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    PAY SLIP FOR {salaryMonth}
                  </span>
                </div>
              </div>

              {/* Faculty Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-400">Employee Name:</span> <strong className="text-slate-800">{selectedSalaryTeacher.name}</strong></div>
                <div><span className="text-slate-400">Employee ID:</span> <strong className="text-slate-800 font-mono">{selectedSalaryTeacher.empId}</strong></div>
                <div><span className="text-slate-400">Designation:</span> <strong className="text-slate-800">{selectedSalaryTeacher.designation}</strong></div>
                <div><span className="text-slate-400">Department:</span> <strong className="text-slate-800">{selectedSalaryTeacher.department}</strong></div>
                <div className="col-span-2"><span className="text-slate-400">Bank Account:</span> <strong className="text-slate-800 font-mono">{selectedSalaryTeacher.bankAccount || 'PK72HABB000192837465'}</strong></div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Earnings */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 border-b">Earnings (PKR)</div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Basic Salary:</span>
                      <strong className="font-mono">Rs. {(selectedSalaryTeacher.basicSalary || 65000).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Allowances (Medical/Conveyance):</span>
                      <strong className="font-mono">Rs. {(selectedSalaryTeacher.allowance || 15000).toLocaleString()}</strong>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-bold text-slate-800">
                      <span>Gross Earnings:</span>
                      <span className="font-mono">Rs. {((selectedSalaryTeacher.basicSalary || 65000) + (selectedSalaryTeacher.allowance || 15000)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-rose-50 px-3 py-1.5 font-bold text-rose-800 border-b">Deductions (PKR)</div>
                  <div className="p-3 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Income Tax (Withheld):</span>
                      <strong className="font-mono text-rose-600">Rs. {Math.round((selectedSalaryTeacher.deductions || 3500) * 0.6).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Provident Fund / EOBI:</span>
                      <strong className="font-mono text-rose-600">Rs. {Math.round((selectedSalaryTeacher.deductions || 3500) * 0.4).toLocaleString()}</strong>
                    </div>
                    <div className="pt-2 border-t flex justify-between font-bold text-rose-700">
                      <span>Total Deductions:</span>
                      <span className="font-mono">Rs. {(selectedSalaryTeacher.deductions || 3500).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Payable Highlight */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Net Take-Home Salary</span>
                  <span className="text-[10px] text-slate-500">Credited via Electronic Bank Transfer</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xl font-black text-emerald-800">
                    Rs. {((selectedSalaryTeacher.basicSalary || 65000) + (selectedSalaryTeacher.allowance || 15000) - (selectedSalaryTeacher.deductions || 3500)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-8 text-[11px] text-slate-400 border-t flex justify-between">
                <span>Accounts Officer</span>
                <span>Faculty Signature</span>
                <span>Bursar / Principal Seal</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSalaryTeacher(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Pay Slip (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default TeachersView
