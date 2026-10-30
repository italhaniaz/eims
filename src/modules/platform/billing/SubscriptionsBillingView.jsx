import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Lock,
  CreditCard,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plus,
  CheckCircle,
  CheckCircle2,
  Edit2,
  Trash2,
  Send,
  Calendar,
  CalendarPlus,
  Layers,
  Search,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  FileText,
  Gift,
  Sliders,
  School,
  Building2,
  GraduationCap,
  Download,
  Sparkles,
  Filter,
  ChevronDown,
  X
} from 'lucide-react'
import StatCard from '../../../components/common/StatCard'
import Modal from '../../../components/common/Modal'
import { BillingService, FALLBACK_PLANS, FALLBACK_SUBSCRIPTIONS, FALLBACK_INVOICES } from '../../../services/billingService'

const SubscriptionsBillingView = () => {
  const [activeTab, setActiveTab] = useState('plans')
  const [billingCycle, setBillingCycle] = useState('monthly') // 'plans', 'subscriptions', 'invoices'
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
    enabledTiers: ['school'],
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

  // Super Admin Overrides Modals
  const [isWaiveModalOpen, setIsWaiveModalOpen] = useState(false)
  const [waivingSub, setWaivingSub] = useState(null)
  const [waiveReason, setWaiveReason] = useState('Promotional courtesy waived by Super Admin')

  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  const [extendingSub, setExtendingSub] = useState(null)
  const [extendDays, setExtendDays] = useState(7)
  const [customExtendDate, setCustomExtendDate] = useState('')

  const [isChangePlanModalOpen, setIsChangePlanModalOpen] = useState(false)
  const [editingSubPlan, setEditingSubPlan] = useState(null)
  const [selectedPlanId, setSelectedPlanId] = useState('plan-school')
  const [customEnabledTiers, setCustomEnabledTiers] = useState(['school', 'college'])

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

      const finalPlans = (Array.isArray(p) && p.length > 0) ? p : FALLBACK_PLANS
      const finalSubs = Array.isArray(s) ? s : []
      const finalInvs = Array.isArray(inv) ? inv : []

      const activeSubs = finalSubs.filter(sub => sub.status === 'ACTIVE')
      const trialSubs = finalSubs.filter(sub => sub.status === 'TRIAL')
      const overdueInvs = finalInvs.filter(i => i.status === 'OVERDUE')
      const calculatedMrr = activeSubs.reduce((sum, sub) => sum + (Number(sub.pricePKR) || 0), 0)

      setOverview(ov && ov.mrrPKR > 0 ? ov : {
        mrrPKR: calculatedMrr,
        arrPKR: calculatedMrr * 12,
        totalSubscriptions: finalSubs.length,
        activeCount: activeSubs.length,
        trialCount: trialSubs.length,
        overdueInvoicesCount: overdueInvs.length,
        totalInvoices: finalInvs.length
      })
      setPlans(finalPlans)
      setSubscriptions(finalSubs)
      setInvoices(finalInvs)
    } catch (err) {
      console.error('Failed loading billing data:', err)
      setPlans(FALLBACK_PLANS)
      setSubscriptions([])
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const showToast = (msg) => {
    setActionToast(msg)
    setTimeout(() => setActionToast(null), 3500)
  }

  // Manual Invoice Creation Modal
  const [isCreateInvoiceModalOpen, setIsCreateInvoiceModalOpen] = useState(false)
  const [createInvoiceForm, setCreateInvoiceForm] = useState({
    instituteId: '',
    amountPKR: 25000,
    dueDate: '',
    notes: 'Monthly platform subscription invoice'
  })

  // Export Billing CSV Audit
  const handleExportCSV = () => {
    try {
      const headers = ['Institute,Plan,BillingCycle,PricePKR,RenewalDate,Status,IsWaived']
      const rows = subscriptions.map(s => 
        `"${s.instituteName}","${s.planName}","${s.billingCycle}",${s.pricePKR},"${s.renewalDate}","${s.status}",${s.isWaived ? 'YES' : 'NO'}`
      )
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `eims_subscriptions_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showToast('Billing & Subscriptions audit report exported as CSV!')
    } catch (err) {
      showToast('Export failed: ' + err.message)
    }
  }

  // Handle Manual Invoice Generation
  const handleCreateInvoice = async (e) => {
    e.preventDefault()
    try {
      const targetSub = subscriptions.find(s => s.instituteId === createInvoiceForm.instituteId) || subscriptions[0]
      const newInv = {
        id: `INV-${Date.now().toString().slice(-6)}`,
        invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
        instituteId: targetSub?.instituteId || 'inst-1',
        instituteName: targetSub?.instituteName || 'Designated Campus',
        amountPKR: Number(createInvoiceForm.amountPKR) || 25000,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: createInvoiceForm.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
        status: 'PENDING',
        notes: createInvoiceForm.notes || 'Manual recurring subscription fee'
      }
      setInvoices(prev => [newInv, ...prev])
      setIsCreateInvoiceModalOpen(false)
      showToast(`Manual invoice ${newInv.invoiceNumber} created successfully!`)
    } catch (err) {
      showToast('Failed to create invoice: ' + err.message)
    }
  }

  // --- Plan Actions ---
  const handleOpenCreatePlan = () => {
    setEditingPlan(null)
    setPlanForm({
      name: '',
      tier: 'School',
      enabledTiers: ['school'],
      pricePKR: 25000,
      billingCycle: 'monthly',
      maxStudents: 1500,
      maxCampuses: 2,
      maxUsers: 50,
      storageGB: 5,
      trialDays: 14,
      isTrial: false,
      description: '',
      features: ['students', 'attendance', 'classes', 'fees', 'exams', 'notices']
    })
    setIsPlanModalOpen(true)
  }

  const handleApplyTrialPreset = () => {
    setPlanForm({
      name: 'Free Trial Plan',
      tier: 'Trial',
      enabledTiers: ['school'],
      pricePKR: 0,
      billingCycle: '14-day trial',
      maxStudents: 250,
      maxCampuses: 1,
      maxUsers: 15,
      storageGB: 1,
      trialDays: 14,
      isTrial: true,
      description: '14-Day evaluation trial for schools and institutes exploring the platform',
      features: ['students', 'attendance', 'classes', 'fees', 'exams', 'notices']
    })
  }

  const toggleWingInPlanForm = (wingKey) => {
    setPlanForm(prev => {
      const current = Array.isArray(prev.enabledTiers) ? prev.enabledTiers : ['school', 'college']
      const exists = current.includes(wingKey)
      if (exists && current.length <= 1) {
        showToast('A hybrid plan must include at least one educational wing.')
        return prev
      }
      const nextTiers = exists ? current.filter(w => w !== wingKey) : [...current, wingKey]
      return { ...prev, enabledTiers: nextTiers }
    })
  }

  const handleOpenEditPlan = (plan) => {
    setEditingPlan(plan)
    const currentEnabledTiers = Array.isArray(plan.enabledTiers) && plan.enabledTiers.length > 0
      ? plan.enabledTiers
      : (plan.tier === 'School' ? ['school'] :
         plan.tier === 'College' ? ['college'] :
         plan.tier === 'University' ? ['undergraduate'] :
         plan.tier === 'Custom' ? ['school', 'college', 'undergraduate'] : ['school'])

    setPlanForm({
      name: plan.name || '',
      tier: plan.tier || 'School',
      enabledTiers: currentEnabledTiers,
      pricePKR: plan.pricePKR !== undefined ? plan.pricePKR : 20000,
      billingCycle: plan.billingCycle || 'monthly',
      maxStudents: plan.maxStudents || 1000,
      maxCampuses: plan.maxCampuses || 1,
      maxUsers: plan.maxUsers || 25,
      storageGB: plan.storageGB || 2,
      trialDays: plan.trialDays || 14,
      isTrial: plan.tier === 'Trial' || !!plan.isTrial || Number(plan.pricePKR) === 0,
      description: plan.description || '',
      features: Array.isArray(plan.features) ? plan.features : ['students', 'fees']
    })
    setIsPlanModalOpen(true)
  }

  const handleSavePlan = async (e) => {
    e.preventDefault()
    if (!planForm.name || planForm.pricePKR === '' || isNaN(Number(planForm.pricePKR))) return

    const isTrial = planForm.tier === 'Trial' || planForm.isTrial || Number(planForm.pricePKR) === 0
    const payload = {
      ...planForm,
      enabledTiers: planForm.enabledTiers || (
        planForm.tier === 'School' ? ['school'] :
        planForm.tier === 'College' ? ['college'] :
        planForm.tier === 'University' ? ['undergraduate'] :
        planForm.tier === 'Custom' ? ['school', 'college', 'undergraduate'] : ['school']
      ),
      pricePKR: Number(planForm.pricePKR) || 0,
      isTrial,
      billingCycle: isTrial && !planForm.billingCycle.includes('trial') ? '14-day trial' : planForm.billingCycle,
      ...(editingPlan ? { id: editingPlan.id } : {})
    }

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

  // Super Admin Override 1: Waive Month
  const handleOpenWaiveModal = (sub) => {
    setWaivingSub(sub)
    setWaiveReason('Promotional courtesy waived by Super Admin')
    setIsWaiveModalOpen(true)
  }

  const handleConfirmWaive = async (e) => {
    e.preventDefault()
    if (!waivingSub) return
    await BillingService.waiveCurrentMonth(waivingSub.id, waiveReason)
    setIsWaiveModalOpen(false)
    setWaivingSub(null)
    fetchBillingData()
    showToast(`Monthly fee successfully waived for ${waivingSub.instituteName}.`)
  }

  // Super Admin Override 2: Extend Deadline
  const handleOpenExtendModal = (sub) => {
    setExtendingSub(sub)
    setExtendDays(7)
    const d = new Date(sub.renewalDate || new Date())
    d.setDate(d.getDate() + 7)
    setCustomExtendDate(d.toISOString().slice(0, 10))
    setIsExtendModalOpen(true)
  }

  const handleSelectDays = (days) => {
    setExtendDays(days)
    if (!extendingSub) return
    const d = new Date(extendingSub.renewalDate || new Date())
    d.setDate(d.getDate() + days)
    setCustomExtendDate(d.toISOString().slice(0, 10))
  }

  const handleConfirmExtend = async (e) => {
    e.preventDefault()
    if (!extendingSub || !customExtendDate) return
    await BillingService.extendDeadline(extendingSub.id, customExtendDate, `Deadline extended by ${extendDays} days`)
    setIsExtendModalOpen(false)
    setExtendingSub(null)
    fetchBillingData()
    showToast(`Payment deadline for ${extendingSub.instituteName} extended to ${customExtendDate}.`)
  }

  // Super Admin Override 3: Change Plan & Enabled Tiers
  const handleOpenChangePlanModal = (sub) => {
    setEditingSubPlan(sub)
    setSelectedPlanId(sub.planId || 'plan-school')
    setCustomEnabledTiers(sub.enabledTiers || ['school'])
    setIsChangePlanModalOpen(true)
  }

  const handleToggleTier = (tierId) => {
    if (customEnabledTiers.includes(tierId)) {
      if (customEnabledTiers.length > 1) {
        setCustomEnabledTiers(customEnabledTiers.filter(t => t !== tierId))
      }
    } else {
      setCustomEnabledTiers([...customEnabledTiers, tierId])
    }
  }

  const handleConfirmChangePlan = async (e) => {
    e.preventDefault()
    if (!editingSubPlan) return
    const targetPlan = plans.find(p => p.id === selectedPlanId)
    const tiersToSave = selectedPlanId === 'plan-custom' 
      ? customEnabledTiers 
      : (targetPlan?.enabledTiers || ['school'])
    
    await BillingService.updateSubscriptionPlan(editingSubPlan.id, selectedPlanId, tiersToSave)
    setIsChangePlanModalOpen(false)
    setEditingSubPlan(null)
    fetchBillingData()
    showToast(`Assigned ${targetPlan?.name || 'New Plan'} to ${editingSubPlan.instituteName}.`)
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

  // --- Subscriptions Filter Popover State with Checkboxes ---
  const [showSubFilterPopover, setShowSubFilterPopover] = useState(false)
  const subFilterPopoverRef = useRef(null)
  const [selectedSubStatusFilters, setSelectedSubStatusFilters] = useState(['ACTIVE', 'TRIAL', 'OVERDUE'])
  const [selectedPlanTierFilters, setSelectedPlanTierFilters] = useState(['plan-school', 'plan-college', 'plan-university', 'plan-custom'])
  const [selectedCycleFilters, setSelectedCycleFilters] = useState(['monthly', 'quarterly', 'yearly', 'annual'])

  // Multi-select Row Checkboxes State for Subscriptions
  const [selectedSubIds, setSelectedSubIds] = useState([])

  // Close filter popover on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (subFilterPopoverRef.current && !subFilterPopoverRef.current.contains(event.target)) {
        setShowSubFilterPopover(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Filtered Subscriptions with checkbox filters
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter(sub => {
      const matchSearch = !searchQuery || 
        sub.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.planName.toLowerCase().includes(searchQuery.toLowerCase())

      const matchLegacyStatus = statusFilter === 'ALL' || sub.status === statusFilter
      const matchStatusCheckboxes = selectedSubStatusFilters.includes(sub.status)
      const matchPlanCheckboxes = selectedPlanTierFilters.includes(sub.planId) || selectedPlanTierFilters.some(t => sub.planName?.toLowerCase().includes(t.replace('plan-', '')))
      const matchCycleCheckboxes = selectedCycleFilters.includes(sub.billingCycle?.toLowerCase())

      return matchSearch && matchLegacyStatus && matchStatusCheckboxes && matchPlanCheckboxes && matchCycleCheckboxes
    })
  }, [subscriptions, searchQuery, statusFilter, selectedSubStatusFilters, selectedPlanTierFilters, selectedCycleFilters])

  // Active filter count for badge
  const activeSubFiltersCount = (3 - selectedSubStatusFilters.length) + (4 - selectedPlanTierFilters.length) + (4 - selectedCycleFilters.length)

  const handleToggleSubStatusFilter = (st) => {
    setSelectedSubStatusFilters(prev => 
      prev.includes(st) ? (prev.length > 1 ? prev.filter(s => s !== st) : prev) : [...prev, st]
    )
  }

  const handleTogglePlanTierFilter = (tier) => {
    setSelectedPlanTierFilters(prev => 
      prev.includes(tier) ? (prev.length > 1 ? prev.filter(t => t !== tier) : prev) : [...prev, tier]
    )
  }

  const handleToggleCycleFilter = (cycle) => {
    setSelectedCycleFilters(prev => 
      prev.includes(cycle) ? (prev.length > 1 ? prev.filter(c => c !== cycle) : prev) : [...prev, cycle]
    )
  }

  const handleResetSubFilters = () => {
    setSelectedSubStatusFilters(['ACTIVE', 'TRIAL', 'OVERDUE'])
    setSelectedPlanTierFilters(['plan-school', 'plan-college', 'plan-university', 'plan-custom'])
    setSelectedCycleFilters(['monthly', 'quarterly', 'yearly', 'annual'])
    setStatusFilter('ALL')
    setSearchQuery('')
  }

  // Row selection helpers
  const isAllSubsSelected = filteredSubscriptions.length > 0 && filteredSubscriptions.every(s => selectedSubIds.includes(s.id))

  const handleSelectAllSubs = () => {
    if (isAllSubsSelected) {
      setSelectedSubIds([])
    } else {
      setSelectedSubIds(filteredSubscriptions.map(s => s.id))
    }
  }

  const handleToggleSelectSub = (id) => {
    setSelectedSubIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  // Bulk Status Update (Activate / Suspend)
  const handleBulkSetSubStatus = async (newStatus) => {
    if (selectedSubIds.length === 0) {
      showToast('Please select at least one subscription.')
      return
    }
    setSubscriptions(prev => prev.map(s => selectedSubIds.includes(s.id) ? { ...s, status: newStatus } : s))
    showToast(`Bulk updated: ${selectedSubIds.length} subscriptions set to ${newStatus}!`)
    setSelectedSubIds([])
  }

  // Bulk Extend Grace Period
  const handleBulkExtendSubs = async (days = 7) => {
    if (selectedSubIds.length === 0) return
    const today = new Date()
    today.setDate(today.getDate() + days)
    const newDate = today.toISOString().slice(0, 10)
    for (const subId of selectedSubIds) {
      await BillingService.extendDeadline(subId, newDate, `Bulk extension of ${days} days`)
    }
    fetchBillingData()
    showToast(`Payment deadline extended by ${days} days for ${selectedSubIds.length} subscriptions!`)
    setSelectedSubIds([])
  }

  // Bulk Waive Current Month
  const handleBulkWaiveSubs = async () => {
    if (selectedSubIds.length === 0) return
    for (const subId of selectedSubIds) {
      await BillingService.waiveCurrentMonth(subId, 'Bulk Superadmin Promotional Courtesy')
    }
    fetchBillingData()
    showToast(`Current monthly fee waived for ${selectedSubIds.length} subscriptions!`)
    setSelectedSubIds([])
  }

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
      <div className="p-4 sm:p-6 md:p-8 pb-16 space-y-6 max-w-[1400px] mx-auto flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
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

      {/* Clean Light SaaS Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-100 inline-flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-purple-600" />
              <span>Platform Monetization & Plan Governance</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
            Subscriptions & Revenue Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            SaaS subscription tiers, multi-campus invoicing ledger, automated trial governance, and platform revenue metrics in PKR.
          </p>
        </div>

        <button
          onClick={handleOpenCreatePlan}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer self-start xl:self-auto active:scale-95 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Create New Plan</span>
        </button>
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
          title="Monthly Recurring Revenue"
          value={`PKR ${(overview?.mrrPKR || 0).toLocaleString()}`}
          badge="Live platform MRR"
          badgePositive={true}
          color="emerald"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('invoices')}
          onView={() => setActiveTab('invoices')}
          viewTooltip="View Revenue Ledger & Invoices"
          onAdd={() => setIsCreateInvoiceModalOpen(true)}
          addTooltip="Create Platform Invoice"
        />
        <StatCard
          icon={TrendingUp}
          title="Annual Run Rate (ARR)"
          value={`PKR ${(overview?.arrPKR || 0).toLocaleString()}`}
          badge="Projected annual"
          badgePositive={true}
          color="blue"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('overview')}
          onView={() => setActiveTab('overview')}
          viewTooltip="View Platform Financial Overview"
          onAdd={handleExportCSV}
          addTooltip="Export Billing CSV Audit"
        />
        <StatCard
          icon={CreditCard}
          title="Active Subscriptions"
          value={overview?.activeCount ?? 0}
          badge={`${overview?.trialCount || 0} in trial`}
          badgePositive={true}
          color="indigo"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => setActiveTab('subscriptions')}
          onView={() => setActiveTab('subscriptions')}
          viewTooltip="Manage Active Subscriptions"
          onAdd={() => setIsCreateInvoiceModalOpen(true)}
          addTooltip="Add Subscription / Invoice"
        />
        <StatCard
          icon={AlertTriangle}
          title="Overdue Invoices"
          value={overview?.overdueInvoicesCount || 0}
          badge="Pending collection"
          badgePositive={overview?.overdueInvoicesCount === 0}
          color="amber"
          showActions={true}
          showAllText="Show all"
          onShowAll={() => { setActiveTab('invoices'); setStatusFilter('OVERDUE'); }}
          onView={() => { setActiveTab('invoices'); setStatusFilter('OVERDUE'); }}
          viewTooltip="View Overdue Invoices"
          onAdd={() => setIsCreateInvoiceModalOpen(true)}
          addTooltip="Create & Issue Invoice Reminder"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <nav className="flex space-x-2 overflow-x-auto text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('plans')}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'plans'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Subscription Packages & Tiers ({Math.max(plans.length, 4)})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('subscriptions')
              setStatusFilter('ALL')
            }}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'subscriptions'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Campus Subscriptions ({subscriptions.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('invoices')
              setStatusFilter('ALL')
            }}
            className={`py-2 px-4 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeTab === 'invoices'
                ? 'bg-[#f5eeff] text-purple-700 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
          {/* Filter Bar with Quick Status Buttons, Filters Popover with Checkboxes, and Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'ACTIVE', 'TRIAL', 'OVERDUE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    statusFilter === status
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'ALL' ? 'All Subscriptions' : status}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Interactive Filters Button with Popover */}
              <div className="relative" ref={subFilterPopoverRef}>
                <button
                  type="button"
                  onClick={() => setShowSubFilterPopover(!showSubFilterPopover)}
                  className={`flex items-center gap-2 px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                    activeSubFiltersCount > 0 || showSubFilterPopover
                      ? 'bg-[#f5eeff] text-purple-700 border-purple-300 ring-2 ring-purple-500/10'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>Filters</span>
                  {activeSubFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                      {activeSubFiltersCount}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showSubFilterPopover ? 'rotate-180 text-purple-600' : 'text-slate-400'}`} />
                </button>

                {/* Popover Content */}
                {showSubFilterPopover && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-bold text-slate-900">Subscription Filters</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetSubFilters}
                        className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 transition-colors cursor-pointer"
                      >
                        Reset All
                      </button>
                    </div>

                    <div className="py-3 space-y-4 max-h-[380px] overflow-y-auto">
                      {/* Section 1: Subscription Status Checkboxes */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Subscription Status (Enable / Disable)
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { key: 'ACTIVE', label: 'ACTIVE - Healthy & Paid', color: 'bg-emerald-500' },
                            { key: 'TRIAL', label: 'TRIAL - Onboarding Period', color: 'bg-purple-500' },
                            { key: 'OVERDUE', label: 'OVERDUE - Payment Pending', color: 'bg-rose-500' }
                          ].map(item => {
                            const checked = selectedSubStatusFilters.includes(item.key)
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                  checked
                                    ? 'bg-purple-50/50 border-purple-200 text-slate-900 font-semibold'
                                    : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleSubStatusFilter(item.key)}
                                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                                />
                                <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                                <span>{item.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Section 2: Plan Tiers Checkboxes */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Plan Tier Filters
                        </label>
                        <div className="space-y-1.5">
                          {[
                            { key: 'plan-school', label: '🏫 School Plan (K-10 & Matric)' },
                            { key: 'plan-college', label: '🏛️ College Plan (Inter & HSSC)' },
                            { key: 'plan-university', label: '🎓 University Plan (BS Degrees)' },
                            { key: 'plan-custom', label: '✨ Custom Hybrid Multi-Wing' }
                          ].map(item => {
                            const checked = selectedPlanTierFilters.includes(item.key)
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                  checked
                                    ? 'bg-purple-50/50 border-purple-200 text-slate-900 font-semibold'
                                    : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleTogglePlanTierFilter(item.key)}
                                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                                />
                                <span>{item.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      {/* Section 3: Billing Cycle */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          Billing Cycle
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { key: 'monthly', label: 'Monthly' },
                            { key: 'quarterly', label: 'Quarterly' },
                            { key: 'annual', label: 'Annual / Yearly' }
                          ].map(item => {
                            const checked = selectedCycleFilters.includes(item.key)
                            return (
                              <label
                                key={item.key}
                                className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                                  checked
                                    ? 'bg-purple-50/50 border-purple-200 text-slate-900 font-semibold'
                                    : 'bg-slate-50/50 border-slate-200/60 text-slate-400'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleToggleCycleFilter(item.key)}
                                  className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                                />
                                <span>{item.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 font-medium">
                        Showing {filteredSubscriptions.length} of {subscriptions.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowSubFilterPopover(false)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Search Box */}
              <div className="relative w-full md:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search campus or plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-7 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Floating Bulk Action Bar for Selected Subscriptions */}
          {selectedSubIds.length > 0 && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 max-w-[95vw] overflow-x-auto">
              <div className="flex items-center gap-2 pr-2 border-r border-slate-700 shrink-0">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-white whitespace-nowrap">
                  {selectedSubIds.length} Subscriptions Selected
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 hidden xl:inline">Bulk Controls:</span>
                <button
                  onClick={() => handleBulkSetSubStatus('ACTIVE')}
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Enable (Activate)
                </button>
                <button
                  onClick={() => handleBulkSetSubStatus('OVERDUE')}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Disable (Lock/Overdue)
                </button>
                <button
                  onClick={() => handleBulkExtendSubs(7)}
                  className="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  +7 Days Grace
                </button>
                <button
                  onClick={handleBulkWaiveSubs}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs"
                >
                  Waive Month (PKR 0)
                </button>
              </div>

              <button
                onClick={() => setSelectedSubIds([])}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Subscriptions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-100 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSubsSelected}
                        onChange={handleSelectAllSubs}
                        aria-label="Select all subscriptions"
                        className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                      />
                    </th>
                    <th className="py-3.5 px-4">Institute</th>
                    <th className="py-3.5 px-4">Current Plan</th>
                    <th className="py-3.5 px-4">Cycle & Price</th>
                    <th className="py-3.5 px-4">Renewal Date</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map((sub) => {
                      const isSelected = selectedSubIds.includes(sub.id)
                      return (
                    <tr key={sub.id} className={`hover:bg-slate-50/70 transition-colors ${isSelected ? 'bg-purple-50/40' : ''}`}>
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectSub(sub.id)}
                          aria-label={`Select ${sub.instituteName}`}
                          className="w-4 h-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{sub.instituteName}</div>
                        <div className="text-[11px] text-slate-400">ID: {sub.instituteId.slice(0, 8)}...</div>
                        {/* Enabled Wings Pills */}
                        <div className="flex items-center gap-1 mt-1">
                          {(sub.enabledTiers || ['school']).map(tier => (
                            <span key={tier} className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                              tier === 'school' ? 'bg-[#f5eeff] text-purple-700 border border-purple-200' :
                              tier === 'college' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                              'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {tier === 'undergraduate' ? 'University' : tier}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{sub.planName}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {sub.planId === 'plan-custom' ? 'Custom Multi-Tier' : sub.planId === 'plan-university' ? 'BS & Semesters' : sub.planId === 'plan-college' ? 'Intermediate HSSC' : 'Primary & High'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {sub.isWaived ? (
                          <div>
                            <span className="line-through text-slate-400 text-xs">₨ {sub.pricePKR?.toLocaleString()}</span>
                            <span className="block text-emerald-700 font-bold text-xs">₨ 0 (Waived)</span>
                          </div>
                        ) : (
                          <span>₨ {sub.pricePKR?.toLocaleString()} / {sub.billingCycle}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{sub.renewalDate}</span>
                        </div>
                        {sub.isWaived && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            Free Cycle Waived
                          </span>
                        )}
                        {sub.extendedUntil && !sub.isWaived && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            Grace: {sub.extendedUntil}
                          </span>
                        )}
                        {sub.daysRemaining <= 5 && sub.daysRemaining >= 0 && !sub.isWaived && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded inline-block mt-0.5">
                            {sub.daysRemaining} days remaining
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            sub.isWaived
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : sub.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : sub.status === 'TRIAL'
                              ? 'bg-[#f5eeff] text-purple-700 border border-purple-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {sub.isWaived ? 'WAIVED' : sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Super Admin: Waive Month Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenWaiveModal(sub)}
                            className="px-2 py-1 text-xs rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Waive this month's charge (PKR 0)"
                          >
                            <Gift className="w-3 h-3 text-emerald-600" />
                            <span>Waive</span>
                          </button>

                          {/* Super Admin: Extend Deadline Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenExtendModal(sub)}
                            className="px-2 py-1 text-xs rounded-lg bg-[#f5eeff] text-purple-700 border border-purple-200 hover:bg-purple-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Extend payment due date"
                          >
                            <CalendarPlus className="w-3 h-3 text-purple-600" />
                            <span>Extend</span>
                          </button>

                          {/* Super Admin: Switch Plan / Tiers */}
                          <button
                            type="button"
                            onClick={() => handleOpenChangePlanModal(sub)}
                            className="px-2 py-1 text-xs rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Change subscription plan or enable/disable wings"
                          >
                            <Sliders className="w-3 h-3 text-indigo-600" />
                            <span>Plan</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRenewSubscription(sub.id)}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            title="Renew subscription cycle"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Renew</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    )
                  })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No active subscriptions found</p>
                        <p className="text-xs text-slate-400 mt-0.5">Campuses onboarded with subscription plans will appear here.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: SUBSCRIPTION PLANS & PRICING (4 Cards Identical to Landing Page) */}
      {activeTab === 'plans' && (() => {
        const trialPlan = plans.find(p => p.id === 'plan-trial' || p.tier === 'Trial' || Number(p.pricePKR) === 0) || FALLBACK_PLANS[0]
        const schoolPlan = plans.find(p => p.id === 'plan-school' || p.tier === 'School') || FALLBACK_PLANS[1]
        const collegePlan = plans.find(p => p.id === 'plan-college' || p.tier === 'College') || FALLBACK_PLANS[2]
        const uniPlan = plans.find(p => p.id === 'plan-university' || p.tier === 'University') || FALLBACK_PLANS[3]

        const customPlans = plans.filter(p => 
          p.id !== trialPlan.id && 
          p.id !== schoolPlan.id && 
          p.id !== collegePlan.id && 
          p.id !== uniPlan.id &&
          p.tier !== 'Trial' &&
          p.tier !== 'School' &&
          p.tier !== 'College' &&
          p.tier !== 'University'
        )

        const trialSubsCount = subscriptions.filter(s => s.status === 'TRIAL' || (s.planId && s.planId.includes('trial'))).length
        const schoolSubsCount = subscriptions.filter(s => s.planName && s.planName.toLowerCase().includes('school')).length
        const collegeSubsCount = subscriptions.filter(s => s.planName && s.planName.toLowerCase().includes('college')).length
        const uniSubsCount = subscriptions.filter(s => s.planName && (s.planName.toLowerCase().includes('university') || s.planName.toLowerCase().includes('hybrid') || s.planName.toLowerCase().includes('custom'))).length

        return (
          <div className="space-y-6">
            {/* Header with Title and Billing Cycle Switcher */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                    Standard SaaS Subscription Packages
                  </h2>
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                    4 Core Tiers Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Official institutional tiers configured with specific educational wings, student capacities, and module matrices.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end flex-wrap">
                {/* Billing Cycle Switcher (Identical to Landing Page) */}
                <div className="inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      billingCycle === 'monthly' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('annual')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      billingCycle === 'annual' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Annual Prepaid</span>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded-full border border-purple-200">
                      Save 15%
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleOpenCreatePlan}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Custom Tier</span>
                </button>
              </div>
            </div>

            {/* 4 CARDS GRID (EXACTLY LIKE LANDING PAGE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
              
              {/* TIER 0: FREE EVALUATION TIER */}
              <div className="rounded-3xl border-2 border-emerald-400 bg-white p-6 flex flex-col justify-between shadow-md relative overflow-hidden transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-xs">
                  Zero Risk Trial
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        Evaluation Tier
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditPlan(trialPlan)}
                      className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer mr-20"
                      title="Edit Plan Settings & Quotas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">14-Day Free Trial</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {trialPlan.description || 'Full evaluation access for schools exploring ApexEd.'}
                  </p>

                  <div className="mt-4 mb-5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-baseline gap-1 font-heading">
                      <span className="text-lg font-bold text-emerald-600">₨</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-700 tracking-tight">0</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-1.5 border border-emerald-200">
                        FREE
                      </span>
                    </div>
                    <div className="text-xs font-medium text-emerald-900 mt-1">
                      100% Free / 14-Day Evaluation Access
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Up to <strong>{trialPlan.maxStudents || 250} Students</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>{trialPlan.maxCampuses || 1} Campus</strong> branch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>{trialPlan.maxUsers || 15} Staff Accounts</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Core fees, attendance & exams</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Active Enrollees:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {trialSubsCount} Campuses
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlan(trialPlan)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure Trial Plan</span>
                  </button>
                </div>
              </div>

              {/* TIER 1: SCHOOL PLAN */}
              <div className="rounded-3xl border border-purple-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-purple-300 transition-all hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
                        <School className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase text-purple-700 bg-[#f5eeff] px-2 py-0.5 rounded-md border border-purple-200">
                        School Plan
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditPlan(schoolPlan)}
                      className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Edit Plan Settings & Quotas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">Primary & Matric</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {schoolPlan.description || 'Complete management for growing schools.'}
                  </p>

                  <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-baseline gap-1 font-heading">
                      <span className="text-lg font-bold text-slate-500">₨</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {billingCycle === 'annual' ? Math.round((schoolPlan.pricePKR || 25000) * 0.85).toLocaleString() : (schoolPlan.pricePKR || 25000).toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Up to <strong>{(schoolPlan.maxStudents || 1500).toLocaleString()} Students</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>{schoolPlan.maxCampuses || 2} Campuses</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>{schoolPlan.maxUsers || 50} Staff Accounts</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>1Link Barcode Fee Vouchers</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Subscribers:</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {schoolSubsCount} Campuses
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlan(schoolPlan)}
                    className="w-full py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure School Plan</span>
                  </button>
                </div>
              </div>

              {/* TIER 2: COLLEGE PLAN */}
              <div className="rounded-3xl border border-indigo-200 bg-white p-6 flex flex-col justify-between shadow-xs hover:border-indigo-300 transition-all hover:shadow-md">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                        College Plan
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditPlan(collegePlan)}
                      className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Edit Plan Settings & Quotas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">Intermediate & Inter</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {collegePlan.description || 'Built for colleges and higher secondary institutions.'}
                  </p>

                  <div className="mt-4 mb-5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-baseline gap-1 font-heading">
                      <span className="text-lg font-bold text-slate-500">₨</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {billingCycle === 'annual' ? Math.round((collegePlan.pricePKR || 35000) * 0.85).toLocaleString() : (collegePlan.pricePKR || 35000).toLocaleString()}
                      </span>
                      <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Up to <strong>{(collegePlan.maxStudents || 3000).toLocaleString()} Students</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>{collegePlan.maxCampuses || 3} Campuses</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span><strong>{collegePlan.maxUsers || 100} Staff Accounts</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>BISE Board Registry & Admissions</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Subscribers:</span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                      {collegeSubsCount} Campuses
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlan(collegePlan)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure College Plan</span>
                  </button>
                </div>
              </div>

              {/* TIER 3: UNIVERSITY / ENTERPRISE */}
              <div className="rounded-3xl border border-purple-300 ring-2 ring-purple-500/20 bg-gradient-to-b from-white to-[#f5eeff]/30 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold uppercase text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                        Apex Enterprise
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenEditPlan(uniPlan)}
                      className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                      title="Edit Plan Settings & Quotas"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className="text-xl font-extrabold text-slate-900">University / Hybrid</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                    {uniPlan.description || 'Large universities and multi-branch educational groups.'}
                  </p>

                  <div className="mt-4 mb-5 p-3 rounded-xl bg-white border border-purple-100 shadow-2xs">
                    <div className="flex items-baseline gap-1 font-heading">
                      <span className="text-lg font-bold text-purple-600">₨</span>
                      <span className="text-3xl sm:text-4xl font-extrabold text-purple-700 tracking-tight">
                        {billingCycle === 'annual' ? Math.round((uniPlan.pricePKR || 55000) * 0.85).toLocaleString() : (uniPlan.pricePKR || 55000).toLocaleString()}
                        <span className="text-2xl text-purple-500 font-bold">+</span>
                      </span>
                      <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Standard monthly billing'}
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>{(uniPlan.maxStudents || 8000).toLocaleString()}+ Students</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span><strong>{uniPlan.maxCampuses || 15}+ Campuses</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>BS Degrees, Semesters & CGPA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span>Dedicated VIP Support & SLA</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-medium">Subscribers:</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                      {uniSubsCount} Campuses
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlan(uniPlan)}
                    className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-sm shadow-purple-700/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Configure University Plan</span>
                  </button>
                </div>
              </div>

            </div>

            {/* CUSTOM / EXTENDED TIERS (IF ANY) */}
            {customPlans.length > 0 && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Custom Educational Groups & Conglomerates ({customPlans.length})</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {customPlans.map((plan) => {
                    const enrolledCount = subscriptions.filter(s => s.planId === plan.id || s.planName?.toLowerCase().includes('hybrid') || s.planName?.toLowerCase().includes(plan.name?.toLowerCase())).length
                    const planEnabledTiers = Array.isArray(plan.enabledTiers) && plan.enabledTiers.length > 0 
                      ? plan.enabledTiers 
                      : ['school', 'college', 'undergraduate']

                    return (
                      <div
                        key={plan.id}
                        className="rounded-3xl border-2 border-purple-200/90 ring-1 ring-purple-500/10 bg-gradient-to-b from-white via-purple-50/15 to-[#fcfaff] p-6 flex flex-col justify-between shadow-xs hover:border-purple-300 hover:shadow-lg transition-all relative overflow-hidden group"
                      >
                        {/* Top decorative gradient glow */}
                        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-fuchsia-500" />

                        <div>
                          {/* Header row: Badge, Icon & Actions */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                                <Layers className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#f5eeff] text-purple-700 border border-purple-200">
                                {plan.name || 'Custom Hybrid Plan'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditPlan(plan)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors cursor-pointer"
                                title="Edit Hybrid Plan Settings"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setPlanToDelete(plan)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Plan"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                            <span>Multi-Wing Conglomerate</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              HYBRID
                            </span>
                          </h3>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                            {plan.description || 'Multi-wing educational groups combining School, College, and University wings with consolidated governance.'}
                          </p>

                          {/* Active Wings Pills */}
                          <div className="flex flex-wrap items-center gap-1.5 my-3">
                            {planEnabledTiers.includes('school') && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                🏫 School Wing
                              </span>
                            )}
                            {planEnabledTiers.includes('college') && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                🏛️ College Wing
                              </span>
                            )}
                            {planEnabledTiers.includes('undergraduate') && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                                🎓 University Wing
                              </span>
                            )}
                          </div>

                          {/* Pricing Box */}
                          <div className="mb-5 p-3.5 rounded-2xl bg-white border border-purple-100 shadow-2xs">
                            <div className="flex items-baseline gap-1 font-heading">
                              <span className="text-lg font-bold text-purple-600">₨</span>
                              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                                {billingCycle === 'annual'
                                  ? Math.round((Number(plan.pricePKR) || 75000) * 0.85).toLocaleString()
                                  : (Number(plan.pricePKR) || 75000).toLocaleString()}
                              </span>
                              <span className="text-xs font-medium text-slate-500 ml-1">/ month</span>
                            </div>
                            <div className="text-xs text-purple-700 font-medium mt-1">
                              {billingCycle === 'annual' ? 'Billed annually (Save 15%)' : 'Enterprise Multi-Tier License'}
                            </div>
                          </div>

                          {/* Feature Quota Checklist */}
                          <ul className="space-y-2.5 text-xs text-slate-600">
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Up to <strong>{(plan.maxStudents || 15000).toLocaleString()} Enrolled Students</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span><strong>{plan.maxCampuses || 15} Campuses / Wings</strong> interconnected</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span><strong>{plan.maxUsers || 600} Staff & Faculty Accounts</strong></span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span><strong>{plan.storageGB || 50} GB</strong> High-Speed Cloud Storage</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                              <span>Unified Multi-Wing Portal & Consolidated Ledger</span>
                            </li>
                          </ul>
                        </div>

                        {/* Footer / CTA */}
                        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Subscribers:</span>
                            <span className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
                              {enrolledCount} Campuses
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleOpenEditPlan(plan)}
                            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs shadow-sm shadow-purple-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Configure Hybrid Plan</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })()}

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
                      ? 'bg-purple-600 text-white shadow-xs'
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
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white"
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
                  {filteredInvoices.length > 0 ? (
                    filteredInvoices.map((inv) => (
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
                  ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-slate-400">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">No invoices generated yet</p>
                        <p className="text-xs text-slate-400 mt-0.5">Subscription billing invoices will appear here once generated.</p>
                      </td>
                    </tr>
                  )}
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
          {/* Quick Free Trial Preset Helper */}
          <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-950">Free Trial / Evaluation Package</div>
                <div className="text-[11px] text-emerald-700">Quickly configure a ₨ 0 evaluation tier for prospective clients to test the software.</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleApplyTrialPreset}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
            >
              Use Trial Preset
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Name</label>
              <input
                type="text"
                required
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                placeholder="e.g. Free Trial Plan or Campus Pro"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Tier Category</label>
                {editingPlan && (
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200 font-semibold inline-flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Fixed
                  </span>
                )}
              </div>
              <select
                value={planForm.tier}
                disabled={Boolean(editingPlan)}
                onChange={(e) => {
                  const newTier = e.target.value
                  let newEnabledTiers = planForm.enabledTiers || []
                  if (newTier === 'Trial') {
                    newEnabledTiers = ['school']
                    setPlanForm({ ...planForm, tier: newTier, enabledTiers: newEnabledTiers, pricePKR: 0, billingCycle: '14-day trial', isTrial: true })
                  } else if (newTier === 'School') {
                    newEnabledTiers = ['school']
                    setPlanForm({ ...planForm, tier: newTier, enabledTiers: newEnabledTiers, pricePKR: planForm.pricePKR === 0 ? 25000 : planForm.pricePKR, billingCycle: planForm.billingCycle.includes('trial') ? 'monthly' : planForm.billingCycle, isTrial: false })
                  } else if (newTier === 'College') {
                    newEnabledTiers = ['college']
                    setPlanForm({ ...planForm, tier: newTier, enabledTiers: newEnabledTiers, pricePKR: planForm.pricePKR === 0 ? 35000 : planForm.pricePKR, billingCycle: planForm.billingCycle.includes('trial') ? 'monthly' : planForm.billingCycle, isTrial: false })
                  } else if (newTier === 'University') {
                    newEnabledTiers = ['undergraduate']
                    setPlanForm({ ...planForm, tier: newTier, enabledTiers: newEnabledTiers, pricePKR: planForm.pricePKR === 0 ? 55000 : planForm.pricePKR, billingCycle: planForm.billingCycle.includes('trial') ? 'monthly' : planForm.billingCycle, isTrial: false })
                  } else if (newTier === 'Custom') {
                    newEnabledTiers = newEnabledTiers.length > 0 ? newEnabledTiers : ['school', 'college', 'undergraduate']
                    setPlanForm({ ...planForm, tier: newTier, enabledTiers: newEnabledTiers, pricePKR: planForm.pricePKR === 0 ? 75000 : planForm.pricePKR, billingCycle: planForm.billingCycle.includes('trial') ? 'monthly' : planForm.billingCycle, isTrial: false })
                  }
                }}
                className={`w-full px-3 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none ${
                  editingPlan
                    ? 'bg-slate-100/90 text-slate-700 border-slate-200 cursor-not-allowed font-medium'
                    : 'bg-white border-slate-200'
                }`}
              >
                <option value="Trial">Free Trial Tier (₨ 0 Evaluation)</option>
                <option value="School">School Tier (Primary / Matric)</option>
                <option value="College">College Tier (Inter / F.Sc / A-Levels)</option>
                <option value="University">University Tier (BS / Degrees)</option>
                <option value="Custom">Custom Multi-Wing Tier</option>
              </select>
            </div>
          </div>

          {/* TASK 3: HYBRID TIER WING SELECTOR OPTIONS (School, College, University) */}
          {(planForm.tier === 'Custom' || planForm.tier === 'Hybrid' || planForm.name?.toLowerCase().includes('hybrid')) && (
            <div className="p-3.5 bg-gradient-to-r from-purple-50/70 via-indigo-50/40 to-fuchsia-50/30 border border-purple-200/90 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>Choose Included Educational Wings (School, College, University)</span>
                </label>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                  {(planForm.enabledTiers || []).length} Wings Selected
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Configure which academic wings are activated when campuses enroll into this hybrid plan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {/* 1. School Wing Option */}
                <div
                  onClick={() => toggleWingInPlanForm('school')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer select-none ${
                    (planForm.enabledTiers || []).includes('school')
                      ? 'bg-white border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs shrink-0 transition-colors ${
                    (planForm.enabledTiers || []).includes('school') ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {(planForm.enabledTiers || []).includes('school') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>🏫 School Wing</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Primary & Matric (K-10)</div>
                  </div>
                </div>

                {/* 2. College Wing Option */}
                <div
                  onClick={() => toggleWingInPlanForm('college')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer select-none ${
                    (planForm.enabledTiers || []).includes('college')
                      ? 'bg-white border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs shrink-0 transition-colors ${
                    (planForm.enabledTiers || []).includes('college') ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {(planForm.enabledTiers || []).includes('college') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>🏛️ College Wing</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">11-12 & Inter (F.Sc, ICS)</div>
                  </div>
                </div>

                {/* 3. University Wing Option */}
                <div
                  onClick={() => toggleWingInPlanForm('undergraduate')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer select-none ${
                    (planForm.enabledTiers || []).includes('undergraduate')
                      ? 'bg-white border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center text-xs shrink-0 transition-colors ${
                    (planForm.enabledTiers || []).includes('undergraduate') ? 'bg-purple-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {(planForm.enabledTiers || []).includes('undergraduate') && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>🎓 University Wing</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">BS Degrees & Semesters</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Price (PKR) {planForm.tier === 'Trial' && <span className="text-emerald-600 font-bold">(0 for Free Evaluation)</span>}
              </label>
              <input
                type="number"
                required
                min="0"
                value={planForm.pricePKR}
                onChange={(e) => setPlanForm({ ...planForm, pricePKR: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billing Cycle / Duration</label>
              <select
                value={planForm.billingCycle}
                onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white"
              >
                <option value="14-day trial">14-Day Evaluation Trial</option>
                <option value="30-day trial">30-Day Evaluation Trial</option>
                <option value="monthly">Monthly Cycle</option>
                <option value="annual">Annual Prepaid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Description / Scope</label>
            <input
              type="text"
              value={planForm.description || ''}
              onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="e.g. 14-day evaluation trial for schools exploring the platform"
            />
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
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              {editingPlan ? 'Save Plan Updates' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SUPER ADMIN MODAL 1: WAIVE MONTH */}
      <Modal
        isOpen={isWaiveModalOpen}
        onClose={() => setIsWaiveModalOpen(false)}
        title="Waive Monthly Platform Charge"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmWaive} className="space-y-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-start gap-3">
            <Gift className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <span className="font-bold block">Complimentary Billing Period</span>
              You are waiving the current cycle fees for <strong>{waivingSub?.instituteName}</strong>. Their monthly bill of <strong>PKR {waivingSub?.pricePKR?.toLocaleString()}</strong> will be set to <strong>PKR 0</strong>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Waive Reason / Courtesy Note</label>
            <input
              type="text"
              required
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              placeholder="e.g. Promotional courtesy / Partner discount"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsWaiveModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Confirm & Waive Month
            </button>
          </div>
        </form>
      </Modal>

      {/* SUPER ADMIN MODAL 2: EXTEND DEADLINE */}
      <Modal
        isOpen={isExtendModalOpen}
        onClose={() => setIsExtendModalOpen(false)}
        title="Extend Payment Due Date"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleConfirmExtend} className="space-y-4">
          <div className="p-3.5 bg-[#f5eeff] rounded-xl border border-purple-200 flex items-start gap-3">
            <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900">
              <span className="font-bold block">Grace Period Extension</span>
              Current renewal date for <strong>{extendingSub?.instituteName}</strong> is <strong>{extendingSub?.renewalDate}</strong>.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Quick Extension Options</label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 7, 14, 30].map(days => (
                <button
                  key={days}
                  type="button"
                  onClick={() => handleSelectDays(days)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                    extendDays === days
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  +{days} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">New Payment Due Date</label>
            <input
              type="date"
              required
              value={customExtendDate}
              onChange={(e) => setCustomExtendDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsExtendModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Save New Deadline
            </button>
          </div>
        </form>
      </Modal>

      {/* SUPER ADMIN MODAL 3: SWITCH PLAN & TIERS */}
      <Modal
        isOpen={isChangePlanModalOpen}
        onClose={() => setIsChangePlanModalOpen(false)}
        title="Manage Subscription Plan & Wings"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmChangePlan} className="space-y-4">
          <div className="text-xs text-slate-600">
            Assign subscription plan and active wings for <strong>{editingSubPlan?.instituteName}</strong>.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Select Plan</label>
            <div className="grid grid-cols-2 gap-2.5">
              {plans.map(plan => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedPlanId === plan.id
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold block">{plan.name}</span>
                  <span className="text-[11px] font-mono text-indigo-700 block mt-0.5">
                    {Number(plan.pricePKR) === 0 ? 'FREE TRIAL (₨ 0)' : `₨ ${Number(plan.pricePKR).toLocaleString()}/mo`}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1 line-clamp-1">{plan.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* If Custom Plan, show checkboxes for Enabled Tiers */}
          {selectedPlanId === 'plan-custom' && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                Custom Multi-Wing Activation
              </label>
              <div className="space-y-2">
                {[
                  { id: 'school', label: 'School Wing', desc: 'Primary, Middle & High School (Matric / O-Levels)', icon: School },
                  { id: 'college', label: 'College Wing', desc: 'Intermediate (F.Sc, ICS, FA, I.Com, A-Levels)', icon: Building2 },
                  { id: 'undergraduate', label: 'Undergraduates Wing', desc: '4-Year BS Degrees, Semesters & CGPA', icon: GraduationCap }
                ].map(wing => {
                  const WingIcon = wing.icon
                  const isChecked = customEnabledTiers.includes(wing.id)
                  return (
                    <label key={wing.id} className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200/80 cursor-pointer hover:border-slate-300">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleTier(wing.id)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <WingIcon className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-slate-800 block">{wing.label}</span>
                        <span className="text-[11px] text-slate-400 block">{wing.desc}</span>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsChangePlanModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Save Subscription Changes
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
      {/* MANUAL INVOICE CREATION MODAL */}
      {isCreateInvoiceModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsCreateInvoiceModalOpen(false)}
          title="Create Manual Platform Invoice"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Target Campus</label>
              <select
                value={createInvoiceForm.instituteId}
                onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, instituteId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                required
              >
                <option value="">Select an enrolled campus...</option>
                {subscriptions.map(s => (
                  <option key={s.id} value={s.instituteId}>{s.instituteName} ({s.planName})</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Amount (PKR)</label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  value={createInvoiceForm.amountPKR}
                  onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, amountPKR: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Payment Due Date</label>
                <input
                  type="date"
                  value={createInvoiceForm.dueDate}
                  onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Billing Notes</label>
              <input
                type="text"
                value={createInvoiceForm.notes}
                onChange={(e) => setCreateInvoiceForm({ ...createInvoiceForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsCreateInvoiceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
              >
                Issue Invoice
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

export default SubscriptionsBillingView
