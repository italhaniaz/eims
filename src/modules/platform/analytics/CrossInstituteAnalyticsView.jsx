import React, { useState, useEffect, useMemo, useRef } from 'react'
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
  CheckCircle2,
  Clock,
  Send,
  Building,
  ArrowUpDown,
  FileText,
  X,
  ChevronDown,
  Sliders,
  Columns
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { AnalyticsService } from '../../../services/analyticsService'
import { DataService } from '../../../services/dataService'
import { useAppData } from '../../../context/AppDataContext'

const CrossInstituteAnalyticsView = () => {
  const { institutes = [], students = [], teachers = [], fees = [] } = useAppData()
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
  const [isBreakdownModalOpen, setIsBreakdownModalOpen] = useState(false)
  const [activeMetricTab, setActiveMetricTab] = useState('students') // 'students', 'faculty', 'attendance', 'fees'
  const [breakdownSearch, setBreakdownSearch] = useState('')

  const openBreakdownModal = (tab = 'students') => {
    setActiveMetricTab(tab)
    setBreakdownSearch('')
    setIsBreakdownModalOpen(true)
  }
  const [scheduleForm, setScheduleForm] = useState({
    title: 'Weekly Executive Performance Briefing',
    frequency: 'WEEKLY',
    format: 'PDF',
    recipients: 'governance@schoolms.com, registrar@schoolms.com'
  })
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    loadData()
  }, [period, institutes, students, teachers, fees])

  const loadData = () => {
    setLoading(true)
    setTimeout(() => {
      const data = AnalyticsService.getCrossInstituteData(period, { institutes, students, teachers, fees })
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

  // --- Analytics Filter Popover State with Checkboxes ---
  const [showAnalyticsFilterPopover, setShowAnalyticsFilterPopover] = useState(false)
  const analyticsFilterPopoverRef = useRef(null)
  const [selectedTypeFilters, setSelectedTypeFilters] = useState(['SCHOOL', 'COLLEGE', 'UNIVERSITY'])
  const [selectedHealthFilters, setSelectedHealthFilters] = useState(['high', 'standard', 'attention'])

  // Column Visibility Checkboxes (Enable / Disable Columns in Matrix)
  const [visibleColumns, setVisibleColumns] = useState({
    students: true,
    faculty: true,
    ratio: true,
    attendance: true,
    fees: true,
    collected: true,
    health: true
  })

  // Multi-select Row Checkboxes State
  const [selectedAnalyticsIds, setSelectedAnalyticsIds] = useState([])

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (analyticsFilterPopoverRef.current && !analyticsFilterPopoverRef.current.contains(event.target)) {
        setShowAnalyticsFilterPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredAndSorted = useMemo(() => {
    if (!analyticsData?.comparisonList) return []

    let list = analyticsData.comparisonList.filter(inst => {
      const matchesSearch = !searchTerm ||
        inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inst.city.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesLegacyType = typeFilter === 'ALL' || inst.type.toUpperCase() === typeFilter.toUpperCase()
      const matchesTypeCheckboxes = selectedTypeFilters.includes(inst.type.toUpperCase())

      // Health thresholds: high (>=85%), attention (<70%), standard (in-between)
      const isHigh = inst.attendanceRate >= 85
      const isAttention = inst.attendanceRate < 70
      const isStandard = !isHigh && !isAttention

      const matchesHealth = (
        (isHigh && selectedHealthFilters.includes('high')) ||
        (isStandard && selectedHealthFilters.includes('standard')) ||
        (isAttention && selectedHealthFilters.includes('attention'))
      )

      return matchesSearch && matchesLegacyType && matchesTypeCheckboxes && matchesHealth
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
  }, [analyticsData, searchTerm, typeFilter, selectedTypeFilters, selectedHealthFilters, sortField, sortAsc])

  // Active filter count for badge
  const activeAnalyticsFiltersCount = (3 - selectedTypeFilters.length) + (3 - selectedHealthFilters.length)

  const handleToggleTypeFilter = (t) => {
    setSelectedTypeFilters(prev => 
      prev.includes(t) ? (prev.length > 1 ? prev.filter(item => item !== t) : prev) : [...prev, t]
    )
  }

  const handleToggleHealthFilter = (h) => {
    setSelectedHealthFilters(prev => 
      prev.includes(h) ? (prev.length > 1 ? prev.filter(item => item !== h) : prev) : [...prev, h]
    )
  }

  const handleToggleColumn = (colKey) => {
    setVisibleColumns(prev => ({ ...prev, [colKey]: !prev[colKey] }))
  }

  const handleResetAnalyticsFilters = () => {
    setSelectedTypeFilters(['SCHOOL', 'COLLEGE', 'UNIVERSITY'])
    setSelectedHealthFilters(['high', 'standard', 'attention'])
    setVisibleColumns({
      students: true,
      faculty: true,
      ratio: true,
      attendance: true,
      fees: true,
      collected: true,
      health: true
    })
    setTypeFilter('ALL')
    setSearchTerm('')
  }

  // Row selection helpers
  const isAllAnalyticsSelected = filteredAndSorted.length > 0 && filteredAndSorted.every(i => selectedAnalyticsIds.includes(i.id))

  const handleSelectAllAnalytics = () => {
    if (isAllAnalyticsSelected) {
      setSelectedAnalyticsIds([])
    } else {
      setSelectedAnalyticsIds(filteredAndSorted.map(i => i.id))
    }
  }

  const handleToggleSelectAnalytics = (id) => {
    setSelectedAnalyticsIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Export selected rows to CSV
  const handleExportSelectedCSV = () => {
    if (selectedAnalyticsIds.length === 0) return
    const selectedRows = filteredAndSorted.filter(i => selectedAnalyticsIds.includes(i.id))
    const headers = ['Institute,Code,City,Type,Students,Faculty,Ratio,AttendanceRate,FeeRecoveryRate,PKRCollected']
    const rows = selectedRows.map(r => 
      `"${r.name}","${r.code}","${r.city}","${r.type}",${r.studentCount},${r.teacherCount},"${r.studentTeacherRatio}","${r.attendanceRate}%","${r.feeRecoveryRate}%",${r.feeCollectedPKR || 0}`
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `eims_campus_analytics_selected_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast(`Exported analytics snapshot for ${selectedAnalyticsIds.length} selected campuses!`)
  }

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
          onShowAll={() => openBreakdownModal('students')}
          onView={() => openBreakdownModal('students')}
          viewTooltip="View all institutes student breakdown"
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
          onShowAll={() => openBreakdownModal('faculty')}
          onView={() => openBreakdownModal('faculty')}
          viewTooltip="View all institutes faculty breakdown"
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
          onShowAll={() => openBreakdownModal('attendance')}
          onView={() => openBreakdownModal('attendance')}
          viewTooltip="View all institutes attendance breakdown"
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
          onShowAll={() => openBreakdownModal('fees')}
          onView={() => openBreakdownModal('fees')}
          viewTooltip="View all institutes fee recovery breakdown"
          onAdd={() => handleExportCSV()}
          addTooltip="Export fee reconciliation audit snapshot"
        />
      </div>


      {/* Filter & Search Bar with Interactive Checkbox Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
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

          {/* Quick Type Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'School', 'College', 'University'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  typeFilter === t ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t === 'ALL' ? 'All Types' : t}
              </button>
            ))}
          </div>

          {/* Interactive Filters Button with Popover */}
          <div className="relative" ref={analyticsFilterPopoverRef}>
            <button
              type="button"
              onClick={() => setShowAnalyticsFilterPopover(!showAnalyticsFilterPopover)}
              className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                activeAnalyticsFiltersCount > 0 || showAnalyticsFilterPopover
                  ? 'bg-[#f5eeff] text-purple-700 border-purple-300 ring-2 ring-purple-500/10'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Filters</span>
              {activeAnalyticsFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                  {activeAnalyticsFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAnalyticsFilterPopover ? 'rotate-180 text-purple-600' : 'text-slate-400'}`} />
            </button>

            {/* Filter Popover Content */}
            {showAnalyticsFilterPopover && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-slate-900">Analytics & Matrix Filters</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleResetAnalyticsFilters}
                    className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                  >
                    Reset All
                  </button>
                </div>

                <div className="py-3 space-y-4 max-h-[380px] overflow-y-auto">
                  {/* Section 1: Campus Type Checkboxes */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Campus Types (Enable / Disable)
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { key: 'SCHOOL', label: '🏫 School Campuses (Primary & Matric)' },
                        { key: 'COLLEGE', label: '🏛️ College Campuses (Inter & HSSC)' },
                        { key: 'UNIVERSITY', label: '🎓 University Campuses (BS Degrees)' }
                      ].map(item => {
                        const checked = selectedTypeFilters.includes(item.key)
                        return (
                          <label
                            key={item.key}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              checked
                                ? 'bg-purple-50/50 border-purple-200 text-slate-900 font-semibold'
                                : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleTypeFilter(item.key)}
                              className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                            />
                            <span>{item.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Section 2: Health Status Checkboxes */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                      Performance & Health Thresholds
                    </label>
                    <div className="space-y-1.5">
                      {[
                        { key: 'high', label: 'High Performing (Attendance ≥85%)', color: 'bg-emerald-500' },
                        { key: 'standard', label: 'Standard Range (Attendance 70-84%)', color: 'bg-purple-500' },
                        { key: 'attention', label: 'Needs Attention (Attendance <70%)', color: 'bg-rose-500' }
                      ].map(item => {
                        const checked = selectedHealthFilters.includes(item.key)
                        return (
                          <label
                            key={item.key}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                              checked
                                ? 'bg-purple-50/50 border-purple-200 text-slate-900 font-semibold'
                                : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleHealthFilter(item.key)}
                              className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                            />
                            <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                            <span>{item.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Section 3: Metric Columns Visibility */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Visible Columns (Show / Hide)
                      </label>
                      <Columns className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      {[
                        { key: 'students', label: 'Students' },
                        { key: 'faculty', label: 'Faculty' },
                        { key: 'ratio', label: 'Ratio' },
                        { key: 'attendance', label: 'Attendance' },
                        { key: 'fees', label: 'Fee Recovery' },
                        { key: 'collected', label: 'PKR Collected' },
                        { key: 'health', label: 'Health' }
                      ].map(col => (
                        <label
                          key={col.key}
                          className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key]}
                            onChange={() => handleToggleColumn(col.key)}
                            className="w-3.5 h-3.5 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    Showing {filteredAndSorted.length} campuses
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAnalyticsFilterPopover(false)}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search campus or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Bulk Action Bar for Selected Campuses */}
      {selectedAnalyticsIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 max-w-[95vw] overflow-x-auto">
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white whitespace-nowrap">
              {selectedAnalyticsIds.length} Campuses Selected
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportSelectedCSV}
              className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedAnalyticsIds([])}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllAnalyticsSelected}
                    onChange={handleSelectAllAnalytics}
                    aria-label="Select all campuses"
                    className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                  />
                </th>
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
                {visibleColumns.students && (
                  <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('studentCount')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Students</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.faculty && (
                  <th className="py-3.5 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('teacherCount')}>
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Faculty</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.ratio && (
                  <th className="py-3.5 px-4 text-center">Ratio</th>
                )}
                {visibleColumns.attendance && (
                  <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('attendanceRate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Attendance Rate</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.fees && (
                  <th className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('feeRecoveryRate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Fee Recovery</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                )}
                {visibleColumns.collected && (
                  <th className="py-3.5 px-4 text-right">Collected (PKR)</th>
                )}
                {visibleColumns.health && (
                  <th className="py-3.5 px-4 text-center">Health</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((inst) => {
                  const isSelected = selectedAnalyticsIds.includes(inst.id)
                  return (
                <tr key={inst.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-purple-50/40' : ''}`}>
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectAnalytics(inst.id)}
                      aria-label={`Select ${inst.name}`}
                      className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                    />
                  </td>
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
                  {visibleColumns.students && (
                    <td className="py-3.5 px-4 text-right font-medium">{inst.studentCount.toLocaleString()}</td>
                  )}
                  {visibleColumns.faculty && (
                    <td className="py-3.5 px-4 text-right font-medium">{inst.teacherCount}</td>
                  )}
                  {visibleColumns.ratio && (
                    <td className="py-3.5 px-4 text-center font-mono text-xs">{inst.studentTeacherRatio}</td>
                  )}
                  {visibleColumns.attendance && (
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
                  )}
                  {visibleColumns.fees && (
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
                  )}
                  {visibleColumns.collected && (
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-800">
                      Rs. {inst.totalCollectedPKR.toLocaleString()}
                    </td>
                  )}
                  {visibleColumns.health && (
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          inst.health === 'Excellent'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inst.health === 'Good'
                            ? 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                            : inst.health === 'New Campus'
                            ? 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inst.health}
                      </span>
                    </td>
                  )}
                </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-400">
                    <Building className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No campuses reporting live telemetry</p>
                    <p className="text-xs text-slate-400 mt-0.5">Campuses will appear here once registered on the platform.</p>
                  </td>
                </tr>
              )}
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
            {analyticsData.comparisonList.length > 0 ? (
              analyticsData.comparisonList.map((inst) => (
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
            ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No attendance telemetry recorded yet.
              </div>
            )}
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
            {analyticsData.comparisonList.length > 0 ? (
              analyticsData.comparisonList.map((inst) => (
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
            ))
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No tuition fee recovery telemetry recorded yet.
              </div>
            )}
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
                        <td className="p-2 text-right font-mono font-medium">Rs. {inst.totalCollectedPKR.toLocaleString()}</td>
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

      {/* ALL INSTITUTES TELEMETRY BREAKDOWN MODAL */}
      <Modal
        isOpen={isBreakdownModalOpen}
        onClose={() => setIsBreakdownModalOpen(false)}
        title="Cross-Institute Multi-Campus Telemetry Breakdown"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-5">
          {/* Header Metric Tabs Switcher */}
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveMetricTab('students')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMetricTab === 'students'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Student Body ({summary.totalStudents.toLocaleString()})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetricTab('faculty')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMetricTab === 'faculty'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Faculty & Staff ({summary.totalTeachers.toLocaleString()})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetricTab('attendance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMetricTab === 'attendance'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <Percent className="w-4 h-4" />
              <span>Attendance Rate ({summary.avgAttendance}%)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMetricTab('fees')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeMetricTab === 'fees'
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-500/20'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Fee Recovery ({summary.avgFeeRecovery}%)</span>
            </button>
          </div>

          {/* Metric Overview Summary Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {activeMetricTab === 'students' && (
              <>
                <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Total Enrolled</span>
                  <p className="text-lg font-extrabold text-blue-900 mt-0.5">{summary.totalStudents.toLocaleString()}</p>
                  <span className="text-[11px] text-blue-600 font-medium">+12.4% vs last term</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Campuses</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{analyticsData.comparisonList.length}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Reporting Live Data</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Per Campus</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{Math.round(summary.totalStudents / Math.max(1, analyticsData.comparisonList.length))}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Students / Institution</span>
                </div>
                <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Largest Campus</span>
                  <p className="text-sm font-extrabold text-purple-900 mt-0.5 truncate">{topPerformers.largestEnrollment?.name || '—'}</p>
                  <span className="text-[11px] text-purple-700 font-semibold">{topPerformers.largestEnrollment?.studentCount || 0} Students</span>
                </div>
              </>
            )}

            {activeMetricTab === 'faculty' && (
              <>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Faculty</span>
                  <p className="text-lg font-extrabold text-emerald-900 mt-0.5">{summary.totalTeachers.toLocaleString()}</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Across all institutions</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Avg Per Campus</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{Math.round(summary.totalTeachers / Math.max(1, analyticsData.comparisonList.length))}</p>
                  <span className="text-[11px] text-slate-500 font-medium">Teachers / Institution</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Mean Ratio</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">{Math.round(summary.totalStudents / Math.max(1, summary.totalTeachers))}:1</p>
                  <span className="text-[11px] text-slate-500 font-medium">Student to Teacher</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Top Faculty Hub</span>
                  <p className="text-sm font-extrabold text-emerald-900 mt-0.5 truncate">{analyticsData.comparisonList[0]?.name || '—'}</p>
                  <span className="text-[11px] text-emerald-700 font-semibold">{analyticsData.comparisonList[0]?.teacherCount || 0} Instructors</span>
                </div>
              </>
            )}

            {activeMetricTab === 'attendance' && (
              <>
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Mean Attendance</span>
                  <p className="text-lg font-extrabold text-indigo-900 mt-0.5">{summary.avgAttendance}%</p>
                  <span className="text-[11px] text-indigo-600 font-medium">Campus-wide daily average</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Highest Attendance</span>
                  <p className="text-sm font-extrabold text-emerald-900 mt-0.5 truncate">{topPerformers.topAttendance?.name || '—'}</p>
                  <span className="text-[11px] text-emerald-700 font-semibold">{topPerformers.topAttendance ? `${topPerformers.topAttendance.attendanceRate}% Present` : '—'}</span>
                </div>
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Attention Campus</span>
                  <p className="text-sm font-extrabold text-amber-900 mt-0.5 truncate">{topPerformers.lowestAttendance?.name || '—'}</p>
                  <span className="text-[11px] text-amber-700 font-semibold">{topPerformers.lowestAttendance ? `${topPerformers.lowestAttendance.attendanceRate}% Present` : '—'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Active Monitoring</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">100%</p>
                  <span className="text-[11px] text-slate-500 font-medium">Biometric & Portal Synced</span>
                </div>
              </>
            )}

            {activeMetricTab === 'fees' && (
              <>
                <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Recovery Ratio</span>
                  <p className="text-lg font-extrabold text-amber-900 mt-0.5">{summary.avgFeeRecovery}%</p>
                  <span className="text-[11px] text-amber-600 font-medium">Overall Dues Cleared</span>
                </div>
                <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Collected</span>
                  <p className="text-lg font-extrabold text-emerald-900 mt-0.5">PKR {(summary.totalCollectedPKR / 1000000).toFixed(1)}M</p>
                  <span className="text-[11px] text-emerald-600 font-medium">Direct Bank & JazzCash</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Invoiced</span>
                  <p className="text-lg font-extrabold text-slate-900 mt-0.5">PKR {(summary.totalBilledPKR / 1000000).toFixed(1)}M</p>
                  <span className="text-[11px] text-slate-500 font-medium">Challans Generated</span>
                </div>
                <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Outstanding</span>
                  <p className="text-lg font-extrabold text-rose-900 mt-0.5">PKR {((summary.totalBilledPKR - summary.totalCollectedPKR) / 1000000).toFixed(1)}M</p>
                  <span className="text-[11px] text-rose-600 font-medium">Pending Dues</span>
                </div>
              </>
            )}
          </div>

          {/* Search bar inside modal */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter institutions by name, code or city..."
              value={breakdownSearch}
              onChange={(e) => setBreakdownSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
            />
          </div>

          {/* Detailed Campus Breakdown Cards / Table */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-2xs">
            <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
              {analyticsData.comparisonList
                .filter(inst => {
                  if (!breakdownSearch) return true
                  const q = breakdownSearch.toLowerCase()
                  return inst.name.toLowerCase().includes(q) || inst.code.toLowerCase().includes(q) || inst.city.toLowerCase().includes(q)
                })
                .map((inst, idx) => {
                  const studentShare = Math.round((inst.studentCount / Math.max(1, summary.totalStudents)) * 1000) / 10
                  const colors = ['from-purple-500 to-indigo-500', 'from-blue-500 to-cyan-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500']
                  const colorGradient = colors[idx % colors.length]

                  return (
                    <div key={inst.id} className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Left: Campus Avatar & Identity */}
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${colorGradient} text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0`}>
                          {inst.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{inst.name}</h4>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                              {inst.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {inst.city} • <span className="font-semibold text-purple-600">{inst.type}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right: Metric Specific Telemetry Display */}
                      <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                        {activeMetricTab === 'students' && (
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              {inst.studentCount.toLocaleString()} <span className="text-xs font-semibold text-slate-500">Students</span>
                            </span>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <div className="w-20 sm:w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(100, studentShare * 2)}%` }}></div>
                              </div>
                              <span className="text-[11px] font-bold text-blue-600">{studentShare}% share</span>
                            </div>
                          </div>
                        )}

                        {activeMetricTab === 'faculty' && (
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              {inst.teacherCount} <span className="text-xs font-semibold text-slate-500">Faculty</span>
                            </span>
                            <p className="text-[11px] font-medium text-emerald-600 mt-0.5">
                              Ratio {inst.studentTeacherRatio}
                            </p>
                          </div>
                        )}

                        {activeMetricTab === 'attendance' && (
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              {inst.attendanceRate}%
                            </span>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <div className="w-20 sm:w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className={`h-1.5 rounded-full ${inst.attendanceRate >= 90 ? 'bg-emerald-500' : inst.attendanceRate >= 85 ? 'bg-blue-500' : 'bg-amber-500'}`} 
                                  style={{ width: `${inst.attendanceRate}%` }}
                                ></div>
                              </div>
                              <span className={`text-[11px] font-bold ${inst.attendanceRate >= 90 ? 'text-emerald-600' : 'text-slate-600'}`}>
                                {inst.attendanceRate >= 90 ? 'High' : 'Normal'}
                              </span>
                            </div>
                          </div>
                        )}

                        {activeMetricTab === 'fees' && (
                          <div className="text-right">
                            <span className="text-base sm:text-lg font-extrabold text-slate-900">
                              {inst.feeRecoveryRate}% <span className="text-xs font-semibold text-slate-500">Collected</span>
                            </span>
                            <p className="text-[11px] font-mono text-emerald-700 font-semibold mt-0.5">
                              Rs. {inst.totalCollectedPKR.toLocaleString()}
                            </p>
                          </div>
                        )}

                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Modal Bottom Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Telemetry synchronized across {analyticsData.comparisonList.length} operational campuses
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
              <button
                type="button"
                onClick={() => setIsBreakdownModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </Modal>

    </div>
  )
}

export default CrossInstituteAnalyticsView
