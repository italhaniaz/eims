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
  CreditCard,
  CheckCircle
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminAccountsView = ({ activeTab = 'chart', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const handleExportFinancialStatement = () => {
    try {
      const csv = 'Account Category,FY 2025-2026 (PKR),FY 2024-2025 (PKR),Variance\nTuition Fee Revenue,148500000,132000000,+12.5%\nAcademic Services & Lab Fees,18200000,16500000,+10.3%\nFaculty Payroll Expenses,-68400000,-62000000,+10.3%\nAdministrative Salaries,-18500000,-17200000,+7.5%\nCampus Infrastructure & Lease,-12400000,-11800000,+5.1%\nUtilities & Operational Overheads,-9200000,-8600000,+6.9%\nNet Operating Surplus,58200000,48900000,+19.0%'
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Consolidated_Financial_Statement_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      toast?.success?.('Audited financial statement exported to CSV!')
    } catch {
      toast?.error?.('Export failed')
    }
  }

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


      {/* Tab: Income & Expense Overview */}
      {effectiveTab === 'overview' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Campus Operational Income vs. Expenditure</h3>
              <p className="text-xs text-slate-500">Double-entry accounting aggregates across faculty payroll, campus lease, utilities, and tuition income.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Fiscal Year: <strong className="text-slate-800">2025-2026</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Gross Tuition Income', value: 'PKR 148.5M', sub: '91.7% Realized', positive: true },
              { title: 'Faculty & Staff Payroll', value: 'PKR 68.4M', sub: '46.0% of Revenue', positive: false },
              { title: 'Campus Infrastructure & OpEx', value: 'PKR 29.8M', sub: '20.1% of Revenue', positive: false },
              { title: 'Net Operational Surplus', value: 'PKR 50.3M', sub: '33.9% Net Margin', positive: true }
            ].map((k, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">{k.title}</span>
                <span className="text-xl font-extrabold text-slate-900 block mt-1">{k.value}</span>
                <span className={`text-[11px] font-bold block mt-0.5 ${k.positive ? 'text-emerald-700' : 'text-purple-700'}`}>{k.sub}</span>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Affiliated Campus</th>
                  <th className="py-3 px-4">Tuition Income (PKR)</th>
                  <th className="py-3 px-4">Staff Payroll (PKR)</th>
                  <th className="py-3 px-4">Campus Utilities (PKR)</th>
                  <th className="py-3 px-4">Net Surplus (PKR)</th>
                  <th className="py-3 px-4 text-right">Operating Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { campus: 'Beaconhouse Central High', rev: 'PKR 48.5M', pay: 'PKR 21.2M', utl: 'PKR 7.4M', net: 'PKR 19.9M', margin: '41.0%' },
                  { campus: 'The City School Senior Branch', rev: 'PKR 42.1M', pay: 'PKR 19.5M', utl: 'PKR 6.8M', net: 'PKR 15.8M', margin: '37.5%' },
                  { campus: 'Lahore Grammar Model Town', rev: 'PKR 31.2M', pay: 'PKR 14.8M', utl: 'PKR 5.2M', net: 'PKR 11.2M', margin: '35.9%' },
                  { campus: 'Army Public School & College', rev: 'PKR 26.7M', pay: 'PKR 12.9M', utl: 'PKR 4.6M', net: 'PKR 9.2M', margin: '34.4%' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.campus}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{row.rev}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.pay}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{row.utl}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{row.net}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">{row.margin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Bank & Payment Reconciliation */}
      {effectiveTab === 'reconciliation' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Commercial Bank &amp; IPG Settlement Reconciliation</h3>
              <p className="text-xs text-slate-500">Live feeds from Habib Bank, Meezan Bank, KuickPay, and 1Bill National Switch. Match rate: <strong>99.4%</strong>.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Executed automated reconciliation: 1,482 transactions reconciled!')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Auto-Reconcile Live Batch</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Settlement Channel</th>
                  <th className="py-3 px-4">Batch ID &amp; Date</th>
                  <th className="py-3 px-4">Bank Statement (PKR)</th>
                  <th className="py-3 px-4">EIMS Ledger (PKR)</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4 text-right">Reconciliation State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { channel: 'Habib Bank Ltd (HBL)', batch: 'HBL-REC-8841 (Today)', bank: 'PKR 14,250,000', ledger: 'PKR 14,250,000', var: 'PKR 0.00', status: 'Reconciled (100%)' },
                  { channel: 'Meezan Bank Islamic IPG', batch: 'MEZ-REC-3320 (Today)', bank: 'PKR 9,840,000', ledger: 'PKR 9,840,000', var: 'PKR 0.00', status: 'Reconciled (100%)' },
                  { channel: '1Bill National Switch', batch: '1BILL-REC-1192 (Yesterday)', bank: 'PKR 21,500,000', ledger: 'PKR 21,485,000', var: 'PKR 15,000 (Fee Adj)', status: 'Matched with Surcharge' },
                  { channel: 'KuickPay IPG', batch: 'KP-REC-0091 (Yesterday)', bank: 'PKR 6,320,000', ledger: 'PKR 6,320,000', var: 'PKR 0.00', status: 'Reconciled (100%)' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.channel}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">{row.batch}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{row.bank}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{row.ledger}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">{row.var}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Payroll Summary */}
      {effectiveTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Central Faculty &amp; Staff Payroll Register</h3>
              <p className="text-xs text-slate-500">Monthly salary disbursement batches, tax deductions (WHT), and bank transfer approvals.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Current month payroll batch approved and scheduled for bank disbursement!')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Approve Central Payroll Batch</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Campus Name</th>
                  <th className="py-3 px-4">Staff Count</th>
                  <th className="py-3 px-4">Gross Salary (PKR)</th>
                  <th className="py-3 px-4">Income Tax (WHT)</th>
                  <th className="py-3 px-4">Net Disbursement (PKR)</th>
                  <th className="py-3 px-4 text-right">Disbursement Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { campus: 'Beaconhouse Central High', count: 184, gross: 'PKR 14,800,000', tax: 'PKR 1,420,000', net: 'PKR 13,380,000', status: 'Disbursed' },
                  { campus: 'The City School Senior Branch', count: 142, gross: 'PKR 11,200,000', tax: 'PKR 1,080,000', net: 'PKR 10,120,000', status: 'Disbursed' },
                  { campus: 'Lahore Grammar Model Town', count: 98, gross: 'PKR 7,800,000', tax: 'PKR 720,000', net: 'PKR 7,080,000', status: 'Approved for Pay' },
                  { campus: 'Army Public School & College', count: 115, gross: 'PKR 9,400,000', tax: 'PKR 890,000', net: 'PKR 8,510,000', status: 'Verification Pending' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.campus}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{row.count} Employees</td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">{row.gross}</td>
                    <td className="py-3.5 px-4 font-mono text-rose-700 font-bold">{row.tax}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">{row.net}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${row.status === 'Disbursed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Tax & Receipt Settings */}
      {effectiveTab === 'tax' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">FBR Tax Directives &amp; Receipt Configuration</h3>
            <p className="text-xs text-slate-500">Withholding tax regulations under Federal Board of Revenue (FBR) Section 236I and Section 149 payroll rules.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Section 236I Advance Tax on Tuition Fees</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Non-Filer Parent Penalty Rate:</span>
                  <span className="font-mono font-bold text-rose-700">5.0% on fee &gt; PKR 200,000</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Active Filer Rate:</span>
                  <span className="font-mono font-bold text-emerald-700">0.0% (Exempt with valid NTN/CNIC)</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">National Tax Number (NTN) Central Registry</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Central Platform NTN:</span>
                  <span className="font-mono font-bold text-purple-700">7489201-4</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white rounded-lg border border-slate-200">
                  <span>Withholding Agent Status:</span>
                  <span className="font-bold text-emerald-700">Active &amp; Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Financial Statements */}
      {effectiveTab === 'statements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Consolidated Financial Statements &amp; Audit P&amp;L</h3>
              <p className="text-xs text-slate-500">Official Balance Sheet, Income Statement, and Cash Flow statement ready for external auditor review.</p>
            </div>
            <button
              onClick={handleExportFinancialStatement}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Audited Statement (CSV)</span>
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Consolidated Platform Income Statement (P&amp;L Summary)</h4>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700">Total Tuition &amp; Academic Revenue:</span>
                <span className="font-bold text-slate-900">PKR 148,500,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span className="text-slate-700">Academic Ancillary Services &amp; Lab Levies:</span>
                <span className="font-bold text-slate-900">PKR 18,200,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                <span>Total Academic &amp; Administrative Staff Payroll:</span>
                <span>(PKR 68,400,000)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 text-rose-700">
                <span>Campus Infrastructure Leases &amp; Operations:</span>
                <span>(PKR 29,800,000)</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-sm text-emerald-700 border-t-2 border-slate-300">
                <span>Net Operational Surplus:</span>
                <span>PKR 68,500,000</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperadminAccountsView
