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
  RotateCcw,
  Printer,
  AlertCircle,
  FileText,
  School,
  X,
  DollarSign,
  CreditCard,
  ShieldAlert
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const LibraryView = () => {
  const { library = [], bookIssues = [], students = [], institutes = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'issued' | 'overdue'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false)
  const [selectedBookForIssue, setSelectedBookForIssue] = useState(null)
  const [editingBook, setEditingBook] = useState(null)
  const [selectedClearanceSlip, setSelectedClearanceSlip] = useState(null)
  const [selectedReturnIssue, setSelectedReturnIssue] = useState(null)
  const [returnSettlementType, setReturnSettlementType] = useState('cash') // 'cash' | 'push_fee' | 'lost_damaged' | 'waive'
  const [lostBookReplacementCost, setLostBookReplacementCost] = useState(1500)

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

  // Overdue fine calculation helper
  const getOverdueDetails = (dueDate) => {
    if (!dueDate) return { isOverdue: false, days: 0, fine: 0 }
    const due = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    due.setHours(0, 0, 0, 0)
    const diffTime = today - due
    const days = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    if (days > 0) {
      return { isOverdue: true, days, fine: days * 15 } // Rs. 15 per day
    }
    return { isOverdue: false, days: 0, fine: 0 }
  }

  const openAddModal = () => {
    setEditingBook(null)
    setFormData({
      title: '',
      author: '',
      isbn: `978-${Math.floor(100000000 + Math.random() * 900000000)}`,
      category: 'Computer Science',
      shelfNo: 'B-04',
      totalCopies: 10,
      issuedCopies: 0,
      status: 'Available'
    })
    setIsModalOpen(true)
  }

  const openEditModal = (book) => {
    setEditingBook(book)
    setFormData({
      title: book.title || '',
      author: book.author || '',
      isbn: book.isbn || '',
      category: book.category || 'Computer Science',
      shelfNo: book.shelfNo || 'A-10',
      totalCopies: Number(book.totalCopies || 10),
      issuedCopies: Number(book.issuedCopies || 0),
      status: book.status || 'Available'
    })
    setIsModalOpen(true)
  }

  const openIssueModal = (book) => {
    setSelectedBookForIssue(book)
    const defDue = new Date()
    defDue.setDate(defDue.getDate() + 14)
    setIssueData({
      studentName: students[0]?.name || '',
      rollNumber: students[0]?.rollNumber || '',
      dueDate: defDue.toISOString().split('T')[0]
    })
    setIsIssueModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.author) {
      toast.error('Book Title and Author are required.')
      return
    }

    const payload = {
      ...formData,
      totalCopies: Number(formData.totalCopies),
      issuedCopies: Number(formData.issuedCopies || 0),
      status: Number(formData.totalCopies) > Number(formData.issuedCopies || 0) ? 'Available' : 'Out of Stock'
    }

    if (editingBook) {
      await updateItem('library', editingBook.id, payload)
      toast.success(`Book "${formData.title}" updated successfully!`)
    } else {
      await addItem('library', payload)
      toast.success(`Book "${formData.title}" added to catalog!`)
    }
    setIsModalOpen(false)
  }

  // Issue book to student
  const handleConfirmIssue = async (e) => {
    e.preventDefault()
    if (!selectedBookForIssue) return

    const available = Number(selectedBookForIssue.totalCopies || 0) - Number(selectedBookForIssue.issuedCopies || 0)
    if (available <= 0) {
      toast.error('No copies available in stock to issue.')
      return
    }

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

  // Process Book Return with Fine Ledger Integration
  const handleSettleReturn = async (e) => {
    e.preventDefault()
    if (!selectedReturnIssue) return

    const iss = selectedReturnIssue
    const overdue = getOverdueDetails(iss.dueDate)
    const book = library.find(b => b.id === iss.bookId)

    if (returnSettlementType === 'lost_damaged') {
      // Decrement total copies as book is lost
      if (book) {
        await updateItem('library', book.id, {
          totalCopies: Math.max(0, Number(book.totalCopies || 1) - 1),
          issuedCopies: Math.max(0, Number(book.issuedCopies || 1) - 1)
        })
      }

      // Push book replacement invoice to Student Fees
      await addItem('fees', {
        studentName: iss.studentName,
        rollNumber: iss.rollNumber,
        className: '10th Grade',
        amount: Number(lostBookReplacementCost),
        grossAmount: Number(lostBookReplacementCost),
        discountAmount: 0,
        concessionType: 'None',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        feeTitle: `Library Book Loss Replacement Penalty: ${iss.bookTitle}`,
        instituteId: 'inst-1',
        paymentDate: null
      })

      await updateItem('bookIssues', iss.id, {
        status: 'Lost / Damaged',
        returnedDate: new Date().toISOString().split('T')[0],
        fineCollected: 0,
        lossPenaltyBilled: Number(lostBookReplacementCost)
      })

      toast.warning(`Book marked as Lost. Replacement penalty Rs. ${lostBookReplacementCost.toLocaleString()} billed to ${iss.studentName}'s fee ledger!`)
    } else if (returnSettlementType === 'push_fee') {
      // Push overdue fine to student fee ledger
      if (book && Number(book.issuedCopies) > 0) {
        await updateItem('library', book.id, {
          issuedCopies: Math.max(0, Number(book.issuedCopies) - 1)
        })
      }

      await addItem('fees', {
        studentName: iss.studentName,
        rollNumber: iss.rollNumber,
        className: '10th Grade',
        amount: Number(overdue.fine),
        grossAmount: Number(overdue.fine),
        discountAmount: 0,
        concessionType: 'None',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending',
        feeTitle: `Library Overdue Circulation Fine: ${iss.bookTitle} (${overdue.days} days)`,
        instituteId: 'inst-1',
        paymentDate: null
      })

      await updateItem('bookIssues', iss.id, {
        status: 'Returned',
        returnedDate: new Date().toISOString().split('T')[0],
        fineCollected: 0,
        fineBilledToFeeChallan: true
      })

      toast.success(`Book returned! Overdue fine of Rs. ${overdue.fine} pushed to ${iss.studentName}'s fee account.`)
    } else if (returnSettlementType === 'waive') {
      if (book && Number(book.issuedCopies) > 0) {
        await updateItem('library', book.id, {
          issuedCopies: Math.max(0, Number(book.issuedCopies) - 1)
        })
      }

      await updateItem('bookIssues', iss.id, {
        status: 'Returned',
        returnedDate: new Date().toISOString().split('T')[0],
        fineCollected: 0,
        fineWaived: true
      })

      toast.info(`Book returned! Overdue fine was administratively waived.`)
    } else {
      // Cash collection at desk
      if (book && Number(book.issuedCopies) > 0) {
        await updateItem('library', book.id, {
          issuedCopies: Math.max(0, Number(book.issuedCopies) - 1)
        })
      }

      await updateItem('bookIssues', iss.id, {
        status: 'Returned',
        returnedDate: new Date().toISOString().split('T')[0],
        fineCollected: overdue.fine
      })

      toast.success(`Book returned! Rs. ${overdue.fine} overdue fine collected in cash at library desk.`)
      setSelectedClearanceSlip({ ...iss, overdue })
    }

    setSelectedReturnIssue(null)
  }

  // Process Book Return
  const handleReturnBook = async (issueRecord) => {
    const book = library.find(b => b.id === issueRecord.bookId)
    if (book && Number(book.issuedCopies) > 0) {
      await updateItem('library', book.id, {
        issuedCopies: Math.max(0, Number(book.issuedCopies) - 1)
      })
    }

    const overdueInfo = getOverdueDetails(issueRecord.dueDate)

    await updateItem('bookIssues', issueRecord.id, {
      status: 'Returned',
      returnedDate: new Date().toISOString().split('T')[0],
      fineCollected: overdueInfo.fine
    })

    toast.success(`Book "${issueRecord.bookTitle}" marked as Returned! Inventory restored.`)
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

  const overdueIssues = useMemo(() => {
    return activeIssues.filter(i => getOverdueDetails(i.dueDate).isOverdue)
  }, [activeIssues])

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
    toast.success('Library catalog exported to CSV.')
  }

  const displayedLoans = activeTab === 'overdue' ? overdueIssues : activeIssues

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Central Digital Library & Circulation</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Book catalog tracking, student loan circulation, automated overdue fines, and printable clearance receipts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCatalogCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
            title="Download CSV catalog"
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'catalog' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Book Catalog ({library.length})
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'issued' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Loans ({activeIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('overdue')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'overdue' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-600 hover:bg-rose-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Overdue Books ({overdueIssues.length})</span>
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium"
              >
                <option value="ALL">All Categories</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Literature">Literature</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {paginatedBooks.length > 0 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {paginatedBooks.map((b) => {
                  const available = Math.max(0, Number(b.totalCopies || 0) - Number(b.issuedCopies || 0))
                  return (
                    <div 
                      key={b.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {b.category}
                          </span>
                          <span className="text-[11px] font-mono font-semibold text-slate-400">
                            Shelf: {b.shelfNo}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 mt-3 text-base line-clamp-2 leading-snug">{b.title}</h3>
                        <p className="text-xs text-slate-500 mt-1">by {b.author}</p>
                        <span className="text-[11px] font-mono text-slate-400 block mt-1">ISBN: {b.isbn}</span>

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
        /* Active Loans & Overdue Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {activeTab === 'overdue' ? 'Overdue Books & Penalty Ledger' : 'Active Book Loans & Checkouts'}
              </h3>
              <p className="text-xs text-slate-400">Track book circulation, overdue fines (Rs. 15/day), and return clearance slips</p>
            </div>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-200">
              Showing: {displayedLoans.length} Loans
            </span>
          </div>

          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Book Title</th>
                <th className="px-6 py-3.5">Student Borrower</th>
                <th className="px-6 py-3.5">Roll Number</th>
                <th className="px-6 py-3.5">Issue Date</th>
                <th className="px-6 py-3.5">Due Date & Fine</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayedLoans.length > 0 ? (
                displayedLoans.map((iss) => {
                  const overdue = getOverdueDetails(iss.dueDate)

                  return (
                    <tr key={iss.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3.5 font-bold text-slate-900">{iss.bookTitle}</td>
                      <td className="px-6 py-3.5 font-semibold text-slate-800">{iss.studentName}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">{iss.rollNumber}</td>
                      <td className="px-6 py-3.5 text-slate-500">{iss.issueDate}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-slate-700 block">{iss.dueDate}</span>
                        {overdue.isOverdue ? (
                          <span className="inline-block mt-0.5 text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                            Overdue {overdue.days}d • Fine: Rs. {overdue.fine}
                          </span>
                        ) : (
                          <span className="inline-block mt-0.5 text-[10px] font-medium text-emerald-600">On Time</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedClearanceSlip({ ...iss, overdue })}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold inline-flex items-center gap-1"
                          title="Generate Return Clearance Slip"
                        >
                          <FileText className="w-3 h-3 text-slate-500" />
                          <span>Clearance Slip</span>
                        </button>

                        {overdue.isOverdue ? (
                          <button
                            onClick={() => {
                              setSelectedReturnIssue(iss)
                              setReturnSettlementType('cash')
                            }}
                            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-bold inline-flex items-center gap-1 shadow-sm cursor-pointer"
                            title="Settle Overdue Fine & Process Return"
                          >
                            <AlertCircle className="w-3 h-3" />
                            <span>Settle Fine & Return</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleReturnBook(iss)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
                            title="Mark Book as Returned"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Mark Returned</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    <p className="font-semibold text-slate-700">No Loans in this View</p>
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
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">ISBN Number</label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 font-mono"
                placeholder="978-0262033848"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Subject Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Literature">Literature</option>
                <option value="General Knowledge">General Knowledge</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Shelf / Aisle Location</label>
              <input
                type="text"
                value={formData.shelfNo}
                onChange={(e) => setFormData({ ...formData, shelfNo: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
                placeholder="e.g. A-14"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
            >
              Save Book to Catalog
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
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs space-y-1">
              <span className="font-bold text-indigo-900 block">{selectedBookForIssue.title}</span>
              <span className="text-indigo-700 block">Author: {selectedBookForIssue.author} • Shelf: {selectedBookForIssue.shelfNo}</span>
              <span className="text-emerald-700 font-semibold block">Available Copies: {Number(selectedBookForIssue.totalCopies || 0) - Number(selectedBookForIssue.issuedCopies || 0)}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Select Student *</label>
              <select
                value={issueData.studentName}
                onChange={(e) => {
                  const s = students.find(std => std.name === e.target.value)
                  setIssueData({
                    ...issueData,
                    studentName: e.target.value,
                    rollNumber: s?.rollNumber || `STD-${Math.floor(100 + Math.random() * 900)}`
                  })
                }}
                className="w-full px-3.5 py-2 text-xs rounded-lg border border-slate-200 bg-white"
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
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200 bg-slate-50 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Return Due Date *</label>
                <input
                  type="date"
                  required
                  value={issueData.dueDate}
                  onChange={(e) => setIssueData({ ...issueData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded border border-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsIssueModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
              >
                Confirm Loan & Issue Book
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Library Return & Clearance Receipt Modal */}
      {selectedClearanceSlip && (
        <Modal
          isOpen={Boolean(selectedClearanceSlip)}
          onClose={() => setSelectedClearanceSlip(null)}
          title="Official Library Book Return & Clearance Receipt"
        >
          <div className="space-y-4">
            <div 
              id="printable-clearance-slip"
              className="p-6 bg-white border-2 border-slate-300 rounded-2xl space-y-4 print:border-black"
            >
              {/* Slip Header */}
              <div className="text-center border-b pb-3">
                <School className="w-8 h-8 text-indigo-600 mx-auto mb-1" />
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  {institutes[0]?.name || 'CENTRAL HIGH SCHOOL'}
                </h3>
                <p className="text-[11px] text-slate-500">Central Digital Library & Circulation Cell</p>
                <span className="inline-block mt-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                  BOOK RETURN & DUES CLEARANCE VOUCHER
                </span>
              </div>

              {/* Student & Book Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-400">Borrower:</span> <strong className="text-slate-800">{selectedClearanceSlip.studentName}</strong></div>
                <div><span className="text-slate-400">Roll Number:</span> <strong className="text-slate-800 font-mono">{selectedClearanceSlip.rollNumber}</strong></div>
                <div><span className="text-slate-400">Book Title:</span> <strong className="text-slate-800">{selectedClearanceSlip.bookTitle}</strong></div>
                <div><span className="text-slate-400">Issue Date:</span> <strong className="text-slate-800">{selectedClearanceSlip.issueDate}</strong></div>
                <div><span className="text-slate-400">Return Deadline:</span> <strong className="text-slate-800">{selectedClearanceSlip.dueDate}</strong></div>
                <div><span className="text-slate-400">Return Date:</span> <strong className="text-slate-800">{new Date().toISOString().split('T')[0]}</strong></div>
              </div>

              {/* Overdue Fine Status */}
              <div className="p-3 rounded-xl border flex items-center justify-between text-xs bg-slate-50">
                <div>
                  <span className="font-bold text-slate-700 block">Circulation Fine Assessment:</span>
                  <span className="text-[10px] text-slate-500">
                    {selectedClearanceSlip.overdue?.isOverdue 
                      ? `${selectedClearanceSlip.overdue.days} days overdue @ Rs. 15/day` 
                      : 'Returned within permissible checkout period'}
                  </span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-sm font-black text-slate-900">
                    Rs. {selectedClearanceSlip.overdue?.fine || 0}
                  </span>
                  <span className="text-[9px] text-emerald-700 font-bold block">PAID & SETTLED</span>
                </div>
              </div>

              {/* Clearance Declaration */}
              <p className="text-[11px] text-slate-600 leading-relaxed border-t pt-2">
                This acknowledges that the aforementioned book has been received in satisfactory condition and restored to catalog inventory. The student holds no outstanding liabilities for this transaction.
              </p>

              {/* Signatures */}
              <div className="flex justify-between pt-6 text-[10px] text-slate-400 border-t">
                <span>Borrower Signature</span>
                <span>Circulation Desk Officer</span>
                <span>Head Librarian Seal</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedClearanceSlip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Clearance Voucher (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default LibraryView
