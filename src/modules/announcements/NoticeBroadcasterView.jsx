import React, { useState } from 'react'
import { Megaphone, Plus, Search, Calendar, Trash2, Send, School, CheckCircle2 } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import Modal from '../../components/common/Modal'

export const NoticeBroadcasterView = () => {
  const { institutes } = useAppData()
  const [broadcasts, setBroadcasts] = useState([
    {
      id: 'bc-1',
      title: 'Annual Board Registration Deadlines 2026-27',
      target: 'All Registered Campuses',
      priority: 'High',
      date: '2026-10-18',
      message: 'All affiliated institutes must submit student registration lists for secondary examinations before the deadline.'
    },
    {
      id: 'bc-2',
      title: 'Winter Vacation Uniform Policy Directive',
      target: 'Punjab Region Campuses',
      priority: 'Normal',
      date: '2026-10-15',
      message: 'Official guidelines regarding winter dress code and school timing adjustments issued by the Education Directorate.'
    }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sentSuccess, setSentSuccess] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    target: 'All Registered Campuses',
    priority: 'Normal',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title || !formData.message) return

    const newBroadcast = {
      id: `bc-${Date.now()}`,
      title: formData.title,
      target: formData.target,
      priority: formData.priority,
      date: new Date().toISOString().split('T')[0],
      message: formData.message
    }

    setBroadcasts([newBroadcast, ...broadcasts])
    setIsModalOpen(false)
    setSentSuccess(true)
    setTimeout(() => setSentSuccess(false), 3500)
    setFormData({ title: '', target: 'All Registered Campuses', priority: 'Normal', message: '' })
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this broadcast directive?')) {
      setBroadcasts(broadcasts.filter(b => b.id !== id))
    }
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Platform Broadcast & Circulars</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Broadcast official directives, policy announcements, and circulars to campuses</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Broadcast New Circular</span>
        </button>
      </div>

      {sentSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Circular broadcasted to campus portals successfully!
        </div>
      )}

      {/* Broadcast Cards */}
      <div className="space-y-4">
        {broadcasts.map(b => (
          <div key={b.id} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  b.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                }`}>
                  {b.priority} Priority
                </span>
                <span className="text-xs text-slate-400 font-mono">{b.date}</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                  <School className="w-3 h-3" /> {b.target}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-800 leading-snug">{b.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{b.message}</p>
            </div>

            <button
              onClick={() => handleDelete(b.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors self-end sm:self-start"
              title="Delete Directive"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Platform Circular Directive"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Circular Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Schedule for Board Examination Enrolment"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Campuses</label>
              <select
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="All Registered Campuses">All Registered Campuses</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High / Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Directive Message</label>
            <textarea
              rows={4}
              required
              placeholder="Enter official circular message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-slate-600">Cancel</button>
            <button type="submit" className="px-5 py-2 text-sm text-white bg-purple-600 rounded-lg font-semibold flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Broadcast Now</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default NoticeBroadcasterView
