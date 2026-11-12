import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  BookOpen,
  ArrowLeftRight,
  Plus,
  Edit3,
  Trash2,
  X
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const daysOverdue = (dueIso) => {
  if (!dueIso) return 0
  const due = new Date(`${String(dueIso).slice(0, 10)}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : 0
}

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

export const LibrarySuiteViews = ({
  mode = 'books', // 'books' | 'issue'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { students = [], teachers = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'

  const booksKey = `sms_campus_library_books_${instId}`
  const loansKey = `sms_campus_library_loans_${instId}`

  const [books, setBooks] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(booksKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [loans, setLoans] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(loansKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      const b = JSON.parse(localStorage.getItem(booksKey) || '[]')
      setBooks(Array.isArray(b) ? b : [])
    } catch {
      setBooks([])
    }
    try {
      const l = JSON.parse(localStorage.getItem(loansKey) || '[]')
      setLoans(Array.isArray(l) ? l : [])
    } catch {
      setLoans([])
    }
  }, [instId, booksKey, loansKey])

  const persistBooks = (next) => {
    setBooks(next)
    try {
      localStorage.setItem(booksKey, JSON.stringify(next))
    } catch {}
  }

  const persistLoans = (next) => {
    setLoans(next)
    try {
      localStorage.setItem(loansKey, JSON.stringify(next))
    } catch {}
  }

  // Books state
  const [bookSearch, setBookSearch] = useState('')
  const [bookModalOpen, setBookModalOpen] = useState(false)
  const [editingBookId, setEditingBookId] = useState(null)
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    shelf: '',
    totalCopies: '1'
  })

  // Issue & Return state
  const [issueForm, setIssueForm] = useState({
    bookId: '',
    borrower: '',
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)
  })
  const [loanFilter, setLoanFilter] = useState('Issued') // 'Issued' | 'Overdue' | 'Returned' | 'All'
  const [fineInputs, setFineInputs] = useState({})

  const borrowerSuggestions = useMemo(() => {
    const stNames = students
      .filter((s) => !s.instituteId || s.instituteId === instId)
      .map((s) => s.name)
    const sfNames = teachers
      .filter((t) => !t.instituteId || t.instituteId === instId)
      .map((t) => t.name)
    return [...new Set([...stNames, ...sfNames].filter(Boolean))]
  }, [students, teachers, instId])

  const bookStats = useMemo(() => {
    const titles = books.length
    const totalCopies = books.reduce((s, b) => s + Number(b.totalCopies || 0), 0)
    const issuedLoans = loans.filter((l) => l.status !== 'Returned')
    const overdueLoans = issuedLoans.filter((l) => daysOverdue(l.dueDate) > 0)
    return {
      titles,
      totalCopies,
      issuedNow: issuedLoans.length,
      overdue: overdueLoans.length
    }
  }, [books, loans])

  const getBookAvailable = (book) => {
    const activeForBook = loans.filter(
      (l) => l.bookId === book.id && l.status !== 'Returned'
    ).length
    return Math.max(0, Number(book.totalCopies || 0) - activeForBook)
  }

  const handleSaveBook = (e) => {
    e.preventDefault()
    const cleanTitle = bookForm.title.trim()
    if (!cleanTitle) {
      toast.error('Book title is required.')
      return
    }
    const payload = {
      title: cleanTitle,
      author: bookForm.author.trim(),
      category: bookForm.category.trim(),
      isbn: bookForm.isbn.trim(),
      shelf: bookForm.shelf.trim(),
      totalCopies: Math.max(1, Number(bookForm.totalCopies || 1))
    }
    if (editingBookId) {
      persistBooks(books.map((b) => (b.id === editingBookId ? { ...b, ...payload } : b)))
      toast.success(`Updated "${cleanTitle}".`)
    } else {
      persistBooks([...books, { id: `BK-${Date.now()}`, ...payload }])
      toast.success(`Added "${cleanTitle}" to catalogue.`)
    }
    setBookModalOpen(false)
    setEditingBookId(null)
  }

  const handleIssueBook = (e) => {
    e.preventDefault()
    const book = books.find((b) => b.id === issueForm.bookId)
    if (!book) {
      toast.error('Please select a book.')
      return
    }
    if (getBookAvailable(book) <= 0) {
      toast.error(`No copies of "${book.title}" are currently available.`)
      return
    }
    const borrower = issueForm.borrower.trim()
    if (!borrower) {
      toast.error('Enter a borrower name.')
      return
    }
    const newLoan = {
      id: `LN-${Date.now()}`,
      bookId: book.id,
      bookTitle: book.title,
      borrower,
      issuedDate: new Date().toISOString().slice(0, 10),
      dueDate: issueForm.dueDate,
      status: 'Issued',
      fine: 0,
      returnedDate: ''
    }
    persistLoans([newLoan, ...loans])
    toast.success(`Issued "${book.title}" to ${borrower}.`)
    setIssueForm((p) => ({ ...p, bookId: '', borrower: '' }))
  }

  const handleReturnLoan = (loan) => {
    const fine = Math.max(0, Number(fineInputs[loan.id] || 0))
    persistLoans(
      loans.map((l) =>
        l.id === loan.id
          ? {
              ...l,
              status: 'Returned',
              fine,
              returnedDate: new Date().toISOString().slice(0, 10)
            }
          : l
      )
    )
    toast.success(
      `Returned "${loan.bookTitle}"${fine > 0 ? ` (Fine: PKR ${fine.toLocaleString()})` : ''}.`
    )
  }

  const TopNavTabs = (
    <div className="flex items-center gap-2 border-b border-slate-200">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-library')}
        className={`px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
          mode === 'books'
            ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Books</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-library-issue')}
        className={`px-4 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
          mode === 'issue'
            ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
            : 'border-transparent text-slate-500 hover:text-slate-800'
        }`}
      >
        <ArrowLeftRight className="w-3.5 h-3.5" />
        <span>Issue &amp; return</span>
      </button>
    </div>
  )

  // ==========================
  // RENDER: ISSUE & RETURN (Pick 2)
  // ==========================
  if (mode === 'issue') {
    const filteredLoans = loans.filter((l) => {
      const ov = daysOverdue(l.dueDate)
      if (loanFilter === 'Issued') return l.status !== 'Returned'
      if (loanFilter === 'Overdue') return l.status !== 'Returned' && ov > 0
      if (loanFilter === 'Returned') return l.status === 'Returned'
      return true
    })

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Library Issue & Return"
          onBack={() => onRouteChange?.('inst-library')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        {TopNavTabs}

        {/* Issue a book card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Plus className="w-4 h-4 text-slate-700" />
            <span>Issue a book</span>
          </div>

          <form onSubmit={handleIssueBook} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Book <span className="text-rose-500">*</span>
              </label>
              <select
                value={issueForm.bookId}
                onChange={(e) => setIssueForm((p) => ({ ...p, bookId: e.target.value }))}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
              >
                <option value="">Select a book</option>
                {books.map((b) => {
                  const avail = getBookAvailable(b)
                  return (
                    <option key={b.id} value={b.id} disabled={avail <= 0}>
                      {b.title} ({avail}/{b.totalCopies} available)
                    </option>
                  )
                })}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Borrower <span className="text-rose-500">*</span>
              </label>
              <input
                list="library-borrowers-list"
                value={issueForm.borrower}
                onChange={(e) => setIssueForm((p) => ({ ...p, borrower: e.target.value }))}
                placeholder="Type a student or staff name"
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
              <datalist id="library-borrowers-list">
                {borrowerSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-600 mb-1">
                Due date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={issueForm.dueDate}
                onChange={(e) => setIssueForm((p) => ({ ...p, dueDate: e.target.value }))}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold cursor-pointer"
              >
                Issue
              </button>
            </div>
          </form>
        </div>

        {/* Loans Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Loans</h2>
            <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              {['Issued', 'Overdue', 'Returned', 'All'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setLoanFilter(tab)}
                  className={`px-3 py-1 font-semibold cursor-pointer ${
                    loanFilter === tab
                      ? 'bg-sky-500 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                  <th className="py-2.5 px-4">Book</th>
                  <th className="py-2.5 px-3">Borrower</th>
                  <th className="py-2.5 px-3">Issued</th>
                  <th className="py-2.5 px-3">Due</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No library loans in this view.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((l) => {
                    const ov = l.status === 'Returned' ? 0 : daysOverdue(l.dueDate)
                    return (
                      <tr key={l.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-semibold text-slate-900">{l.bookTitle}</td>
                        <td className="py-3 px-3 text-slate-700">{l.borrower}</td>
                        <td className="py-3 px-3 text-slate-600">
                          {formatDisplayDate(l.issuedDate)}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {formatDisplayDate(l.dueDate)}
                        </td>
                        <td className="py-3 px-3">
                          {l.status === 'Returned' ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                              Returned
                            </span>
                          ) : ov > 0 ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-bold">
                              Overdue {ov}d
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-sky-500 text-white text-[10px] font-bold">
                              Issued
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {l.status === 'Returned' ? (
                            <span className="text-[11px] text-slate-400">
                              {l.fine > 0 ? `Fine: PKR ${l.fine}` : formatDisplayDate(l.returnedDate)}
                            </span>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                placeholder="Fine"
                                value={fineInputs[l.id] || ''}
                                onChange={(e) =>
                                  setFineInputs((p) => ({ ...p, [l.id]: e.target.value }))
                                }
                                className="w-16 px-2 py-1 rounded border border-slate-200 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => handleReturnLoan(l)}
                                className="px-2.5 py-1 rounded border border-emerald-400 text-emerald-700 hover:bg-emerald-50 text-[11px] font-semibold cursor-pointer"
                              >
                                Return
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: BOOKS CATALOGUE (Pick 1)
  // ==========================
  const filteredBooks = books.filter((b) => {
    const q = bookSearch.trim().toLowerCase()
    if (!q) return true
    return `${b.title} ${b.author} ${b.isbn} ${b.category}`.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      <QuickHeader
        title="Library Books"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      {TopNavTabs}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs">
          <div className="text-xl font-extrabold text-slate-900">{bookStats.titles}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Titles</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs">
          <div className="text-xl font-extrabold text-slate-900">{bookStats.totalCopies}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Total copies</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs">
          <div className="text-xl font-extrabold text-sky-600">{bookStats.issuedNow}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Issued now</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs">
          <div className="text-xl font-extrabold text-rose-600">{bookStats.overdue}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Overdue</div>
        </div>
      </div>

      {/* Book catalogue card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <BookOpen className="w-4 h-4 text-slate-600" />
            <span>Book catalogue</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              placeholder="Search title, author, ISBN"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs w-52"
            />
            <button
              type="button"
              onClick={() => {
                setEditingBookId(null)
                setBookForm({
                  title: '',
                  author: '',
                  category: '',
                  isbn: '',
                  shelf: '',
                  totalCopies: '1'
                })
                setBookModalOpen(true)
              }}
              className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add book</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-600">
                <th className="py-2.5 px-4">Title</th>
                <th className="py-2.5 px-3">Author</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Shelf</th>
                <th className="py-2.5 px-3">Available</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    No books in catalogue yet. Click <strong>+ Add book</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.title}</td>
                    <td className="py-3 px-3 text-slate-600">{b.author || '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{b.category || '—'}</td>
                    <td className="py-3 px-3 text-slate-600">{b.shelf || '—'}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {getBookAvailable(b)} / {b.totalCopies}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingBookId(b.id)
                            setBookForm({
                              title: b.title,
                              author: b.author || '',
                              category: b.category || '',
                              isbn: b.isbn || '',
                              shelf: b.shelf || '',
                              totalCopies: String(b.totalCopies || 1)
                            })
                            setBookModalOpen(true)
                          }}
                          className="p-1.5 rounded border border-sky-400 text-sky-600 hover:bg-sky-50 cursor-pointer"
                          title="Edit book"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            persistBooks(books.filter((x) => x.id !== b.id))
                            toast.success(`Deleted "${b.title}".`)
                          }}
                          className="p-1.5 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete book"
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

      {/* Add / Edit Book Modal */}
      {bookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveBook}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                {editingBookId ? 'Edit Book' : 'Add Book'}
              </h3>
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) => setBookForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Author</label>
                  <input
                    type="text"
                    value={bookForm.author}
                    onChange={(e) => setBookForm((p) => ({ ...p, author: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={bookForm.category}
                    onChange={(e) => setBookForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm((p) => ({ ...p, isbn: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shelf</label>
                  <input
                    type="text"
                    value={bookForm.shelf}
                    onChange={(e) => setBookForm((p) => ({ ...p, shelf: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Copies *</label>
                <input
                  type="number"
                  min="1"
                  value={bookForm.totalCopies}
                  onChange={(e) => setBookForm((p) => ({ ...p, totalCopies: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBookModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 text-white font-semibold cursor-pointer"
              >
                Save Book
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default LibrarySuiteViews
