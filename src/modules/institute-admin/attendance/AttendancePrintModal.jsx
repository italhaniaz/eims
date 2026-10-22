import React, { useRef, useState } from 'react'
import { X, Printer, Download, FileSpreadsheet, Calendar, Layers, Award } from 'lucide-react'
import {
  ATTENDANCE_STATUSES,
  exportDailyAttendanceCSV,
  exportMonthlyAttendanceCSV,
  formatDateDDMMYYYY
} from './attendanceService'

export const AttendancePrintModal = ({
  isOpen,
  onClose,
  currentInstitute,
  session,
  className,
  sectionName,
  date,
  yearMonthStr,
  students = [],
  attendanceRecords = {},
  monthlyData
}) => {
  if (!isOpen) return null

  const [printTab, setPrintTab] = useState('daily') // 'daily' | 'monthly' | 'certificate'
  const [selectedStudentForCert, setSelectedStudentForCert] = useState(students[0]?.id || '')

  const instName = currentInstitute?.name || 'Academic Campus'
  const instCampus = currentInstitute?.city || currentInstitute?.address || 'Main Campus'

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (printTab === 'daily') {
      exportDailyAttendanceCSV(date, className, sectionName, students, attendanceRecords)
    } else if (monthlyData) {
      exportMonthlyAttendanceCSV(session, className, sectionName, yearMonthStr, monthlyData)
    }
  }

  // Daily counters
  const presentCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'present'
  }).length
  const absentCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'absent'
  }).length
  const leaveCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'leave'
  }).length
  const lateCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'late'
  }).length
  const shortLeaveCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'short_leave'
  }).length

  // Certificate student data
  const certStudentRow = monthlyData?.studentRows?.find(r => r.student.id === selectedStudentForCert) || monthlyData?.studentRows?.[0]
  const certStudent = certStudentRow?.student || students.find(s => s.id === selectedStudentForCert) || students[0]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Controls (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-slate-200/80 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPrintTab('daily')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printTab === 'daily' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daily Roll Call Sheet
              </button>
              <button
                type="button"
                onClick={() => setPrintTab('monthly')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printTab === 'monthly' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Register
              </button>
              <button
                type="button"
                onClick={() => setPrintTab('certificate')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  printTab === 'certificate' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attendance Certificate
              </button>
            </div>

            {printTab === 'certificate' && (
              <select
                value={selectedStudentForCert}
                onChange={(e) => setSelectedStudentForCert(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none"
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            {printTab !== 'certificate' && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="p-8 overflow-y-auto max-h-[calc(92vh-75px)] bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible print:max-h-none print:w-full">
          {/* TAB 1: DAILY SHEET */}
          {printTab === 'daily' && (
            <div>
              {/* Institutional Print Header */}
              <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900">
                    {instName}
                  </h1>
                  <p className="text-xs text-slate-600">
                    {instCampus} • Department of Academic Records & Roll Call
                  </p>
                  <h2 className="text-sm font-bold text-emerald-800 mt-1 uppercase tracking-wider">
                    Official Daily Attendance Register
                  </h2>
                </div>

                <div className="text-right text-xs space-y-0.5 font-mono">
                  <div><strong>Session:</strong> {session}</div>
                  <div><strong>Class:</strong> {className} ({sectionName})</div>
                  <div><strong>Date:</strong> {formatDateDDMMYYYY(date)}</div>
                  <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              {/* Daily Summary Stats */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-mono mb-4">
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Present</span>
                  <strong className="text-emerald-700 text-sm font-bold">{presentCount}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Absent</span>
                  <strong className="text-rose-700 text-sm font-bold">{absentCount}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Leave</span>
                  <strong className="text-amber-700 text-sm font-bold">{leaveCount}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Late</span>
                  <strong className="text-purple-700 text-sm font-bold">{lateCount}</strong>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 uppercase">Total Enrolled</span>
                  <strong className="text-slate-800 text-sm font-bold">{students.length}</strong>
                </div>
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-12 text-center">Sr</th>
                    <th className="p-2 border-r border-slate-300 w-24">Roll No</th>
                    <th className="p-2 border-r border-slate-300">Student Name</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Status</th>
                    <th className="p-2 border-r border-slate-300 w-28">Arrival / Reason</th>
                    <th className="p-2 border-r border-slate-300">Remarks</th>
                    <th className="p-2 w-28 text-center">Guardian Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.map((std, idx) => {
                    const item = attendanceRecords[std.id]
                    const status = typeof item === 'string' ? item : (item?.status || 'present')
                    const reason = item?.reason || ''
                    const remarks = item?.remarks || ''
                    const arrivalTime = item?.arrivalTime || ''
                    const statusCfg = ATTENDANCE_STATUSES[status] || ATTENDANCE_STATUSES.present

                    return (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-2 border-r border-slate-200 text-center font-mono text-[11px]">{idx + 1}</td>
                        <td className="p-2 border-r border-slate-200 font-mono font-bold text-[11px]">{std.rollNumber}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{std.name}</td>
                        <td className="p-2 border-r border-slate-200 text-center">
                          <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${statusCfg.badgeClass}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[11px] text-slate-600">
                          {status === 'late' && arrivalTime ? `Arrived ${arrivalTime}` : reason || '—'}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-[11px] text-slate-500 italic">
                          {remarks || '—'}
                        </td>
                        <td className="p-2 text-center font-mono text-[10px] text-slate-600">
                          {std.guardianPhone || std.phone || '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Signature Block */}
              <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
                <div className="border-t border-slate-400 pt-1.5">
                  <strong className="block text-slate-800">Class In-Charge Teacher</strong>
                  <span className="text-[10px] text-slate-500">Signature</span>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <strong className="block text-slate-800">Attendance Officer</strong>
                  <span className="text-[10px] text-slate-500">Verified By</span>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <strong className="block text-slate-800">Campus Principal</strong>
                  <span className="text-[10px] text-slate-500">Official Stamp</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MONTHLY MATRIX */}
          {printTab === 'monthly' && monthlyData && (
            <div>
              <div className="border-b-2 border-slate-800 pb-3 mb-3 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">{instName}</h1>
                  <h2 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                    Monthly Student Attendance Matrix • {yearMonthStr}
                  </h2>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <span>Class: {className} ({sectionName}) • Session: {session}</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[9px] border border-slate-300 font-mono">
                  <thead className="bg-slate-100 uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-1 border-r border-slate-300 w-12">Roll</th>
                      <th className="p-1 border-r border-slate-300 w-28 font-sans">Name</th>
                      {monthlyData.days.filter(d => d.isWorking).map(d => (
                        <th key={d.dayNum} className="p-0.5 text-center border-r border-slate-300">
                          {d.dayNum}
                        </th>
                      ))}
                      <th className="p-1 border-r border-slate-300 text-center w-6">P</th>
                      <th className="p-1 border-r border-slate-300 text-center w-6">A</th>
                      <th className="p-1 border-r border-slate-300 text-center w-6">L</th>
                      <th className="p-1 border-r border-slate-300 text-center w-6">T</th>
                      <th className="p-1 text-center w-10 font-bold">Att %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {monthlyData.studentRows.map(row => (
                      <tr key={row.student.id}>
                        <td className="p-0.5 border-r border-slate-200 font-bold">{row.student.rollNumber}</td>
                        <td className="p-0.5 border-r border-slate-200 font-sans font-medium truncate max-w-[100px]">{row.student.name}</td>
                        {monthlyData.days.filter(d => d.isWorking).map(d => {
                          const st = row.dailyStatus[d.dayNum]
                          const short = st ? st.short : '—'
                          return (
                            <td key={d.dayNum} className="p-0.5 text-center border-r border-slate-200">
                              {short}
                            </td>
                          )
                        })}
                        <td className="p-0.5 border-r border-slate-200 text-center font-bold text-emerald-700">{row.presentCount}</td>
                        <td className="p-0.5 border-r border-slate-200 text-center font-bold text-rose-700">{row.absentCount}</td>
                        <td className="p-0.5 border-r border-slate-200 text-center text-amber-700">{row.leaveCount}</td>
                        <td className="p-0.5 border-r border-slate-200 text-center text-purple-700">{row.lateCount}</td>
                        <td className="p-0.5 text-center font-bold font-sans">{row.attendancePercentage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 gap-6 text-center text-xs">
                <div className="border-t border-slate-400 pt-1.5">
                  <strong className="block text-slate-800">Class Teacher Signature</strong>
                </div>
                <div className="border-t border-slate-400 pt-1.5">
                  <strong className="block text-slate-800">Principal Signature & Stamp</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OFFICIAL ATTENDANCE CERTIFICATE */}
          {printTab === 'certificate' && certStudent && (
            <div className="border-4 border-double border-emerald-800 p-8 rounded-2xl bg-white text-center space-y-6">
              <div className="space-y-1">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Award className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold uppercase tracking-widest text-slate-900 mt-2">
                  {instName}
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                  {instCampus} • Department of Academic Affairs
                </p>
                <div className="h-0.5 w-32 bg-emerald-700 mx-auto mt-2" />
                <h2 className="text-base font-bold text-emerald-900 uppercase tracking-wider pt-2">
                  Certificate of Attendance & Regularity
                </h2>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto pt-2">
                This is to officially certify that
              </p>

              <div className="py-2">
                <h3 className="text-xl font-bold text-slate-900 underline underline-offset-4 decoration-emerald-600">
                  {certStudent.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Roll Number: <strong>{certStudent.rollNumber}</strong> • Class: <strong>{className} ({sectionName})</strong>
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed max-w-xl mx-auto">
                has maintained an overall attendance regularity of{' '}
                <strong className="text-emerald-800 text-sm font-bold">
                  {certStudentRow ? `${certStudentRow.attendancePercentage}%` : '100%'}
                </strong>{' '}
                during the academic session <strong>{session}</strong> (Month of {yearMonthStr}), having attended{' '}
                <strong>{certStudentRow?.presentCount || 0}</strong> days out of{' '}
                <strong>{monthlyData?.totalWorkingDays || 26}</strong> total evaluated instructional working days.
              </p>

              <div className="pt-10 grid grid-cols-2 gap-12 text-xs">
                <div className="border-t border-slate-400 pt-2 text-center">
                  <span className="font-bold text-slate-800 block">Class Teacher / In-Charge</span>
                  <span className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString()}</span>
                </div>
                <div className="border-t border-slate-400 pt-2 text-center">
                  <span className="font-bold text-slate-800 block">Head of Institution / Principal</span>
                  <span className="text-[10px] text-slate-400">Official Institutional Seal</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AttendancePrintModal
