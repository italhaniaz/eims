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
  ChevronRight
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const TeachersView = ({ currentInstitute }) => {
  const { teachers, addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState(null)

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
    if (!formData.name || !formData.empId) {
      toast.error('Faculty Name and Employee ID are required.')
      return
    }

    const cleanEmpId = formData.empId.trim()

    // Duplicate EmpID check
    const isDuplicate = teachers.some(t => 
      t.empId?.toLowerCase() === cleanEmpId.toLowerCase() &&
      (!editingTeacher || t.id !== editingTeacher.id) &&
      (!t.instituteId || t.instituteId === currentInstitute?.id)
    )

    if (isDuplicate) {
      toast.error(`Employee ID "${cleanEmpId}" is already assigned to another faculty member!`)
      return
    }

    const payload = {
      ...formData,
      empId: cleanEmpId,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingTeacher) {
      await updateItem('teachers', editingTeacher.id, payload)
      toast.success(`Faculty member "${formData.name}" updated.`)
    } else {
      await addItem('teachers', payload)
      toast.success(`Faculty member "${formData.name}" added successfully!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete faculty record for "${name}"?`)) {
      await deleteItem('teachers', id)
      toast.success(`Faculty record removed.`)
    }
  }

  // Filtered and Sorted
  const filteredAndSorted = useMemo(() => {
    const list = teachers.filter(t =>
      (!t.instituteId || t.instituteId === currentInstitute?.id) &&
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
       t.department.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return list.sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''

      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [teachers, currentInstitute?.id, searchTerm, sortField, sortDirection])

  // Pagination calculation
  const totalTeachers = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalTeachers / pageSize))
  const paginatedTeachers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // Export CSV
  const exportTeachersCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No faculty records to export.')
      return
    }

    const headers = ['Full Name', 'Employee ID', 'Designation', 'Department', 'Phone', 'Email', 'Status']
    const rows = filteredAndSorted.map(t => [
      `"${t.name || ''}"`,
      `"${t.empId || ''}"`,
      `"${t.designation || ''}"`,
      `"${t.department || ''}"`,
      `"${t.phone || ''}"`,
      `"${t.email || ''}"`,
      `"${t.status || 'Active'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `faculty_directory_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} faculty members to CSV.`)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Teaching Staff</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage teaching staff, designations, and department assignments</p>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Grid of Teacher cards */}
      {paginatedTeachers.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedTeachers.map(t => (
              <div key={t.id} className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div>
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
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{t.email || 'No email registered'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {t.status || 'Active'}
                  </span>

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
            ))}
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
        <div className="bg-white rounded-xl p-10 border border-slate-200 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Faculty Records Found</p>
          <p className="text-xs text-slate-400 mt-1">Add teachers using the button above.</p>
        </div>
      )}

      {/* Modal - Add / Edit Teacher */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTeacher ? 'Edit Teacher Details' : 'Add New Faculty Member'}
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
    </div>
  )
}

export default TeachersView
