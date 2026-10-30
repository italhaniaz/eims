import React, { useState } from 'react'
import { 
  Building2, 
  BarChart3, 
  CheckSquare, 
  RefreshCw, 
  DollarSign, 
  Receipt, 
  FileSpreadsheet, 
  ShieldCheck, 
  Search, 
  Check, 
  X, 
  Download,
  PieChart,
  TrendingUp,
  CreditCard
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminAccountsView = ({ activeTab = 'chart', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'chart'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Expense budget approvals
  const [budgetRequests, setBudgetRequests] = useState([
    { id: 'BGT-501', campus: 'Beaconhouse Central High', category: 'Capital Expenditure', item: 'Computer Lab Upgrade (30 i7 Workstations)', amount: 'PKR 2,400,000', requestedBy: 'Campus Principal', status: 'Pending Approval' },
    { id: 'BGT-502', campus: 'City School Senior Branch', category: 'Operational Expense', item: 'Annual Generator Overhaul & Solar Maintenance', amount: 'PKR 450,000', requestedBy: 'Facilities Manager', status: 'Approved' }
  ])

  // Chart of accounts heads
  const [chartHeads] = useState([
    { code: '1000-ASSETS', name: 'Non-Current & Current Assets', balance: 'PKR 142.5M', type: 'Asset' },
    { code: '2000-LIABILITIES', name: 'Accounts Payable & Caution Money', balance: 'PKR 18.2M', type: 'Liability' },
    { code: '3000-EQUITY', name: 'Trust Endowment & Retained Surplus', balance: 'PKR 124.3M', type: 'Equity' },
    { code: '4000-REVENUE', name: 'Student Tuition & Examination Fees', balance: 'PKR 218.4M', type: 'Revenue' },
    { code: '5000-EXPENSES', name: 'Faculty Salaries & Infrastructure Utilities', balance: 'PKR 164.8M', type: 'Expense' }
  ])

  const tabsConfig = [
    { key: 'chart', label: 'Chart of Accounts & Ledger', icon: FileSpreadsheet },
    { key: 'overview', label: 'Income & Expense Overview', icon: BarChart3 },
    { key: 'budgets', label: 'Budgets & Expense Approvals', icon: CheckSquare, badge: budgetRequests.filter(b => b.status === 'Pending Approval').length },
    { key: 'reconciliation', label: 'Bank & Payment Reconciliation', icon: RefreshCw },
    { key: 'payroll', label: 'Payroll Summary', icon: DollarSign },
    { key: 'tax', label: 'Tax & Receipt Settings', icon: Receipt },
    { key: 'statements', label: 'Financial Statements', icon: TrendingUp }
  ]

  const handleApproveBudget = (id) => {
    setBudgetRequests(prev => prev.map(b => b.id === id ? { ...b, status: 'Approved' } : b))
    toast?.success?.(`Budget disbursement ${id} approved. Funds released to campus account.`)
  }

  const handleRejectBudget = (id) => {
    setBudgetRequests(prev => prev.map(b => b.id === id ? { ...b, status: 'Rejected' } : b))
    toast?.info?.(`Budget request ${id} rejected.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-200 border border-white/10 mb-2">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Super Administrator • Central Accounting & Audit Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Accounts & Fiscal Operations
            </h1>
            <p className="text-sm text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Consolidated chart of accounts, campus P&L statements, multi-million payroll disbursement, and FBR tax governance.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Trial Balance generator initiated for current fiscal quarter')}
            className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Generate Trial Balance</span>
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
                    ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-white text-blue-900' : 'bg-blue-100 text-blue-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Chart of Accounts */}
      {effectiveTab === 'chart' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Standard Chart of Accounts (COA)</h3>
                <p className="text-xs text-slate-500">Master general ledger accounts enforced across all branch institutes</p>
              </div>
            </div>
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                <tr>
                  <th className="p-4">Account Code</th>
                  <th className="p-4">Account Head Name</th>
                  <th className="p-4">Classification</th>
                  <th className="p-4">Current Net Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {chartHeads.map((ch, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-blue-700">{ch.code}</td>
                    <td className="p-4 font-bold text-slate-900">{ch.name}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {ch.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{ch.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Budgets & Approvals */}
      {effectiveTab === 'budgets' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Campus Expense & Capex Approvals</h3>
            <p className="text-xs text-slate-500">Major purchase and infrastructure repair requests above campus threshold</p>
          </div>
          <div className="divide-y divide-slate-100">
            {budgetRequests.map(b => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">{b.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{b.item}</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Campus: <b>{b.campus}</b> • Head: <b>{b.category}</b> &bull; Requested by: {b.requestedBy}
                  </p>
                  <p className="text-sm font-black text-emerald-700">{b.amount}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {b.status === 'Pending Approval' ? (
                    <>
                      <button 
                        onClick={() => handleApproveBudget(b.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-500 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Capex</span>
                      </button>
                      <button 
                        onClick={() => handleRejectBudget(b.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {b.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for other tabs */}
      {['overview', 'reconciliation', 'payroll', 'tax', 'statements'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Matrix</h3>
          <p className="text-xs text-slate-500">Automated double-entry ledger summaries and external audit exports.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Reconciles automatically with registered commercial bank feeds (Habib Bank, Meezan Bank, Bank Alfalah).
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAccountsView
