import React, { useState, useEffect } from 'react'
import { X, Send, Phone, MessageSquare, Copy, Check, CheckCircle2, AlertTriangle, Users, Globe, ExternalLink } from 'lucide-react'
import {
  generateBilingualAlertText,
  ATTENDANCE_STATUSES,
  getConsecutiveAbsences,
  logAlertDispatch,
  getAlertDispatchesForDate,
  formatDateDDMMYYYY
} from './attendanceService'

export const AbsenteeNotificationModal = ({
  isOpen,
  onClose,
  session,
  date,
  className,
  sectionName,
  instituteName,
  students = [],
  attendanceRecords = {},
  consecutiveThreshold = 3,
  onNotificationSent
}) => {
  // Filter students who are absent, leave, or late
  const unpresentStudents = students.filter(s => {
    const item = attendanceRecords[s.id]
    const status = typeof item === 'string' ? item : (item?.status || 'present')
    return status === 'absent' || status === 'leave' || status === 'late' || status === 'short_leave'
  })

  // Language selector: 'english' | 'urdu'
  const [templateLang, setTemplateLang] = useState('english')
  const [copiedId, setCopiedId] = useState(null)
  const [selectedStudentId, setSelectedStudentId] = useState(unpresentStudents[0]?.id || null)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [bulkSentSuccess, setBulkSentSuccess] = useState(false)

  // Tracking sent status per student
  const [dispatchLogs, setDispatchLogs] = useState(() => getAlertDispatchesForDate(date))

  if (!isOpen) return null

  const activeStudent = unpresentStudents.find(s => s.id === selectedStudentId) || unpresentStudents[0]
  const activeRecord = activeStudent ? attendanceRecords[activeStudent.id] : null
  const activeStatus = typeof activeRecord === 'string' ? activeRecord : (activeRecord?.status || 'absent')
  const activeReason = activeRecord?.reason || ''

  // Consecutive absences check for active student
  const consecutiveInfo = activeStudent ? getConsecutiveAbsences(
    activeStudent.id,
    session,
    className,
    sectionName,
    date,
    consecutiveThreshold
  ) : { count: 0, isFlagged: false }

  const bilingualTexts = activeStudent ? generateBilingualAlertText(
    activeStudent,
    instituteName,
    formatDateDDMMYYYY(date),
    activeStatus,
    activeReason,
    consecutiveInfo.count
  ) : { english: '', urdu: '' }

  const activeMessage = templateLang === 'urdu' ? bilingualTexts.urdu : bilingualTexts.english

  const isStudentSent = (studentId) => {
    return dispatchLogs.some(l => l.studentId === studentId)
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    if (activeStudent) {
      logAlertDispatch(activeStudent.id, activeStudent.name, date, 'SMS', activeStudent.guardianPhone || activeStudent.phone || '', 'Sent')
      setDispatchLogs(getAlertDispatchesForDate(date))
    }
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleOpenWhatsApp = (student, message) => {
    const rawPhone = student.guardianPhone || student.phone || ''
    const cleanPhone = rawPhone.replace(/[^0-9]/g, '')
    const encoded = encodeURIComponent(message)
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
    window.open(url, '_blank')

    logAlertDispatch(student.id, student.name, date, 'WhatsApp', rawPhone, 'Sent')
    setDispatchLogs(getAlertDispatchesForDate(date))
  }

  const handleSendAllBulk = () => {
    setIsSendingBulk(true)
    setTimeout(() => {
      unpresentStudents.forEach(std => {
        logAlertDispatch(std.id, std.name, date, 'Bulk SMS', std.guardianPhone || std.phone || '', 'Sent')
      })
      setDispatchLogs(getAlertDispatchesForDate(date))
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
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
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
                {className} ({sectionName}) • Date: {formatDateDDMMYYYY(date)} • {unpresentStudents.length} Absent / Leave Students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
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
            <div className="md:col-span-5 border-r border-slate-100 overflow-y-auto max-h-[420px] p-3 space-y-1.5 bg-slate-50/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 px-2 block tracking-wider">
                Select Student to Review
              </span>

              {unpresentStudents.map(std => {
                const rec = attendanceRecords[std.id]
                const st = typeof rec === 'string' ? rec : (rec?.status || 'absent')
                const statusCfg = ATTENDANCE_STATUSES[st] || ATTENDANCE_STATUSES.absent
                const isSelected = (activeStudent?.id === std.id)
                const isSent = isStudentSent(std.id)

                const cInfo = getConsecutiveAbsences(std.id, session, className, sectionName, date, consecutiveThreshold)

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
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800 font-bold text-xs truncate">
                          {std.name}
                        </strong>
                        {cInfo.isFlagged && (
                          <span className="px-1 py-0.2 rounded font-mono text-[9px] bg-rose-100 text-rose-800 font-bold" title={`Absent ${cInfo.count} consecutive days`}>
                            {cInfo.count}d Absent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>Roll: {std.rollNumber}</span>
                        <span>•</span>
                        <span>{std.guardianPhone || std.phone || 'No phone'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${statusCfg.badgeClass}`}>
                        {statusCfg.label}
                      </span>
                      <span className={`text-[9px] font-bold ${isSent ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {isSent ? 'Sent ✓' : 'Pending'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right Message Preview Panel */}
            <div className="md:col-span-7 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto max-h-[420px] space-y-3 bg-white">
              {activeStudent ? (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{activeStudent.name}</span>
                          {consecutiveInfo.isFlagged && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>{consecutiveInfo.count} Days Consecutive Absence!</span>
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-xs font-mono">
                          Parent Contact: {activeStudent.guardianPhone || activeStudent.phone || 'Not Registered'}
                        </span>
                      </div>

                      {/* Language Switcher */}
                      <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 font-bold text-[11px]">
                        <button
                          type="button"
                          onClick={() => setTemplateLang('english')}
                          className={`px-2.5 py-1 rounded transition-all ${
                            templateLang === 'english' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => setTemplateLang('urdu')}
                          className={`px-2.5 py-1 rounded transition-all ${
                            templateLang === 'urdu' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-500'
                          }`}
                        >
                          اردو (Urdu)
                        </button>
                      </div>
                    </div>

                    <div>
                      <span className="font-bold text-slate-600 uppercase text-[10px] block mb-1">
                        Formatted Alert Message ({templateLang === 'urdu' ? 'اردو' : 'English'})
                      </span>
                      <pre className={`p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs leading-relaxed whitespace-pre-wrap select-all ${
                        templateLang === 'urdu' ? 'font-sans text-right' : 'font-sans text-left'
                      }`}>
                        {activeMessage}
                      </pre>
                    </div>
                  </div>

                  {/* Individual Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Status: <strong className={isStudentSent(activeStudent.id) ? 'text-emerald-700' : 'text-amber-700'}>
                        {isStudentSent(activeStudent.id) ? 'Sent to Guardian' : 'Pending Dispatch'}
                      </strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(activeStudent.id, activeMessage)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {copiedId === activeStudent.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedId === activeStudent.id ? 'Copied & Logged!' : 'Copy SMS'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenWhatsApp(activeStudent, activeMessage)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Send WhatsApp</span>
                      </button>
                    </div>
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
            Dispatches are recorded in local communication audit logs.
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
                    <span>Dispatching All Alerts...</span>
                  </>
                ) : bulkSentSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Dispatched Successfully!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Mark All {unpresentStudents.length} As Sent</span>
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
