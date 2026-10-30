import React, { useState, useMemo } from 'react'
import { 
  UserPlus, 
  Calendar, 
  Award, 
  Layers, 
  DollarSign, 
  LayoutDashboard, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  Building2, 
  Download, 
  Sparkles,
  TrendingUp,
  FileCheck,
  Check,
  Edit2,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

export const SuperadminAdmissionsView = ({ activeTab = 'overview', onTabChange = () => {} }) => {
  const { institutes = [] } = useAppData()
  const { toast } = useToast()

  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'overview'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Modal State for New Admission Cycle
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false)
  const [newCycle, setNewCycle] = useState({
    name: '',
    campusScope: 'All Campuses (Central)',
    startDate: '',
    endDate: '',
    capacity: 250,
    status: 'Active (Open)'
  })

  // Modal State for Merit Policy Editor
  const [isMeritModalOpen, setIsMeritModalOpen] = useState(false)
  const [editingMerit, setEditingMerit] = useState(null)

  const handleCreateCycle = (e) => {
    e.preventDefault()
    if (!newCycle.name || !newCycle.startDate || !newCycle.endDate) {
      toast?.error?.('Please complete all required fields.')
      return
    }

    const createdCycle = {
      id: `CYC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      name: newCycle.name,
      campusScope: newCycle.campusScope,
      startDate: newCycle.startDate,
      endDate: newCycle.endDate,
      status: newCycle.status,
      applications: 0
    }

    setCycles(prev => [createdCycle, ...prev])
    setIsCycleModalOpen(false)
    setNewCycle({
      name: '',
      campusScope: 'All Campuses (Central)',
      startDate: '',
      endDate: '',
      capacity: 250,
      status: 'Active (Open)'
    })
    toast?.success?.(`Admission cycle "${createdCycle.name}" launched successfully!`)
  }

  const handleOpenMeritModal = (policy) => {
    setEditingMerit({ ...policy })
    setIsMeritModalOpen(true)
  }

  const handleSaveMerit = (e) => {
    e.preventDefault()
    if (!editingMerit) return
    setMeritPolicies(prev => prev.map(m => m.wing === editingMerit.wing ? editingMerit : m))
    setIsMeritModalOpen(false)
    toast?.success?.(`Merit formula for ${editingMerit.wing} successfully updated and published.`)
  }

  // 1. Admission Cycles
  const [cycles, setCycles] = useState([
    { id: 'CYC-2026-F', name: 'Fall 2026 Admissions Intake', campusScope: 'All Campuses (Central)', startDate: '2026-06-01', endDate: '2026-08-31', status: 'Active (Open)', applications: 384 },
    { id: 'CYC-2027-S', name: 'Spring 2027 Lateral Entry', campusScope: 'High School & College Wings', startDate: '2026-11-15', endDate: '2027-01-10', status: 'Scheduled', applications: 45 }
  ])

  // 2. Merit Policies
  const [meritPolicies, setMeritPolicies] = useState([
    { wing: 'Kindergarten & Primary Wing', minPercentage: '50%', testWeight: '40%', interviewWeight: '60%', pastAcademicWeight: '0%', status: 'Published' },
    { wing: 'Middle & High School', minPercentage: '60%', testWeight: '50%', interviewWeight: '20%', pastAcademicWeight: '30%', status: 'Published' },
    { wing: 'College & Higher Secondary', minPercentage: '70%', testWeight: '60%', interviewWeight: '15%', pastAcademicWeight: '25%', status: 'Published' }
  ])

  // 3. Seat Matrix
  const [seatMatrix, setSeatMatrix] = useState([
    { campus: 'Beaconhouse Central High', wing: 'Primary Wing', totalCapacity: 250, filledSeats: 210, availableSeats: 40, waitlist: 15 },
    { campus: 'Beaconhouse Central High', wing: 'High School', totalCapacity: 300, filledSeats: 285, availableSeats: 15, waitlist: 28 },
    { campus: 'City School Senior Branch', wing: 'Middle Wing', totalCapacity: 200, filledSeats: 160, availableSeats: 40, waitlist: 8 },
    { campus: 'Lahore Grammar Model Town', wing: 'College Wing', totalCapacity: 180, filledSeats: 175, availableSeats: 5, waitlist: 42 }
  ])

  // 4. Application Fee Settings
  const [feeSettings, setFeeSettings] = useState([
    { tier: 'Primary Wing', prospectusFee: 'PKR 1,500', processingFee: 'PKR 1,000', testFee: 'PKR 500', status: 'Standard' },
    { tier: 'Middle & High School', prospectusFee: 'PKR 2,000', processingFee: 'PKR 1,500', testFee: 'PKR 1,000', status: 'Standard' },
    { tier: 'College / Pre-Medical / Pre-Eng', prospectusFee: 'PKR 3,000', processingFee: 'PKR 2,000', testFee: 'PKR 1,500', status: 'Standard' }
  ])

  const tabsConfig = [
    { key: 'overview', label: 'Admissions Overview', icon: LayoutDashboard },
    { key: 'cycles', label: 'Admission Cycles', icon: Calendar, badge: cycles.length },
    { key: 'merit', label: 'Entry Test & Merit Policies', icon: Award },
    { key: 'seats', label: 'Seat Matrix & Waitlist', icon: Layers },
    { key: 'fees', label: 'Application Fee Settings', icon: DollarSign }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <UserPlus className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Admissions Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admissions Architecture & Intake
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Define cross-campus admission cycles, entrance test merit formulas, quotas, and application processing rules.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCycleModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Launch Admission Cycle</span>
            </button>
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

      {/* 1. OVERVIEW */}
      {effectiveTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Inflow Leads</span>
              <div className="text-2xl font-bold font-mono text-purple-700">1,248</div>
              <p className="text-[11px] text-slate-500">Across 4 affiliated institutes</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tests Taken</span>
              <div className="text-2xl font-bold font-mono text-indigo-700">892</div>
              <p className="text-[11px] text-slate-500">71.4% entrance attendance rate</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Offers Issued</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">540</div>
              <p className="text-[11px] text-slate-500">Within qualified merit bracket</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled & Confirmed</span>
              <div className="text-2xl font-bold font-mono text-slate-900">429</div>
              <p className="text-[11px] text-slate-500">First installment challan cleared</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Superadmin Central Directives</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The Super Administrator has authority to freeze admissions, enforce affirmative action or staff quotas, override entrance merit thresholds, and audit fee concessions across any registered campus.
            </p>
          </div>
        </div>
      )}

      {/* 2. ADMISSION CYCLES */}
      {effectiveTab === 'cycles' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Cycle ID & Name</th>
                  <th className="py-3.5 px-4">Campus & Wing Scope</th>
                  <th className="py-3.5 px-4">Application Window</th>
                  <th className="py-3.5 px-4">Intake Status</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cycles.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{c.name}</div>
                      <span className="font-mono text-[10px] text-purple-700">{c.id}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{c.campusScope}</td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{c.startDate} to {c.endDate}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-purple-700">{c.applications} applicants</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toast?.info?.(`Editing cycle ${c.id}`)}
                        className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. ENTRY TEST & MERIT POLICIES */}
      {effectiveTab === 'merit' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {meritPolicies.map((m, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs">{m.wing}</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold">Active</span>
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div>Minimum Eligibility Cut-off: <strong className="font-mono text-purple-700">{m.minPercentage}</strong></div>
                  <div>Entrance Test Weightage: <strong className="font-mono text-slate-800">{m.testWeight}</strong></div>
                  <div>Interview / Assessment: <strong className="font-mono text-slate-800">{m.interviewWeight}</strong></div>
                  <div>Past Academic Transcript: <strong className="font-mono text-slate-800">{m.pastAcademicWeight}</strong></div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenMeritModal(m)}
                  className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Configure Formula
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SEAT MATRIX & WAITLIST */}
      {effectiveTab === 'seats' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Campus & Wing</th>
                  <th className="py-3.5 px-4 text-center">Total Capacity</th>
                  <th className="py-3.5 px-4 text-center">Filled Seats</th>
                  <th className="py-3.5 px-4 text-center">Available Capacity</th>
                  <th className="py-3.5 px-4 text-center">Waitlist Queue</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {seatMatrix.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{s.campus}</div>
                      <span className="text-[10px] text-purple-700 font-semibold">{s.wing}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold">{s.totalCapacity}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-700">{s.filledSeats}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-indigo-700">{s.availableSeats}</td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-700">{s.waitlist} in line</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => toast?.info?.(`Managing waitlist for ${s.campus}`)}
                        className="text-purple-600 hover:text-purple-800 font-bold text-xs cursor-pointer"
                      >
                        Manage Quotas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. APPLICATION FEE SETTINGS */}
      {effectiveTab === 'fees' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {feeSettings.map((f, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
                <span className="font-bold text-slate-900 text-xs block border-b border-slate-100 pb-2">{f.tier}</span>
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Prospectus Voucher:</span>
                    <strong className="font-mono text-purple-700">{f.prospectusFee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Application Processing:</span>
                    <strong className="font-mono text-slate-800">{f.processingFee}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Entrance Examination:</span>
                    <strong className="font-mono text-slate-800">{f.testFee}</strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toast?.success?.(`Updated application fee tariff for ${f.tier}`)}
                  className="w-full py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-purple-200"
                >
                  Adjust Tariff Rates
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Modal: Launch Admission Cycle */}
      {isCycleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Launch New Admission Cycle</h3>
                <p className="text-xs text-purple-200 mt-0.5">Central platform intake authorization</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCycleModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCycle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cycle Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spring 2027 Lateral Intake"
                  value={newCycle.name}
                  onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Campus & Wing Scope *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All Campuses (Central) or High School Wing"
                  value={newCycle.campusScope}
                  onChange={(e) => setNewCycle({ ...newCycle, campusScope: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={newCycle.startDate}
                    onChange={(e) => setNewCycle({ ...newCycle, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={newCycle.endDate}
                    onChange={(e) => setNewCycle({ ...newCycle, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={newCycle.status}
                    onChange={(e) => setNewCycle({ ...newCycle, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  >
                    <option value="Active (Open)">Active (Open)</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Capacity</label>
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    value={newCycle.capacity}
                    onChange={(e) => setNewCycle({ ...newCycle, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Launch Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Configure Merit Formula */}
      {isMeritModalOpen && editingMerit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg">Merit Weightage Engine</h3>
                <p className="text-xs text-purple-200 mt-0.5">{editingMerit.wing}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMeritModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMerit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Eligibility Cut-off</label>
                <input
                  type="text"
                  required
                  value={editingMerit.minPercentage}
                  onChange={(e) => setEditingMerit({ ...editingMerit, minPercentage: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entrance Test Weightage</label>
                <input
                  type="text"
                  required
                  value={editingMerit.testWeight}
                  onChange={(e) => setEditingMerit({ ...editingMerit, testWeight: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Interview / Personal Assessment</label>
                <input
                  type="text"
                  required
                  value={editingMerit.interviewWeight}
                  onChange={(e) => setEditingMerit({ ...editingMerit, interviewWeight: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Past Academic Transcript</label>
                <input
                  type="text"
                  required
                  value={editingMerit.pastAcademicWeight}
                  onChange={(e) => setEditingMerit({ ...editingMerit, pastAcademicWeight: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMeritModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Formula
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAdmissionsView
