import React, { useState, useMemo, useEffect } from 'react'
import { MessageSquare, X, Send, Phone, Eraser } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import {
  getDistinctInstituteClassNames,
  isClassAllowedForTier
} from '../../utils/tierGating'

const SMS_TEMPLATES = [
  {
    id: 'fee',
    label: 'Fee Reminder',
    cls: 'border-blue-400 text-blue-600 hover:bg-blue-50',
    build: ({ studentName, dueAmount, instName }) =>
      `Dear Parent, kindly clear the pending fee${dueAmount > 0 ? ` of PKR ${dueAmount.toLocaleString()}` : ''} for ${studentName || 'your child'} at your earliest convenience. Thank you — ${instName}.`
  },
  {
    id: 'attendance',
    label: 'Attendance',
    cls: 'border-orange-400 text-orange-600 hover:bg-orange-50',
    build: ({ studentName, instName }) =>
      `Dear Parent, please note that ${studentName || 'your child'} was marked absent today. Kindly inform the school office of the reason. Regards, ${instName}.`
  },
  {
    id: 'exam',
    label: 'Exam Notice',
    cls: 'border-cyan-400 text-cyan-600 hover:bg-cyan-50',
    build: ({ studentName, className, instName }) =>
      `Dear Parent, upcoming examination schedules for ${className || 'your child'} (${studentName || 'Student'}) have been finalized. Please ensure regular preparation and attendance. — ${instName}.`
  },
  {
    id: 'meeting',
    label: 'Meeting',
    cls: 'border-emerald-400 text-emerald-600 hover:bg-emerald-50',
    build: ({ studentName, instName }) =>
      `Dear Parent, you are invited for a Parent-Teacher Meeting regarding ${studentName || 'your child'}'s academic progress. Please contact the school office for your slot. — ${instName}.`
  },
  {
    id: 'general',
    label: 'General',
    cls: 'border-slate-400 text-slate-700 hover:bg-slate-50',
    build: ({ instName }) =>
      `Dear Parent, important update from ${instName}: please check your student portal or contact the campus administration office for details.`
  }
]

export const SendSmsModal = ({ isOpen, onClose, currentInstitute }) => {
  const {
    students = [],
    classes = [],
    fees = [],
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const instName = currentInstitute?.name || 'School Administration'

  const instStudents = useMemo(
    () =>
      students.filter(
        (s) =>
          (!currentInstitute?.id || s.instituteId === currentInstitute.id || !s.instituteId) &&
          isClassAllowedForTier(s.className, currentInstitute)
      ),
    [students, currentInstitute]
  )

  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, instStudents, currentInstitute),
    [classes, instStudents, currentInstitute]
  )

  const [selectedClass, setSelectedClass] = useState('')
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setSelectedClass('')
    setSelectedStudentId('')
    setMessage('')
  }, [isOpen])

  const studentsInClass = useMemo(() => {
    if (!selectedClass) return []
    return instStudents.filter(
      (s) => (s.className || '').trim().toLowerCase() === selectedClass.trim().toLowerCase()
    )
  }, [instStudents, selectedClass])

  const selectedStudent = useMemo(() => {
    if (!selectedStudentId || selectedStudentId === '__ALL__') return null
    return studentsInClass.find((s) => s.id === selectedStudentId) || null
  }, [studentsInClass, selectedStudentId])

  const outstandingForStudent = useMemo(() => {
    if (!selectedStudent) return 0
    return fees
      .filter((f) => f.studentId === selectedStudent.id && f.status !== 'Paid')
      .reduce((sum, f) => {
        const due = Number(f.amount || 0) + Number(f.fine || f.lateFine || 0)
        const paid = Number(f.paidAmount || 0)
        const waiver = Number(f.discount || f.waiver || 0)
        return sum + Math.max(0, due - paid - waiver)
      }, 0)
  }, [fees, selectedStudent])

  const handleApplyTemplate = (tpl) => {
    const text = tpl.build({
      studentName: selectedStudent ? selectedStudent.fullName || selectedStudent.name : selectedClass ? `students of ${selectedClass}` : 'your child',
      className: selectedClass,
      dueAmount: outstandingForStudent,
      instName
    })
    setMessage(text.slice(0, 1000))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedClass) {
      toast('Please select a class first.', 'warning')
      return
    }
    if (!selectedStudentId) {
      toast('Please select a student or All Students in class.', 'warning')
      return
    }
    if (!message.trim()) {
      toast('Please enter an SMS message.', 'warning')
      return
    }

    const targets = selectedStudentId === '__ALL__'
      ? studentsInClass
      : selectedStudent
        ? [selectedStudent]
        : []

    if (targets.length === 0) {
      toast('No recipient found for the selected class.', 'warning')
      return
    }

    const recipientLabel =
      selectedStudentId === '__ALL__'
        ? `All Parents — ${selectedClass} (${targets.length})`
        : `${selectedStudent.fullName || selectedStudent.name} (${selectedStudent.parentPhone || selectedStudent.phone || 'Parent'})`

    setIsSending(true)
    try {
      await sendCommunicationBlast({
        channel: 'SMS',
        recipientGroup: recipientLabel,
        message: message.trim(),
        recipientsCount: targets.length
      })
      logAuditEvent?.(
        `Sent SMS to ${recipientLabel}`,
        instName,
        'Success'
      )
      toast(`SMS sent to ${recipientLabel}.`, 'success')
      onClose?.()
    } catch (err) {
      toast(err?.message || 'Failed to dispatch SMS.', 'error')
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  const parentPhone = selectedStudent?.parentPhone || selectedStudent?.phone || selectedStudent?.guardianPhone || ''

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-fade-in">
        {/* Cyan Header matching Pick 1 */}
        <div className="bg-cyan-500 px-5 py-3.5 flex items-center justify-between text-white">
          <div className="flex items-center gap-2 font-bold text-sm">
            <MessageSquare className="w-4 h-4" />
            <span>Send SMS to Parent</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/85 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Class * & Student * */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Class <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setSelectedStudentId('')
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                required
              >
                <option value="">Select class</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Student <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                disabled={!selectedClass}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 font-medium disabled:bg-slate-100 disabled:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25"
                required
              >
                {!selectedClass ? (
                  <option value="">Select Class First</option>
                ) : (
                  <>
                    <option value="">Select student...</option>
                    {studentsInClass.length > 0 && (
                      <option value="__ALL__">
                        All Students in {selectedClass} ({studentsInClass.length})
                      </option>
                    )}
                    {studentsInClass.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.fullName || st.name}
                        {st.rollNumber ? ` · Roll ${st.rollNumber}` : ''}
                      </option>
                    ))}
                  </>
                )}
              </select>
              {selectedStudent && (
                <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  <span>
                    {selectedStudent.fatherName || 'Parent'} · {parentPhone || 'No phone on file'}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Quick Templates */}
          <div className="space-y-1.5">
            <p className="text-xs font-bold text-slate-800">
              Quick Templates <span className="font-normal text-slate-400">(Click to auto-fill)</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {SMS_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleApplyTemplate(tpl)}
                  className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold cursor-pointer transition-colors ${tpl.cls}`}
                >
                  {tpl.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setMessage('')}
                className="px-2.5 py-1 rounded-full border border-slate-400 text-slate-600 hover:bg-slate-100 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Eraser className="w-3 h-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Message * */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Message <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={5}
              maxLength={1000}
              placeholder="Type your message here or select a template above..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/25 resize-y"
              required
            />
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
              <span>{message.length} / 1000 characters</span>
              {message.length > 0 && (
                <span>{Math.ceil(message.length / 160)} SMS part{Math.ceil(message.length / 160) === 1 ? '' : 's'}</span>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-500 hover:bg-slate-600 text-white font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending || !selectedClass || !selectedStudentId || !message.trim()}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Send SMS'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SendSmsModal
