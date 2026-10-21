import React, { useState } from 'react'
import { BookMarked, Plus, Search, Edit2, Trash2, BookOpen, CheckCircle, Tag, ArrowRight } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'

export const LibraryView = () => {
  const { library, addItem, updateItem, deleteItem } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)

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
    if (!formData.title || !formData.author) return

    if (editingBook) {
      await updateItem('library', editingBook.id, formData)
    } else {
      await addItem('library', formData)
    }
    setIsModalOpen(false)
  }

  const handleIssueBook = async (book) => {
    if (book.issuedCopies >= book.totalCopies) {
      alert('No more copies available in stock!')
      return
    }
    await updateItem('library', book.id, {
      issuedCopies: Number(book.issuedCopies || 0) + 1
    })
  }

  const handleReturnBook = async (book) => {
    if (book.issuedCopies <= 0) return
    await updateItem('library', book.id, {
      issuedCopies: Number(book.issuedCopies) - 1
    })
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete book from library catalog?')) {
      await deleteItem('library', id)
    }
  }

  const filtered = library.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.isbn && b.isbn.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">School Library & Book Repository</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Catalog curriculum books, track borrowing, shelf numbers, and book inventories</p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by book title, author, or ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-white"
          >
            <option value="ALL">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Literature">English Literature</option>
            <option value="General">General / Islamic</option>
          </select>
        </div>
      </div>

      {/* Grid of Books */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(b => {
            const available = Number(b.totalCopies || 1) - Number(b.issuedCopies || 0)
            return (
              <div key={b.id} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {b.category || 'General'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Shelf: {b.shelfNo || 'A-1'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-3 leading-snug">{b.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">Author: <strong className="text-slate-700">{b.author}</strong></p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">ISBN: {b.isbn || '—'}</p>

                  <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Available: <strong className="text-emerald-700">{available}</strong> / {b.totalCopies}</span>
                    <span className="text-slate-500">Issued: <strong className="text-amber-700">{b.issuedCopies || 0}</strong></span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleIssueBook(b)}
                      disabled={available <= 0}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-50"
                      title="Issue to student"
                    >
                      Issue
                    </button>
                    <button
                      onClick={() => handleReturnBook(b)}
                      disabled={(b.issuedCopies || 0) <= 0}
                      className="px-2.5 py-1 text-xs font-semibold border border-slate-300 hover:bg-slate-50 text-slate-700 rounded transition-colors disabled:opacity-50"
                      title="Return book copy"
                    >
                      Return
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(b)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="p-1.5 text-slate-400 hover:text-rose-600 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">0 Books in Library Repository</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            The library catalog is currently empty. Click "Add New Book" to catalogue books and publications.
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Book</span>
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBook ? 'Edit Book Details' : 'Add New Book to Library'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Book Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Principles of Physics"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Author Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Halliday & Resnick"
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">ISBN Number</label>
              <input
                type="text"
                placeholder="978-0470561584"
                value={formData.isbn}
                onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Literature">Literature</option>
                <option value="General">General / Islamic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Shelf Number</label>
              <input
                type="text"
                placeholder="A-10"
                value={formData.shelfNo}
                onChange={(e) => setFormData({ ...formData, shelfNo: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Total Copies</label>
              <input
                type="number"
                min="1"
                value={formData.totalCopies}
                onChange={(e) => setFormData({ ...formData, totalCopies: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-indigo-600 rounded-lg font-semibold">Save Book</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default LibraryView
