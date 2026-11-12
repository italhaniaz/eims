import React, { useState, useMemo } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Users,
  User,
  AlertTriangle,
  Search,
  Printer,
  Eye,
  Settings
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { isClassAllowedForTier } from '../../../utils/tierGating'
import Modal from '../../../components/common/Modal'

const normalizeParentKey = (name, phone) => {
  const cleanName = String(name || '').trim().toLowerCase().replace(/\s+/g, ' ')
  const cleanPhone = String(phone || '').replace(/\D/g, '')
  if (!cleanName && !cleanPhone) return ''
  return cleanPhone ? `${cleanName}__${cleanPhone.slice(-10)}` : cleanName
}

const fmtAmount = (n) =>
  Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const FamilyInvoicesView = ({
  currentInstitute,
  onRouteChange,
  onOpenBillingHistory,
  onOpenQuickPayment
}) => {
  const { students = [], fees = [], updateItem } = useAppData()
  const { toast } = useToast()

  const instStudents = useMemo(
    () =>
      students.filter((s) => {
        if (currentInstitute?.id && s.instituteId && s.instituteId !== currentInstitute.id) return false
        if (!isClassAllowedForTier(s.className, currentInstitute)) return false
        const st = String(s.status || 'Active').toLowerCase()
        return !['dropped', 'left', 'withdrawn', 'graduated'].includes(st)
      }),
    [students, currentInstitute]
  )

  // Compute pending due per student from fees
  const dueByStudent = useMemo(() => {
    const map = {}
    for (const f of fees) {
      if (currentInstitute?.id && f.instituteId && f.instituteId !== currentInstitute.id) continue
      const sid = f.studentId || f.student_id
      if (!sid) continue
      const st = String(f.status || '').toLowerCase()
      if (['paid', 'cancelled', 'waived'].includes(st)) continue
      const total = Number(f.amount ?? f.totalAmount ?? 0)
      const paid = Number(f.paidAmount ?? f.amountPaid ?? 0)
      const due = Math.max(0, total - paid)
      if (due > 0) {
        map[sid] = (map[sid] || 0) + due
      }
    }
    return map
  }, [fees, currentInstitute])

  // Group students into families
  const { families, unlinkedStudents } = useMemo(() => {
    const map = new Map()
    const unlinked = []

    for (const s of instStudents) {
      const pName = (s.guardianName || s.fatherName || '').trim()
      const pPhone = (s.guardianPhone || s.fatherPhone || s.parentPhone || s.phone || '').trim()
      if (!pName) {
        unlinked.push(s)
        continue
      }
      const key = s.parentId || `fam_${normalizeParentKey(pName, pPhone)}`
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          parentName: pName,
          phone: pPhone,
          children: []
        })
      }
      const fam = map.get(key)
      if (!fam.phone && pPhone) fam.phone = pPhone
      fam.children.push({
        ...s,
        due: dueByStudent[s.id] || 0
      })
    }

    const list = Array.from(map.values()).map((fam) => ({
      ...fam,
      totalDue: fam.children.reduce((sum, c) => sum + c.due, 0)
    }))

    return { families: list, unlinkedStudents: unlinked }
  }, [instStudents, dueByStudent])

  const siblingsCount = useMemo(
    () => families.filter((f) => f.children.length >= 2).length,
    [families]
  )
  const singleChildCount = useMemo(
    () => families.filter((f) => f.children.length === 1).length,
    [families]
  )

  // UI State
  const [activeTab, setActiveTab] = useState('siblings') // 'siblings' | 'single' | 'unlinked'
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [showZeroPending, setShowZeroPending] = useState(false)
  const [selectedFamilyIds, setSelectedFamilyIds] = useState([])

  // Modals
  const [previewFamilies, setPreviewFamilies] = useState(null) // array of family objects
  const [manageFamily, setManageFamily] = useState(null)
  const [childLinkSearch, setChildLinkSearch] = useState('')

  const displayedFamilies = useMemo(() => {
    if (activeTab === 'unlinked') return []
    let list =
      activeTab === 'siblings'
        ? families.filter((f) => f.children.length >= 2)
        : families.filter((f) => f.children.length === 1)

    if (!showZeroPending) {
      list = list.filter((f) => f.totalDue > 0)
    }

    const q = appliedSearch.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (f) =>
          f.parentName.toLowerCase().includes(q) ||
          (f.phone || '').toLowerCase().includes(q) ||
          f.children.some(
            (c) =>
              (c.name || '').toLowerCase().includes(q) ||
              (c.admissionNo || '').toLowerCase().includes(q) ||
              (c.rollNumber || '').toLowerCase().includes(q)
          )
      )
    }

    return list
  }, [families, activeTab, showZeroPending, appliedSearch])

  const allDisplayedSelected =
    displayedFamilies.length > 0 &&
    displayedFamilies.every((f) => selectedFamilyIds.includes(f.id))

  const handlePrintInvoices = (targetFamilies) => {
    if (!targetFamilies || targetFamilies.length === 0) return
    const win = window.open('', '_blank', 'width=900,height=750')
    if (!win) {
      toast.warning('Please allow pop-ups to print family invoices')
      return
    }
    const instName = currentInstitute?.name || 'Institute Management System'
    const blocks = targetFamilies
      .map(
        (fam) => `
        <div class="inv">
          <div class="hdr">
            <div>
              <div class="inst">${instName}</div>
              <div class="sub">Consolidated Family Fee Invoice</div>
            </div>
            <div style="text-align:right;font-size:12px;">
              <div><strong>Parent:</strong> ${fam.parentName}</div>
              <div><strong>Phone:</strong> ${fam.phone || '—'}</div>
            </div>
          </div>
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Roll / Adm No</th><th style="text-align:right">Due (PKR)</th></tr></thead>
            <tbody>
              ${fam.children
                .map(
                  (c) => `
                  <tr>
                    <td>${c.name}</td>
                    <td>${c.className || '—'}</td>
                    <td>${c.rollNumber || '—'} / ${c.admissionNo || '—'}</td>
                    <td style="text-align:right;font-weight:bold;">${c.due > 0 ? fmtAmount(c.due) : 'Paid up'}</td>
                  </tr>
                `
                )
                .join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align:right;font-weight:bold;">Total Family Due</td>
                <td style="text-align:right;font-weight:bold;color:#dc2626;">PKR ${fmtAmount(fam.totalDue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      `
      )
      .join('')

    win.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Family Invoices</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #1e293b; }
            .inv { border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-bottom: 24px; page-break-inside: avoid; }
            .hdr { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 14px; }
            .inst { font-size: 18px; font-weight: bold; }
            .sub { font-size: 12px; color: #64748b; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border-bottom: 1px solid #e2e8f0; padding: 8px; text-align: left; }
            th { background: #f8fafc; font-size: 11px; text-transform: uppercase; color: #64748b; }
          </style>
        </head>
        <body>
          ${blocks}
          <script>window.onload = function(){ window.print(); }</script>
        </body>
      </html>
    `)
    win.document.close()
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Family Invoices</h1>
          </div>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-admissions-enroll')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Enrollment
          </button>
          <button
            type="button"
            onClick={() => onOpenQuickPayment?.()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Add Payment
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Receipt className="w-3.5 h-3.5" />
            Generate Invoice
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-finance-expenses')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Manage Expense
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-comm-sms')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Send SMS
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('siblings')}
          className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 shadow-sm p-4 flex items-center gap-3.5 text-left transition-all"
        >
          <div className="w-11 h-11 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Parents/Guardians</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{families.length}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('siblings')}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3.5 text-left transition-all ${
            activeTab === 'siblings' ? 'border-2 border-emerald-400' : 'border border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Siblings (2+ Children)</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{siblingsCount}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('single')}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3.5 text-left transition-all ${
            activeTab === 'single' ? 'border-2 border-cyan-400' : 'border border-slate-200 hover:border-cyan-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Single Child</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{singleChildCount}</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unlinked')}
          className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3.5 text-left transition-all ${
            activeTab === 'unlinked' ? 'border-2 border-orange-400' : 'border border-slate-200 hover:border-orange-300'
          }`}
        >
          <div className="w-11 h-11 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Unlinked Students</p>
            <p className="text-xl font-bold text-slate-900 leading-tight mt-0.5">{unlinkedStudents.length}</p>
          </div>
        </button>
      </div>

      {/* Main Family Invoices Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Top Search & Tabs Toolbar */}
        <div className="p-4 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="flex items-center">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') setAppliedSearch(searchInput)
                  }}
                  placeholder="Name, admission no. or ro..."
                  className="w-44 sm:w-52 px-3 py-1.5 text-xs rounded-l-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setAppliedSearch(searchInput)}
                  className="px-2.5 py-1.5 rounded-r-md border border-l-0 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600"
                  aria-label="Search"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Segmented Tabs */}
              <div className="inline-flex rounded-md border border-slate-200 overflow-hidden text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('siblings')
                    setSelectedFamilyIds([])
                  }}
                  className={`px-3 py-1.5 transition-colors ${
                    activeTab === 'siblings'
                      ? 'bg-slate-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Siblings Invoices
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('single')
                    setSelectedFamilyIds([])
                  }}
                  className={`px-3 py-1.5 border-l border-slate-200 transition-colors ${
                    activeTab === 'single'
                      ? 'bg-slate-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Single Child Invoices
                </button>
              </div>

              {/* 0 Pending Checkbox */}
              {activeTab !== 'unlinked' && (
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer ml-1">
                  <input
                    type="checkbox"
                    checked={showZeroPending}
                    onChange={(e) => setShowZeroPending(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Show families with 0 pending fee too</span>
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={() => handlePrintInvoices(displayedFamilies)}
              disabled={displayedFamilies.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-blue-200 bg-white hover:bg-blue-50 disabled:opacity-40 text-blue-600 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print All ({displayedFamilies.length})
            </button>
          </div>

          {activeTab !== 'unlinked' && (
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedFamilyIds(displayedFamilies.map((f) => f.id))}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFamilyIds([])}
                  className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-semibold"
                >
                  Deselect All
                </button>
                <span className="text-[11px] text-slate-400">{selectedFamilyIds.length} selected</span>
              </div>

              <button
                type="button"
                disabled={selectedFamilyIds.length === 0}
                onClick={() =>
                  setPreviewFamilies(displayedFamilies.filter((f) => selectedFamilyIds.includes(f.id)))
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-xs font-semibold transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Selected Invoices
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        {activeTab === 'unlinked' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Roll / Adm No</th>
                  <th className="py-3 px-4 text-right">Pending Due</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {unlinkedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      All active students are linked to a parent / guardian.
                    </td>
                  </tr>
                ) : (
                  unlinkedStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-3 px-4 text-slate-600">{s.className || '—'}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {s.rollNumber || '—'} / {s.admissionNo || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-rose-600">
                        {dueByStudent[s.id] ? fmtAmount(dueByStudent[s.id]) : 'Paid up'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => onRouteChange?.('inst-students-guardians')}
                          className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold"
                        >
                          Link Parent
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600">
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={allDisplayedSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFamilyIds(displayedFamilies.map((f) => f.id))
                        } else {
                          setSelectedFamilyIds([])
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-3 px-4 min-w-[190px]">Parent/Guardian</th>
                  <th className="py-3 px-4 min-w-[340px]">Children</th>
                  <th className="py-3 px-4 text-right min-w-[110px]">Total Due</th>
                  <th className="py-3 px-4 text-right min-w-[150px]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedFamilies.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No matching family invoices found. Try checking &quot;Show families with 0 pending fee too&quot;.
                    </td>
                  </tr>
                ) : (
                  displayedFamilies.map((fam) => {
                    const checked = selectedFamilyIds.includes(fam.id)
                    return (
                      <tr key={fam.id} className="hover:bg-slate-50/60 align-top">
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedFamilyIds((prev) =>
                                prev.includes(fam.id)
                                  ? prev.filter((id) => id !== fam.id)
                                  : [...prev, fam.id]
                              )
                            }
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1"
                          />
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">{fam.parentName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{fam.phone || 'No phone'}</div>
                          <button
                            type="button"
                            onClick={() => {
                              setChildLinkSearch('')
                              setManageFamily(fam)
                            }}
                            className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-medium transition-colors"
                          >
                            <Settings className="w-3 h-3" />
                            Manage Children
                          </button>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1.5">
                            {fam.children.map((ch) => (
                              <div
                                key={ch.id}
                                className="flex items-center justify-between gap-4 text-xs"
                              >
                                <button
                                  type="button"
                                  onClick={() => onOpenBillingHistory?.(ch.id)}
                                  className="text-left hover:text-blue-600 hover:underline"
                                >
                                  <span className="font-medium text-slate-800">{ch.name}</span>{' '}
                                  <span className="text-[11px] text-slate-400">
                                    ({ch.className || 'N/A'})
                                  </span>
                                </button>
                                <span
                                  className={`font-semibold text-[11px] shrink-0 ${
                                    ch.due > 0 ? 'text-rose-600' : 'text-slate-400'
                                  }`}
                                >
                                  {ch.due > 0 ? fmtAmount(ch.due) : 'Paid up'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <span
                            className={`font-bold text-xs ${
                              fam.totalDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {fam.totalDue > 0 ? fmtAmount(fam.totalDue) : 'Paid up'}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setPreviewFamilies([fam])}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold shadow-2xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Generate Invoice
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview / Generate Family Invoice Modal */}
      {previewFamilies && (
        <Modal
          isOpen
          onClose={() => setPreviewFamilies(null)}
          title={
            previewFamilies.length === 1
              ? `Family Invoice — ${previewFamilies[0].parentName}`
              : `Family Invoices Preview (${previewFamilies.length} families)`
          }
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="max-h-[60vh] overflow-y-auto space-y-4">
              {previewFamilies.map((fam) => (
                <div key={fam.id} className="border border-slate-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{fam.parentName}</div>
                      <div className="text-[11px] text-slate-500">{fam.phone || 'No phone on file'}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase text-slate-400 block">Total Family Due</span>
                      <span className="text-sm font-extrabold text-rose-600">
                        PKR {fmtAmount(fam.totalDue)}
                      </span>
                    </div>
                  </div>

                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase text-slate-400 border-b border-slate-100">
                        <th className="py-1.5">Student</th>
                        <th className="py-1.5">Class</th>
                        <th className="py-1.5 text-right">Due (PKR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fam.children.map((ch) => (
                        <tr key={ch.id}>
                          <td className="py-2 font-medium text-slate-800">{ch.name}</td>
                          <td className="py-2 text-slate-500">{ch.className || '—'}</td>
                          <td className="py-2 text-right font-semibold text-rose-600">
                            {ch.due > 0 ? fmtAmount(ch.due) : 'Paid up'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewFamilies(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => handlePrintInvoices(previewFamilies)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Invoice(s)
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manage Children Modal */}
      {manageFamily && (
        <Modal
          isOpen
          onClose={() => setManageFamily(null)}
          title={`Manage Children — ${manageFamily.parentName}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-3 text-xs">
            <input
              type="text"
              value={childLinkSearch}
              onChange={(e) => setChildLinkSearch(e.target.value)}
              placeholder="Search student to link or view..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
              {instStudents
                .filter((st) => {
                  const q = childLinkSearch.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (st.name || '').toLowerCase().includes(q) ||
                    (st.rollNumber || '').toLowerCase().includes(q)
                  )
                })
                .slice(0, 40)
                .map((st) => {
                  const isLinked = manageFamily.children.some((c) => c.id === st.id)
                  return (
                    <div key={st.id} className="px-3 py-2 flex items-center justify-between gap-2">
                      <div>
                        <div className="font-semibold text-slate-800">{st.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {st.className || 'N/A'} • Roll: {st.rollNumber || '—'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await updateItem('students', st.id, {
                              guardianName: isLinked ? '' : manageFamily.parentName,
                              fatherName: isLinked ? '' : manageFamily.parentName,
                              fatherPhone: isLinked ? st.fatherPhone : manageFamily.phone
                            })
                            toast.success(
                              isLinked
                                ? `Unlinked ${st.name} from ${manageFamily.parentName}`
                                : `Linked ${st.name} to ${manageFamily.parentName}`
                            )
                          } catch {
                            toast.error('Failed to update student parent link')
                          }
                        }}
                        className={`px-3 py-1 rounded text-[11px] font-semibold border ${
                          isLinked
                            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                            : 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {isLinked ? 'Unlink' : 'Link'}
                      </button>
                    </div>
                  )
                })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default FamilyInvoicesView
