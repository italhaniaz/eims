import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Building2, 
  Sliders, 
  Calendar, 
  Download, 
  FileSpreadsheet, 
  Sparkles,
  PieChart,
  ArrowUpRight,
  Filter
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminReportsAnalyticsView = ({ activeTab = 'trends', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'trends'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  const tabsConfig = [
    { key: 'trends', label: 'Enrollment & Dropout Trends', icon: TrendingUp },
    { key: 'performance', label: 'Performance Analysis', icon: BarChart3 },
    { key: 'collection', label: 'Fee Collection vs Outstanding', icon: DollarSign },
    { key: 'comparison', label: 'Campus Comparison', icon: Building2 },
    { key: 'builder', label: 'Custom Report Builder', icon: Sliders },
    { key: 'scheduled', label: 'Scheduled Reports', icon: Calendar },
    { key: 'export', label: 'Export Center (PDF / Excel / CSV)', icon: Download }
  ]

  const handleExport = (format) => {
    toast?.success?.(`Generating consolidated platform ${format} report... Download ready.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Super Administrator • Platform Intelligence & Data Lake</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Reports & Executive Analytics
            </h1>
            <p className="text-sm text-indigo-100 mt-1 max-w-2xl leading-relaxed">
              Consolidated enrollment telemetry, multi-campus benchmarking, custom BI queries, and scheduled trustee briefs.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleExport('PDF')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button 
              onClick={() => handleExport('Excel')}
              className="px-3.5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-indigo-700 text-white shadow-sm shadow-indigo-700/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Enrollment & Trends */}
      {effectiveTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrolled Body</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">3,420</h3>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% YoY Growth
              </span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">New Admissions 2026</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">680</h3>
              <span className="text-xs text-purple-600 font-semibold mt-1 inline-block">Exceeded annual quota</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Annual Dropout Rate</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">1.8%</h3>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Industry benchmark &lt; 4%</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Retention Index</span>
              <h3 className="text-2xl font-black text-indigo-700 mt-1">98.2%</h3>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Highest across Lahore campuses</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Campus Comparison */}
      {effectiveTab === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Head-to-Head Campus Benchmarking</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">Campus Name</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Faculty Ratio</th>
                  <th className="p-4">Attendance Rate</th>
                  <th className="p-4">Fee Recovery</th>
                  <th className="p-4">Exam Pass %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {[
                  { name: 'Beaconhouse Central High', students: 1314, ratio: '1:16', att: '95.2%', fee: '92.4%', pass: '96.8%' },
                  { name: 'City School Senior Branch', students: 1211, ratio: '1:18', att: '94.1%', fee: '89.1%', pass: '94.2%' },
                  { name: 'Lahore Grammar Model Town', students: 895, ratio: '1:15', att: '95.8%', fee: '94.6%', pass: '97.5%' }
                ].map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">{c.name}</td>
                    <td className="p-4 font-semibold">{c.students}</td>
                    <td className="p-4">{c.ratio}</td>
                    <td className="p-4 text-emerald-700 font-bold">{c.att}</td>
                    <td className="p-4 text-purple-700 font-bold">{c.fee}</td>
                    <td className="p-4 font-black text-slate-900">{c.pass}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 7: Export Center */}
      {effectiveTab === 'export' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Platform Data Export Center</h3>
          <p className="text-xs text-slate-500">Download sanitized compliance snapshots for regulatory bodies and external auditors</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { title: 'Annual Educational Census (PEIRA / SED)', format: 'Excel & PDF', desc: 'Complete wing-wise student counts, teacher qualifications, and room matrix' },
              { title: 'Fiscal Year Master Audit Ledger', format: 'CSV & XLSX', desc: 'General ledger, withholding taxes deducted, and bank reconciliations' },
              { title: 'Examination Results Master Gazette', format: 'PDF & Official DMC', desc: 'Tabulated marks sheets with pass/fail and subject GPA metrics' }
            ].map((e, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-indigo-700">{e.format}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{e.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{e.desc}</p>
                </div>
                <button
                  onClick={() => handleExport(e.format)}
                  className="mt-4 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Snapshot</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {['performance', 'collection', 'builder', 'scheduled'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Intelligence Engine</h3>
          <p className="text-xs text-slate-500">Automated SQL aggregates synthesize multi-tenant data into interactive reports.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Real-time caching layer refreshes every 15 minutes to guarantee sub-second dashboard query speeds.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminReportsAnalyticsView
