import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  Settings,
  Search,
  Copy,
  CheckCircle2,
  Trash2
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import ConvertStudentModal from './ConvertStudentModal'
import { recordCampusLedgerTransaction } from '../institute-admin/accounts/CampusAccountsView'

const APPLICATION_STATUSES = ['Submitted', 'Under review', 'Documents required', 'Accepted', 'Rejected']

const getSettingsStorageKey = (instId) => `eims_online_app_settings_${instId || 'default'}`

const loadSettings = (instId) => {
  try {
    const raw = localStorage.getItem(getSettingsStorageKey(instId))
    if (raw) return JSON.parse(raw)
  } catch {}
  return {
    isOpen: false,
    applicationFee: '0',
    requiredDocuments: '',
    instructions: ''
  }
}

export const OnlineApplicationsView = ({ currentInstitute, onRouteChange }) => {
  const {
    admissionsPipeline = [],
    students = [],
    classes = [],
    addItem,
    updateItem,
    deleteItem,
    logAuditEvent
  } = useAppData()
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'inst-1'
  const [settings, setSettings] = useState(() => loadSettings(instId))
  const [showSettingsPanel, setShowSettingsPanel] = useState(true)
  const [statusFilter, setStatusFilter] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [enrollTarget, setEnrollTarget] = useState(null)

  const formShareUrl = useMemo(() => {
    const base = typeof window !== 'undefined' ? window.location.origin : 'https://edudigitize.io'
    return `${base}/apply/${encodeURIComponent(instId)}`
  }, [instId])

  const handleSaveSettings = (e) => {
    e.preventDefault()
    try {
      localStorage.setItem(getSettingsStorageKey(instId), JSON.stringify(settings))
      logAuditEvent?.(
        `Updated Online Applications form settings (${settings.isOpen ? 'Open' : 'Closed'})`,
        currentInstitute?.name || 'Admin',
        'Success'
      )
      toast('Online application form settings saved.', 'success')
    } catch {
      toast('Could not save settings locally.', 'error')
    }
  }

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(formShareUrl)
      toast('Online application link copied.', 'success')
    } catch {
      toast('Could not copy link.', 'error')
    }
  }

  // Filter online applications from admissionsPipeline
  const onlineApplications = useMemo(() => {
    return admissionsPipeline
      .filter(
        (item) =>
          (!currentInstitute?.id || !item.instituteId || item.instituteId === currentInstitute.id) &&
          (item.source === 'Website / Online' || item.source === 'Website' || item.isOnlineApplication)
      )
      .map((item, idx) => {
        const appStatus = APPLICATION_STATUSES.includes(item.onlineStatus)
          ? item.onlineStatus
          : item.stage === 'Enrolled'
            ? 'Accepted'
            : item.stage === 'Rejected'
              ? 'Rejected'
              : 'Submitted'
        return {
          ...item,
          refNo: item.referenceNo || `APP-${String(item.id || idx + 1).slice(-6).toUpperCase()}`,
          appStatus
        }
      })
  }, [admissionsPipeline, currentInstitute?.id])

  const counts = useMemo(() => {
    const map = { All: onlineApplications.length }
    APPLICATION_STATUSES.forEach((st) => {
      map[st] = onlineApplications.filter((a) => a.appStatus === st).length
    })
    return map
  }, [onlineApplications])

  const filteredApps = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    return onlineApplications.filter((app) => {
      if (statusFilter !== 'All' && app.appStatus !== statusFilter) return false
      if (!q) return true
      return (
        (app.studentName || '').toLowerCase().includes(q) ||
        (app.parentName || '').toLowerCase().includes(q) ||
        (app.refNo || '').toLowerCase().includes(q) ||
        (app.parentPhone || '').toLowerCase().includes(q)
      )
    })
  }, [onlineApplications, statusFilter, searchTerm])

  const handleStatusChange = async (app, nextStatus) => {
    try {
      await updateItem('admissionsPipeline', app.id, {
        onlineStatus: nextStatus,
        stage: nextStatus === 'Accepted' ? 'Offer Issued' : nextStatus === 'Rejected' ? 'Rejected' : 'Contacted'
      })
      toast(`Application marked as ${nextStatus}.`, 'success')
    } catch {
      toast('Failed to update status.', 'error')
    }
  }

  const handleDeleteApp = async (app) => {
    const ok = window.confirm(`Delete online application ${app.refNo} (${app.studentName})?`)
    if (!ok) return
    try {
      await deleteItem('admissionsPipeline', app.id)
      toast('Application removed.', 'info')
    } catch {
      toast('Could not delete application.', 'error')
    }
  }

  const handleConfirmEnroll = async (lead, enrollData) => {
    const todayIso = new Date().toISOString().split('T')[0]
    await addItem('students', {
      name: enrollData.name,
      rollNumber: enrollData.rollNumber,
      className: enrollData.className,
      section: enrollData.section,
      gender: enrollData.gender || 'Male',
      bFormCnic: enrollData.bFormCnic || '',
      dob: enrollData.dob || '',
      phone: enrollData.guardianPhone || enrollData.phone || '',
      fatherName: enrollData.fatherName || '',
      fatherCnic: enrollData.fatherCnic || '',
      address: enrollData.address || '',
      city: enrollData.city || 'Lahore',
      email: enrollData.email || '',
      status: 'Active',
      feeStatus: enrollData.feeStatus || 'Pending',
      instituteId: instId,
      campus: currentInstitute?.name || 'Main Campus',
      admittedFromPipelineId: lead.id,
      admissionDate: todayIso
    })
    await addItem('fees', {
      studentName: enrollData.name,
      rollNumber: enrollData.rollNumber,
      className: enrollData.className,
      amount: Number(enrollData.admissionFeeAmount) || 25000,
      grossAmount: Number(enrollData.admissionFeeAmount) || 25000,
      discount: 0,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: enrollData.feeStatus === 'Paid' ? 'Paid' : 'Pending',
      feeTitle: 'Admission Enrollment & Security Fee',
      instituteId: instId,
      paidAt: enrollData.feeStatus === 'Paid' ? new Date().toISOString() : null
    })
    if (enrollData.feeStatus === 'Paid') {
      recordCampusLedgerTransaction(instId, {
        id: `VCH-ADM-${Date.now().toString().slice(-6)}`,
        date: todayIso,
        description: `Admission Fee - ${enrollData.name} (${enrollData.rollNumber})`,
        type: 'Income',
        category: 'Admissions Fee',
        debit: 0,
        credit: Number(enrollData.admissionFeeAmount) || 25000,
        account: 'Cash',
        status: 'Cleared'
      })
    }
    await updateItem('admissionsPipeline', lead.id, {
      onlineStatus: 'Accepted',
      stage: 'Enrolled',
      enrolledAt: new Date().toISOString()
    })
    toast(`${enrollData.name} enrolled successfully!`, 'success')
    setEnrollTarget(null)
  }

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Top Header matching Pick 1 */}
      <div>
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="w-5 h-5 text-slate-600" />
          <h1 className="text-lg font-bold tracking-tight">Online Applications</h1>
        </div>
        <button
          type="button"
          onClick={() => onRouteChange?.('inst-dashboard')}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 mt-0.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      {/* Main White Card matching Pick 1 */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-5">
        {/* Form Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span
              className={`px-2.5 py-0.5 rounded text-[11px] font-bold text-white ${
                settings.isOpen ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              {settings.isOpen ? 'Form is open' : 'Form is closed'}
            </span>
            {settings.isOpen ? (
              <div className="flex flex-wrap items-center gap-2 text-slate-600">
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {formShareUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy link</span>
                </button>
              </div>
            ) : (
              <span className="text-slate-500">Turn it on in Form settings to share the link.</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowSettingsPanel((s) => !s)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Form settings</span>
          </button>
        </div>

        {/* Form Settings Section */}
        {showSettingsPanel && (
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(settings.isOpen)}
                onChange={(e) => setSettings((p) => ({ ...p, isOpen: e.target.checked }))}
                className="mt-0.5 rounded border-slate-300 text-blue-600"
              />
              <div>
                <p className="font-bold text-slate-800">Accept online applications</p>
                <p className="text-[11px] text-slate-400">When off, parents see &ldquo;Admissions closed&rdquo;.</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Application fee (0 = free)
                </label>
                <input
                  type="number"
                  min="0"
                  value={settings.applicationFee}
                  onChange={(e) => setSettings((p) => ({ ...p, applicationFee: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="md:col-span-9">
                <label className="block font-semibold text-slate-700 mb-1">Required documents</label>
                <input
                  type="text"
                  placeholder="Birth certificate, previous report card, 2 photos"
                  value={settings.requiredDocuments}
                  onChange={(e) => setSettings((p) => ({ ...p, requiredDocuments: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Instructions for parents</label>
              <textarea
                rows={3}
                placeholder="Payment details, important dates, contact"
                value={settings.instructions}
                onChange={(e) => setSettings((p) => ({ ...p, instructions: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                Save settings
              </button>
            </div>
          </form>
        )}

        {/* Filter Pills + Search */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                statusFilter === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {APPLICATION_STATUSES.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold cursor-pointer transition-colors ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {st} ({counts[st] || 0})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name, reference,"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-52 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Applications List / Empty State matching Pick 1 */}
        {filteredApps.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No applications yet. Share the form link with parents.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Applicant</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{app.refNo}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{app.studentName}</p>
                      <p className="text-[11px] text-slate-400">{app.parentName || '—'}</p>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{app.gradeApplied || '—'}</td>
                    <td className="py-2.5 px-3 text-blue-600">{app.parentPhone || '—'}</td>
                    <td className="py-2.5 px-3">
                      <select
                        value={app.appStatus}
                        onChange={(e) => handleStatusChange(app, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-200 bg-white text-[11px] font-semibold text-slate-700"
                      >
                        {APPLICATION_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {app.stage !== 'Enrolled' && (
                          <button
                            type="button"
                            onClick={() => setEnrollTarget(app)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Enroll</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteApp(app)}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {enrollTarget && (
        <ConvertStudentModal
          isOpen={Boolean(enrollTarget)}
          onClose={() => setEnrollTarget(null)}
          lead={enrollTarget}
          currentInstitute={currentInstitute}
          classes={classes}
          students={students}
          onConfirmEnrollment={handleConfirmEnroll}
        />
      )}
    </div>
  )
}

export default OnlineApplicationsView
