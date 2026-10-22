import React, { useState, useMemo } from 'react'
import { 
  X, 
  ArrowRight, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  Calendar, 
  Users, 
  Sparkles 
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const ClassPromotionModal = ({
  isOpen,
  onClose,
  classes = [],
  students = [],
  currentSession = '2026-2027',
  onPromoteClass,
  onCloneSession
}) => {
  const [modalTab, setModalTab] = useState('promote') // 'promote' | 'clone'
  
  // Promote state
  const [sourceClassId, setSourceClassId] = useState(classes[0]?.id || '')
  const [targetClassId, setTargetClassId] = useState(classes[1]?.id || '')
  const [targetSession, setTargetSession] = useState('2027-2028')
  const [isPromoting, setIsPromoting] = useState(false)
  const [previewConfirmed, setPreviewConfirmed] = useState(false)

  // Clone session state
  const [cloneFromSession, setCloneFromSession] = useState(currentSession)
  const [cloneToSession, setCloneToSession] = useState('2027-2028')
  const [isCloning, setIsCloning] = useState(false)

  const sourceClass = useMemo(() => {
    return classes.find(c => c.id === sourceClassId) || classes[0]
  }, [classes, sourceClassId])

  const targetClass = useMemo(() => {
    return classes.find(c => c.id === targetClassId)
  }, [classes, targetClassId])

  // Students in source class
  const sourceStudents = useMemo(() => {
    if (!sourceClass) return []
    return students.filter(s => (s.className || '').toLowerCase().trim() === sourceClass.name.toLowerCase().trim())
  }, [students, sourceClass])

  // Classes in the session to clone
  const classesToClone = useMemo(() => {
    return classes.filter(c => (c.academicSession || currentSession) === cloneFromSession)
  }, [classes, cloneFromSession, currentSession])

  if (!isOpen) return null

  const handleExecutePromotion = () => {
    if (!sourceClass || !targetClass) return
    onPromoteClass({
      sourceClass,
      targetClass,
      students: sourceStudents,
      newSession: targetSession
    })
    onClose()
  }

  const handleExecuteClone = () => {
    if (!cloneToSession.trim()) return
    onCloneSession({
      fromSession: cloneFromSession,
      toSession: cloneToSession.trim(),
      classes: classesToClone
    })
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academic Session End: Promotion & Structure Wizard"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200 gap-2">
          <button
            onClick={() => setModalTab('promote')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              modalTab === 'promote'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Promote Class to Next Grade</span>
          </button>
          <button
            onClick={() => setModalTab('clone')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              modalTab === 'clone'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Copy className="w-4 h-4" />
            <span>Clone Structure to New Session</span>
          </button>
        </div>

        {/* TAB 1: PROMOTE CLASS */}
        {modalTab === 'promote' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
              Promote an entire cohort of students from their current class to the next academic level upon session completion.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Class (Current)</label>
                <select
                  value={sourceClassId}
                  onChange={(e) => setSourceClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sections?.length || 1} sections)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Class (Promoted To)</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="">-- Select Target Class --</option>
                  {classes.filter(c => c.id !== sourceClassId).map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.sections?.length || 1} sections)</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Academic Session</label>
              <input
                type="text"
                value={targetSession}
                onChange={(e) => setTargetSession(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-medium"
                placeholder="2027-2028"
              />
            </div>

            {/* Preview Box */}
            {sourceClass && targetClass && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block">Promotion Preview & Summary:</span>
                <div className="flex items-center gap-3 text-xs">
                  <div className="p-2 bg-white rounded-lg border text-center flex-1">
                    <span className="text-[10px] text-slate-400 block">From Class</span>
                    <strong className="text-slate-900">{sourceClass.name}</strong>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="p-2 bg-white rounded-lg border text-center flex-1">
                    <span className="text-[10px] text-slate-400 block">Promoted Into</span>
                    <strong className="text-emerald-800">{targetClass.name}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-600 pt-1">
                  • Total <strong>{sourceStudents.length}</strong> enrolled student(s) will have their class updated to <strong>{targetClass.name}</strong> under session <strong>{targetSession}</strong>.
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!targetClass || sourceStudents.length === 0}
                onClick={handleExecutePromotion}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm disabled:opacity-50"
              >
                Confirm & Promote {sourceStudents.length} Students
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CLONE STRUCTURE */}
        {modalTab === 'clone' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              Copy all classes, sections, and subjects into a new academic session. <strong>No student enrollments are copied</strong>, giving you a fresh, clean schedule for the new year.
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Source Session</label>
                <input
                  type="text"
                  disabled
                  value={cloneFromSession}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-100 font-mono text-slate-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target New Session *</label>
                <input
                  type="text"
                  required
                  value={cloneToSession}
                  onChange={(e) => setCloneToSession(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-slate-800"
                  placeholder="2027-2028"
                />
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Classes to be Cloned ({classesToClone.length}):</span>
              <p className="text-[11px] text-slate-500">
                {classesToClone.length > 0 
                  ? classesToClone.map(c => c.name).join(', ') 
                  : 'No classes found in source session.'}
              </p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={classesToClone.length === 0 || !cloneToSession.trim()}
                onClick={handleExecuteClone}
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm disabled:opacity-50"
              >
                Clone {classesToClone.length} Classes to {cloneToSession}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default ClassPromotionModal
