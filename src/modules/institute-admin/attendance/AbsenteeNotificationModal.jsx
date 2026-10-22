import React, { useState } from 'react'
import { X, Send, Phone, MessageSquare, Copy, Check, CheckCircle2, AlertTriangle, Users } from 'lucide-react'
import { generateAbsenteeAlertText, ATTENDANCE_STATUSES } from './attendanceService'

export const AbsenteeNotificationModal = ({
  isOpen,
  onClose,
  date,
  className,
  sectionName,
  instituteName,
  students = [],
  attendanceRecords = {},
  onNotificationSent
}) => {
  if (!isOpen) return null

  // Filter students who are absent, leave, or late
  const unpresentStudents = students.filter(s => {
    const item = attendanceRecords[s.id]
    const status = typeof item === 'string' ? item : (item?.status || 'present')
    return status === 'absent' || status === 'leave' || status === 'late'
  })

  const [copiedId, setCopiedId] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState(unpresentStudents[0]?.id || null)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [bulkSentSuccess, setBulkSentSuccess] = useState(false)

  const activeStudent = unpresentStudents.find(s => s.id === selectedStudentId) || unpresentStudents[0]
  const activeRecord = activeStudent ? attendanceRecords[activeStudent.id] : null
  const activeStatus = typeof activeRecord === 'string' ? activeRecord : (activeRecord?.status || 'absent')
  const activeReason = activeRecord?.reason || ''

  const previewMessage = activeStudent ? generateAbsenteeAlertText(
    activeStudent,
    instituteName,
    date,
    activeStatus,
    activeReason
  ) : ''

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleOpenWhatsApp = (student, message) => {
    const rawPhone = student.guardianPhone || student.phone || ''
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
    const encoded = encodeURIComponent(message)
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')
  }

  const handleSendAllBulk = () => {
    setIsSendingBulk(true)
    setTimeout(() => {
      setIsSendingBulk(false)
      setBulkSentSuccess(true)
      onNotificationSent?.(unpresentStudents.length)
      setTimeout(() => {
        setBulkSentSuccess(false)
        onClose()
      }, 2000)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Guardian Absentee & Leave Alerts
              </h3>
              <p className="text-xs text-slate-400">
                {className} ({sectionName}) • Date: {date} • {unpresentStudents.length} Absent / Leave Students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {unpresentStudents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">100% Attendance Today!</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No students are marked absent, on leave, or late for {className} ({sectionName}) on this date.
            </p>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden text-xs">
            {/* Left list of unpresent students */}
            <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto max-h-[380px] p-3 space-y-1.5 bg-slate-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block tracking-wider">
                Select Student to Review
              </span>

              {unpresentStudents.map(std => {
                const rec = attendanceRecords[std.id]
                const st = typeof rec === 'string' ? rec : (rec?.status || 'absent')
                const statusCfg = ATTENDANCE_STATUSES[st] || ATTENDANCE_STATUSES.absent
                const isSelected = (activeStudent?.id === std.id)

                return (
                  <div
                    key={std.id}
                    onClick={() => setSelectedStudentId(std.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate">
                      <strong className="block text-slate-800 font-bold text-xs truncate">
                        {std.name}
                      </strong>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                        <span>Roll: {std.rollNumber}</span>
                        <span>•</span>
                        <span>{std.guardianPhone || std.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] shrink-0 border ${statusCfg.badgeClass}`}>
                      {statusCfg.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Right Message Preview Panel */}
            <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[380px] space-y-3 bg-white">
              {activeStudent ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{activeStudent.name}</span>
                        <span className="text-slate-400 text-xs font-mono">
                          Parent Contact: {activeStudent.guardianPhone || activeStudent.phone || 'Not Registered'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg font-bold border text-xs ${
                        ATTENDANCE_STATUSES[activeStatus]?.badgeClass
                      }`}>
                        {ATTENDANCE_STATUSES[activeStatus]?.label}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">
                        SMS & WhatsApp Message Preview
                      </span>
                      <pre className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-sans text-xs leading-relaxed whitespace-pre-wrap select-all">
                        {previewMessage}
                      </pre>
                    </div>
                  </div>

                  {/* Individual Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleCopy(activeStudent.id, previewMessage)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {copiedId === activeStudent.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === activeStudent.id ? 'Copied!' : 'Copy Text'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenWhatsApp(activeStudent, previewMessage)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Open WhatsApp</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-slate-400">
                  Select a student from the list to preview alert
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Direct WhatsApp dispatch launches web client. Bulk dispatch logs simulated SMS triggers.
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors"
            >
              Close
            </button>

            {unpresentStudents.length > 0 && (
              <button
                type="button"
                disabled={isSendingBulk || bulkSentSuccess}
                onClick={handleSendAllBulk}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                {isSendingBulk ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending SMS to {unpresentStudents.length} Parents...</span>
                  </>
                ) : bulkSentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispatched Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch All {unpresentStudents.length} Alerts</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AbsenteeNotificationModal
