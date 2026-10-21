import React, { useState } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Send, 
  Download, 
  School, 
  CreditCard,
  Receipt,
  ArrowUpRight
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'

export const FinancialAnalyticsView = () => {
  const { institutes, fees, students, sendCommunicationBlast } = useAppData()
  const [reminderSent, setReminderSent] = useState(false)

  // Calculations across all registered fees
  const totalBilled = fees.reduce((sum, f) => sum + Number(f.amount || 0), 0)
  const totalCollected = fees
    .filter(f => f.status === 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)
  const totalPending = fees
    .filter(f => f.status !== 'Paid')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0)
  
  const recoveryRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0
  const defaultersCount = fees.filter(f => f.status !== 'Paid').length

  const handleSendReminderBlast = () => {
    sendCommunicationBlast({
      channel: 'SMS & WhatsApp',
      recipientGroup: 'Fee Defaulters Parents',
      message: 'Dear Parent, this is an automated reminder regarding pending tuition fees dues. Please deposit at your earliest.'
    })
    setReminderSent(true)
    setTimeout(() => setReminderSent(false), 4000)
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Campus Financial & Revenue Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">Global fee collection analytics, revenue reconciliation, and campus fee recovery rates</p>
        </div>

        <button
          onClick={handleSendReminderBlast}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Blast Fee Reminder to Defaulters</span>
        </button>
      </div>

      {reminderSent && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Automated fee reminder blast dispatched to {defaultersCount} parents via SMS/WhatsApp!
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Fees Invoiced</span>
            <Receipt className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">Rs. {totalBilled.toLocaleString()}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Across all academic sessions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Realized Collection</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-mono">Rs. {totalCollected.toLocaleString()}</p>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Deposited in verified accounts</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Outstanding Dues</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-mono">Rs. {totalPending.toLocaleString()}</p>
          <span className="text-[11px] text-amber-600 font-semibold mt-1 block">{defaultersCount} pending challans</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Overall Recovery Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{recoveryRate}%</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${recoveryRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* Campus Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Campus-Wise Revenue & Fee Reconciliation</h3>
            <p className="text-xs text-slate-400">Institutional recovery breakdown by registered campus</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {institutes.length} Campuses Monitored
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[650px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Campus / Institute</th>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Total Billed</th>
                <th className="px-6 py-4">Collected</th>
                <th className="px-6 py-4">Outstanding</th>
                <th className="px-6 py-4">Recovery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutes.length > 0 ? (
                institutes.map(inst => {
                  const instFees = fees.filter(f => f.instituteId === inst.id)
                  const billed = instFees.reduce((s, f) => s + Number(f.amount || 0), 0)
                  const collected = instFees.filter(f => f.status === 'Paid').reduce((s, f) => s + Number(f.amount || 0), 0)
                  const pending = billed - collected
                  const rate = billed > 0 ? Math.round((collected / billed) * 100) : 100

                  return (
                    <tr key={inst.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-2.5">
                        <School className="w-4 h-4 text-emerald-600" />
                        <span>{inst.name}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{inst.code}</td>
                      <td className="px-6 py-4 font-mono text-xs font-semibold">Rs. {billed.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-emerald-700">Rs. {collected.toLocaleString()}</td>
                      <td className="px-6 py-4 font-mono text-xs font-bold text-amber-700">Rs. {pending.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <DollarSign className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No Campus Financial Records Found</p>
                    <p className="text-xs text-slate-400 mt-1">Register campuses and generate fee vouchers to view live financial collection analytics.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default FinancialAnalyticsView
