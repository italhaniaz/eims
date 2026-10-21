import React, { useState, useMemo } from 'react'
import { 
  Megaphone, 
  Plus, 
  Search, 
  Calendar, 
  Tag, 
  Trash2, 
  Pin, 
  Bell, 
  Printer, 
  School, 
  CheckCircle2, 
  AlertTriangle,
  Building,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const NoticeBoardView = ({ currentInstitute }) => {
  const { notices = [], addItem, updateItem, deleteItem, logAuditEvent } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedNoticeForPrint, setSelectedNoticeForPrint] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    category: 'General',
    audience: 'All Students & Parents',
    content: '',
    pinned: false
  })

  const instNotices = notices.filter(n => !n.instituteId || n.instituteId === currentInstitute?.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.content) {
      toast.error('Title and message content are required.')
      return
    }

    const newNotice = {
      title: formData.title,
      category: formData.category,
      audience: formData.audience,
      content: formData.content,
      date: new Date().toISOString().split('T')[0],
      pinned: Boolean(formData.pinned),
      instituteId: currentInstitute?.id || 'inst-1'
    }

    await addItem('notices', newNotice)
    if (logAuditEvent) {
      logAuditEvent(`Published notice circular: "${formData.title}"`, 'Notice Board Admin', 'Success')
    }
    toast.success('Notice published to campus board!')
    setIsModalOpen(false)
    setFormData({ title: '', category: 'General', audience: 'All Students & Parents', content: '', pinned: false })
  }

  const handleDelete = async (id, title) => {
    if (window.confirm(`Delete notice "${title}"?`)) {
      await deleteItem('notices', id)
      if (logAuditEvent) {
        logAuditEvent(`Removed notice: "${title}"`, 'Notice Board Admin', 'Success')
      }
      toast.success('Notice removed.')
    }
  }

  const togglePin = async (notice) => {
    const nextPinned = !notice.pinned
    await updateItem('notices', notice.id, { pinned: nextPinned })
    if (logAuditEvent) {
      logAuditEvent(`${nextPinned ? 'Pinned' : 'Unpinned'} notice: "${notice.title}"`, 'Notice Board Admin', 'Success')
    }
    toast.success(nextPinned ? 'Circular pinned to top of campus feed!' : 'Circular unpinned.')
  }

  const filteredNotices = useMemo(() => {
    const list = instNotices.filter(n => {
      const s = searchTerm.toLowerCase()
      const matchesSearch = 
        (n.title || '').toLowerCase().includes(s) ||
        (n.content || '').toLowerCase().includes(s)
      const matchesCat = selectedCategory === 'All' || n.category === selectedCategory
      return matchesSearch && matchesCat
    })

    // Sort: pinned notices first, then newest by date
    return list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date || 0) - new Date(a.date || 0)
    })
  }, [instNotices, searchTerm, selectedCategory])

  const getBadgeColor = (category) => {
    switch (category) {
      case 'Exam': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'Urgent': return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'Academic': return 'bg-blue-50 text-blue-700 border-blue-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campus Digital Notice Board</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish circulars, pin emergency directives, and generate official printable gazettes
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Notice</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search circulars, subject, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['All', 'General', 'Exam', 'Urgent', 'Academic'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Grid */}
      {filteredNotices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotices.map((n) => (
            <div 
              key={n.id} 
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between relative ${
                n.pinned 
                  ? 'border-amber-300 shadow-md ring-2 ring-amber-400/20 bg-gradient-to-b from-amber-50/20 to-white' 
                  : 'border-slate-200 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Pinned Banner */}
              {n.pinned && (
                <div className="absolute -top-3 left-4 inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                  <Pin className="w-3 h-3 fill-current" />
                  <span>PINNED CIRCULAR</span>
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2 mb-2 pt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getBadgeColor(n.category)}`}>
                    {n.category}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      {n.date}
                    </span>
                    
                    <button
                      onClick={() => togglePin(n)}
                      className={`p-1 rounded transition-colors ml-1 cursor-pointer ${
                        n.pinned ? 'text-amber-600 hover:text-amber-700 bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-slate-50'
                      }`}
                      title={n.pinned ? 'Unpin Notice' : 'Pin Notice to Top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${n.pinned ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      onClick={() => setSelectedNoticeForPrint(n)}
                      className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      title="Print Official Gazette Circular"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(n.id, n.title)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded transition-colors cursor-pointer"
                      title="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug mt-1">{n.title}</h3>
                <p className="text-xs text-slate-600 mt-2 line-clamp-4 leading-relaxed whitespace-pre-line">{n.content}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Audience: <strong className="text-slate-700">{n.audience}</strong></span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Bell className="w-3 h-3" />
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 border border-slate-200 text-center shadow-sm">
          <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No Circulars Found</h3>
          <p className="text-xs text-slate-400 mt-1">Publish an announcement or clear search filters.</p>
        </div>
      )}

      {/* Publish Notice Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Official Campus Circular / Notice"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Notice Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="e.g. Winter Break Schedule Announcement"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              >
                <option value="General">General</option>
                <option value="Academic">Academic</option>
                <option value="Exam">Exam</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Audience</label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
              >
                <option value="All Students & Parents">All Students & Parents</option>
                <option value="Students Only">Students Only</option>
                <option value="Parents Only">Parents Only</option>
                <option value="Faculty & Staff">Faculty & Staff</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Circular Message *</label>
            <textarea
              required
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Enter comprehensive announcement details..."
            />
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Pin className="w-4 h-4 text-amber-600" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">Pin to Top of Feed</span>
                <span className="text-[11px] text-amber-700">Keep this notice permanently highlighted at the top of the campus board</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formData.pinned}
              onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow cursor-pointer"
            >
              Publish Circular
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Printable Gazette Circular Modal */}
      {selectedNoticeForPrint && (
        <Modal
          isOpen={!!selectedNoticeForPrint}
          onClose={() => setSelectedNoticeForPrint(null)}
          title="Official Campus Circular & Gazette Notification"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="p-8 bg-white border-2 border-slate-900 rounded-xl space-y-6 font-serif text-slate-900 print:border-black print:p-8">
              {/* Header Letterhead */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-900 text-white flex items-center justify-center mb-2">
                  <School className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black uppercase tracking-wider">
                  {currentInstitute?.name || 'CENTRAL HIGH SCHOOL SYSTEM'}
                </h2>
                <p className="text-xs uppercase tracking-widest text-slate-600 font-sans">
                  OFFICE OF THE PRINCIPAL & ADMINISTRATIVE REGISTRAR
                </p>
                <p className="text-[10px] text-slate-500 font-mono font-sans">
                  BISE Affiliation: {currentInstitute?.code || 'BHS-001'} • Government of the Punjab Registered
                </p>
              </div>

              {/* Reference & Metadata Header */}
              <div className="flex justify-between items-center text-xs font-sans border-b border-slate-200 pb-2">
                <div>
                  <span className="text-slate-400 block text-[10px]">DISPATCH REFERENCE</span>
                  <strong className="font-mono text-slate-800">
                    REF: SCH/CIRCULAR/{new Date().getFullYear()}/{selectedNoticeForPrint.id.slice(-4).toUpperCase()}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">DATE OF ISSUANCE</span>
                  <strong className="font-mono text-slate-800">{selectedNoticeForPrint.date}</strong>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1 font-sans">
                <span className="text-[11px] text-slate-500 uppercase font-bold tracking-wider">
                  CIRCULATION TARGET: {selectedNoticeForPrint.audience.toUpperCase()}
                </span>
                <h3 className="text-sm font-black uppercase tracking-wide bg-slate-100 p-2.5 rounded border border-slate-200">
                  SUBJECT: {selectedNoticeForPrint.title}
                </h3>
              </div>

              {/* Main Body */}
              <div className="text-xs leading-relaxed font-sans text-slate-700 whitespace-pre-line py-2">
                {selectedNoticeForPrint.content}
              </div>

              {/* Official Circulation & Distribution List */}
              <div className="pt-4 border-t border-slate-200 text-[10px] font-sans text-slate-500 space-y-1">
                <span className="font-bold uppercase text-slate-700">Distribution for Immediate Compliance:</span>
                <ol className="list-decimal pl-4 space-y-0.5">
                  <li>Notice Boards across all academic wings (Elementary, Secondary & College wings).</li>
                  <li>Staff Common Room & Faculty Roster for strict adherence.</li>
                  <li>Official Parent Digital Notification Gateway & Archive.</li>
                  <li>Office of the Chief Proctor & Controller of Examinations.</li>
                </ol>
              </div>

              {/* Signatures & Seals */}
              <div className="flex justify-between items-end pt-8 font-sans text-xs">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-400 mb-1"></div>
                  <span className="font-semibold text-slate-700">Administrative Registrar</span>
                  <span className="block text-[10px] text-slate-400">Records & Archives</span>
                </div>

                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-[9px] text-slate-400 uppercase font-bold text-center">
                  INSTITUTIONAL SEAL
                </div>

                <div className="text-center">
                  <div className="w-36 border-b-2 border-slate-900 mb-1"></div>
                  <span className="font-black text-slate-900">Principal / Head of Campus</span>
                  <span className="block text-[10px] text-slate-500">Chief Executive Officer</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedNoticeForPrint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-black rounded-lg shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Circular (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default NoticeBoardView