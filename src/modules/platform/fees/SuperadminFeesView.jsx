import React, { useState } from 'react'
import { 
  DollarSign, 
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

      {/* Fallback for other tabs */}
      {['late-rules', 'installments', 'challans', 'scholarships', 'vouchers', 'defaulters', 'reports'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Policy Directives</h3>
          <p className="text-xs text-slate-500">Centralized directives enforce uniform fiscal discipline across all campus branches.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Rules configured here sync directly to the student portal and online fee challan printouts.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminFeesView
