import React, { useState, useMemo, useRef } from 'react'
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  IdCard, 
  Printer, 
  User, 
  School, 
  QrCode, 
  Filter, 
  X,
  Download,
  Upload,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  FileSpreadsheet,
  AlertCircle,
  FileText,
  Award,
  CheckCircle2
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { detectProgramLevel, normalizeClassSections } from '../../../constants/academicLevels'
import Modal from '../../../components/common/Modal'

export const StudentsView = ({ currentInstitute }) => {
  const { 
    students, 
    classes = [],
    addItem, 
    updateItem, 
    deleteItem,
    activeProgramLevel,
    setActiveProgramLevel,
    programLevels = [] 
  } = useAppData()

  const { toast } = useToast()
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [selectedIdCard, setSelectedIdCard] = useState(null)
  const [selectedSLC, setSelectedSLC] = useState(null)

  // Sorting state
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    className: '10th Grade',
    section: 'A',
    email: '',
    phone: '',
    bloodGroup: 'B+',
    emergencyContact: '',
    feeStatus: 'Paid',
    attendanceRate: '95%',
    photoUrl: null
  })

  // Photo Upload Handler (Converts image to Data URL)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.warning('Image size is larger than 2MB. Please select a smaller photo.')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      setFormData(prev => ({ ...prev, photoUrl: event.target?.result }))
      toast.info('Student photo attached.')
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, photoUrl: null }))
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const openAddModal = () => {
    setEditingStudent(null)
    setFormData({
      name: '',
      rollNumber: `STD-${Math.floor(1000 + Math.random() * 9000)}`,
      className: '10th Grade',
      section: 'A',
      email: '',
      phone: '',
      bloodGroup: 'B+',
      emergencyContact: '',
      feeStatus: 'Paid',
      attendanceRate: '95%',
      photoUrl: null
    })
    setIsModalOpen(true)
  }

  const openEditModal = (s) => {
    setEditingStudent(s)
    setFormData({
      name: s.name || '',
      rollNumber: s.rollNumber || '',
      className: s.className || '10th Grade',
      section: s.section || 'A',
      email: s.email || '',
      phone: s.phone || '',
      bloodGroup: s.bloodGroup || 'B+',
      emergencyContact: s.emergencyContact || '',
      feeStatus: s.feeStatus || 'Paid',
      attendanceRate: s.attendanceRate || '95%',
      photoUrl: s.photoUrl || null
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
    if (!formData.name || !formData.rollNumber) {
      toast.error('Student Name and Roll Number are required.')
      return
    }

    const cleanRoll = formData.rollNumber.trim()

    // Duplicate Roll Number Validation Check
    const isDuplicate = students.some(s => 
      s.rollNumber?.toLowerCase() === cleanRoll.toLowerCase() &&
      (!editingStudent || s.id !== editingStudent.id) &&
      (!s.instituteId || s.instituteId === currentInstitute?.id)
    )

    if (isDuplicate) {
      toast.error(`Roll Number "${cleanRoll}" already exists for another student in this campus!`)
      return
    }

    const payload = {
      ...formData,
      rollNumber: cleanRoll,
      instituteId: currentInstitute?.id || 'inst-1'
    }

    if (editingStudent) {
      await updateItem('students', editingStudent.id, payload)
      toast.success(`Student "${formData.name}" profile updated.`)
    } else {
      await addItem('students', payload)
      toast.success(`Student "${formData.name}" enrolled successfully!`)
    }
    setIsModalOpen(false)
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"?`)) {
      await deleteItem('students', id)
      toast.success(`Student "${name}" removed.`)
    }
  }

  // Filtered & Sorted Student Roster
  const filteredAndSorted = useMemo(() => {
    const list = students.filter(s => {
      const matchesCampus = !s.instituteId || s.instituteId === currentInstitute?.id
      const query = searchTerm.toLowerCase()
      const matchesSearch = 
        (s.name || '').toLowerCase().includes(query) ||
        (s.rollNumber || '').toLowerCase().includes(query) ||
        (s.className || '').toLowerCase().includes(query) ||
        (s.phone || '').includes(query)

      if (!matchesCampus || !matchesSearch) return false

      if (activeProgramLevel && activeProgramLevel !== 'all') {
        const studentLevel = detectProgramLevel(s.className)
        return studentLevel === activeProgramLevel || studentLevel === 'all'
      }
      return true
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
  }, [students, currentInstitute?.id, searchTerm, activeProgramLevel, sortField, sortDirection])

  // Pagination calculation
  const totalStudents = filteredAndSorted.length
  const totalPages = Math.max(1, Math.ceil(totalStudents / pageSize))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSorted.slice(start, start + pageSize)
  }, [filteredAndSorted, currentPage, pageSize])

  // Reset to page 1 on search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // CSV Export Feature
  const exportToCSV = () => {
    if (filteredAndSorted.length === 0) {
      toast.warning('No student records to export.')
      return
    }

    const headers = ['Full Name', 'Roll Number', 'Class', 'Section', 'Email', 'Phone', 'Blood Group', 'Fee Status', 'Attendance Rate']
    const rows = filteredAndSorted.map(s => [
      `"${s.name || ''}"`,
      `"${s.rollNumber || ''}"`,
      `"${s.className || ''}"`,
      `"${s.section || 'A'}"`,
      `"${s.email || ''}"`,
      `"${s.phone || s.emergencyContact || ''}"`,
      `"${s.bloodGroup || 'B+'}"`,
      `"${s.feeStatus || 'Paid'}"`,
      `"${s.attendanceRate || '95%'}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `students_roster_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filteredAndSorted.length} students to CSV.`)
  }

  // CSV Import Feature
  const handleCSVImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const text = event.target?.result
        if (typeof text !== 'string') return
        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length < 2) {
          toast.error('The uploaded CSV file is empty or missing data rows.')
          return
        }

        let importedCount = 0
        let skippedCount = 0

        // Parse rows starting after header
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].split(',').map(item => item.replace(/^["']|["']$/g, '').trim())
          const [name, rollNumber, className, section, email, phone, bloodGroup, feeStatus, attendanceRate] = row

          if (!name || !rollNumber) {
            skippedCount++
            continue
          }

          // Check if roll number already exists
          const exists = students.some(s => s.rollNumber?.toLowerCase() === rollNumber.toLowerCase())
          if (exists) {
            skippedCount++
            continue
          }

          await addItem('students', {
            name,
            rollNumber,
            className: className || '10th Grade',
            section: section || 'A',
            email: email || '',
            phone: phone || '',
            bloodGroup: bloodGroup || 'B+',
            feeStatus: feeStatus || 'Paid',
            attendanceRate: attendanceRate || '95%',
            instituteId: currentInstitute?.id || 'inst-1'
          })
          importedCount++
        }

        if (importedCount > 0) {
          toast.success(`Successfully imported ${importedCount} students!`)
        }
        if (skippedCount > 0) {
          toast.info(`Skipped ${skippedCount} duplicate or incomplete rows.`)
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to parse CSV file. Ensure valid CSV formatting.')
      } finally {
        if (csvInputRef.current) csvInputRef.current.value = ''
      }
    }
    reader.readAsText(file)
  }

  const activeLevelObj = programLevels.find(l => l.key === activeProgramLevel)

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Admissions & Roster</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Enroll students, generate smart photo ID cards, and manage student rosters</p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={csvInputRef}
            onChange={handleCSVImport}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Import students from CSV file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            title="Export filtered student roster to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Student Admission</span>
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Search & Filter toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5 flex-1">
            <div className="relative w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, roll number, or grade..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              />
            </div>
            {activeProgramLevel && activeProgramLevel !== 'all' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shrink-0">
                <span>Tier: {activeLevelObj?.shortTitle}</span>
                <button
                  onClick={() => setActiveProgramLevel('all')}
                  className="text-blue-500 hover:text-blue-800 ml-1 font-bold"
                  title="Clear tier filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>
            <span className="text-xs text-slate-500 font-medium whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-full">
              Total: {totalStudents}
            </span>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-600 font-bold border-b border-slate-200/80">
              <tr>
                <th 
                  onClick={() => handleSort('name')} 
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Student Profile</span>
                    {sortField === 'name' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('rollNumber')} 
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Roll Number</span>
                    {sortField === 'rollNumber' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('className')} 
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Class & Section</span>
                    {sortField === 'className' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5">Contact</th>
                <th 
                  onClick={() => handleSort('feeStatus')} 
                  className="px-6 py-3.5 cursor-pointer hover:bg-slate-100/80 select-none transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Fee Status</span>
                    {sortField === 'feeStatus' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-emerald-600" /> : <ArrowDown className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {s.photoUrl ? (
                            <img src={s.photoUrl} alt={s.name} className="w-full h-full object-cover" />
                          ) : (
                            s.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">{s.name}</div>
                          <div className="text-[11px] text-slate-400">{s.email || 'No email registered'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {s.rollNumber}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-800">{s.className} ({s.section || 'A'})</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase font-semibold">
                          {detectProgramLevel(s.className)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500">{s.phone || s.emergencyContact || '—'}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        s.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-amber-50 text-amber-600 border border-amber-200'
                      }`}>
                        {s.feeStatus}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedIdCard(s)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                          title="Generate Student ID Card"
                        >
                          <IdCard className="w-3.5 h-3.5" />
                          <span>ID Card</span>
                        </button>
                        <button
                          onClick={() => setSelectedSLC(s)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-amber-50 text-amber-800 hover:bg-amber-100 flex items-center gap-1 transition-colors"
                          title="Generate Official School Leaving & Character Certificate (SLC)"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>SLC</span>
                        </button>
                        <button 
                          onClick={() => openEditModal(s)} 
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(s.id, s.name)} 
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No Student Records Found</p>
                    <p className="text-xs text-slate-400 mt-1">Enroll students manually or import via CSV file above.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalStudents > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, totalStudents)}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalStudents}</span> students
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                .map((page, idx, arr) => {
                  const prev = arr[idx - 1]
                  return (
                    <React.Fragment key={page}>
                      {prev && page - prev > 1 && <span className="px-1 text-slate-400">...</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 rounded text-xs font-semibold transition-all ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  )
                })}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admission / Edit Modal with Photo Upload */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Details' : 'New Student Admission'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo upload header */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-slate-200 border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-slate-400" />
              )}
            </div>
            <div className="flex-1">
              <span className="block text-xs font-semibold text-slate-700">Student ID Card Photo</span>
              <span className="text-[11px] text-slate-400 block mb-1.5">JPG or PNG (max 2MB)</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-500" />
                  <span>Choose Photo</span>
                </button>
                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-[11px] text-rose-500 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Student Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Daniyal Tariq"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number (Unique) *</label>
              <input
                type="text"
                required
                value={formData.rollNumber}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. BHS-101"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Grade / Class *</label>
              <input
                type="text"
                required
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="e.g. 10th Grade"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Section</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="A / B / C"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Contact Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="+92 3XX-XXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Fee Status</label>
              <select
                value={formData.feeStatus}
                onChange={(e) => setFormData({ ...formData, feeStatus: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all"
            >
              {editingStudent ? 'Save Changes' : 'Enroll Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Student ID Card Badge Modal */}
      {selectedIdCard && (
        <Modal
          isOpen={Boolean(selectedIdCard)}
          onClose={() => setSelectedIdCard(null)}
          title="Student Official Identity Badge"
        >
          <div className="space-y-4">
            {/* Student ID Card Badge Preview */}
            <div className="w-full max-w-[340px] mx-auto bg-gradient-to-b from-[#111c30] to-[#1e345b] text-white rounded-2xl shadow-xl overflow-hidden border-2 border-emerald-500/50 print:border-black">
              {/* Card Header */}
              <div className="p-4 text-center border-b border-white/10 bg-emerald-700/30">
                <School className="w-7 h-7 mx-auto text-emerald-400 mb-1" />
                <h4 className="text-xs font-black uppercase tracking-wider leading-snug">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h4>
                <span className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">Student Identity Card</span>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col items-center text-center">
                {/* Photo Frame */}
                <div className="w-20 h-24 rounded-xl bg-white/10 border-2 border-dashed border-emerald-400/60 flex flex-col items-center justify-center text-slate-300 mb-3 shadow-inner overflow-hidden">
                  {selectedIdCard.photoUrl ? (
                    <img src={selectedIdCard.photoUrl} alt={selectedIdCard.name} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <User className="w-10 h-10 text-emerald-300/80" />
                      <span className="text-[8px] uppercase tracking-wider text-slate-400 mt-1">Photo</span>
                    </>
                  )}
                </div>

                <h3 className="text-base font-bold text-white tracking-wide">{selectedIdCard.name}</h3>
                <span className="text-xs text-emerald-300 font-mono font-bold mt-0.5">{selectedIdCard.rollNumber}</span>

                {/* Details Table */}
                <div className="w-full mt-3 pt-3 border-t border-white/10 space-y-1.5 text-xs text-left">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Class & Section:</span>
                    <span className="font-semibold text-white">{selectedIdCard.className} ({selectedIdCard.section || 'A'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Blood Group:</span>
                    <span className="font-semibold text-rose-300">{selectedIdCard.bloodGroup || 'B+'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Emergency Phone:</span>
                    <span className="font-semibold text-white">{selectedIdCard.phone || '+92 300 0000000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Session:</span>
                    <span className="font-semibold text-white">2026 - 2027</span>
                  </div>
                </div>

                {/* Barcode representation */}
                <div className="w-full mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="font-mono text-[9px] text-slate-400 tracking-widest uppercase">
                    ||| | ||||| || |||||| |
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] uppercase block text-slate-400">Principal Signature</span>
                    <span className="text-[10px] font-serif italic text-emerald-300">Authorized</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedIdCard(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Student Card</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Official School Leaving & Character Certificate (SLC) Modal */}
      {selectedSLC && (
        <Modal
          isOpen={Boolean(selectedSLC)}
          onClose={() => setSelectedSLC(null)}
          title="Official School Leaving & Character Certificate (SLC)"
        >
          <div className="space-y-4">
            <div 
              id="printable-slc"
              className="p-8 bg-white border-4 border-double border-amber-600 rounded-2xl space-y-5 print:border-black print:p-10"
            >
              {/* Crest & Header */}
              <div className="text-center border-b-2 border-amber-600 pb-4">
                <School className="w-10 h-10 text-amber-700 mx-auto mb-1" />
                <h2 className="text-lg font-black uppercase tracking-widest text-slate-900">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL'}
                </h2>
                <p className="text-xs text-slate-600 font-medium">Department of Academic Affairs & Certification</p>
                <div className="mt-2 inline-block px-4 py-1 bg-amber-50 border border-amber-300 rounded text-xs font-black uppercase tracking-widest text-amber-900">
                  SCHOOL LEAVING & CHARACTER CERTIFICATE
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono">
                  <span>Serial No: SLC-{selectedSLC.id || '2026'}-{Math.floor(100 + Math.random() * 900)}</span>
                  <span>Issue Date: {new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Certificate Body Paragraphs */}
              <div className="text-xs text-slate-800 space-y-3 leading-relaxed">
                <p>
                  This is to certify that Master / Miss <strong className="text-slate-950 font-bold border-b border-dotted border-slate-700 px-1">{selectedSLC.name}</strong>, 
                  bearing Institute Admission / Roll No. <strong className="font-mono text-slate-950 px-1">{selectedSLC.rollNumber}</strong>, 
                  has been a regular student of this institution in <strong className="text-slate-950 px-1">{selectedSLC.className}</strong>.
                </p>

                <p>
                  According to official institutional records, the student was enrolled on <strong className="font-medium">August 15, 2024</strong> and has officially completed his/her tenure at this institution on <strong className="font-medium">{new Date().toLocaleDateString()}</strong>.
                </p>

                <p>
                  During the academic period, his/her general conduct and behavior remained <strong className="text-emerald-800 font-black">EXEMPLARY & SATISFACTORY</strong>. He/She has actively participated in co-curricular activities and exhibited commendable moral character.
                </p>

                <p>
                  All institutional tuition dues, library books, and transport clearances have been <strong className="text-emerald-700 font-bold">CLEARED UP TO DATE</strong>. There are no outstanding liabilities against this candidate.
                </p>

                <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-200/80 text-[11px] grid grid-cols-2 gap-2">
                  <div><span className="text-slate-500">Reason for Leaving:</span> <strong className="text-slate-800">Higher Studies / Session Completion</strong></div>
                  <div><span className="text-slate-500">Academic Standing:</span> <strong className="text-emerald-700">Good Standing (Promoted)</strong></div>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-10 flex justify-between text-center text-xs text-slate-500 border-t">
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[10px] block">Class In-Charge</span>
                </div>
                <div className="space-y-1">
                  <div className="w-32 border-b border-slate-400 mx-auto"></div>
                  <span className="text-[10px] block">Registrar / Bursar</span>
                </div>
                <div className="space-y-1">
                  <div className="w-36 border-b-2 border-amber-700 mx-auto"></div>
                  <span className="text-[10px] font-bold text-slate-800 block">Principal Seal & Signature</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedSLC(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Certificate (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default StudentsView
