import React, { useRef, useState } from 'react'
import { X, Printer, Download, FileSpreadsheet, Calendar, Layers } from 'lucide-react'
import { ATTENDANCE_STATUSES, exportDailyAttendanceCSV, exportMonthlyAttendanceCSV } from './attendanceService'

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

  const [printTab, setPrintTab] = useState('daily') // 'daily' | 'monthly'
  const printAreaRef = useRef(null)

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
  const halfDayCount = students.filter(s => {
    const r = attendanceRecords[s.id]
    return (typeof r === 'string' ? r : r?.status) === 'half_day'
  }).length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Controls (Hidden during print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden">
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
                Monthly Register Matrix
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
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
        <div 
          ref={printAreaRef}
          className="p-8 overflow-y-auto max-h-[calc(92vh-75px)] bg-white text-slate-900 font-sans print:p-0 print:m-0 print:overflow-visible print:max-h-none print:w-full"
        >
          {/* Institutional Print Header */}
          <div className="border-b-2 border-slate-800 pb-4 mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight uppercase text-slate-900">
                {instName}
              </h1>
              <p className="text-xs text-slate-600">
                {instCampus} • Department of Academic Affairs & Records
              </p>
              <h2 className="text-sm font-bold text-emerald-800 mt-1 uppercase tracking-wider">
                {printTab === 'daily' ? 'Official Daily Attendance Register' : `Monthly Attendance Record (${yearMonthStr})`}
              </h2>
            </div>

            <div className="text-right text-xs space-y-0.5 font-mono">
              <div><strong>Session:</strong> {session}</div>
              <div><strong>Class:</strong> {className} ({sectionName})</div>
              {printTab === 'daily' && <div><strong>Date:</strong> {date}</div>}
              <div><strong>Generated:</strong> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* TAB 1: DAILY SHEET */}
          {printTab === 'daily' && (
            <div className="space-y-4">
              {/* Daily Summary Stats Pill */}
              <div className="grid grid-cols-5 gap-2 text-center text-xs border border-slate-200 rounded-xl p-2.5 bg-slate-50 font-mono">
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

              {/* Daily Student List Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 uppercase text-[10px] font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2 border-r border-slate-300 w-12 text-center">Sr</th>
                    <th className="p-2 border-r border-slate-300 w-24">Roll No</th>
                    <th className="p-2 border-r border-slate-300">Student Name</th>
                    <th className="p-2 border-r border-slate-300 w-24 text-center">Status</th>
                    <th className="p-2 border-r border-slate-300 w-28">Arrival / Reason</th>
                    <th className="p-2 border-r border-slate-300">Remarks</th>
                    <th className="p-2 w-28 text-center">Guardian Ph.</th>
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
            </div>
          )}

          {/* TAB 2: MONTHLY MATRIX */}
          {printTab === 'monthly' && monthlyData && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border border-slate-300 font-mono">
                  <thead className="bg-slate-100 uppercase font-bold border-b border-slate-300">
                    <tr>
                      <th className="p-1 border-r border-slate-300 w-16">Roll</th>
                      <th className="p-1 border-r border-slate-300 w-32 font-sans">Name</th>
                      {monthlyData.days.filter(d => !d.isSunday).map(d => (
                        <th key={d.dayNum} className="p-1 text-center border-r border-slate-300">
                          {d.dayNum}
                        </th>
                      ))}
                      <th className="p-1 border-r border-slate-300 text-center w-8">P</th>
                      <th className="p-1 border-r border-slate-300 text-center w-8">A</th>
                      <th className="p-1 border-r border-slate-300 text-center w-8">L</th>
                      <th className="p-1 border-r border-slate-300 text-center w-8">T</th>
                      <th className="p-1 text-center w-12">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {monthlyData.studentRows.map(row => (
                      <tr key={row.student.id}>
                        <td className="p-1 border-r border-slate-200 font-bold">{row.student.rollNumber}</td>
                        <td className="p-1 border-r border-slate-200 font-sans font-medium truncate max-w-[120px]">{row.student.name}</td>
                        {monthlyData.days.filter(d => !d.isSunday).map(d => {
                          const st = row.dailyStatus[d.dayNum]
                          const short = st ? st.short : '—'
                          const isA = short === 'A'
                          const isL = short === 'L'
                          return (
                            <td 
                              key={d.dayNum} 
                              className={`p-1 text-center border-r border-slate-200 ${
                                isA ? 'bg-rose-100 font-bold text-rose-800' : isL ? 'bg-amber-100 text-amber-800' : ''
                              }`}
                            >
                              {short}
                            </td>
                          )
                        })}
                        <td className="p-1 border-r border-slate-200 text-center text-emerald-700 font-bold">{row.presentCount}</td>
                        <td className="p-1 border-r border-slate-200 text-center text-rose-700 font-bold">{row.absentCount}</td>
                        <td className="p-1 border-r border-slate-200 text-center text-amber-700">{row.leaveCount}</td>
                        <td className="p-1 border-r border-slate-200 text-center text-purple-700">{row.lateCount}</td>
                        <td className={`p-1 text-center font-bold ${
                          row.isDefaulter ? 'text-rose-600 bg-rose-50' : 'text-slate-800'
                        }`}>
                          {row.attendancePercentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Institutional Signature Footer */}
          <div className="mt-12 pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center text-xs">
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="block text-slate-800">Class In-Charge Teacher</strong>
              <span className="text-[10px] text-slate-500">Signature & Date</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="block text-slate-800">Attendance Officer / Registrar</strong>
              <span className="text-[10px] text-slate-500">Verified By</span>
            </div>
            <div className="border-t border-slate-400 pt-1.5">
              <strong className="block text-slate-800">Campus Principal / Director</strong>
              <span className="text-[10px] text-slate-500">Official Stamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendancePrintModal
