import React, { useState } from 'react'
import { 
  Clock, 
  Calendar, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  Cpu, 
  BarChart3, 
  ShieldCheck, 
  Search, 
  Filter, 
  Check, 
  X, 
  Sparkles,
  Download
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminAttendanceView = ({ activeTab = 'overview', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'overview'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Attendance correction requests state
  const [corrections, setCorrections] = useState([
    { id: 'COR-091', student: 'Ahmed Raza', roll: 'LGS-221', campus: 'Lahore Grammar Model Town', wing: 'Middle Wing', date: '2026-10-28', markFrom: 'Absent', markTo: 'Present', reason: 'Biometric reader timeout during morning assembly', status: 'Pending Approval' },
    { id: 'COR-092', student: 'Zainab Fatima', roll: 'BHS-108', campus: 'Beaconhouse Central High', wing: 'College Wing', date: '2026-10-27', markFrom: 'Late (40m)', markTo: 'Official Leave', reason: 'Participating in Interschool Science Olympiad', status: 'Approved' }
  ])

  // Biometric devices state
  const [biometricDevices, setBiometricDevices] = useState([
    { id: 'BIO-01', campus: 'Beaconhouse Central High', model: 'ZKTeco SpeedFace-V5L', ip: '192.168.10.45', location: 'Main Turnstile Gate 1', status: 'Online & Synced', lastSync: '1 min ago' },
    { id: 'BIO-02', campus: 'City School Senior Branch', model: 'Hikvision Face Terminal DS-K1T671', ip: '192.168.1.80', location: 'Faculty Entrance', status: 'Online & Synced', lastSync: '3 mins ago' },
    { id: 'BIO-03', campus: 'Lahore Grammar Model Town', model: 'ZKTeco IN01-A (RFID & Thumb)', ip: '10.0.0.12', location: 'Boys Wing Portal', status: 'Device Lagging', lastSync: '24 mins ago' }
  ])

  // Shortage Defaulters (<75%)
  const [defaulters] = useState([
    { roll: 'BHS-099', name: 'Bilal Shahid', campus: 'Beaconhouse Central High', wing: 'Secondary Wing', totalSessions: 180, attended: 112, percentage: '62.2%', status: 'Debarred from Terminal Exams' },
    { roll: 'TCS-404', name: 'Hamza Farooq', campus: 'City School Senior Branch', wing: 'College Wing', totalSessions: 160, attended: 104, percentage: '65.0%', status: 'Warning Notice Sent' },
    { roll: 'LGS-115', name: 'Ayesha Noor', campus: 'Lahore Grammar Model Town', wing: 'Primary Wing', totalSessions: 180, attended: 128, percentage: '71.1%', status: 'Medical Certificate Requested' }
  ])

  const tabsConfig = [
    { key: 'overview', label: 'Attendance Overview', icon: Clock },
    { key: 'rules', label: 'Attendance Rules', icon: ShieldCheck },
    { key: 'defaulters', label: 'Shortage & Defaulters List', icon: AlertTriangle, badge: defaulters.length },
    { key: 'leave', label: 'Leave Policies & Approvals', icon: Calendar },
    { key: 'corrections', label: 'Attendance Correction Approvals', icon: FileCheck, badge: corrections.filter(c => c.status === 'Pending Approval').length },
    { key: 'staff', label: 'Staff Attendance Overview', icon: Users },
    { key: 'biometric', label: 'Biometric / RFID Integrations', icon: Cpu },
    { key: 'reports', label: 'Attendance Reports', icon: BarChart3 }
  ]

  const handleApproveCorrection = (id) => {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c))
    toast?.success?.(`Attendance correction ${id} authorized. Register updated.`)
  }

  const handleRejectCorrection = (id) => {
    setCorrections(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c))
    toast?.info?.(`Attendance correction ${id} rejected.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/10 mb-2">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Super Administrator • Cross-Campus Attendance Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Attendance Telemetry & Compliance
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              Real-time multi-campus attendance tracking, 75% examination threshold monitoring, and biometric device fleet sync.
            </p>
          </div>
          <button 
            onClick={() => toast?.success?.('Biometric hardware synchronization pulse dispatched to all registered campus gateways.')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Cpu className="w-4 h-4" />
            <span>Sync All Biometric Devices</span>
          </button>
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
                    ? 'bg-emerald-700 text-white shadow-sm shadow-emerald-700/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Attendance Overview */}
      {effectiveTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Daily Attendance</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">94.8%</h3>
              <span className="text-xs text-emerald-600 font-semibold mt-1 inline-block">+1.4% vs last week</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">3,420</h3>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Across all 4 active campuses</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Arrivals (Unexcused)</span>
              <h3 className="text-2xl font-black text-amber-600 mt-1">48</h3>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">Gate check past 8:15 AM</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Attendance Rate</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">98.1%</h3>
              <span className="text-xs text-slate-500 font-medium mt-1 inline-block">168 / 171 Clocked In</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="font-bold text-slate-900 text-base">Campus & Wing-wise Live Attendance Ratio</h3>
            <div className="space-y-4 mt-4">
              {[
                { name: 'Beaconhouse Central High (Senior School)', rate: 96.2, present: 840, total: 873, color: 'bg-emerald-500' },
                { name: 'Beaconhouse Central High (College Wing)', rate: 93.4, present: 412, total: 441, color: 'bg-emerald-500' },
                { name: 'City School Senior Branch (All Wings)', rate: 94.1, present: 1140, total: 1211, color: 'bg-emerald-500' },
                { name: 'Lahore Grammar Model Town (Elementary & Middle)', rate: 95.8, present: 1028, total: 1073, color: 'bg-emerald-500' }
              ].map((c, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                    <span>{c.name}</span>
                    <span className="text-emerald-700">{c.rate}% ({c.present} / {c.total} Present)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                    <div className={`${c.color} h-full rounded-full transition-all`} style={{ width: `${c.rate}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Attendance Rules */}
      {effectiveTab === 'rules' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Standard Platform Attendance Rules & Thresholds</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-emerald-800 uppercase">Board Exam Threshold</span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">75.0% Mandatory</h4>
              <p className="text-xs text-slate-500 mt-1">Students below 75% are ineligible to sit in final board & terminal examinations unless granted medical waiver.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-amber-800 uppercase">Shortage Warning Alert</span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">Below 80% Trigger</h4>
              <p className="text-xs text-slate-500 mt-1">Automatic SMS and portal notification dispatched to parents when attendance drops below 80%.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-purple-800 uppercase">Late Arrival Grace Window</span>
              <h4 className="text-lg font-bold text-slate-900 mt-1">15 Minutes</h4>
              <p className="text-xs text-slate-500 mt-1">3 consecutive unexcused late marks automatically convert to 1 day marked absence in the monthly gazette.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Shortage & Defaulters */}
      {effectiveTab === 'defaulters' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Attendance Defaulters List (&lt; 75%)</h3>
              <p className="text-xs text-slate-500">Students facing exam debarment due to insufficient term attendance</p>
            </div>
            <button 
              onClick={() => toast?.info?.('Parent shortage notice letters generated in PDF')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Defaulter Gazette</span>
            </button>
          </div>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Roll No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Campus & Wing</th>
                <th className="p-4">Sessions Attended</th>
                <th className="p-4">Attendance Rate</th>
                <th className="p-4">Sanction Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {defaulters.map((d, i) => (
                <tr key={i} className="hover:bg-rose-50/20">
                  <td className="p-4 font-mono font-bold text-slate-900">{d.roll}</td>
                  <td className="p-4 font-bold text-slate-900">{d.name}</td>
                  <td className="p-4">{d.campus} ({d.wing})</td>
                  <td className="p-4">{d.attended} / {d.totalSessions}</td>
                  <td className="p-4 font-bold text-rose-600">{d.percentage}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800">
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: Corrections */}
      {effectiveTab === 'corrections' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Attendance Correction Requests</h3>
            <p className="text-xs text-slate-500">Teacher and campus requests to amend marked absences or technical biometric faults</p>
          </div>
          <div className="divide-y divide-slate-100">
            {corrections.map(c => (
              <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">{c.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{c.student} ({c.roll})</span>
                    <span className="text-xs text-slate-500">• {c.campus}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Change: <span className="line-through text-rose-500 font-semibold">{c.markFrom}</span> &rarr; <span className="text-emerald-700 font-bold">{c.markTo}</span> on <b>{c.date}</b>
                  </p>
                  <p className="text-xs text-slate-500 italic">"{c.reason}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === 'Pending Approval' ? (
                    <>
                      <button 
                        onClick={() => handleApproveCorrection(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-500 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                      <button 
                        onClick={() => handleRejectCorrection(c.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${c.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {c.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Biometric Integrations */}
      {effectiveTab === 'biometric' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Campus Biometric & RFID Device Fleet</h3>
            <p className="text-xs text-slate-500">Live hardware telemetry and sync health with campus gates</p>
          </div>
          <div className="divide-y divide-slate-100">
            {biometricDevices.map(d => (
              <div key={d.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800">{d.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{d.model}</span>
                    <span className="text-xs text-slate-500">({d.ip})</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{d.campus} • {d.location}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${d.status.includes('Online') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {d.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">Last synced: {d.lastSync}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Fallback for other tabs */}
      {['leave', 'staff', 'reports'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Intelligence & Policies</h3>
          <p className="text-xs text-slate-500">Standardized attendance records and automated summaries are generated nightly.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Daily logs are synchronized with the central audit ledger. All absences beyond 3 consecutive days require digital clearance.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAttendanceView
