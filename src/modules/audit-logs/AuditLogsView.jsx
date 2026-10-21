import React, { useState } from 'react'
import { ShieldCheck, Search, Filter, Clock, Download, CheckCircle, AlertTriangle, User } from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'

export const AuditLogsView = () => {
  const { auditLogs } = useAppData()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  const filtered = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.ip && log.ip.includes(searchTerm))
    const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleExportLogs = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      ['ID', 'Action', 'User', 'IP Address', 'Timestamp', 'Status'],
      ...auditLogs.map(l => [l.id, l.action, l.user, l.ip, l.timestamp, l.status])
    ].map(e => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Security & Audit Trail</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Real-time immutable activity stream, authentication attempts, and administrative security logs</p>
        </div>

        <button
          onClick={handleExportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, or IP address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-white"
          >
            <option value="ALL">All Events</option>
            <option value="Success">Success Only</option>
            <option value="Warning">Warning / Failed</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Action Performed</th>
                <th className="px-6 py-4">Operator / User</th>
                <th className="px-6 py-4">Origin IP</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 font-mono">
                    <td className="px-6 py-4 font-bold text-slate-800 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        <span>{l.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-sans">{l.user}</td>
                    <td className="px-6 py-4 text-slate-500">{l.ip || '192.168.1.1'}</td>
                    <td className="px-6 py-4 text-slate-400">{l.timestamp}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        l.status === 'Success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-sans">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No Security Events Logged</p>
                    <p className="text-xs text-slate-400 mt-1">System is healthy and secure. All new user activities are logged here automatically.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AuditLogsView
