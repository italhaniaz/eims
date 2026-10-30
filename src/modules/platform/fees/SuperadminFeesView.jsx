import React, { useState } from 'react'
import { 
  DollarSign,
  Printer,
  Send,
  Plus,
  FileText,
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Layers, 
  FileSpreadsheet, 
  Award, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  Receipt, 
  BarChart3, 
  Search, 
  Check, 
  X, 
  Download,
  Percent,
  Wallet
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminFeesView = ({ activeTab = 'structure', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [defaulterSearch, setDefaulterSearch] = useState('')
  const [defaulterAgingFilter, setDefaulterAgingFilter] = useState('ALL')
  const [inspectingChallan, setInspectingChallan] = useState(null)
  
  // Late fee rules
  const [lateRules, setLateRules] = useState([
    { id: 'LR-01', wing: 'School Wing (Grades 1-10)', graceDays: 10, finePerDay: 'PKR 100', maxCap: 'PKR 2,000', suspendDays: 45, status: 'Active' },
    { id: 'LR-02', wing: 'College Wing (HSSC / A-Levels)', graceDays: 10, finePerDay: 'PKR 150', maxCap: 'PKR 3,500', suspendDays: 40, status: 'Active' },
    { id: 'LR-03', wing: 'University Wing (BS / MS)', graceDays: 15, finePerDay: 'PKR 250', maxCap: 'PKR 5,000', suspendDays: 30, status: 'Active' }
  ])

  // Defaulters data
  const [defaultersList] = useState([
    { id: 'DEF-101', student: 'Bilal Farooq', roll: 'BHS-401', campus: 'Beaconhouse Central High', wing: 'School', amount: 'PKR 36,000', days: 42, contact: '0300-4829101', status: 'Notice Issued' },
    { id: 'DEF-102', student: 'Zainab Qasim', roll: 'TCS-912', campus: 'City School Senior Branch', wing: 'College', amount: 'PKR 52,500', days: 65, contact: '0321-9988771', status: 'Exam Freeze Warning' },
    { id: 'DEF-103', student: 'Usman Ghani', roll: 'LGS-112', campus: 'Lahore Grammar Model Town', wing: 'School', amount: 'PKR 28,000', days: 25, contact: '0333-5566772', status: '1st Reminder' },
    { id: 'DEF-104', student: 'Hamza Tariq', roll: 'APS-551', campus: 'Army Public School & College', wing: 'University', amount: 'PKR 78,000', days: 88, contact: '0345-1122334', status: 'Suspension Pending' }
  ])

  // Promo vouchers
  const [vouchersList, setVouchersList] = useState([
    { code: 'WELCOME2026', discount: 'PKR 5,000 OFF', type: 'Admission Fixed', claimed: 84, maxLimit: 100, expires: '30 Nov 2026', status: 'Active' },
    { code: 'SIBLING25', discount: '25% Tuition Waiver', type: 'Kinship Recurring', claimed: 142, maxLimit: 500, expires: 'Permanent', status: 'Active' },
    { code: 'ANNUAL10', discount: '10% Lump-Sum Advance', type: 'Advance Payment', claimed: 67, maxLimit: 200, expires: '31 Dec 2026', status: 'Active' }
  ])

  const handleExportFeesReport = () => {
    try {
      const csv = 'Campus,Total Invoiced (PKR),Collected (PKR),Outstanding (PKR),Recovery Rate\nBeaconhouse Central,48500000,45200000,3300000,93.2%\nCity School Senior,42100000,38900000,3200000,92.4%\nLahore Grammar School,31200000,28500000,2700000,91.3%\nArmy Public School,26700000,23600000,3100000,88.4%'
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Central_Fees_Recovery_Report_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      toast?.success?.('Consolidated central fees revenue report exported to CSV!')
    } catch {
      toast?.error?.('Export failed')
    }
  }

  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'structure'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Refund / Waiver approval requests
  const [waiverRequests, setWaiverRequests] = useState([
    { id: 'WAV-301', student: 'Zohaib Ali', roll: 'BHS-332', campus: 'Beaconhouse Central High', wing: 'College Wing', requestedAmount: 'PKR 18,500', type: 'Hardship Fee Concession (50%)', reason: 'Father medical emergency, submitted official hospital report', status: 'Pending Approval' },
    { id: 'WAV-302', student: 'Maryam Naveed', roll: 'TCS-819', campus: 'City School Senior Branch', wing: 'Secondary Wing', requestedAmount: 'PKR 25,000', type: 'Refund of Advance Security Deposit', reason: 'Student transferred due to family relocation to Islamabad', status: 'Pending Approval' }
  ])

  // Payment gateways
  const [gateways] = useState([
    { name: '1Bill (National Switch)', type: 'Biller ID 100482', settlement: 'T+1 Instant', fee: 'PKR 15 / challan', status: 'Operational', activeCampuses: 'All Campuses' },
    { name: 'KuickPay IPG', type: 'API Consumer 9920', settlement: 'Same Day', fee: '0.85% + FED', status: 'Operational', activeCampuses: 'All Campuses' },
    { name: 'JazzCash Direct Merchant', type: 'Merchant Wallet 0300-XXXXXXX', settlement: 'Real-time', fee: '1.20%', status: 'Operational', activeCampuses: 'All Campuses' },
    { name: 'EasyPaisa Corporate API', type: 'Till ID 88471', settlement: 'Real-time', fee: '1.15%', status: 'Operational', activeCampuses: 'All Campuses' }
  ])

  const tabsConfig = [
    { key: 'structure', label: 'Fee Structure Templates', icon: DollarSign },
    { key: 'late-rules', label: 'Late Fee & Installment Rules', icon: Calendar },
    { key: 'installments', label: 'Installment Plans', icon: Layers },
    { key: 'challans', label: 'Fee Challan Templates', icon: Receipt },
    { key: 'scholarships', label: 'Scholarships & Discount Policies', icon: Award },
    { key: 'vouchers', label: 'Vouchers & Promotions', icon: Tag },
    { key: 'collection', label: 'Collection Overview', icon: BarChart3 },
    { key: 'defaulters', label: 'Defaulters & Outstanding', icon: AlertCircle },
    { key: 'gateways', label: 'Payment Gateways', icon: CreditCard },
    { key: 'refunds', label: 'Refund & Waiver Approvals', icon: CheckCircle2, badge: waiverRequests.filter(w => w.status === 'Pending Approval').length },
    { key: 'reports', label: 'Finance Reports', icon: FileSpreadsheet }
  ]

  const handleApproveWaiver = (id) => {
    setWaiverRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'Approved' } : w))
    toast?.success?.(`Fee waiver / refund request ${id} authorized. Finance ledger credited.`)
  }

  const handleRejectWaiver = (id) => {
    setWaiverRequests(prev => prev.map(w => w.id === id ? { ...w, status: 'Rejected' } : w))
    toast?.info?.(`Fee waiver / refund request ${id} rejected.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-green-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-200 border border-white/10 mb-2">
              <Wallet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Super Administrator • Platform Financial Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Fees & Central Revenue Framework
            </h1>
            <p className="text-sm text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              Standardize fee tariffs, 1Bill / KuickPay gateways, late fine rules, scholarship quotas, and waiver approvals.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Central fee structure template editor opened')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <DollarSign className="w-4 h-4" />
            <span>Create Fee Tariff</span>
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

      {/* Tab 1: Fee Structure Templates */}
      {effectiveTab === 'structure' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary & Middle School Tariff</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">PKR 14,500 / mo</h3>
              <p className="text-xs text-slate-500 mt-1">Includes tuition, digital learning access, and basic lab subscription</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Secondary & Matric Tariff</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">PKR 18,200 / mo</h3>
              <p className="text-xs text-slate-500 mt-1">Includes science labs, model exams, and library access</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">College & Intermediate Tariff</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">PKR 22,500 / mo</h3>
              <p className="text-xs text-slate-500 mt-1">F.Sc / ICS with complete practicals, test sessions, and entry test prep</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Collection Overview */}
      {effectiveTab === 'collection' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Billed (October 2026)</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">PKR 48.6M</h3>
              <span className="text-xs text-slate-500 font-medium">Billed across 3,420 students</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Realized & Collected</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">PKR 43.1M</h3>
              <span className="text-xs text-emerald-700 font-bold">88.7% Recovery Rate</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding Dues</span>
              <h3 className="text-2xl font-black text-rose-600 mt-1">PKR 5.5M</h3>
              <span className="text-xs text-slate-500">Includes late fee surcharges</span>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Digital Gateway Share</span>
              <h3 className="text-2xl font-black text-purple-700 mt-1">74.2%</h3>
              <span className="text-xs text-slate-500">Collected via 1Bill / JazzCash</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 9: Payment Gateways */}
      {effectiveTab === 'gateways' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">National Fintech & Banking Gateways</h3>
            <p className="text-xs text-slate-500">Integrated online payment rails for automated real-time reconciliation</p>
          </div>
          <div className="divide-y divide-slate-100">
            {gateways.map((g, i) => (
              <div key={i} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                    <span className="font-bold text-slate-900 text-sm">{g.name}</span>
                    <span className="text-xs text-slate-500 font-mono">({g.type})</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Settlement: <b>{g.settlement}</b> • Merchant Fee: <b>{g.fee}</b></p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {g.status}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{g.activeCampuses}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 10: Refunds & Waivers */}
      {effectiveTab === 'refunds' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Refund & Fee Concession Approvals</h3>
            <p className="text-xs text-slate-500">Principals escalations for hardship discount or security deposit return</p>
          </div>
          <div className="divide-y divide-slate-100">
            {waiverRequests.map(w => (
              <div key={w.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">{w.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{w.student} ({w.roll})</span>
                    <span className="text-xs text-slate-500">• {w.campus}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-semibold">{w.type} &mdash; <span className="text-emerald-700">{w.requestedAmount}</span></p>
                  <p className="text-xs text-slate-500 italic">"{w.reason}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {w.status === 'Pending Approval' ? (
                    <>
                      <button 
                        onClick={() => handleApproveWaiver(w.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-500 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                      <button 
                        onClick={() => handleRejectWaiver(w.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${w.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {w.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Tab: Late Fee & Installment Rules */}
      {effectiveTab === 'late-rules' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Late Fee &amp; Fiscal Penalty Governance</h3>
              <p className="text-xs text-slate-500">Enforce standardized grace periods, daily surcharge fines, and auto-suspension thresholds across all campuses.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Opened Define New Fine Rule dialog')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define Fine Directive</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Academic Wing Scope</th>
                  <th className="py-3 px-4">Grace Period</th>
                  <th className="py-3 px-4">Daily Penalty</th>
                  <th className="py-3 px-4">Max Fine Cap</th>
                  <th className="py-3 px-4">Portal Suspension</th>
                  <th className="py-3 px-4 text-right">Directive Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lateRules.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.wing}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{r.graceDays} Days after Due Date</td>
                    <td className="py-3.5 px-4 font-mono text-purple-700 font-bold">{r.finePerDay}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{r.maxCap}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold font-mono">
                        {r.suspendDays} Days Overdue
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Installment Plans */}
      {effectiveTab === 'installments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Standard Installment Plan Templates</h3>
            <p className="text-xs text-slate-500">Provide pre-authorized installment structures for students facing temporary fiscal difficulty.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Bi-Annual (2 Split)', parts: '2 Installments (50% / 50%)', fee: '0% Surcharge', scope: 'School & College Wings', active: '184 Enrolled' },
              { name: 'Quarterly (3 Trimester Split)', parts: '3 Installments (35% / 35% / 30%)', fee: '1.5% Processing Fee', scope: 'College Wing', active: '96 Enrolled' },
              { name: 'Monthly Term Plan (10-Pay)', parts: '10 Equal Monthly Payments', fee: '3.0% Admin Surcharge', scope: 'University Degree Programs', active: '312 Enrolled' }
            ].map((p, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">{p.fee}</span>
                  <span className="text-xs font-bold text-emerald-600">{p.active}</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{p.parts}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Scope: {p.scope}</span>
                  <button onClick={() => toast?.success?.(`Applied ${p.name} template policy`)} className="text-purple-700 font-bold hover:underline cursor-pointer">Configure</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Fee Challan Templates */}
      {effectiveTab === 'challans' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Fee Challan &amp; 1Bill Voucher Templates</h3>
              <p className="text-xs text-slate-500">Central templates formatted for Pakistani commercial banks (HBL, Meezan, Alfalah) with 1Bill Consumer IDs.</p>
            </div>
            <button
              onClick={() => toast?.info?.('Previewing Standard 3-Ply Fee Challan')}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Preview 3-Ply Printout</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">3-Ply Bank Challan (National Standard)</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">Primary Default</span>
              </div>
              <p className="text-xs text-slate-600">
                Triple-pane layout: Bank Copy, Institute Finance Copy, and Student/Parent Copy with barcode and KuickPay prefix.
              </p>
              <div className="p-3 bg-white rounded-lg border border-purple-100 font-mono text-[11px] text-slate-600 space-y-1">
                <div>&bull; Biller ID: 100482 (1Bill Switch)</div>
                <div>&bull; Barcode: Code 128 / QR Verification Enabled</div>
                <div>&bull; Instruction: Payable at any 1Link Member Bank &amp; Mobile Banking Apps</div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">Digital Online Fee Receipt</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">Paperless</span>
              </div>
              <p className="text-xs text-slate-600">
                Automated PDF receipt instantly generated upon online payment confirmation via JazzCash, EasyPaisa, or KuickPay.
              </p>
              <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-600 space-y-1">
                <div>&bull; Delivery: Automatic WhatsApp + Email PDF Dispatch</div>
                <div>&bull; Security: Cryptographically Signed SHA-256 HMAC Stamp</div>
                <div>&bull; Sync: Synchronous Supabase &amp; LocalStorage Update</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Scholarships & Discount Policies */}
      {effectiveTab === 'scholarships' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Central Scholarships &amp; Concession Directives</h3>
              <p className="text-xs text-slate-500">Allocated budget: <strong>PKR 25,500,000</strong> &bull; Total active beneficiaries: <strong>412 Students</strong>.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Opened Add Scholarship Category modal')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Scholarship Quota</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Merit Excellence (85%+)', waiver: '50% Tuition Waiver', quota: '120 Seats', budget: 'PKR 8.4M' },
              { title: 'Need-Based Hardship', waiver: 'Up to 100% Waiver', quota: '80 Seats', budget: 'PKR 6.5M' },
              { title: 'Kinship / Sibling Discount', waiver: '25% for 2nd Child', quota: '300 Seats', budget: 'PKR 7.2M' },
              { title: 'Faculty & Staff Children', waiver: '75% Tuition Waiver', quota: '50 Seats', budget: 'PKR 3.4M' }
            ].map((sc, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <span className="font-bold text-slate-900 text-xs block">{sc.title}</span>
                <span className="text-xs font-extrabold text-purple-700 block">{sc.waiver}</span>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{sc.quota}</span>
                  <span className="font-mono">{sc.budget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Vouchers & Promotions */}
      {effectiveTab === 'vouchers' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Promotional &amp; Admission Voucher Codes</h3>
              <p className="text-xs text-slate-500">Discount coupons applied by applicants on the online admission portal or student fee payments.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Voucher creation modal initiated.')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Coupon Code</th>
                  <th className="py-3 px-4">Discount Value</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Usage &amp; Claim Limit</th>
                  <th className="py-3 px-4">Expiration Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vouchersList.map(v => (
                  <tr key={v.code} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-purple-700">{v.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{v.discount}</td>
                    <td className="py-3 px-4 text-slate-600">{v.type}</td>
                    <td className="py-3 px-4 font-mono">{v.claimed} / {v.maxLimit} Claimed</td>
                    <td className="py-3 px-4 text-slate-500">{v.expires}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Defaulters & Outstanding */}
      {effectiveTab === 'defaulters' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Cross-Campus Fee Defaulters &amp; Arrears Tracker</h3>
              <p className="text-xs text-slate-500">Track aging brackets (30, 60, 90+ days) and trigger automated SMS payment demands.</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={defaulterSearch}
                onChange={(e) => setDefaulterSearch(e.target.value)}
                className="p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-purple-500 w-48"
              />
              <button
                onClick={() => toast?.success?.('Dispatched payment reminder SMS to 4 overdue accounts!')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Broadcast Overdue SMS</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Student &amp; Roll</th>
                  <th className="py-3 px-4">Campus &amp; Wing</th>
                  <th className="py-3 px-4">Outstanding (PKR)</th>
                  <th className="py-3 px-4">Aging Duration</th>
                  <th className="py-3 px-4">Parent Phone</th>
                  <th className="py-3 px-4 text-right">Escalation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {defaultersList
                  .filter(d => {
                    if (!defaulterSearch) return true;
                    const q = defaulterSearch.toLowerCase();
                    return d.student.toLowerCase().includes(q) || d.roll.toLowerCase().includes(q) || d.campus.toLowerCase().includes(q);
                  })
                  .map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{d.student}</div>
                        <span className="font-mono text-[10px] text-purple-700">{d.roll}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">{d.campus}</div>
                        <span className="text-[10px] text-slate-400">{d.wing} Wing</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{d.amount}</td>
                      <td className="py-3.5 px-4 font-mono font-medium">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${d.days > 60 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                          {d.days} Days Overdue
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{d.contact}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Central Finance & Revenue Reports */}
      {effectiveTab === 'reports' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Central Fiscal Realization &amp; Revenue Reports</h3>
              <p className="text-xs text-slate-500">Cross-campus collection performance and national banking switch settlement audit.</p>
            </div>
            <button
              onClick={handleExportFeesReport}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Invoiced (PKR)', value: '148.5M', change: '+8.4% vs Last Term' },
              { title: 'Total Realized (PKR)', value: '136.2M', change: '91.7% Recovery Rate' },
              { title: 'Pending Arrears (PKR)', value: '12.3M', change: '8.3% Outstanding' },
              { title: 'Average Challan Size', value: 'PKR 28,450', change: 'Across All Tiers' }
            ].map((st, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">{st.title}</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1">{st.value}</span>
                <span className="text-[11px] text-purple-600 font-bold block mt-0.5">{st.change}</span>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Campus Collection Ranking</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Campus Name</th>
                    <th className="py-3 px-4">Invoiced (PKR)</th>
                    <th className="py-3 px-4">Collected (PKR)</th>
                    <th className="py-3 px-4">Outstanding (PKR)</th>
                    <th className="py-3 px-4 text-right">Recovery Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { name: 'Beaconhouse Central High', inv: 'PKR 48.5M', col: 'PKR 45.2M', out: 'PKR 3.3M', rate: '93.2%' },
                    { name: 'The City School Senior Branch', inv: 'PKR 42.1M', col: 'PKR 38.9M', out: 'PKR 3.2M', rate: '92.4%' },
                    { name: 'Lahore Grammar Model Town', inv: 'PKR 31.2M', col: 'PKR 28.5M', out: 'PKR 2.7M', rate: '91.3%' },
                    { name: 'Army Public School & College', inv: 'PKR 26.7M', col: 'PKR 23.6M', out: 'PKR 3.1M', rate: '88.4%' }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{row.name}</td>
                      <td className="py-3.5 px-4 font-mono">{row.inv}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{row.col}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-700">{row.out}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-purple-700">{row.rate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperadminFeesView
