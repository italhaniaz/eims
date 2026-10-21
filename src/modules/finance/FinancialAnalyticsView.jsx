import React, { useState, useMemo } from 'react'
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
  ArrowUpRight,
  Search,
  Filter,
  Printer,
  Check,
  PhoneCall,
  Clock,
  UserX,
  FileWarning
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import Modal from '../../components/common/Modal'

export const FinancialAnalyticsView = () => {
  const { institutes = [], fees = [], students = [], updateItem, sendCommunicationBlast } = useAppData()
  const { toast } = useToast()

  const [reminderSent, setReminderSent] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [selectedNoticeChallan, setSelectedNoticeChallan] = useState(null)
  const [remindedList, setRemindedList] = useState({})

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
    toast.success(`Automated fee reminder blast dispatched to ${defaultersCount} parents!`)
    setTimeout(() => setReminderSent(false), 4000)
  }

  // 1-Click single student reminder
  const handleSingleReminder = (fee) => {
    setRemindedList(prev => ({ ...prev, [fee.id]: true }))
    toast.success(`Fee reminder SMS dispatched to ${fee.studentName}'s guardian!`)
  }

  // 1-Click Cashier Instant Settlement
  const handleInstantCollect = async (fee) => {
    await updateItem('fees', fee.id, {
      status: 'Paid',
      paymentDate: new Date().toISOString().split('T')[0]
    })
    toast.success(`Payment of Rs. ${Number(fee.amount).toLocaleString()} collected for ${fee.studentName}!`)
  }

  // Defaulters List with filtering
  const defaultersList = useMemo(() => {
    return fees
      .filter(f => f.status !== 'Paid')
      .filter(f => {
        if (selectedCampus !== 'all' && f.instituteId !== selectedCampus) return false
        if (selectedClass !== 'all' && f.className !== selectedClass) return false
        if (!searchTerm) return true
        const term = searchTerm.toLowerCase()
        return (
          f.studentName?.toLowerCase().includes(term) ||
          f.rollNumber?.toLowerCase().includes(term) ||
          f.className?.toLowerCase().includes(term) ||
          String(f.id).toLowerCase().includes(term)
        )
      })
  }, [fees, selectedCampus, selectedClass, searchTerm])

  const totalFilteredPending = defaultersList.reduce((sum, f) => sum + Number(f.amount || 0), 0)

  // Unique classes for filter
  const availableClasses = useMemo(() => {
    const set = new Set(fees.map(f => f.className).filter(Boolean))
    return Array.from(set)
  }, [fees])

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Multi-Campus Financial & Revenue Intelligence</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global fee collection analytics, revenue reconciliation, fee recovery rates, and interactive defaulters ledger
          </p>
        </div>

        <button
          onClick={handleSendReminderBlast}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Blast Fee Reminder to All Defaulters</span>
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

      {/* Actionable Overdue Fee Defaulters Roster */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-rose-500" />
              <h3 className="text-base font-bold text-slate-900">Overdue Fee Defaulters Action Center</h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Targeted recovery ledger with instant SMS reminders, counter fee collection, and printable demand notices
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold px-3 py-1 bg-rose-50 text-rose-700 rounded-lg border border-rose-200">
              Rs. {totalFilteredPending.toLocaleString()} Overdue ({defaultersList.length} Students)
            </span>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search defaulter by student name, roll number, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCampus}
              onChange={(e) => setSelectedCampus(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Campuses</option>
              {institutes.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>

            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none"
            >
              <option value="all">All Grades / Classes</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Defaulters Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-5 py-3">Roll No</th>
                <th className="px-5 py-3">Student Name</th>
                <th className="px-5 py-3">Campus / Class</th>
                <th className="px-5 py-3">Due Date</th>
                <th className="px-5 py-3">Outstanding Dues</th>
                <th className="px-5 py-3 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {defaultersList.length > 0 ? (
                defaultersList.map(fee => {
                  const inst = institutes.find(i => i.id === fee.instituteId)
                  const student = students.find(s => s.rollNumber === fee.rollNumber || s.name === fee.studentName)
                  const phone = student?.phone || '+92 321 8899000'
                  const isReminded = remindedList[fee.id]

                  return (
                    <tr key={fee.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3 font-mono font-bold text-slate-700">{fee.rollNumber || 'STD-000'}</td>
                      <td className="px-5 py-3 font-bold text-slate-900">{fee.studentName}</td>
                      <td className="px-5 py-3">
                        <span className="font-semibold text-slate-700 block">{fee.className || 'General'}</span>
                        <span className="text-[10px] text-slate-400 block">{inst?.name || 'Main Campus'}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Due: {fee.dueDate || '2026-10-25'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3 font-mono font-bold text-rose-600 text-sm">
                        Rs. {Number(fee.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleSingleReminder(fee)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                            isReminded 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          }`}
                          title="Dispatch SMS Reminder"
                        >
                          {isReminded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Send className="w-3.5 h-3.5 text-blue-600" />}
                          <span>{isReminded ? 'Reminded ✓' : 'Send SMS'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedNoticeChallan({ fee, student, inst })}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                          title="Print Formal Fee Recovery Demand Notice"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Demand Notice</span>
                        </button>

                        <button
                          onClick={() => handleInstantCollect(fee)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
                          title="Instant Counter Collection"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Collect</span>
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">Zero Fee Defaulters Found!</p>
                    <p className="text-xs text-slate-400 mt-0.5">All registered fee vouchers for the selected scope have been collected and verified.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Official Demand Notice Modal */}
      {selectedNoticeChallan && (
        <Modal
          isOpen={Boolean(selectedNoticeChallan)}
          onClose={() => setSelectedNoticeChallan(null)}
          title="Official Fee Overdue Recovery Demand Notice"
        >
          <div className="space-y-4">
            <div 
              id="printable-demand-notice" 
              className="p-6 bg-white border-2 border-slate-300 rounded-2xl space-y-4 print:border-black"
            >
              {/* Letterhead */}
              <div className="text-center border-b pb-4">
                <School className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <h3 className="text-base font-black uppercase tracking-wider text-slate-900">
                  {selectedNoticeChallan.inst?.name || 'CENTRAL HIGH SCHOOL'}
                </h3>
                <p className="text-xs text-slate-500">Accounts & Bursar Department • Fee Recovery Cell</p>
                <span className="inline-block mt-2 font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 uppercase tracking-widest">
                  FINAL OVERDUE REMINDER NOTICE
                </span>
              </div>

              {/* Student & Notice Info */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div><span className="text-slate-400">Student Name:</span> <strong className="text-slate-800">{selectedNoticeChallan.fee.studentName}</strong></div>
                <div><span className="text-slate-400">Roll Number:</span> <strong className="text-slate-800 font-mono">{selectedNoticeChallan.fee.rollNumber}</strong></div>
                <div><span className="text-slate-400">Grade / Class:</span> <strong className="text-slate-800">{selectedNoticeChallan.fee.className}</strong></div>
                <div><span className="text-slate-400">Due Date:</span> <strong className="text-rose-600 font-bold">{selectedNoticeChallan.fee.dueDate}</strong></div>
              </div>

              {/* Notice Body */}
              <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                <p><strong>Dear Parent / Guardian,</strong></p>
                <p>
                  This is an urgent formal notification from the Accounts Department. Our institutional audit indicates that the tuition fee dues amounting to <strong className="text-rose-600 font-mono">Rs. {Number(selectedNoticeChallan.fee.amount).toLocaleString()}</strong> remain overdue past the specified deadline.
                </p>
                <p>
                  To prevent interruption of academic records, examination roll-number slips, and LMS access, please ensure the settlement of the outstanding dues at the campus fee counter or via online institutional banking on or before the due date.
                </p>
              </div>

              {/* Dues Breakdown */}
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Total Outstanding Net Dues:</span>
                <span className="font-mono text-base font-black text-rose-700">
                  Rs. {Number(selectedNoticeChallan.fee.amount).toLocaleString()}
                </span>
              </div>

              {/* Signatures */}
              <div className="flex justify-between pt-8 text-[11px] text-slate-400 border-t">
                <span>Accounts Officer</span>
                <span>Bursar & Finance Controller</span>
                <span>Campus Principal Seal</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedNoticeChallan(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Demand Notice (PDF)</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default FinancialAnalyticsView
