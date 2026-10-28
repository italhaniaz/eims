import React, { useState, useMemo } from 'react'
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Clock, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  User,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Activity,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export const AuditLogsView = () => {
  const { auditLogs = [], refreshData } = useAppData()
  const { toast } = useToast()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Sorting state
  const [sortField, setSortField] = useState('timestamp')
  const [sortDirection, setSortDirection] = useState('desc')

  const filteredLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const s = searchTerm.toLowerCase()
      const matchesSearch = 
        (log.action || '').toLowerCase().includes(s) ||
        (log.user || '').toLowerCase().includes(s) ||
        (log.ip && log.ip.includes(searchTerm))
      const matchesStatus = filterStatus === 'ALL' || log.status === filterStatus
      return matchesSearch && matchesStatus
    })
  }, [auditLogs, searchTerm, filterStatus])

  const sortedLogs = useMemo(() => {
    return [...filteredLogs].sort((a, b) => {
      let valA = a[sortField] || ''
      let valB = b[sortField] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredLogs, sortField, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedLogs.length / pageSize))
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return sortedLogs.slice(start, start + pageSize)
  }, [sortedLogs, currentPage, pageSize])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleExportLogs = () => {
    const csvContent = 'data:text/csv;charset=utf-8,' + [
      ['ID', 'Action Performed', 'Operator / User', 'Origin IP', 'Timestamp', 'Status'],
      ...sortedLogs.map(l => [
        `"${l.id}"`, 
        `"${(l.action || '').replace(/"/g, '""')}"`, 
        `"${l.user || ''}"`, 
        `"${l.ip || '192.168.1.1'}"`, 
        `"${l.timestamp || ''}"`, 
        `"${l.status || 'Success'}"`
      ])
    ].map(e => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Security_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Security audit trail exported as CSV!')
  }

  const warningCount = useMemo(() => {
    return auditLogs.filter(l => l.status === 'Warning' || l.status === 'Failed').length
  }, [auditLogs])

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Compliance & Immutable Event Stream</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            System Security & Audit Trail
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time immutable activity stream, authentication attempts, and administrative security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={() => {
              refreshData()
              toast.info('Audit trail refreshed!')
            }}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer whitespace-nowrap shrink-0"
            title="Refresh stream"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportLogs}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* Live Security Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Total Recorded Events</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{auditLogs.length}</div>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" /> Live stream active
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#f5eeff] text-purple-600 flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Security Incidents / Warnings</span>
            <div className="text-2xl font-black text-slate-900 mt-0.5">{warningCount}</div>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              {warningCount === 0 ? 'No active threats detected' : 'Under surveillance'}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warningCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">Most Recent Event</span>
            <div className="text-xs font-bold text-slate-800 truncate max-w-[200px] mt-1">
              {auditLogs[0]?.action || 'System Normal'}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
              {auditLogs[0]?.timestamp || '—'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, user, or IP address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter:</span>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none bg-white text-slate-700 font-medium"
          >
            <option value="ALL">All Events ({auditLogs.length})</option>
            <option value="Success">Success Events Only</option>
            <option value="Warning">Warning / Failed Events Only</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b">
              <tr>
                <th 
                  onClick={() => handleSort('action')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Action Performed</span>
                    {sortField === 'action' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('user')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Operator / User</span>
                    {sortField === 'user' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4">Origin IP</th>
                <th 
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-4 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    {sortField === 'timestamp' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-purple-600" /> : <ArrowDown className="w-3.5 h-3.5 text-purple-600" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-slate-300" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/70 font-mono transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800 font-sans">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${l.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                        <span>{l.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-sans">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{l.user || 'System Agent'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{l.ip || '192.168.1.1'}</td>
                    <td className="px-6 py-4 text-slate-400">{l.timestamp}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        l.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {l.status === 'Success' ? <CheckCircle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-sans">
                    <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No Security Events Matching Criteria</p>
                    <p className="text-xs text-slate-400 mt-1">Adjust search filter or perform operations across the portal.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {sortedLogs.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
            <div>
              Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, sortedLogs.length)}</strong> of <strong>{sortedLogs.length}</strong> events
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              
              <span className="font-semibold px-2">Page {currentPage} of {totalPages}</span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuditLogsView