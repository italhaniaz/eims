import React, { useState } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  MapPin, 
  GraduationCap, 
  FileCheck, 
  MessageSquare, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Tag, 
  Users, 
  Award, 
  ChevronRight,
  Flame,
  Thermometer,
  Snowflake,
  ExternalLink
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { useToast } from '../../context/ToastContext'

export const LeadDetailsDrawer = ({
  isOpen,
  onClose,
  lead,
  onUpdateLead,
  onOpenScorecard,
  onOpenOffer,
  onProceedToEnroll
}) => {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'timeline' | 'documents' | 'notes'

  // New communication log state
  const [newLogType, setNewLogType] = useState('Call') // 'Call' | 'WhatsApp' | 'Meeting' | 'Email'
  const [newLogNotes, setNewLogNotes] = useState('')
  const [newLogCounselor, setNewLogCounselor] = useState(lead?.assignedCounselor || 'Admissions Desk')

  // Document checklist local state
  const [docs, setDocs] = useState(() => ({
    bForm: lead?.documents?.bForm || false,
    resultCard: lead?.documents?.resultCard || false,
    photos: lead?.documents?.photos || false,
    transferCert: lead?.documents?.transferCert || false
  }))

  // Notes & Tags local state
  const [internalNotes, setInternalNotes] = useState(lead?.internalNotes || lead?.notes || '')
  const [tagsInput, setTagsInput] = useState(Array.isArray(lead?.tags) ? lead.tags.join(', ') : '')

  if (!isOpen || !lead) return null

  // Toggle document checklist
  const handleToggleDoc = async (docKey) => {
    const updatedDocs = {
      ...docs,
      [docKey]: !docs[docKey]
    }
    setDocs(updatedDocs)
    if (onUpdateLead) {
      await onUpdateLead(lead.id, {
        documents: updatedDocs
      })
      toast.success('Document checklist status updated.')
    }
  }

  // Save new interaction log
  const handleAddLog = async (e) => {
    e.preventDefault()
    if (!newLogNotes.trim()) return

    const newEntry = {
      id: `log-${Date.now()}`,
      type: newLogType,
      timestamp: new Date().toISOString(),
      counselor: newLogCounselor,
      notes: newLogNotes.trim()
    }

    const currentLogs = Array.isArray(lead.communicationLogs) ? lead.communicationLogs : []
    const updatedLogs = [newEntry, ...currentLogs]

    if (onUpdateLead) {
      await onUpdateLead(lead.id, {
        communicationLogs: updatedLogs
      })
      setNewLogNotes('')
      toast.success(`${newLogType} interaction logged.`)
    }
  }

  // Save internal notes & tags
  const handleSaveNotes = async () => {
    const parsedTags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    if (onUpdateLead) {
      await onUpdateLead(lead.id, {
        internalNotes: internalNotes,
        tags: parsedTags
      })
      toast.success('Notes and tags saved.')
    }
  }

  const logs = Array.isArray(lead.communicationLogs) ? lead.communicationLogs : []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Candidate Dossier: ${lead.studentName}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Header Hero Pill */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center font-black text-lg">
              {lead.studentName?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight">{lead.studentName}</h2>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40 font-mono">
                  {lead.stage}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Applying for: <strong className="text-white">{lead.gradeApplied}</strong> • Session: {lead.academicSession || '2026-2027'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lead.parentPhone && (
              <a
                href={`https://wa.me/${lead.parentPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {lead.parentPhone && (
              <a
                href={`tel:${lead.parentPhone}`}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
              >
                <Phone className="w-3 h-3" />
                <span>Call</span>
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timeline' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Communication Timeline ({logs.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Documents Checklist</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notes' ? 'bg-teal-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Notes & Tags</span>
          </button>
        </div>

        {/* Tab 1: Overview & Details */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Applicant Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block border-b pb-1.5">
                  Applicant Information
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Gender</span>
                    <strong>{lead.gender || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Date of Birth</span>
                    <strong>{lead.dob || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">B-Form / CNIC</span>
                    <strong className="font-mono">{lead.bFormCnic || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Previous School</span>
                    <strong>{lead.previousSchool || '—'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Previous Academic Record</span>
                    <strong>{lead.previousClassMarks || lead.matricMarks || '—'}</strong>
                  </div>
                  {lead.address && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Residential Address</span>
                      <span>{lead.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Guardian Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block border-b pb-1.5">
                  Parent / Guardian Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Guardian Name</span>
                    <strong>{lead.parentName || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Relation</span>
                    <strong>{lead.parentRelation || 'Father'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">Calling Phone</span>
                    <strong className="font-mono">{lead.parentPhone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-semibold">WhatsApp</span>
                    <strong className="font-mono">{lead.parentWhatsapp || lead.parentPhone || '—'}</strong>
                  </div>
                  {lead.parentEmail && (
                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase block font-semibold">Email</span>
                      <span>{lead.parentEmail}</span>
                    </div>
                  )}
                  {lead.siblingEnrolled && (
                    <div className="col-span-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900">
                      <span className="text-[10px] font-bold block uppercase">Sibling Already Enrolled:</span>
                      <strong>{lead.siblingName ? `${lead.siblingName} (${lead.siblingRoll || 'Student'})` : 'Yes (Existing Campus Family)'}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Lead & CRM Routing Card */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block border-b pb-1.5">
                Lead Intelligence & Follow-up Scheduling
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Lead Source</span>
                  <span className="font-bold text-teal-800">{lead.source || 'Walk-in'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Assigned Counselor</span>
                  <strong>{lead.assignedCounselor || 'General Admissions'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Priority</span>
                  <span className={`inline-flex items-center gap-1 font-bold ${
                    lead.priority === 'Hot' ? 'text-rose-600' : lead.priority === 'Warm' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {lead.priority === 'Hot' && <Flame className="w-3.5 h-3.5" />}
                    {lead.priority === 'Warm' && <Thermometer className="w-3.5 h-3.5" />}
                    {lead.priority === 'Cold' && <Snowflake className="w-3.5 h-3.5" />}
                    <span>{lead.priority || 'Warm'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Next Follow-up Date</span>
                  <strong className={lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date() ? 'text-rose-600 font-mono' : 'font-mono'}>
                    {lead.nextFollowUpDate || 'Not scheduled'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Scorecard Quick Preview */}
            {lead.scorecard && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-teal-800 block">Entrance Test Evaluation</span>
                  <strong className="text-teal-950 text-sm">Score: {lead.scorecard.percentage || 'Qualified'}</strong>
                  <span className="text-teal-700 ml-2">({lead.scorecard.decision})</span>
                </div>
                {onOpenScorecard && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onOpenScorecard(lead)
                    }}
                    className="px-2.5 py-1 bg-white border border-teal-300 text-teal-800 rounded font-bold hover:bg-teal-100 cursor-pointer"
                  >
                    View Scorecard
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Communication Timeline */}
        {activeTab === 'timeline' && (
          <div className="space-y-4 text-xs">
            {/* Add Log Form */}
            <form onSubmit={handleAddLog} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
              <span className="font-bold text-slate-900 block text-xs">Log New Interaction</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Interaction Type</label>
                  <select
                    value={newLogType}
                    onChange={(e) => setNewLogType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-medium bg-white"
                  >
                    <option value="Call">Phone Call</option>
                    <option value="WhatsApp">WhatsApp Message</option>
                    <option value="Meeting">In-Person Campus Meeting</option>
                    <option value="Email">Email Communication</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Counselor Name</label>
                  <input
                    type="text"
                    value={newLogCounselor}
                    onChange={(e) => setNewLogCounselor(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div className="sm:self-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold flex items-center justify-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save Log</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Summary / Conversation Notes</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Detail candidate response, parent queries, fee inquiries, or promised follow-up..."
                  value={newLogNotes}
                  onChange={(e) => setNewLogNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {logs.length > 0 ? (
                logs.map((item, index) => (
                  <div key={item.id || index} className="p-3 bg-white border border-slate-200 rounded-xl space-y-1 relative pl-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-500 absolute left-3 top-4"></div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-bold text-teal-800 uppercase tracking-wide">{item.type}</span>
                      <span>{new Date(item.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-800 text-xs mt-0.5">{item.notes}</p>
                    <span className="text-[10px] text-slate-400 block">Logged by: {item.counselor || 'Counselor'}</span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed">
                  <MessageSquare className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <p className="font-medium text-xs">No communications logged yet for this candidate.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Documents Checklist */}
        {activeTab === 'documents' && (
          <div className="space-y-3 text-xs">
            <p className="text-slate-500 text-xs">
              Check off official documents verified by the Admissions Committee:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'bForm', label: 'NADRA B-Form / Birth Certificate Copy', desc: 'Verified against CNIC database' },
                { key: 'resultCard', label: 'Previous Result Card / Transcript', desc: 'Official seal of prior institution' },
                { key: 'photos', label: 'Four (4) Passport Photographs', desc: 'Sky blue background' },
                { key: 'transferCert', label: 'Original School Leaving / Transfer Certificate', desc: 'Countersigned by District Education Officer' }
              ].map(item => {
                const isChecked = Boolean(docs[item.key])
                return (
                  <div
                    key={item.key}
                    onClick={() => handleToggleDoc(item.key)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked 
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent onClick
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 pointer-events-none"
                    />
                    <div>
                      <strong className="block text-xs font-bold">{item.label}</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                      <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isChecked ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isChecked ? 'Verified / Received' : 'Pending Document'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Notes & Tags */}
        {activeTab === 'notes' && (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Internal Administrative Notes & Observations
              </label>
              <textarea
                rows={4}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Confidential interview notes, scholarship requests, parent background, transport inquiries..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Lead Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. Science Stream, Transport Required, Hostel, Scholarship Applicant"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-2xs cursor-pointer"
              >
                Save Notes & Tags
              </button>
            </div>
          </div>
        )}

        {/* Drawer Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
          <div className="flex items-center gap-2">
            {onOpenScorecard && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenScorecard(lead)
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>Scorecard</span>
              </button>
            )}

            {onOpenOffer && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onOpenOffer(lead)
                }}
                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-700" />
                <span>Admission Offer</span>
              </button>
            )}

            {onProceedToEnroll && (lead.stage === 'Offer Issued' || lead.stage === 'Fee Paid') && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onProceedToEnroll(lead)
                }}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Enroll Student</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default LeadDetailsDrawer
