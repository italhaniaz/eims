import React, { useState, useEffect, useMemo } from 'react'
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle,
  Edit2,
  Trash2,
  Send,
  Calendar,
  Layers,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { BillingService } from '../../../services/billingService'

const SubscriptionsBillingView = () => {
  const [activeTab, setActiveTab] = useState('subscriptions') // 'subscriptions', 'plans', 'invoices'
  const [overview, setOverview] = useState(null)
  const [plans, setPlans] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  // Modals & Forms
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    tier: 'Basic',
    pricePKR: 20000,
    billingCycle: 'monthly',
    maxStudents: 1000,
    maxCampuses: 2,
    maxUsers: 50,
    storageGB: 5,
    features: ['students', 'fees', 'exams']
  })

  // Delete plan confirm modal
  const [planToDelete, setPlanToDelete] = useState(null)

  // Feedback Toast
  const [actionToast, setActionToast] = useState(null)

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async () => {
    setLoading(true)
    try {
      const [ov, p, s, inv] = await Promise.all([
        BillingService.getBillingOverview(),
        BillingService.getPlans(),
        BillingService.getSubscriptions(),
        BillingService.getInvoices()
      ])
      setOverview(ov)
      setPlans(p)
      setSubscriptions(s)
      setInvoices(inv)
    } catch (err) {
      console.error('Failed loading billing data:', err)
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  // --- Plan Actions ---
  const handleOpenCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm({
      name: '',
      tier: 'Basic',
      pricePKR: 20000,
      billingCycle: 'monthly',
      maxStudents: 1000,
      maxCampuses: 2,
      maxUsers: 50,
      storageGB: 5,
      features: ['students', 'fees', 'exams']
    })
    setIsPlanModalOpen(true)
  }

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan)
    setPlanForm({
      name: plan.name || '',
      tier: plan.tier || 'Basic',
      pricePKR: plan.pricePKR || 20000,
      billingCycle: plan.billingCycle || 'monthly',
      maxStudents: plan.maxStudents || 1000,
      maxCampuses: plan.maxCampuses || 1,
      maxUsers: plan.maxUsers || 25,
      storageGB: plan.storageGB || 2,
      features: Array.isArray(plan.features) ? plan.features : ['students', 'fees']
    })
    setIsPlanModalOpen(true)
  }

  const handleSavePlan = async (e) => {
    e.preventDefault()
    if (!planForm.name || !planForm.pricePKR) return

    const payload = editingPlan ? { ...planForm, id: editingPlan.id } : { ...planForm }
    await BillingService.savePlan(payload)
    setIsPlanModalOpen(false)
    fetchBillingData()
    showToast(editingPlan ? `Plan "${planForm.name}" updated successfully.` : `New plan "${planForm.name}" published.`)
  }

  const handleDeletePlan = async () => {
    if (!planToDelete) return
    await BillingService.deletePlan(planToDelete.id)
    setPlanToDelete(null)
    fetchBillingData()
    showToast(`Plan decommissioned successfully.`)
  }

  // --- Subscription Actions ---
  const handleRenewSubscription = async (id) => {
    await BillingService.renewSubscription(id)
    fetchBillingData()
    showToast(`Subscription cycle renewed for 1 month.`)
  }

  const handleExtendTrial = async (id) => {
    await BillingService.extendTrial(id)
    fetchBillingData()
    showToast(`14-day trial extension granted successfully.`)
  }

  // --- Invoice Actions ---
  const handleMarkPaid = async (id) => {
    await BillingService.markInvoicePaid(id)
    fetchBillingData()
    showToast(`Invoice recorded as PAID in PKR ledger.`)
  }

  const handleSendReminder = async (id) => {
    await BillingService.sendPaymentReminder(id)
    showToast(`Automated payment collection reminder dispatched to institute administrator.`)
  }

  // Filtered Subscriptions
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchSearch = sub.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || sub.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [subscriptions, searchQuery, statusFilter])

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchSearch = inv.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [invoices, searchQuery, statusFilter])

  if (loading) {
    return (
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-medium text-slate-500">Loading multi-campus billing ledgers & subscription quotas...</p>
        </div>
      </div>
    )
  }

  const overdueInvoices = invoices.filter(i => i.status === 'OVERDUE')

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {actionToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{actionToast}</span>
          </div>
          <button onClick={() => setActionToast(null)} className="text-xs text-emerald-700 underline font-medium cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-[#1b253d] to-[#151f38] text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 text-blue-400 font-semibold text-xs uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4" />
            Platform Monetization & Plan Governance
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Subscriptions & Revenue Operations</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
            SaaS subscription tiers, multi-campus invoicing ledger, automated trial governance, and platform revenue metrics in PKR.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreatePlan}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Plan</span>
          </button>
        </div>
      </div>

      {/* Overdue Invoices Alert Banner */}
      {overdueInvoices.length > 0 && (
        <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-rose-900 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Outstanding Invoices Alert</h4>
              <p className="text-xs text-rose-700">
                There are {overdueInvoices.length} overdue invoices requiring immediate payment reminder dispatch.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              overdueInvoices.forEach(i => BillingService.sendPaymentReminder(i.id))
              showToast(`Dispatched payment reminders for ${overdueInvoices.length} overdue invoices.`)
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors cursor-pointer shrink-0"
          >
            Dispatch Reminders
          </button>
        </div>
      )}

      {/* Platform Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={DollarSign}
          label="Monthly Recurring Revenue"
          value={`PKR ${(overview?.mrrPKR || 0).toLocaleString()}`}
          change="Live platform MRR"
          color="emerald"
        />
        <StatCard
          icon={TrendingUp}
          label="Annual Run Rate (ARR)"
          value={`PKR ${(overview?.arrPKR || 0).toLocaleString()}`}
          change="Projected annual revenue"
          color="blue"
        />
        <StatCard
          icon={CreditCard}
          label="Active Subscriptions"
          value={`${overview?.activeCount || 0} Institutes`}
          change={`${overview?.trialCount || 0} active trial(s)`}
          color="indigo"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue Invoices"
          value={overview?.overdueInvoicesCount || 0}
          change="Pending collection"
          color="amber"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => {
              setActiveTab('subscriptions')
              setStatusFilter('ALL')
            }}
            className={`py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Institute Subscriptions ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('plans')
            }}
            className={`py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'plans'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subscription Plans ({plans.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('invoices')
              setStatusFilter('ALL')
            }}
            className={`py-3 text-sm font-medium border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'invoices'
                ? 'border-blue-600 text-blue-600 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Invoices & Ledger ({invoices.length})</span>
          </button>
        </nav>
      </div>

      {/* TAB 1: INSTITUTE SUBSCRIPTIONS */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'ACTIVE', 'TRIAL', 'OVERDUE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Subscriptions' : status}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search institute or plan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Institute</th>
                    <th className="py-3.5 px-4">Current Plan</th>
                    <th className="py-3.5 px-4">Cycle & Price</th>
                    <th className="py-3.5 px-4">Renewal Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{sub.instituteName}</div>
                        <div className="text-[11px] text-slate-400">ID: {sub.instituteId.slice(0, 8)}...</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800">{sub.planName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        ₨ {sub.pricePKR?.toLocaleString()} / {sub.billingCycle}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.renewalDate}</span>
                        </div>
                        {sub.status === 'TRIAL' && (
                          <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">
                            Trial ends: {sub.trialEndsAt || sub.renewalDate}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sub.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.status === 'TRIAL'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status === 'TRIAL' && (
                            <button
                              onClick={() => handleExtendTrial(sub.id)}
                              className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 font-medium transition-colors cursor-pointer"
                              title="Add 14 days to trial"
                            >
                              Extend Trial
                            </button>
                          )}
                          <button
                            onClick={() => handleRenewSubscription(sub.id)}
                            className="px-2.5 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-medium transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Renew</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SUBSCRIPTION PLANS CATALOG */}
      {activeTab === 'plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm transition-all relative ${
                plan.tier === 'Enterprise'
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-slate-200'
              }`}
            >
              {plan.tier === 'Enterprise' && (
                <span className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                  Most Popular Multi-Campus
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">{plan.tier} Tier</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPlan(plan)}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Plan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPlanToDelete(plan)}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Decommission Plan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>

                <div className="mt-4 mb-6">
                  <span className="text-3xl font-extrabold text-slate-900 font-mono">
                    ₨ {Number(plan.pricePKR).toLocaleString()}
                  </span>
                  <span className="text-slate-500 text-xs ml-1.5 font-medium">/ {plan.billingCycle}</span>
                </div>

                {/* Quotas */}
                <div className="space-y-2.5 pb-6 border-b border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span>Student Cap:</span>
                    <span className="font-semibold text-slate-800">{plan.maxStudents.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Campuses Allowed:</span>
                    <span className="font-semibold text-slate-800">{plan.maxCampuses} Branch(es)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Faculty & Staff Logins:</span>
                    <span className="font-semibold text-slate-800">{plan.maxUsers} Users</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Cloud Storage Quota:</span>
                    <span className="font-semibold text-slate-800">{plan.storageGB} GB</span>
                  </div>
                </div>

                {/* Enabled Modules */}
                <div className="pt-4 space-y-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Included Modules</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(plan.features || []).map((feat, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                        <Check className="w-3 h-3 text-emerald-600" />
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-4">
                <button
                  onClick={() => handleOpenEditPlan(plan)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Configure Limits
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: INVOICES & REVENUE LEDGER */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'PAID', 'PENDING', 'OVERDUE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Invoices' : status}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice number or institute..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Invoice #</th>
                    <th className="py-3.5 px-4">Institute</th>
                    <th className="py-3.5 px-4 font-mono">Amount (PKR)</th>
                    <th className="py-3.5 px-4">Issue & Due Date</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{inv.instituteName}</div>
                        <div className="text-[11px] text-slate-400">{inv.planName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₨ {Number(inv.amountPKR).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div>Issued: {inv.issueDate}</div>
                        <div className="text-slate-400">Due: {inv.dueDate}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-slate-700">{inv.paymentMethod}</span>
                        {inv.transactionRef && (
                          <span className="block font-mono text-[10px] text-slate-400">{inv.transactionRef}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            inv.status === 'PAID'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : inv.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.status !== 'PAID' && (
                            <>
                              <button
                                onClick={() => handleSendReminder(inv.id)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer flex items-center gap-1"
                                title="Send email & SMS reminder"
                              >
                                <Send className="w-3 h-3 text-slate-500" />
                                <span>Remind</span>
                              </button>
                              <button
                                onClick={() => handleMarkPaid(inv.id)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
                              >
                                Mark as Paid
                              </button>
                            </>
                          )}
                          {inv.status === 'PAID' && (
                            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Reconciled
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT PLAN MODAL */}
      <Modal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title={editingPlan ? `Edit Subscription Plan: ${editingPlan.name}` : 'Create Subscription Plan'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g. Campus Pro"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tier Category</label>
              <select
                value={planForm.tier}
                onChange={(e) => setPlanForm({ ...planForm, tier: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="Basic">Basic Tier</option>
                <option value="Pro">Professional Tier</option>
                <option value="Enterprise">Enterprise Apex</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price (PKR)</label>
              <input
                type="number"
                required
                min="0"
                value={planForm.pricePKR}
                onChange={(e) => setPlanForm({ ...planForm, pricePKR: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle</label>
              <select
                value={planForm.billingCycle}
                onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                <option value="monthly">Monthly Cycle</option>
                <option value="annual">Annual Prepaid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Students</label>
              <input
                type="number"
                min="10"
                value={planForm.maxStudents}
                onChange={(e) => setPlanForm({ ...planForm, maxStudents: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Campuses</label>
              <input
                type="number"
                min="1"
                value={planForm.maxCampuses}
                onChange={(e) => setPlanForm({ ...planForm, maxCampuses: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Max Users</label>
              <input
                type="number"
                min="1"
                value={planForm.maxUsers}
                onChange={(e) => setPlanForm({ ...planForm, maxUsers: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Storage (GB)</label>
              <input
                type="number"
                min="1"
                value={planForm.storageGB}
                onChange={(e) => setPlanForm({ ...planForm, storageGB: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(false)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              {editingPlan ? 'Save Plan Updates' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE PLAN MODAL */}
      <Modal
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        title="Decommission Subscription Plan"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to decommission <strong className="text-slate-900">{planToDelete?.name}</strong>? Existing active subscriptions will retain their terms, but no new institutes will be able to select this tier.
          </p>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              onClick={() => setPlanToDelete(null)}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleDeletePlan}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Confirm Decommission
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default SubscriptionsBillingView
