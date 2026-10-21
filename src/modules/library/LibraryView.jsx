import React, { useState, useMemo } from 'react'
import { 
  BookMarked, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen, 
  CheckCircle, 
  Tag, 
  ArrowRight,
  UserCheck,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const LibraryView = () => {
  const { library = [], bookIssues = [], students = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'issued'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null)
  const [editingBook, setEditingBook] = useState(null)

  // Catalog pagination
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8

  // Book Form
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    shelfNo: 'A-10',
    totalCopies: 10,
    issuedCopies: 0,
    status: 'Available'
  })

  // Issue Book Form
  const [issueData, setIssueData] = useState({
    studentName: students[0]?.name || '',
    rollNumber: students[0]?.rollNumber || '',
    dueDate: '2026-11-15'
  })

  const openAddModal = () => {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Computer Science',
      shelfNo: 'A-10',
      totalCopies: 10,
      issuedCopies: 0,
      status: 'Available'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (b) => {
    setEditingBook(b)
    setFormData({
      title: b.title,
      author: b.author,
      isbn: b.isbn || '',
      category: b.category || 'General',
      shelfNo: b.shelfNo || 'A-1',
      totalCopies: b.totalCopies || 1,
      issuedCopies: b.issuedCopies || 0,
      status: b.status || 'Available'
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.author) {
      toast.error('Book Title and Author are required.')
      return
    }

    if (editingBook) {
      await updateItem('library', editingBook.id, formData)
      toast.success(`Book "${formData.title}" updated in catalog.`)
    } else {
      await addItem('library', formData)
      toast.success(`Book "${formData.title}" registered in library!`)
    }
    setIsModalOpen(false)
  }

  // Open Issue Modal
  const openIssueModal = (book) => {
    const available = Number(book.totalCopies || 0) - Number(book.issuedCopies || 0)
    if (available <= 0) {
      toast.warning('No available copies left in stock for this book!')
      return
    }
    setSelectedBookForIssue(book)
    setIssueData({
      studentName: students[0]?.name || '',
      rollNumber: students[0]?.rollNumber || '',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 weeks default
    })
    setIsIssueModalOpen(true)
  }

  // Process Book Issue
  const handleConfirmIssue = async (e) => {
    e.preventDefault()
    if (!selectedBookForIssue || !issueData.studentName) return

    // Create issue record
    await addItem('bookIssues', {
      bookId: selectedBookForIssue.id,
      bookTitle: selectedBookForIssue.title,
      author: selectedBookForIssue.author,
      studentName: issueData.studentName,
      rollNumber: issueData.rollNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: issueData.dueDate,
      status: 'Issued'
    })

    // Increment issuedCopies on book
    await updateItem('library', selectedBookForIssue.id, {
      issuedCopies: Number(selectedBookForIssue.issuedCopies || 0) + 1
    })

    toast.success(`Book "${selectedBookForIssue.title}" issued to ${issueData.studentName}!`)
    setIsIssueModalOpen(false)
    setSelectedBookForIssue(null)
  }

  // Process Book Return
  const handleReturnBook = async (issueRecord) => {
    // Find book
    const book = library.find(b => b.id === issueRecord.bookId)
    if (book && Number(book.issuedCopies) > 0) {
      await updateItem('library', book.id, {
        issuedCopies: Math.max(0, Number(book.issuedCopies) - 1)
      })
    }

    await updateItem('bookIssues', issueRecord.id, {
      status: 'Returned',
      returnedDate: new Date().toISOString().split('T')[0]
    })

    toast.success(`Book "${issueRecord.bookTitle}" marked as Returned! Stock updated.`)
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete book "${title}" from catalog?`)) {
      await deleteItem('library', id)
      toast.success('Book removed from catalog.')
    }
  }

  const filtered = useMemo(() => {
    return library.filter(b => {
      const matchesSearch = 
        (b.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ((b.isbn || '') && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [library, searchTerm, selectedCategory])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, currentPage, pageSize])

  const activeIssues = useMemo(() => {
    return bookIssues.filter(i => i.status === 'Issued')
  }, [bookIssues])

  // Export Library Catalog CSV
  const exportCatalogCSV = () => {
    if (filtered.length === 0) {
      toast.warning('No catalog books to export.')
      return
    }

    const headers = ['Book Title', 'Author', 'ISBN', 'Category', 'Shelf Location', 'Total Copies', 'Issued Copies', 'Available In Stock']
    const rows = filtered.map(b => [
      `"${b.title || ''}"`,
      `"${b.author || ''}"`,
      `"${b.isbn || ''}"`,
      `"${b.category || ''}"`,
      `"${b.shelfNo || ''}"`,
      `"${b.totalCopies || 0}"`,
      `"${b.issuedCopies || 0}"`,
      `"${Math.max(0, Number(b.totalCopies || 0) - Number(b.issuedCopies || 0))}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `library_catalog_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exported ${filtered.length} library books to CSV.`)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus Library Management & Circulation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Book cataloging, student lending circulation, and due date returns tracking</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCatalogCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Download Catalog CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Catalog</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            📚 Book Catalog ({library.length})
          </button>
          <button
            onClick={() => setActiveTab('issued')}
            className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'issued'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Active Student Loans</span>
            {activeIssues.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                {activeIssues.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Search & Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by book title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {['ALL', 'Computer Science', 'Physics', 'Mathematics', 'General'].map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Cards Grid */}
          {paginatedBooks.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBooks.map((b) => {
                  const available = Math.max(0, Number(b.totalCopies || 0) - Number(b.issuedCopies || 0))
                  return (
                    <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {b.category}
                          </span>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            Shelf: {b.shelfNo}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 mt-3 text-base leading-snug">{b.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">Author: <strong className="text-slate-700">{b.author}</strong></p>
                        <p className="font-mono text-[11px] text-slate-400 mt-0.5">ISBN: {b.isbn}</p>

                        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-[10px] text-slate-400 block">Total Copies</span>
                            <span className="font-bold text-slate-800 text-sm">{b.totalCopies}</span>
                          </div>
                          <div className={`p-2 rounded-lg border ${available > 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                            <span className="text-[10px] block opacity-80">Available</span>
                            <span className="font-bold text-sm">{available} In Stock</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => openIssueModal(b)}
                          disabled={available <= 0}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Issue to Student</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-indigo-600 rounded">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(b.id, b.title)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
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
                            ? 'bg-indigo-600 text-white'
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
              <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No Books Found</h3>
              <p className="text-xs text-slate-400 mt-1">Register new titles to the catalog using the button above.</p>
            </div>
          )}
        </>
      ) : (
        /* Active Loans Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Active Book Loans & Checkouts</h3>
              <p className="text-xs text-slate-400">Track which student currently holds each library title</p>
            </div>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              Active Loans: {activeIssues.length}
            </span>
          </div>

          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Book Title</th>
                <th className="px-6 py-3.5">Student / Borrower</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Issue Date</th>
                <th className="px-6 py-3.5">Return Due Date</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeIssues.length > 0 ? (
                activeIssues.map((iss) => (
                  <tr key={iss.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-900">{iss.bookTitle}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">{iss.studentName}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-600">{iss.rollNumber}</td>
                    <td className="px-6 py-3.5 text-slate-500">{iss.issueDate}</td>
                    <td className="px-6 py-3.5 font-mono font-bold text-rose-600">{iss.dueDate}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => handleReturnBook(iss)}
                        className="px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Mark Returned</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <p className="font-semibold text-slate-700">No Pending Loans</p>
                    <p className="text-[11px] text-slate-400">All books are accounted for and in library stock.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Library Title' : 'Register New Book to Library Catalog'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Book Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Introduction to Algorithms"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Author Name *</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Thomas H. Cormen"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="General">General</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">ISBN</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Shelf Location</label>
              <input
                type="text"
                value={formData.shelfNo}
                onChange={(e) => setFormData({ ...formData, shelfNo: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                required
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow cursor-pointer"
            >
              {editingBook ? 'Update Book' : 'Register Book'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Issue Book Modal */}
      {selectedBookForIssue && (
        <Modal
          isOpen={isIssueModalOpen}
          onClose={() => setIsIssueModalOpen(false)}
          title={`Issue Book: ${selectedBookForIssue.title}`}
        >
          <form onSubmit={handleConfirmIssue} className="space-y-4">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs space-y-1">
              <div><span className="text-slate-500">Selected Title:</span> <strong className="text-indigo-900">{selectedBookForIssue.title}</strong></div>
              <div><span className="text-slate-500">Author:</span> <strong className="text-slate-800">{selectedBookForIssue.author}</strong></div>
              <div><span className="text-slate-500">Available Stock:</span> <strong className="text-emerald-700 font-mono">{Number(selectedBookForIssue.totalCopies) - Number(selectedBookForIssue.issuedCopies)} copies</strong></div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Borrower Student *</label>
              <select
                value={issueData.studentName}
                onChange={(e) => {
                  const std = students.find(s => s.name === e.target.value)
                  setIssueData(prev => ({
                    ...prev,
                    studentName: e.target.value,
                    rollNumber: std?.rollNumber || ''
                  }))
                }}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200"
              >
                {students.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.rollNumber}) - {s.className}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Roll Number</label>
                <input
                  type="text"
                  readOnly
                  value={issueData.rollNumber}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Return Due Date *</label>
                <input
                  type="date"
                  required
                  value={issueData.dueDate}
                  onChange={(e) => setIssueData({ ...issueData, dueDate: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow cursor-pointer"
              >
                Confirm Book Loan
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default LibraryView
