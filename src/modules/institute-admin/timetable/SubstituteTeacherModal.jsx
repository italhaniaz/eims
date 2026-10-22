import React, { useState } from 'react'
import { 
  X, 
  UserCheck, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText,
  ShieldAlert 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { recordSubstituteAssignment } from './timetableService'

export const SubstituteTeacherModal = ({
  isOpen,
  onClose,
  session = '2026-2027',
  className,
  sectionName,
  slotData, // { day, periodNum, subjectName, teacherId, teacherName, roomName }
  teachers = [],
  onSubstituteAssigned
}) => {
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().split('T')[0])
  const [substituteTeacherId, setSubstituteTeacherId] = useState('')
  const [coverReason, setCoverReason] = useState('Medical Leave Proxy')
  const [handoverNotes, setHandoverNotes] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen || !slotData) return null

  const availableTeachers = teachers.filter(t => 
    t.id !== slotData.teacherId && t.status !== 'On Leave'
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!substituteTeacherId) {
      setErrorMsg('Please select a substitute faculty member to cover this period.')
      return
    }

    const subObj = teachers.find(t => t.id === substituteTeacherId)

    const assignment = {
      session,
      className,
      sectionName,
      date: targetDate,
      day: slotData.day,
      periodNum: slotData.periodNum,
      subjectName: slotData.subjectName,
      roomName: slotData.roomName,
      originalTeacherId: slotData.teacherId,
      originalTeacherName: slotData.teacherName,
      substituteTeacherId,
      substituteTeacherName: subObj?.name || 'Substitute Faculty',
      substituteEmpId: subObj?.empId || '',
      reason: coverReason,
      notes: handoverNotes.trim()
    }

    const saved = recordSubstituteAssignment(assignment)
    if (onSubstituteAssigned) onSubstituteAssigned(saved)
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-emerald-600" />
          <span className="font-bold text-slate-900">Assign Substitute Cover Teacher</span>
        </div>
      }
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Period Details Summary */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <strong className="text-slate-900 font-bold">{slotData.subjectName}</strong>
            <span className="font-mono text-[11px] font-bold text-slate-600 px-2 py-0.5 rounded bg-slate-200/80">
              {slotData.day} • {slotData.periodNum}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 block">
            Regular Teacher: <strong className="text-slate-700">{slotData.teacherName}</strong>
          </span>
          <span className="text-[11px] text-slate-500 block">
            Location: <span className="font-mono">{slotData.roomName}</span> ({className} - {sectionName})
          </span>
        </div>

        {/* Specific Date */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Coverage Date *</label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-slate-800"
          />
        </div>

        {/* Substitute Teacher Dropdown */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Select Substitute Teacher (Proxy) *</label>
          <select
            required
            value={substituteTeacherId}
            onChange={(e) => setSubstituteTeacherId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">-- Select Available Substitute --</option>
            {availableTeachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.empId} • {t.department || 'Faculty'})
              </option>
            ))}
          </select>
        </div>

        {/* Reason for Coverage */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Reason for Proxy Cover</label>
          <select
            value={coverReason}
            onChange={(e) => setCoverReason(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
          >
            <option value="Medical Leave Proxy">Medical / Sick Leave Proxy</option>
            <option value="Casual Leave Proxy">Approved Casual Leave Proxy</option>
            <option value="Official Academic Duty">Official Duty / Meeting</option>
            <option value="Emergency Relief">Emergency Relief Cover</option>
            <option value="Other">Other Specific Need</option>
          </select>
        </div>

        {/* Handover Instructions */}
        <div>
          <label className="block text-slate-600 font-semibold mb-1">Lesson Instructions / Handover Notes</label>
          <textarea
            rows="2"
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            placeholder="e.g. Conduct revision test on Chapter 3; distribute handouts..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all"
          >
            Assign Proxy Cover
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default SubstituteTeacherModal
