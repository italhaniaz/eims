import React, { useState } from 'react'
import { 
  Truck, 
  ShieldAlert, 
  Hotel, 
  BarChart3, 
  AlertTriangle, 
  HeartHandshake, 
  MessageSquare, 
  Search, 
  Check, 
  X, 
  Download,
  CheckCircle2,
  PhoneCall,
  UserCheck
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminCampusServicesView = ({ activeTab = 'transport', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'transport'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Escalated complaints
  const [complaints, setComplaints] = useState([
    { id: 'ESC-401', campus: 'Beaconhouse Central High', category: 'Transport Route Safety', filedBy: 'Parent (Rana Zubair)', student: 'Ali Zubair (Grade 8)', issue: 'Bus Route 4 reckless driving near Thokar Niaz Baig', priority: 'High', status: 'Pending Investigation' },
    { id: 'ESC-402', campus: 'City School Senior Branch', category: 'Hostel Mess Quality', filedBy: 'Hostel Resident', student: 'Farhan Masood (ICS Part-1)', issue: 'Dinner catering timing and water filtration hygiene report', priority: 'Medium', status: 'Under Rectification' }
  ])

  // Transport routes
  const [routes] = useState([
    { routeNo: 'R-01', name: 'Johar Town to Main Campus', buses: 4, students: 168, fee: 'PKR 6,500 / mo', status: 'Optimal' },
    { routeNo: 'R-02', name: 'DHA Phase 5 & 6 Express', buses: 6, students: 242, fee: 'PKR 8,500 / mo', status: 'Optimal' },
    { routeNo: 'R-03', name: 'Gulberg & Model Town Circular', buses: 3, students: 110, fee: 'PKR 6,000 / mo', status: 'Capacity Full' },
    { routeNo: 'R-04', name: 'Wapda Town & Valencia Shuttles', buses: 4, students: 154, fee: 'PKR 7,000 / mo', status: 'Optimal' }
  ])

  const tabsConfig = [
    { key: 'transport', label: 'Transport Routes & Fee Policies', icon: Truck },
    { key: 'drivers', label: 'Driver & Vehicle Compliance', icon: UserCheck },
    { key: 'hostel', label: 'Hostel Capacity & Rules', icon: Hotel },
    { key: 'reports', label: 'Transport & Hostel Reports', icon: BarChart3 },
    { key: 'discipline', label: 'Discipline Records Overview', icon: AlertTriangle },
    { key: 'health', label: 'Health & Welfare Policies', icon: HeartHandshake },
    { key: 'complaints', label: 'Complaint & Grievance Escalations', icon: MessageSquare, badge: complaints.filter(c => c.status === 'Pending Investigation').length }
  ]

  const handleResolveComplaint = (id) => {
    setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: 'Resolved' } : c))
    toast?.success?.(`Escalation ${id} marked resolved. Official response sent to complainant.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-950 via-cyan-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-teal-200 border border-white/10 mb-2">
              <Truck className="w-3.5 h-3.5 text-teal-300" />
              <span>Super Administrator • Platform Campus Services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Campus Logistics, Facilities & Safety
            </h1>
            <p className="text-sm text-teal-100 mt-1 max-w-2xl leading-relaxed">
              Centrally monitor student bus routes, hostel residency caps, driver vetting, and high-priority safety complaints.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Fleet safety audit report dispatched to regional heads')}
            className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Audit Campus Safety</span>
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
                    ? 'bg-teal-700 text-white shadow-sm shadow-teal-700/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-white text-teal-900' : 'bg-teal-100 text-teal-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Transport Routes */}
      {effectiveTab === 'transport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routes.map(r => (
              <div key={r.routeNo} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex justify-between items-center">
                <div>
                  <span className="font-mono text-xs font-bold text-teal-700">{r.routeNo}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5">{r.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">Fleet: <b>{r.buses} Coasters</b> &bull; Capacity: <b>{r.students} Students</b></p>
                  <p className="text-xs text-teal-700 font-bold mt-2">Standard Fare: {r.fee}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'Optimal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Hostel */}
      {effectiveTab === 'hostel' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Central Hostel Facilities & Capacity Matrix</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase">Boys Hostels (3 Buildings)</span>
              <h4 className="text-xl font-bold text-slate-900 mt-1">450 Beds</h4>
              <p className="text-xs text-emerald-600 font-semibold mt-1">88% Occupied (396 Enrolled)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase">Girls Hostels (2 Buildings)</span>
              <h4 className="text-xl font-bold text-slate-900 mt-1">320 Beds</h4>
              <p className="text-xs text-emerald-600 font-semibold mt-1">94% Occupied (301 Enrolled)</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <span className="text-xs font-bold text-slate-400 uppercase">Curfew & Gate Security</span>
              <h4 className="text-xl font-bold text-slate-900 mt-1">8:30 PM Lockout</h4>
              <p className="text-xs text-slate-500 font-semibold mt-1">Biometric gate checkout mandatory</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Complaints */}
      {effectiveTab === 'complaints' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Safety & Services Escalation Log</h3>
            <p className="text-xs text-slate-500">Unresolved complaints escalated to Superadmin from branch grievance cells</p>
          </div>
          <div className="divide-y divide-slate-100">
            {complaints.map(c => (
              <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-700">{c.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{c.category}</span>
                    <span className="text-xs text-rose-600 font-bold">[{c.priority} Priority]</span>
                  </div>
                  <p className="text-xs text-slate-700">Complainant: <b>{c.filedBy}</b> ({c.student}) &bull; Campus: <b>{c.campus}</b></p>
                  <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-100">"{c.issue}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status !== 'Resolved' ? (
                    <button 
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-teal-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-teal-500 cursor-pointer shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Take Action & Close</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Resolved
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {['drivers', 'reports', 'discipline', 'health'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Oversight</h3>
          <p className="text-xs text-slate-500">Central compliance parameters ensure high-quality welfare and child safeguarding.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            All bus drivers and campus guards undergo mandatory biometric background checks and traffic police fitness verification.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminCampusServicesView
