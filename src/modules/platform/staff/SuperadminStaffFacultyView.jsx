import React, { useState, useMemo } from 'react'
import { 
  Users, 
  ShieldCheck, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Building2, 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  Check, 
  X, 
  Eye,
  FileCheck
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'

export const SuperadminStaffFacultyView = ({ activeTab = 'all', onTabChange = () => {} }) => {
  const { teachers = [], institutes = [] } = useAppData()
  const { toast } = useToast()
  const [inspectingStaff, setInspectingStaff] = useState(null)

  const handleExportStaffCSV = () => {
    try {
      const headers = ['Staff ID', 'Name', 'Designation', 'Role', 'Campus', 'Qualification', 'Status']
      const rows = filteredStaff.map(s => [
        s.id,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.designation || '').replace(/"/g, '""')}"`,
        `"${(s.role || '').replace(/"/g, '""')}"`,
        `"${(s.campus || '').replace(/"/g, '""')}"`,
        `"${(s.qualification || '').replace(/"/g, '""')}"`,
        s.status || 'Active'
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Faculty_Staff_Registry_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.(`Successfully exported ${filteredStaff.length} faculty and staff records to CSV!`)
    } catch {
      toast?.error?.('Failed to export CSV.')
    }
  }


  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'all'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('ALL')

  // Sample cross-campus staff data
  const staffList = useMemo(() => {
    if (teachers && teachers.length > 0) return teachers
    return [
      { id: 'STF-01', name: 'Prof. Tariq Jamil', designation: 'Head of Mathematics Department', campus: 'Beaconhouse Central High', role: 'HOD / Senior Lecturer', status: 'Active', salary: 'PKR 145,000', qualification: 'M.Phil Mathematics' },
      { id: 'STF-02', name: 'Dr. Nadia Hashmi', designation: 'Associate Professor of Chemistry', campus: 'City School Senior Branch', role: 'Faculty Specialist', status: 'Active', salary: 'PKR 165,000', qualification: 'Ph.D. Organic Chemistry' },
      { id: 'STF-03', name: 'Syed Ali Raza', designation: 'Senior Physics Instructor', campus: 'Beaconhouse Central High', role: 'Section Coordinator', status: 'Active', salary: 'PKR 125,000', qualification: 'M.Sc Physics' },
      { id: 'STF-04', name: 'Amina Batool', designation: 'English Literature Lecturer', campus: 'Lahore Grammar Model Town', role: 'Class Teacher', status: 'On Leave', salary: 'PKR 98,000', qualification: 'MA English' },
      { id: 'STF-05', name: 'Muhammad Waqas', designation: 'Chief Campus Bursar & Accountant', campus: 'Beaconhouse Central High', role: 'Senior Accountant', status: 'Active', salary: 'PKR 110,000', qualification: 'ACCA Finalist' }
    ]
  }, [teachers])

  const filteredStaff = useMemo(() => {
    return staffList.filter(s => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (s.name || '').toLowerCase().includes(q) || (s.designation || '').toLowerCase().includes(q) || (s.campus || '').toLowerCase().includes(q)
      const matchesCampus = selectedCampus === 'ALL' || s.campus === selectedCampus
      return matchesSearch && matchesCampus
    })
  }, [staffList, searchQuery, selectedCampus])

  // Staff Transfers
  const [staffTransfers, setStaffTransfers] = useState([
    { id: 'STR-201', staffName: 'Syed Ali Raza', fromCampus: 'Beaconhouse Central High', toCampus: 'City School Senior Branch', reason: 'Promoted to Campus Academic Coordinator', status: 'Pending Superadmin Approval', date: '2026-10-24' },
    { id: 'STR-202', staffName: 'Amina Batool', fromCampus: 'Lahore Grammar Model Town', toCampus: 'Beaconhouse Central High', reason: 'Mutual Faculty Exchange Request', status: 'Authorized', date: '2026-10-15' }
  ])

  // Leave & Payroll
  const [payrollPolicies, setPayrollPolicies] = useState([
    { title: 'Annual Casual Leave Entitlement', rule: '14 Days / Academic Year (Paid)', scope: 'All Permanent Faculty' },
    { title: 'Medical / Sick Leave with Hospital Certificate', rule: '10 Days with Full Salary, 15 Days with Half Salary', scope: 'All Staff' },
    { title: 'Provident Fund Matching Contribution', rule: '8.33% Basic Salary matched by Platform Institute', scope: 'Confirmed Staff' },
    { title: 'Overtime & Substitute Lecture Honorarium', rule: 'PKR 1,200 per extra substituted lesson period', scope: 'Teaching Faculty' }
  ])

  const tabsConfig = [
    { key: 'all', label: 'All Staff (Cross-Campus)', icon: Users, badge: staffList.length },
    { key: 'roles', label: 'Staff Role Assignments', icon: ShieldCheck },
    { key: 'transfers', label: 'Inter-Campus Staff Transfers', icon: ArrowLeftRight, badge: staffTransfers.filter(t => t.status.includes('Pending')).length },
    { key: 'payroll', label: 'Leave & Payroll Policies', icon: CreditCard },
    { key: 'reports', label: 'Evaluation & Staff Reports', icon: TrendingUp }
  ]

  const handleApproveStaffTransfer = (id) => {
    setStaffTransfers(prev => prev.map(t => t.id === id ? { ...t, status: 'Authorized' } : t))
    toast?.success?.(`Staff transfer ${id} authorized. Faculty records will be mapped to destination branch.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Central Faculty & Staff Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Staff & Faculty Central Oversight
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidated human resources directory, inter-campus teaching transfers, platform payroll and benefits frameworks.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-right">
            <span className="text-[11px] text-slate-300 block uppercase font-mono tracking-wider">Total Faculty</span>
            <strong className="text-xl font-bold font-mono text-white">{staffList.length} Members</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabSwitch(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 1. ALL STAFF */}
      {effectiveTab === 'all' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:w-auto flex items-center gap-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search staff by Name, Designation, or Campus..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Affiliated Campuses</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleExportStaffCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Staff Member & ID</th>
                  <th className="py-3.5 px-4">Designation & Role</th>
                  <th className="py-3.5 px-4">Affiliated Campus</th>
                  <th className="py-3.5 px-4">Qualification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.name}</div>
                      <span className="font-mono text-[10px] text-purple-700 font-bold">{st.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{st.designation}</div>
                      <span className="text-[10px] text-slate-400">{st.role}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {st.campus || 'Main Campus'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-600">{st.qualification || 'Master Degree'}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (st.status || 'Active') === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {st.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectingStaff(st)}
                        className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. STAFF ROLE ASSIGNMENTS */}
      {effectiveTab === 'roles' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="font-bold text-xs text-slate-900 block">Department Heads (HODs)</span>
              <div className="text-xl font-bold font-mono text-purple-700">18 Appointed</div>
              <p className="text-xs text-slate-500">Lead curriculum delivery, teacher mentoring, and subject evaluations.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="font-bold text-xs text-slate-900 block">Section Coordinators</span>
              <div className="text-xl font-bold font-mono text-indigo-700">32 Assigned</div>
              <p className="text-xs text-slate-500">Manage daily attendance sheets and timetable slot coverage.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
              <span className="font-bold text-xs text-slate-900 block">Campus Bursars & Finance</span>
              <div className="text-xl font-bold font-mono text-emerald-700">6 Officers</div>
              <p className="text-xs text-slate-500">Supervise fee challan generation and collection reconciliations.</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. INTER-CAMPUS STAFF TRANSFERS */}
      {effectiveTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Transfer ID & Faculty</th>
                  <th className="py-3.5 px-4">Current Branch</th>
                  <th className="py-3.5 px-4">Destination Branch</th>
                  <th className="py-3.5 px-4">Justification</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Superadmin Clearance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffTransfers.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{st.staffName}</div>
                      <span className="font-mono text-[10px] text-slate-400">{st.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{st.fromCampus}</td>
                    <td className="py-3.5 px-4 font-medium text-purple-700">{st.toCampus}</td>
                    <td className="py-3.5 px-4 text-slate-600">{st.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        st.status === 'Authorized' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {st.status !== 'Authorized' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveStaffTransfer(st.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Clear Transfer</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Authorized</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. LEAVE & PAYROLL POLICIES */}
      {effectiveTab === 'payroll' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payrollPolicies.map((p, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs">{p.title}</span>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold">Standard Directive</span>
                </div>
                <div className="text-xs text-slate-700">
                  Rule: <strong className="font-mono text-purple-700">{p.rule}</strong>
                </div>
                <div className="text-[11px] text-slate-400">
                  Applicable Audience: <strong>{p.scope}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. EVALUATION & STAFF REPORTS */}
      {effectiveTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Faculty Attendance</span>
            <div className="text-2xl font-bold font-mono text-purple-700">96.8%</div>
            <p className="text-[11px] text-slate-400">Verified through biometric campus clock-ins.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Student Satisfaction Rating</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">4.8 / 5.0</div>
            <p className="text-[11px] text-slate-400">Aggregated term-end student feedback surveys.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Faculty Retention Index</span>
            <div className="text-2xl font-bold font-mono text-indigo-700">92.1%</div>
            <p className="text-[11px] text-slate-400">Multi-year senior teacher retention rate.</p>
          </div>
        </div>
      )}
    
      {/* Staff 360 Inspection Modal */}
      {inspectingStaff && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingStaff(null)}
          title={`Staff Profile: ${inspectingStaff.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectingStaff.name}</h4>
                <p className="text-purple-700 font-mono text-xs font-bold mt-0.5">{inspectingStaff.designation} &bull; {inspectingStaff.id}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {inspectingStaff.status || 'Active'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Affiliated Campus</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.campus || 'Main Campus'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Qualification</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.qualification || 'M.Phil / Master'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Department / Wing</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.role || 'Science Faculty'}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Biometric Check-in Rate</span>
                <span className="font-bold text-emerald-700 text-xs">98.2% Punctual</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => toast?.info?.('Printable Faculty ID Card generated')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Print Staff ID Card
              </button>
              <button
                onClick={() => setInspectingStaff(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default SuperadminStaffFacultyView
