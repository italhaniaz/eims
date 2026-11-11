import React, { useState, useEffect, useMemo } from 'react'
import {
  ClipboardList,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock,
  Eye,
  Check,
  X,
  Trash2,
  Edit2,
  Building2,
  School,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Sparkles,
  Download,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sliders,
  ChevronRight,
  Info,
  KeyRound,
  Copy,
  Layers,
  FileText
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { useToast } from '../../../context/ToastContext'
import { SchoolInquiryService } from '../../../services/schoolInquiryService'
import { DataService } from '../../../services/dataService'

export const SchoolInquiriesView = ({ onRouteChange }) => {
  const toast = useToast()

  // -------------------------------------------------------------
  // 1. STATE & DATA FETCHING
  // -------------------------------------------------------------
  const [inquiries, setInquiries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [searchTerm, setSearchTerm] = useState('')
  const [isSettingEnabled, setIsSettingEnabled] = useState(() => SchoolInquiryService.isSchoolInquiryEnabled())

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Modals state
  const [viewingInquiry, setViewingInquiry] = useState(null)
  const [editingCodePrefix, setEditingCodePrefix] = useState('')
  const [prefixError, setPrefixError] = useState('')
  const [isSavingPrefix, setIsSavingPrefix] = useState(false)

  // Approval Modal State
  const [approvingInquiry, setApprovingInquiry] = useState(null)
  const [approvalCodePrefix, setApprovalCodePrefix] = useState('')
  const [approvalPassword, setApprovalPassword] = useState('Admin@123')
  const [approvalNotes, setApprovalNotes] = useState('')
  const [isProcessingApproval, setIsProcessingApproval] = useState(false)
  const [approvedResult, setApprovedResult] = useState(null)

  // Rejection Modal State
  const [rejectingInquiry, setRejectingInquiry] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessingRejection, setIsProcessingRejection] = useState(false)

  // Delete Confirmation Modals
  const [deletingId, setDeletingId] = useState(null)
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await SchoolInquiryService.getInquiries('ALL')
      setInquiries(Array.isArray(data) ? data : [])
      setIsSettingEnabled(SchoolInquiryService.isSchoolInquiryEnabled())
    } catch (err) {
      toast?.error?.('Failed to load school inquiries')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleSync = () => {
      loadData()
    }

    window.addEventListener('sms_inquiries_updated', handleSync)
    window.addEventListener('sms_settings_updated', handleSync)
    window.addEventListener('storage', handleSync)

    return () => {
      window.removeEventListener('sms_inquiries_updated', handleSync)
      window.removeEventListener('sms_settings_updated', handleSync)
      window.removeEventListener('storage', handleSync)
    }
  }, [])

  // -------------------------------------------------------------
  // 2. COUNTS & FILTERING
  // -------------------------------------------------------------
  const counts = useMemo(() => {
    return {
      all: inquiries.length,
      pending: inquiries.filter(i => (i.status || '').toUpperCase() === 'PENDING').length,
      approved: inquiries.filter(i => (i.status || '').toUpperCase() === 'APPROVED').length,
      rejected: inquiries.filter(i => (i.status || '').toUpperCase() === 'REJECTED').length
    }
  }, [inquiries])

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(item => {
      // Filter tab
      const statusUpper = (item.status || 'PENDING').toUpperCase()
      if (activeFilter === 'PENDING' && statusUpper !== 'PENDING') return false
      if (activeFilter === 'APPROVED' && statusUpper !== 'APPROVED') return false
      if (activeFilter === 'REJECTED' && statusUpper !== 'REJECTED') return false

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim()
        const matchName = (item.schoolName || '').toLowerCase().includes(q)
        const matchContact = (item.contactPerson || '').toLowerCase().includes(q)
        const matchEmail = (item.email || '').toLowerCase().includes(q)
        const matchPhone = (item.phone || '').toLowerCase().includes(q)
        const matchCity = (item.city || '').toLowerCase().includes(q)
        const matchPrefix = (item.schoolCodePrefix || '').toLowerCase().includes(q)
        const matchAssignedCode = (item.assignedSchoolCode || '').toLowerCase().includes(q)
        return matchName || matchContact || matchEmail || matchPhone || matchCity || matchPrefix || matchAssignedCode
      }

      return true
    })
  }, [inquiries, activeFilter, searchTerm])

  // -------------------------------------------------------------
  // 3. SELECTION HANDLERS
  // -------------------------------------------------------------
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredInquiries.map(i => i.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const isAllSelected = filteredInquiries.length > 0 && selectedIds.size === filteredInquiries.length

  // -------------------------------------------------------------
  // 4. VIEW & EDIT CODE PREFIX
  // -------------------------------------------------------------
  const handleOpenView = (inquiry) => {
    setViewingInquiry(inquiry)
    setEditingCodePrefix(inquiry.schoolCodePrefix || '')
    setPrefixError('')
  }

  const handleSaveCodePrefix = async () => {
    if (!viewingInquiry) return
    const cleanPrefix = editingCodePrefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase().trim()
    if (!cleanPrefix) {
      setPrefixError('Prefix is required (letters/numbers only)')
      return
    }
    if (cleanPrefix.length < 2 || cleanPrefix.length > 6) {
      setPrefixError('Prefix must be between 2 and 6 characters')
      return
    }

    setIsSavingPrefix(true)
    setPrefixError('')
    try {
      const updated = await SchoolInquiryService.updateInquiry(viewingInquiry.id, {
        schoolCodePrefix: cleanPrefix
      })
      setViewingInquiry(updated)
      toast?.success?.(`School code prefix updated to "${cleanPrefix}"`)
      loadData()
    } catch (err) {
      setPrefixError(err.message || 'Failed to update prefix')
    } finally {
      setIsSavingPrefix(false)
    }
  }

  // -------------------------------------------------------------
  // 5. APPROVAL WORKFLOW
  // -------------------------------------------------------------
  const handleOpenApproveModal = (inquiry) => {
    setApprovingInquiry(inquiry)
    setApprovalCodePrefix(inquiry.schoolCodePrefix || 'SCHL')
    setApprovalPassword(inquiry.adminPassword || 'Admin@123')
    setApprovalNotes('')
  }

  const handleConfirmApproval = async () => {
    if (!approvingInquiry) return
    setIsProcessingApproval(true)
    try {
      const res = await SchoolInquiryService.approveInquiry(approvingInquiry.id, {
        schoolCodePrefix: approvalCodePrefix,
        adminPassword: approvalPassword,
        notes: approvalNotes
      })

      if (res.success) {
        toast?.success?.(`School "${approvingInquiry.schoolName}" approved & provisioned successfully!`)
        setApprovedResult(res)
        setApprovingInquiry(null)
        if (viewingInquiry?.id === approvingInquiry.id) {
          setViewingInquiry(res.inquiry)
        }
        loadData()
      } else {
        toast?.error?.(res.error || 'Failed to approve inquiry')
      }
    } catch (err) {
      toast?.error?.(err.message || 'Error occurred during approval')
    } finally {
      setIsProcessingApproval(false)
    }
  }

  // -------------------------------------------------------------
  // 6. REJECTION WORKFLOW
  // -------------------------------------------------------------
  const handleOpenRejectModal = (inquiry) => {
    setRejectingInquiry(inquiry)
    setRejectionReason('')
  }

  const handleConfirmRejection = async () => {
    if (!rejectingInquiry) return
    setIsProcessingRejection(true)
    try {
      const res = await SchoolInquiryService.rejectInquiry(rejectingInquiry.id, rejectionReason)
      if (res.success) {
        toast?.info?.(`Inquiry for "${rejectingInquiry.schoolName}" marked as Rejected.`)
        setRejectingInquiry(null)
        if (viewingInquiry?.id === rejectingInquiry.id) {
          setViewingInquiry(res.inquiry)
        }
        loadData()
      }
    } catch (err) {
      toast?.error?.(err.message || 'Failed to reject inquiry')
    } finally {
      setIsProcessingRejection(false)
    }
  }

  // -------------------------------------------------------------
  // 7. DELETION HANDLERS
  // -------------------------------------------------------------
  const handleConfirmSingleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      await SchoolInquiryService.deleteInquiry(deletingId)
      toast?.success?.('School inquiry deleted.')
      if (viewingInquiry?.id === deletingId) setViewingInquiry(null)
      setDeletingId(null)
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(deletingId)
        return next
      })
      loadData()
    } catch (err) {
      toast?.error?.('Failed to delete inquiry')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedIds.size === 0) return
    setIsDeleting(true)
    try {
      await SchoolInquiryService.bulkDeleteInquiries(Array.from(selectedIds))
      toast?.success?.(`${selectedIds.size} inquiries deleted successfully.`)
      setIsBulkDeleteModalOpen(false)
      setSelectedIds(new Set())
      if (viewingInquiry && selectedIds.has(viewingInquiry.id)) {
        setViewingInquiry(null)
      }
      loadData()
    } catch (err) {
      toast?.error?.('Failed to execute bulk deletion')
    } finally {
      setIsDeleting(false)
    }
  }

  // -------------------------------------------------------------
  // 8. CSV EXPORT
  // -------------------------------------------------------------
  const handleExportCSV = () => {
    if (filteredInquiries.length === 0) {
      toast?.info?.('No records to export')
      return
    }

    const headers = ['Inquiry ID', 'School Name', 'Code Prefix', 'Contact Person', 'Email', 'Phone', 'City', 'Plan Tier', 'Status', 'Submitted At', 'Approved Code']
    const rows = filteredInquiries.map(i => [
      `"${i.id}"`,
      `"${i.schoolName || ''}"`,
      `"${i.schoolCodePrefix || ''}"`,
      `"${i.contactPerson || ''}"`,
      `"${i.email || ''}"`,
      `"${i.phone || ''}"`,
      `"${i.city || ''}"`,
      `"${i.planTier || ''}"`,
      `"${i.status || ''}"`,
      `"${i.submissionDate ? new Date(i.submissionDate).toLocaleString() : ''}"`,
      `"${i.assignedSchoolCode || ''}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `school_inquiries_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast?.success?.('Exported school inquiries to CSV')
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* =========================================================
          1. HEADER BANNER
          ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
            <ClipboardList className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                School Inquiries
              </h1>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                isSettingEnabled 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60' 
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
              }`}>
                {isSettingEnabled ? '● Approval Gate ON' : '○ Direct Registration (Gate OFF)'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Review, verify credentials, edit school codes, and provision incoming campus applications before tenant creation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={loadData}
            title="Refresh Inquiries"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => onRouteChange && onRouteChange('sa-settings-general')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4" />
            <span>Inquiry Settings</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          2. DISABLED SETTING NOTICE (REQUIREMENT 6)
          ========================================================= */}
      {!isSettingEnabled && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                School Inquiry Setting is Currently OFF (Direct Instant Registration Active)
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300/90 mt-0.5 max-w-3xl leading-relaxed">
                New school applications from the public landing page or portal are currently bypassing the inquiry queue and registering directly into active campuses. All historical and pending inquiries below remain accessible for inspection and review.
              </p>
            </div>
          </div>

          <button
            onClick={() => onRouteChange && onRouteChange('sa-settings-general')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors shadow-2xs self-start sm:self-auto flex items-center gap-1.5"
          >
            <span>Enable Approval Gate</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* =========================================================
          3. STAT CARDS (ALL, PENDING, APPROVED, REJECTED)
          ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Stat 1: Total */}
        <div 
          onClick={() => setActiveFilter('ALL')}
          className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'border-purple-500 shadow-md shadow-purple-500/10 ring-2 ring-purple-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading mt-2">
            {counts.all}
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 block">
            All submitted applications
          </span>
        </div>

        {/* Stat 2: Pending */}
        <div 
          onClick={() => setActiveFilter('PENDING')}
          className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
            activeFilter === 'PENDING'
              ? 'border-amber-500 shadow-md shadow-amber-500/10 ring-2 ring-amber-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pending Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-heading mt-2">
            {counts.pending}
          </div>
          <span className="text-[11px] text-amber-700/80 dark:text-amber-300/80 mt-1 block font-medium">
            Requires Super Admin action
          </span>
        </div>

        {/* Stat 3: Approved */}
        <div 
          onClick={() => setActiveFilter('APPROVED')}
          className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
            activeFilter === 'APPROVED'
              ? 'border-emerald-500 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Approved
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-heading mt-2">
            {counts.approved}
          </div>
          <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 mt-1 block font-medium">
            Provisioned as active campuses
          </span>
        </div>

        {/* Stat 4: Rejected */}
        <div 
          onClick={() => setActiveFilter('REJECTED')}
          className={`p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all cursor-pointer ${
            activeFilter === 'REJECTED'
              ? 'border-rose-500 shadow-md shadow-rose-500/10 ring-2 ring-rose-500/20'
              : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Rejected
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400 font-heading mt-2">
            {counts.rejected}
          </div>
          <span className="text-[11px] text-rose-700/80 dark:text-rose-300/80 mt-1 block font-medium">
            Archived applications
          </span>
        </div>

      </div>

      {/* =========================================================
          4. FILTER TABS, SEARCH & BULK ACTIONS
          ========================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All', count: counts.all },
              { id: 'PENDING', label: 'Pending', count: counts.pending },
              { id: 'APPROVED', label: 'Approved', count: counts.approved },
              { id: 'REJECTED', label: 'Rejected', count: counts.rejected }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.id
                    ? 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search bar & Bulk Delete */}
          <div className="flex items-center gap-2.5 flex-1 max-w-md ml-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search school, contact, email, city..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {selectedIds.size > 0 && (
              <button
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-2xs cursor-pointer animate-fade-in"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ({selectedIds.size})</span>
              </button>
            )}
          </div>

        </div>

        {/* =========================================================
            5. DATA TABLE
            ========================================================= */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4">School & Prefix</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Contact Details</th>
                <th className="py-3 px-4">Plan / Tier</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <ClipboardList className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">No school inquiries found</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        {searchTerm ? 'No results matched your search query.' : 'There are currently no inquiries in this category.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map(inquiry => {
                  const isSelected = selectedIds.has(inquiry.id)
                  const statusUpper = (inquiry.status || 'PENDING').toUpperCase()

                  return (
                    <tr 
                      key={inquiry.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-purple-50/40 dark:bg-purple-950/20' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(inquiry.id)}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
                        />
                      </td>

                      {/* School & Code Prefix */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{inquiry.schoolName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/50">
                            Prefix: {inquiry.schoolCodePrefix || 'SCHL'}
                          </span>
                          {inquiry.assignedSchoolCode && (
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50">
                              Assigned: {inquiry.assignedSchoolCode}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Person */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {inquiry.contactPerson || 'Principal In-Charge'}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{inquiry.city || 'Lahore'}</span>
                        </span>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 dark:text-slate-300 font-mono text-[11px] flex items-center gap-1.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{inquiry.email}</span>
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 font-mono text-[11px] flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{inquiry.phone || 'N/A'}</span>
                        </div>
                      </td>

                      {/* Plan / Tier */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60">
                          {inquiry.planTier || 'Standard'}
                        </span>
                      </td>

                      {/* Submission Date */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                        {inquiry.submissionDate ? new Date(inquiry.submissionDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        }) : 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {statusUpper === 'PENDING' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Pending</span>
                          </span>
                        )}
                        {statusUpper === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Approved</span>
                          </span>
                        )}
                        {statusUpper === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Rejected</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          
                          {/* View Button */}
                          <button
                            onClick={() => handleOpenView(inquiry)}
                            title="View submitted details"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-purple-600 transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Quick Approve (If not approved) */}
                          {statusUpper !== 'APPROVED' && (
                            <button
                              onClick={() => handleOpenApproveModal(inquiry)}
                              title="Approve & Provision School"
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {/* Quick Reject (If Pending) */}
                          {statusUpper === 'PENDING' && (
                            <button
                              onClick={() => handleOpenRejectModal(inquiry)}
                              title="Reject Application"
                              className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeletingId(inquiry.id)}
                            title="Delete Inquiry"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* =========================================================
          MODAL 1: INQUIRY DETAILS (VIEW & EDIT CODE PREFIX)
          ========================================================= */}
      {viewingInquiry && (
        <Modal
          isOpen={Boolean(viewingInquiry)}
          onClose={() => setViewingInquiry(null)}
          title={`School Inquiry: ${viewingInquiry.schoolName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs sm:text-sm">
            
            {/* Header Status Strip */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Inquiry Identifier</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">{viewingInquiry.id}</span>
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block mb-0.5">Application Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-block border ${
                  viewingInquiry.status === 'Approved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : viewingInquiry.status === 'Rejected'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {viewingInquiry.status}
                </span>
              </div>
            </div>

            {/* Read-Only Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">School Full Name</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                  {viewingInquiry.schoolName}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Contact Person / Principal</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                  {viewingInquiry.contactPerson || 'Principal In-Charge'}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Official Email Address</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono">
                  {viewingInquiry.email}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Mobile / WhatsApp Number</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono">
                  {viewingInquiry.phone || 'N/A'}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">City &amp; Province</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                  {viewingInquiry.city || 'Lahore'}, {viewingInquiry.province || 'Punjab'}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Requested Plan Tier</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium flex items-center justify-between">
                  <span>{viewingInquiry.planTier || 'Standard'}</span>
                  <span className="text-[10px] text-purple-600 font-bold uppercase">SaaS License</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Campus Physical Address</label>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium">
                {viewingInquiry.address || 'Address provided upon onboarding.'}
              </div>
            </div>

            {viewingInquiry.notes && (
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Submitted Notes &amp; Special Requirements</label>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  {viewingInquiry.notes}
                </div>
              </div>
            )}

            {/* REQUIREMENT 3: EDITABLE SCHOOL CODE PREFIX */}
            <div className="p-4 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-purple-950 dark:text-purple-200 text-xs sm:text-sm">
                    <Edit2 className="w-4 h-4 text-purple-600" />
                    <span>School Code Prefix (Customizable Before Approval)</span>
                  </div>
                  <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 mt-0.5">
                    Super Admin can refine the school code prefix. Upon approval, campus code will be generated based on this prefix.
                  </p>
                </div>
                {viewingInquiry.assignedSchoolCode && (
                  <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-100 text-emerald-800 text-xs">
                    Assigned: {viewingInquiry.assignedSchoolCode}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    maxLength={6}
                    disabled={viewingInquiry.status === 'Approved'}
                    value={editingCodePrefix}
                    onChange={e => {
                      setEditingCodePrefix(e.target.value.toUpperCase())
                      setPrefixError('')
                    }}
                    placeholder="e.g. CITY, BAFC, LGS"
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-mono font-bold text-purple-950 dark:text-purple-200 uppercase focus:outline-none focus:ring-2 focus:ring-purple-500/20 disabled:opacity-60"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-mono">
                    2-6 Chars
                  </span>
                </div>

                {viewingInquiry.status !== 'Approved' && (
                  <button
                    type="button"
                    onClick={handleSaveCodePrefix}
                    disabled={isSavingPrefix || editingCodePrefix === viewingInquiry.schoolCodePrefix}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                  >
                    {isSavingPrefix ? 'Saving...' : 'Save Prefix'}
                  </button>
                )}
              </div>

              {prefixError && (
                <p className="text-[11px] text-rose-600 font-bold">{prefixError}</p>
              )}

              <div className="text-[11px] text-purple-900/70 dark:text-purple-300/70">
                Preview Next School Code: <strong className="font-mono">{editingCodePrefix || 'SCHL'}-01</strong>
              </div>
            </div>

            {/* Rejection notice if rejected */}
            {viewingInquiry.status === 'Rejected' && viewingInquiry.rejectionReason && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200">
                <span className="font-bold block mb-1">Rejection Reason:</span>
                <p>{viewingInquiry.rejectionReason}</p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingId(viewingInquiry.id)
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                >
                  Delete Inquiry
                </button>
              </div>

              <div className="flex items-center gap-2">
                {viewingInquiry.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenRejectModal(viewingInquiry)
                      }}
                      className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Reject Application
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenApproveModal(viewingInquiry)
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve &amp; Provision</span>
                    </button>
                  </>
                )}

                {viewingInquiry.status === 'Rejected' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenApproveModal(viewingInquiry)
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer"
                  >
                    Re-evaluate &amp; Approve
                  </button>
                )}

                {viewingInquiry.status === 'Approved' && (
                  <button
                    type="button"
                    onClick={() => {
                      setViewingInquiry(null)
                      if (onRouteChange) onRouteChange('institutes')
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <span>View in Institutes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewingInquiry(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL 2: CONFIRM APPROVAL & PROVISIONING
          ========================================================= */}
      {approvingInquiry && (
        <Modal
          isOpen={Boolean(approvingInquiry)}
          onClose={() => setApprovingInquiry(null)}
          title="Approve School Application & Provision Campus"
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-sm">Transactional Campus Provisioning</span>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 mt-0.5">
                  Approving will automatically create the active institute record, provision its database tenant partition, create the initial administrator login account, and set up the default educational modules.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">School Name</label>
              <input
                type="text"
                readOnly
                value={approvingInquiry.schoolName}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">School Code Prefix</label>
                <input
                  type="text"
                  maxLength={6}
                  value={approvalCodePrefix}
                  onChange={e => setApprovalCodePrefix(e.target.value.toUpperCase().replace(/[^A-Za-z0-9]/g, ''))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono font-bold uppercase text-purple-700 dark:text-purple-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Temporary Admin Password</label>
                <input
                  type="text"
                  value={approvalPassword}
                  onChange={e => setApprovalPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Administrator Email (Login ID)</label>
              <input
                type="text"
                readOnly
                value={approvingInquiry.email}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Super Admin Approval Notes (Optional)</label>
              <textarea
                rows={2}
                value={approvalNotes}
                onChange={e => setApprovalNotes(e.target.value)}
                placeholder="e.g. Verified registration documents and approved for 14-day evaluation."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setApprovingInquiry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmApproval}
                disabled={isProcessingApproval}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessingApproval ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Provisioning Campus...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirm &amp; Provision</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL 3: PROVISIONING SUCCESS & CREDENTIALS READY
          ========================================================= */}
      {approvedResult && (
        <Modal
          isOpen={Boolean(approvedResult)}
          onClose={() => setApprovedResult(null)}
          title="Campus Successfully Provisioned & Activated!"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-center py-2">
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {approvedResult.inquiry?.schoolName}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                The school has been provisioned as an active tenant. The administrator credentials below can be provided to the school principal.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">School Code:</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">{approvedResult.assignedCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Admin Email:</span>
                <span className="font-bold text-slate-900 dark:text-white">{approvedResult.adminEmail}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password:</span>
                <span className="font-bold text-emerald-600">{approvedResult.adminPassword}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`School: ${approvedResult.inquiry?.schoolName}\nCode: ${approvedResult.assignedCode}\nEmail: ${approvedResult.adminEmail}\nPassword: ${approvedResult.adminPassword}`)
                  toast?.success?.('Credentials copied to clipboard!')
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setApprovedResult(null)
                  if (onRouteChange) onRouteChange('institutes')
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Go to Manage Schools</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL 4: REJECTION REASON DIALOG
          ========================================================= */}
      {rejectingInquiry && (
        <Modal
          isOpen={Boolean(rejectingInquiry)}
          onClose={() => setRejectingInquiry(null)}
          title={`Reject Application: ${rejectingInquiry.schoolName}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <p className="text-slate-600 dark:text-slate-300">
              Please specify the reason for rejecting this inquiry. The inquiry will remain stored under the <strong>Rejected</strong> filter for audit purposes.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete school accreditation documents or unverified principal identity."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingInquiry(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejection}
                disabled={isProcessingRejection}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer"
              >
                {isProcessingRejection ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL 5: SINGLE DELETE CONFIRMATION
          ========================================================= */}
      {deletingId && (
        <Modal
          isOpen={Boolean(deletingId)}
          onClose={() => setDeletingId(null)}
          title="Delete School Inquiry"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-center py-2 text-xs sm:text-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Are you sure?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This inquiry record will be permanently deleted from the system. This action cannot be undone.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          MODAL 6: BULK DELETE CONFIRMATION
          ========================================================= */}
      {isBulkDeleteModalOpen && (
        <Modal
          isOpen={isBulkDeleteModalOpen}
          onClose={() => setIsBulkDeleteModalOpen(false)}
          title="Bulk Delete Inquiries"
          maxWidth="max-w-sm"
        >
          <div className="space-y-4 text-center py-2 text-xs sm:text-sm">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Delete {selectedIds.size} Selected Inquiries?
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                All {selectedIds.size} selected inquiry records will be permanently removed from the system.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-2xs cursor-pointer"
              >
                {isDeleting ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

export default SchoolInquiriesView
