import React, { useState, useEffect, useMemo } from 'react'
import {
  BarChart3,
  Users,
  GraduationCap,
  Percent,
  DollarSign,
  Download,
  Printer,
  Calendar,
  Search,
  Filter,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  Building,
  ArrowUpDown,
  FileText,
  X
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { AnalyticsService } from '../../../services/analyticsService'
import { DataService } from '../../../services/dataService'

const CrossInstituteAnalyticsView = () => {
  const [period, setPeriod] = useState('last30')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('studentCount')
  const [sortAsc, setSortAsc] = useState(false)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({
    title: 'Weekly Executive Performance Briefing',
    frequency: 'WEEKLY',
    format: 'PDF',
    recipients: 'governance@schoolms.com, registrar@schoolms.com'
  })
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadData()
  }, [period])

  const loadData = () => {
    setLoading(true)
    setTimeout(() => {
      const data = AnalyticsService.getCrossInstituteData(period)
      setAnalyticsData(data)
      setLoading(false)
    }, 150)
  }

  const handleExportCSV = () => {
    AnalyticsService.exportExecutiveReportCSV()
    showToast('Executive audit CSV report downloaded successfully.')
  }

  const handleSaveSchedule = async (e) => {
    e.preventDefault()
    if (!scheduleForm.title || !scheduleForm.recipients) return
    await AnalyticsService.saveScheduledReport(scheduleForm)
    setIsScheduleModalOpen(false)
    showToast(`Automated report schedule created for: ${scheduleForm.title}`)
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 4000)
  }

  const filteredAndSorted = useMemo(() => {
    if (!analyticsData?.comparisonList) return []

    let list = analyticsData.comparisonList.filter(inst => {
      const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.city.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'ALL' || inst.type.toUpperCase() === typeFilter.toUpperCase()
      return matchesSearch && matchesType
    })

    list.sort((a, b) => {
      let valA = a[sortField]
      let valB = b[sortField]
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA)
      }
      return sortAsc ? valA - valB : valB - valA
    })

    return list
  }, [analyticsData, searchTerm, typeFilter, sortField, sortAsc])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(false)
    }
  }

  if (loading || !analyticsData) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Aggregating cross-institute telemetry & audit metrics...</p>
        </div>
      </div>
    )
  }

  const { summary, topPerformers } = analyticsData

  return (
    <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-xs text-emerald-700 underline font-medium">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              <span>Multi-Campus Telemetry & Intelligence</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Cross-Institute Comparative Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Real-time multi-campus performance comparison, attendance recovery indexes, and cross-institute fee reconciliations.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-semibold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 active:scale-95"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print Briefing</span>
          </button>

          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#f5eeff] hover:bg-[#ede0fe] border border-purple-200/50 text-purple-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Clock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>Schedule Briefing</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Student Body"
          value={summary.totalStudents.toLocaleString()}
          badge="+12.4% vs last term"
          badgePositive={true}
          color="blue"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setSearchTerm(''); setTypeFilter('ALL'); }}
          onView={() => { setSearchTerm(''); setTypeFilter('ALL'); }}
          viewTooltip="View all student enrollment telemetry"
          onAdd={() => setIsScheduleModalOpen(true)}
          addTooltip="Schedule briefing report"
        />
        <StatCard
          icon={GraduationCap}
          title="Total Faculty & Staff"
          value={summary.totalTeachers.toLocaleString()}
          badge="Across all campuses"
          badgePositive={true}
          color="emerald"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setSearchTerm(''); setSortField('teacherCount'); setSortAsc(false); }}
          onView={() => { setSearchTerm(''); setSortField('teacherCount'); setSortAsc(false); }}
          viewTooltip="Sort campuses by faculty strength"
          onAdd={() => setIsPrintModalOpen(true)}
          addTooltip="Print executive faculty briefing"
        />
        <StatCard
          icon={Percent}
          title="Average Attendance Rate"
          value={`${summary.avgAttendance}%`}
          badge="Campus-wide daily mean"
          badgePositive={true}
          color="indigo"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setSearchTerm(''); setSortField('attendanceRate'); setSortAsc(false); }}
          onView={() => { setSearchTerm(''); setSortField('attendanceRate'); setSortAsc(false); }}
          viewTooltip="Sort campuses by attendance rate"
          onAdd={() => handleExportCSV()}
          addTooltip="Export attendance audit snapshot"
        />
        <StatCard
          icon={DollarSign}
          title="Fee Recovery Ratio"
          value={`${summary.avgFeeRecovery}%`}
          badge={`PKR ${(summary.totalCollectedPKR / 1000000).toFixed(1)}M collected`}
          badgePositive={true}
          color="amber"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setSearchTerm(''); setSortField('feeRecoveryRate'); setSortAsc(false); }}
          onView={() => { setSearchTerm(''); setSortField('feeRecoveryRate'); setSortAsc(false); }}
          viewTooltip="Sort campuses by fee recovery index"
          onAdd={() => handleExportCSV()}
          addTooltip="Export fee reconciliation audit snapshot"
        />
      </div>

      {/* Top Performers Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4.5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 block">Top Attendance Campus</span>
            <h4 className="text-sm font-bold text-slate-800 truncate">{topPerformers.topAttendance?.name}</h4>
            <span className="text-xs font-semibold text-amber-700">{topPerformers.topAttendance?.attendanceRate}% Average Attendance</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-4.5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">Highest Fee Recovery</span>
            <h4 className="text-sm font-bold text-slate-800 truncate">{topPerformers.topFeeRecovery?.name}</h4>
            <span className="text-xs font-semibold text-emerald-700">{topPerformers.topFeeRecovery?.feeRecoveryRate}% Dues Collected</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-white p-4.5 rounded-2xl border border-purple-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#f5eeff]0/20 text-purple-600 flex items-center justify-center shrink-0">
            <Building className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-800 block">Largest Student Population</span>
            <h4 className="text-sm font-bold text-slate-800 truncate">{topPerformers.largestEnrollment?.name}</h4>
            <span className="text-xs font-semibold text-purple-700">{topPerformers.largestEnrollment?.studentCount.toLocaleString()} Enrolled Students</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Period Selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-800 cursor-pointer"
            >
              <option value="last30">Last 30 Days</option>
              <option value="quarter">This Quarter (Q3)</option>
              <option value="annual">Annual Academic Year 2025-26</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'School', 'College', 'University'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === t ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search institute or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Comparative Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-800">Campus-by-Campus Comparative Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Showing {filteredAndSorted.length} affiliated campuses</p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            Sort by: <span className="font-semibold text-slate-800">{sortField}</span> ({sortAsc ? 'Asc' : 'Desc'})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1.5">
                    <span>Institute & Code</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-1.5">
                    <span>Type</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('studentCount')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Students</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('teacherCount')}>
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Faculty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Ratio</th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('attendanceRate')}>
                  <div className="flex items-center gap-1.5">
                    <span>Attendance Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('feeRecoveryRate')}>
                  <div className="flex items-center gap-1.5">
                    <span>Fee Recovery</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Collected (PKR)</th>
                <th className="py-3.5 px-4 text-center">Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAndSorted.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{inst.name}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{inst.code}</span>
                      <span>{inst.city}</span>
                      <span>• {inst.campusesCount} Campus(es)</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {inst.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium">{inst.studentCount.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-right font-medium">{inst.teacherCount}</td>
                  <td className="py-3.5 px-4 text-center font-mono text-xs">{inst.studentTeacherRatio}</td>
                  <td className="py-3.5 px-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span>{inst.attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inst.attendanceRate >= 90 ? 'bg-emerald-500' : inst.attendanceRate >= 80 ? 'bg-[#f5eeff]0' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, inst.attendanceRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="w-32">
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span>{inst.feeRecoveryRate}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            inst.feeRecoveryRate >= 90 ? 'bg-emerald-500' : inst.feeRecoveryRate >= 80 ? 'bg-indigo-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, inst.feeRecoveryRate)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                    ₨ {inst.totalCollectedPKR.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        inst.health === 'Excellent'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : inst.health === 'Good'
                          ? 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {inst.health}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Analytics Chart Comparisons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Bar Chart Representation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Percent className="w-4 h-4 text-purple-600" />
              Attendance Performance Distribution (%)
            </h4>
            <span className="text-xs text-slate-400">Target: ≥ 90%</span>
          </div>

          <div className="space-y-3 pt-2">
            {analyticsData.comparisonList.map((inst) => (
              <div key={inst.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{inst.name}</span>
                  <span className="font-semibold text-slate-900">{inst.attendanceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      inst.attendanceRate >= 90 ? 'bg-gradient-to-r from-blue-500 to-emerald-500' : 'bg-[#f5eeff]0'
                    }`}
                    style={{ width: `${inst.attendanceRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fee Recovery Representation */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Tuition Fee Recovery Ratios (%)
            </h4>
            <span className="text-xs text-slate-400">Target: ≥ 85%</span>
          </div>

          <div className="space-y-3 pt-2">
            {analyticsData.comparisonList.map((inst) => (
              <div key={inst.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{inst.name}</span>
                  <span className="font-semibold text-emerald-700">{inst.feeRecoveryRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      inst.feeRecoveryRate >= 90
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : inst.feeRecoveryRate >= 80
                        ? 'bg-emerald-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${inst.feeRecoveryRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PRINTABLE EXECUTIVE BRIEFING MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-800 text-sm sm:text-base">Printable Multi-Campus Executive Briefing</h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto flex-1 font-sans" id="printable-briefing">
              {/* Document Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-widest font-bold text-purple-700">Confidential Executive Intelligence</div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">Educational Institute Management System</h2>
                  <p className="text-xs text-slate-600 mt-1">Central Oversight & Cross-Institute Performance Briefing</p>
                </div>
                <div className="text-left sm:text-right text-xs text-slate-500 space-y-1">
                  <div>Date: <span className="font-semibold text-slate-800">{new Date().toLocaleDateString()}</span></div>
                  <div>Security Clearance: <span className="font-semibold text-slate-800">Super Administrator</span></div>
                  <div>Report Ref: <span className="font-mono text-slate-800 font-semibold">REF-EXECUTIVE-{Date.now().toString().slice(-6)}</span></div>
                </div>
              </div>

              {/* KPI Summary Block */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] text-center">
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Institutes</span>
                  <span className="text-lg font-bold text-slate-900">{summary.totalInstitutes}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Combined Student Body</span>
                  <span className="text-lg font-bold text-purple-700">{summary.totalStudents.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Avg Attendance Rate</span>
                  <span className="text-lg font-bold text-indigo-700">{summary.avgAttendance}%</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 uppercase font-semibold block">Fee Recovery</span>
                  <span className="text-lg font-bold text-emerald-700">{summary.avgFeeRecovery}%</span>
                </div>
              </div>

              {/* Comparative Audit Roster */}
              <div>
                <h4 className="text-xs uppercase tracking-wider font-bold text-slate-800 mb-2">Institutional Ledger & Recovery Summary</h4>
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-2 border-r border-slate-300">Institute</th>
                      <th className="p-2 border-r border-slate-300">Type</th>
                      <th className="p-2 text-right border-r border-slate-300">Students</th>
                      <th className="p-2 text-right border-r border-slate-300">Faculty</th>
                      <th className="p-2 text-center border-r border-slate-300">Attendance</th>
                      <th className="p-2 text-center border-r border-slate-300">Recovery %</th>
                      <th className="p-2 text-right">Deposited (PKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    {analyticsData.comparisonList.map((inst) => (
                      <tr key={inst.id}>
                        <td className="p-2 font-medium border-r border-slate-200">{inst.name} ({inst.code})</td>
                        <td className="p-2 border-r border-slate-200">{inst.type}</td>
                        <td className="p-2 text-right border-r border-slate-200">{inst.studentCount}</td>
                        <td className="p-2 text-right border-r border-slate-200">{inst.teacherCount}</td>
                        <td className="p-2 text-center font-semibold border-r border-slate-200">{inst.attendanceRate}%</td>
                        <td className="p-2 text-center font-semibold border-r border-slate-200">{inst.feeRecoveryRate}%</td>
                        <td className="p-2 text-right font-mono font-medium">₨ {inst.totalCollectedPKR.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Executive Sign-off Line */}
              <div className="pt-8 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Verified by Super Administrator Portal</p>
                  <p className="text-[11px] text-slate-400">Electronic audit authentication seal</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-slate-400 w-48 mb-1"></div>
                  <span className="text-[11px] text-slate-500 uppercase">Authorized Signature / Stamp</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print()
                  setIsPrintModalOpen(false)
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE AUTOMATED DELIVERY MODAL */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Automated Executive Briefing"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleSaveSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Briefing Title</label>
            <input
              type="text"
              required
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency</label>
              <select
                value={scheduleForm.frequency}
                onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              >
                <option value="DAILY">Daily (Morning 08:00 PKT)</option>
                <option value="WEEKLY">Weekly (Every Monday)</option>
                <option value="MONTHLY">Monthly (1st of Month)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
              <select
                value={scheduleForm.format}
                onChange={(e) => setScheduleForm({ ...scheduleForm, format: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              >
                <option value="PDF">PDF Executive Briefing</option>
                <option value="CSV">Raw CSV Multi-Sheet Data</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email Addresses (comma separated)</label>
            <input
              type="text"
              required
              value={scheduleForm.recipients}
              onChange={(e) => setScheduleForm({ ...scheduleForm, recipients: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="admin@schoolms.com, ceo@sms.edu"
            />
          </div>

          <div className="p-3 bg-[#f5eeff] border border-purple-200 rounded-xl text-xs text-purple-800 space-y-1">
            <span className="font-semibold block">Automated Dispatch Protocol</span>
            <p>Reports are generated in background cron and dispatched via the configured SMTP gateway in PKR values.</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default CrossInstituteAnalyticsView
