import React, { useState } from 'react'
import { 
  X, 
  Printer, 
  BookOpen, 
  Users, 
  Layers, 
  DoorOpen, 
  Clock, 
  Calendar, 
  FileText, 
  DollarSign, 
  ExternalLink,
  GraduationCap
} from 'lucide-react'
import Modal from '../../../components/common/Modal'

export const ClassProfileModal = ({
  isOpen,
  onClose,
  classItem,
  teachers = [],
  students = [],
  currentInstitute
}) => {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'slips'

  if (!isOpen || !classItem) return null

  const sections = Array.isArray(classItem.sections) ? classItem.sections : []
  const subjects = Array.isArray(classItem.subjects) ? classItem.subjects : []

  // Students in this class
  const classStudents = students.filter(s => {
    const matchInst = !s.instituteId || s.instituteId === currentInstitute?.id
    if (!matchInst) return false
    return (s.className || '').toLowerCase().trim() === classItem.name.toLowerCase().trim()
  })

  const totalCapacity = sections.reduce((sum, s) => sum + Number(s.capacity || 0), 0)
  const totalEnrolled = classStudents.length
  const seatsLeft = Math.max(0, totalCapacity - totalEnrolled)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Class Profile Dossier: ${classItem.name}`}
      maxWidth="max-w-3xl"
    >
      {/* Print Specific CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-desk-slips, #printable-desk-slips * {
            visibility: visible !important;
          }
          #printable-desk-slips {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="space-y-4">
        {/* Navigation tabs */}
        <div className="flex border-b border-slate-200 gap-2 no-print">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Class Overview & Structure
          </button>
          <button
            onClick={() => setActiveTab('slips')}
            className={`pb-2 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
              activeTab === 'slips'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Desk & Roll Number Slips ({classStudents.length})</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-slate-400 block text-[11px]">Enrolled Students</span>
                <strong className="text-base font-bold text-slate-900">{totalEnrolled}</strong>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-slate-400 block text-[11px]">Seating Capacity</span>
                <strong className="text-base font-bold text-slate-900">{totalCapacity}</strong>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-slate-400 block text-[11px]">Available Desks</span>
                <strong className="text-base font-bold text-emerald-700">{seatsLeft}</strong>
              </div>
            </div>

            {/* Sections Breakdown */}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                Configured Sections ({sections.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sections.map((sec, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{sec.name}</strong>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                        {sec.roomNo || 'Room 101'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between">
                      <span>In-Charge: <strong>{sec.classTeacherName || sec.classTeacher || 'Unassigned'}</strong></span>
                      <span className="font-mono">{sec.capacity || 40} Seats</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum Subjects */}
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                Academic Subjects & Scheme ({subjects.length})
              </span>
              {subjects.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
                      <tr>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5 text-center">Total Marks</th>
                        <th className="p-2.5 text-center">Passing Marks</th>
                        <th className="p-2.5 text-center">Periods/Wk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{sub.name}</td>
                          <td className="p-2.5 text-center font-mono">{sub.totalMarks || 100}</td>
                          <td className="p-2.5 text-center font-mono">{sub.passingMarks || 33}</td>
                          <td className="p-2.5 text-center font-mono">{sub.periodsPerWeek || 5}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-center">
                  No specific subjects configured for this class yet.
                </div>
              )}
            </div>

            {/* Quick module links */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Integrated Modules:</span>
              <div className="flex items-center gap-2">
                <a
                  href="#inst-timetable"
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timetable Schedule</span>
                </a>
                <a
                  href="#inst-fees"
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Fee Structure</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRINTABLE DESK & ROLL NUMBER SLIPS */}
        {activeTab === 'slips' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                Desk seating and examination slips for {classStudents.length} student(s) in {classItem.name}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print All Slips (PDF)</span>
              </button>
            </div>

            <div id="printable-desk-slips" className="grid grid-cols-2 gap-3">
              {classStudents.map((st, i) => (
                <div 
                  key={st.id || i}
                  className="p-3.5 border-2 border-dashed border-slate-300 rounded-xl bg-white space-y-1.5 text-xs select-none"
                >
                  <div className="flex items-center justify-between border-b pb-1 text-[10px] text-slate-400 font-mono">
                    <span>{currentInstitute?.name || 'CENTRAL SCHOOL'}</span>
                    <span>DESK #{i + 1}</span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-sm text-slate-900 block font-black">{st.name}</strong>
                      <span className="text-[11px] text-slate-500">Class: <strong>{classItem.name} ({st.section || 'A'})</strong></span>
                    </div>
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                      {st.rollNumber}
                    </span>
                  </div>
                  <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                    <span>Father: {st.fatherName || 'Guardian'}</span>
                    <span>Session: {classItem.academicSession || '2026-2027'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ClassProfileModal
