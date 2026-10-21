import React, { useState, useMemo } from 'react'
import { 
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
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const InstitutesView = () => {
  const { institutes, examinationBodies, addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInstitute, setEditingInstitute] = useState(null)
  const [viewingDetails, setViewingDetails] = useState(null)

  // Sorting & Pagination
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    province: 'Punjab',
    principal: '',
    email: '',
    phone: '',
    address: '',
    affiliatedBoard: 'BISE Lahore',
    status: 'Active'
  })

  const openAddModal = () => {
    setEditingInstitute(null)
    setFormData({
      name: '',
      code: `SCH-${Math.floor(100 + Math.random() * 900)}`,
      city: 'Lahore',
      province: 'Punjab',
      principal: '',
      email: '',
      phone: '',
      address: '',
      affiliatedBoard: examinationBodies[0]?.code || 'BISE Lahore',
      status: 'Active'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (inst) => {
    setEditingInstitute(inst)
    setFormData({
      name: inst.name || '',
      code: inst.code || '',
      city: inst.city || inst.districtName || 'Lahore',
      province: inst.province || inst.divisionName || 'Punjab',
      principal: inst.principal || '',
      email: inst.email || '',
      phone: inst.phone || '',
      address: inst.address || '',
      affiliatedBoard: inst.affiliatedBoard || 'BISE Lahore',
      status: inst.status || 'Active'
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
    if (!formData.name || !formData.code) {
      toast.error('Institute Name and Code are required.')
      return
    }

    const cleanCode = formData.code.trim()

    // Duplicate Institute Code Validation
    const isDuplicate = institutes.some(inst => 
      inst.code?.toLowerCase() === cleanCode.toLowerCase() &&
      (!editingInstitute || inst.id !== editingInstitute.id)
    )

    if (isDuplicate) {
      toast.error(`Institute Code "${cleanCode}" is already in use by another campus!`)
      return
    }

    const payload = {
      ...formData,
      code: cleanCode,
      totalStudents: editingInstitute?.totalStudents || 0,
      totalTeachers: editingInstitute?.totalTeachers || 0
    }

    if (editingInstitute) {
      await updateItem('institutes', editingInstitute.id, payload)
      toast.success(`Institute "${formData.name}" profile updated.`)
    } else {
      await addItem('institutes', payload)
      toast.success(`Institute "${formData.name}" registered successfully!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name || 'this institute'}"?`)) {
      await deleteItem('institutes', id)
      toast.success(`Institute deleted.`)
    }
  }

  // Filter and Sort Institutes
  const filteredAndSorted = useMemo(() => {
    const list = institutes.filter(inst =>
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((inst.city || inst.address) && (inst.city || inst.address).toLowerCase().includes(searchTerm.toLowerCase()))
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
  }, [institutes, searchTerm, sortField, sortDirection])

  // Pagination calculation
  const totalInstitutes = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalInstitutes / pageSize))
  const paginatedInstitutes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // Export to CSV
  const exportInstitutesCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No institutes to export.')
      return
    }

    const headers = ['Institute Name', 'Code', 'City', 'Province', 'Principal', 'Email', 'Phone', 'Affiliated Board', 'Status']
    const rows = filteredAndSorted.map(inst => [
      `"${inst.name || ''}"`,
      `"${inst.code || ''}"`,
      `"${inst.city || ''}"`,
      `"${inst.province || ''}"`,
      `"${inst.principal || ''}"`,
      `"${inst.email || ''}"`,
      `"${inst.phone || ''}"`,
      `"${inst.affiliatedBoard || ''}"`,
      `"${inst.status || 'Active'}"`
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

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Institutes Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Register, configure, and oversee campuses and school branches</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportInstitutesCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Export institutes to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Institute</span>
          </button>
        </div>
      </div>

      {/* Search Bar & Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institute name, code, or city..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Sort by:</span>
            <button
              onClick={() => handleSort('name')}
              className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                sortField === 'name' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>Name</span>
              {sortField === 'name' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>
            <button
              onClick={() => handleSort('code')}
              className={`px-2 py-1 rounded text-xs font-medium border flex items-center gap-1 ${
                sortField === 'code' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <span>Code</span>
              {sortField === 'code' && (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>
          </div>

          <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg whitespace-nowrap">
            Total: {totalInstitutes}
          </span>
        </div>
      </div>

      {/* Institutes Cards Grid */}
      {paginatedInstitutes.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInstitutes.map((inst) => (
              <div 
                key={inst.id} 
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base shadow-sm">
                      <School className="w-6 h-6" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">
                        {inst.code}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                        {inst.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-4 leading-snug">{inst.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inst.address || `${inst.city || 'City'}, ${inst.province || 'Punjab'}`}</span>
                  </p>

                  {/* Institute Quick Details */}
                  <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Head / Principal:</span>
                      <span className="font-medium text-slate-700">{inst.principal || 'In-Charge Principal'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Affiliation:</span>
                      <span className="font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">{inst.affiliatedBoard || 'Board Affiliated'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Official Email:</span>
                      <span className="font-medium text-blue-600 truncate max-w-[170px]">{inst.email || 'info@sms.edu'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-medium text-slate-700">{inst.phone || '—'}</span>
                    </div>
                  </div>

                  {/* Stats badges */}
                  <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <span className="block text-[11px] text-slate-400">Students</span>
                      <span className="text-sm font-bold text-slate-800">{inst.totalStudents || 0}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <span className="block text-[11px] text-slate-400">Faculty</span>
                      <span className="text-sm font-bold text-slate-800">{inst.totalTeachers || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setViewingDetails(inst)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    title="View campus details and profile"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Profile</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(inst)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded hover:bg-white transition-colors"
                      title="Edit Institute"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(inst.id, inst.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-white transition-colors"
                      title="Delete Institute"
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
                        ? 'bg-blue-600 text-white'
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
            No institutes matched your search query. Try clearing the filter or register a new campus.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Institute</span>
          </button>
        </div>
      )}

      {/* Modal - Add / Edit Institute */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingInstitute ? 'Edit Institute Profile' : 'Register New Campus / Institute'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute Official Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g. Beaconhouse Central High School"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Institute Code (Unique) *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. BHS-001"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Affiliated Examination Board</label>
              <select
                value={formData.affiliatedBoard}
                onChange={(e) => setFormData({ ...formData, affiliatedBoard: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {examinationBodies && examinationBodies.length > 0 ? (
                  examinationBodies.map(ex => (
                    <option key={ex.id} value={ex.code || ex.name}>{ex.name}</option>
                  ))
                ) : (
                  <>
                    <option value="BISE Lahore">BISE Lahore</option>
                    <option value="BISE Rawalpindi">BISE Rawalpindi</option>
                    <option value="Federal Board (FBISE)">Federal Board (FBISE)</option>
                    <option value="Cambridge Assessment (CAIE)">Cambridge Assessment (CAIE)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Head of Institute / Principal</label>
              <input
                type="text"
                value={formData.principal}
                onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Dr. Shahida Parveen"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="e.g. Lahore"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="principal@sms.edu"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Official Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="+92 42 35789012"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Campus Physical Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="e.g. Sector H-8/4, Islamabad"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow transition-all"
            >
              {editingInstitute ? 'Update Campus' : 'Register Campus'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Details View Modal */}
      {viewingDetails && (
        <Modal
          isOpen={Boolean(viewingDetails)}
          onClose={() => setViewingDetails(null)}
          title={`Campus Profile: ${viewingDetails.name}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md font-bold">
                  Code: {viewingDetails.code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {viewingDetails.status || 'Active'}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">{viewingDetails.name}</h4>
              <p className="text-xs text-slate-500 mt-1">{viewingDetails.address || `${viewingDetails.city}, ${viewingDetails.province}`}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Principal / Head</span>
                <span className="font-semibold text-slate-800">{viewingDetails.principal || 'In-Charge Principal'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Board Affiliation</span>
                <span className="font-semibold text-slate-800">{viewingDetails.affiliatedBoard || 'BISE Lahore'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Email</span>
                <span className="font-semibold text-blue-600 truncate block">{viewingDetails.email || '—'}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Contact Phone</span>
                <span className="font-semibold text-slate-800">{viewingDetails.phone || '—'}</span>
              </div>
            </div>

            {/* Campus Infrastructure, Facilities & Quality Accreditation Audit */}
            <div className="bg-gradient-to-br from-indigo-50/60 to-slate-50 border border-indigo-100/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 tracking-tight">Campus Infrastructure & Quality Accreditation Audit</h4>
                    <p className="text-[11px] text-slate-500">Regulatory standards compliance & campus facility audit report</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Category-A Tier
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Laboratories</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">3 Full Labs</p>
                  <p className="text-[10px] text-slate-500">Physics, Chem, Bio</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Computer Lab</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">50 Workstations</p>
                  <p className="text-[10px] text-slate-500">High-speed LAN/Fibre</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Central Library</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">9,200 Titles</p>
                  <p className="text-[10px] text-slate-500">OPAC & Digital Kiosk</p>
                </div>
                <div className="bg-white/80 p-2.5 rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Student-Teacher</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">18:1 Ratio</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Optimal Standard</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-indigo-100/60 text-[11px] text-slate-600">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Affiliation License: <strong>Valid through Dec 2028</strong>
                  </span>
                  <span className="flex items-center gap-1 text-slate-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Fire & Safety Clearance: <strong>Certified</strong>
                  </span>
                </div>
                <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100/70 px-2 py-0.5 rounded">
                  BISE Registered Campus
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
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
    </div>
  )
}

export default InstitutesView
