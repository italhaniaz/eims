import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  List,
  AlarmClock,
  Star,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Plus,
  Printer,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Menu,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { downloadSimplePdf } from '../../utils/pdfExport'
import { getDistinctInstituteClassNames } from '../../utils/tierGating'
import LeadDetailsDrawer from './LeadDetailsDrawer'
import ConvertStudentModal from './ConvertStudentModal'
import { recordCampusLedgerTransaction } from '../institute-admin/accounts/CampusAccountsView'

const HOW_FOUND_OPTIONS = [
  'Not specified',
  'Walk-in',
  'Phone Call',
  'Website',
  'Social Media',
  'Referral',
  'Advertisement',
  'Other'
]

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const pad2 = (n) => String(n).padStart(2, '0')
const getTodayIso = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

const formatFollowUpDate = (iso) => {
  if (!iso) return '—'
  const parts = String(iso).slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  return `${pad2(Number(d))} ${SHORT_MONTHS[Number(m) - 1] || m} ${y}`
}

const normalizeInquiryStatus = (lead) => {
  const explicit = String(lead?.inquiryStatus || '').trim()
  if (['New', 'In Follow-Up', 'Enrolled', 'Closed'].includes(explicit)) return explicit
  const st = String(lead?.stage || '').trim()
  if (st === 'Enrolled') return 'Enrolled'
  if (['Lost', 'Withdrawn', 'Rejected', 'Closed'].includes(st)) return 'Closed'
  if (['Contacted', 'Test/Interview Scheduled', 'Test Done', 'Interview Done', 'Offer Issued', 'Fee Paid', 'In Follow-Up'].includes(st)) {
    return 'In Follow-Up'
  }
  return 'New'
}

const statusToStage = (status) => {
  if (status === 'Enrolled') return 'Enrolled'
  if (status === 'Closed') return 'Lost'
  if (status === 'In Follow-Up') return 'Contacted'
  return 'Inquiry Received'
}

export const AdmissionInquiriesView = ({ currentInstitute, onRouteChange }) => {
  const {
    admissionsPipeline = [],
    students = [],
    classes = [],
    addItem,
    updateItem,
    deleteItem,
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()
  const { user } = useAuth() || {}
  const { toast } = useToast()

  const instId = currentInstitute?.id || 'inst-1'
  const todayIso = useMemo(() => getTodayIso(), [])
  const availableClasses = useMemo(
    () => getDistinctInstituteClassNames(classes, students, currentInstitute),
    [classes, students, currentInstitute]
  )

  const [kpiFilter, setKpiFilter] = useState('all') // 'all' | 'due' | 'New' | 'In Follow-Up' | 'Enrolled' | 'Closed'
  const [searchTerm, setSearchTerm] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortKey, setSortKey] = useState('sn')
  const [sortDir, setSortDir] = useState('asc')

  // Column visibility menu
  const [visMenuOpen, setVisMenuOpen] = useState(false)
  const visMenuRef = useRef(null)
  const [visibleCols, setVisibleCols] = useState({
    mobile: true,
    class: true,
    source: true,
    status: true,
    nextFollowUp: true,
    actions: true
  })

  // Row action dropdown
  const [openRowMenuId, setOpenRowMenuId] = useState(null)

  // Add / Edit Inquiry Modal (Picks 3, 4 & 5)
  const [inquiryModalOpen, setInquiryModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formState, setFormState] = useState({
    studentName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    gradeApplied: '',
    source: 'Not specified',
    nextFollowUpDate: '',
    notes: ''
  })

  // Follow Up Modal
  const [followUpLead, setFollowUpLead] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({
    status: 'In Follow-Up',
    nextFollowUpDate: '',
    note: ''
  })

  // SMS Quick Modal
  const [smsLead, setSmsLead] = useState(null)
  const [smsText, setSmsText] = useState('')

  // Details Drawer & Enroll Modal
  const [drawerLead, setDrawerLead] = useState(null)
  const [enrollLead, setEnrollLead] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      if (visMenuRef.current && !visMenuRef.current.contains(e.target)) {
        setVisMenuOpen(false)
      }
      if (!e.target.closest?.('[data-row-menu]')) {
        setOpenRowMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const instituteInquiries = useMemo(() => {
    return admissionsPipeline
      .filter((l) => !currentInstitute?.id || !l.instituteId || l.instituteId === currentInstitute.id)
      .map((l, idx) => {
        const status = normalizeInquiryStatus(l)
        const followDate = l.nextFollowUpDate || l.followUpDate || ''
        const isOverdue =
          Boolean(followDate) &&
          followDate < todayIso &&
          status !== 'Enrolled' &&
          status !== 'Closed'
        const isDue =
          Boolean(followDate) &&
          followDate <= todayIso &&
          status !== 'Enrolled' &&
          status !== 'Closed'
        const rawSource = l.source && l.source !== 'Not specified' ? l.source : ''
        return {
          ...l,
          sn: idx + 1,
          computedStatus: status,
          followDate,
          isOverdue,
          isDue,
          displaySource: rawSource || '—'
        }
      })
  }, [admissionsPipeline, currentInstitute?.id, todayIso])

  const kpis = useMemo(() => {
    return {
      all: instituteInquiries.length,
      due: instituteInquiries.filter((i) => i.isDue).length,
      New: instituteInquiries.filter((i) => i.computedStatus === 'New').length,
      'In Follow-Up': instituteInquiries.filter((i) => i.computedStatus === 'In Follow-Up').length,
      Enrolled: instituteInquiries.filter((i) => i.computedStatus === 'Enrolled').length,
      Closed: instituteInquiries.filter((i) => i.computedStatus === 'Closed').length
    }
  }, [instituteInquiries])

  const filteredInquiries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    let list = instituteInquiries.filter((item) => {
      if (kpiFilter === 'due' && !item.isDue) return false
      if (['New', 'In Follow-Up', 'Enrolled', 'Closed'].includes(kpiFilter) && item.computedStatus !== kpiFilter) {
        return false
      }
      if (!q) return true
      return (
        (item.studentName || '').toLowerCase().includes(q) ||
        (item.parentName || '').toLowerCase().includes(q) ||
        (item.parentPhone || '').toLowerCase().includes(q) ||
        (item.gradeApplied || '').toLowerCase().includes(q) ||
        (item.displaySource || '').toLowerCase().includes(q) ||
        item.computedStatus.toLowerCase().includes(q)
      )
    })

    list = [...list].sort((a, b) => {
      let va = ''
      let vb = ''
      if (sortKey === 'sn') {
        va = a.sn
        vb = b.sn
      } else if (sortKey === 'student') {
        va = (a.studentName || '').toLowerCase()
        vb = (b.studentName || '').toLowerCase()
      } else if (sortKey === 'mobile') {
        va = (a.parentPhone || '').toLowerCase()
        vb = (b.parentPhone || '').toLowerCase()
      } else if (sortKey === 'class') {
        va = (a.gradeApplied || '').toLowerCase()
        vb = (b.gradeApplied || '').toLowerCase()
      } else if (sortKey === 'source') {
        va = (a.displaySource || '').toLowerCase()
        vb = (b.displaySource || '').toLowerCase()
      } else if (sortKey === 'status') {
        va = a.computedStatus.toLowerCase()
        vb = b.computedStatus.toLowerCase()
      } else if (sortKey === 'followUp') {
        va = a.followDate || '9999-99-99'
        vb = b.followDate || '9999-99-99'
      } else {
        va = a.computedStatus.toLowerCase()
        vb = b.computedStatus.toLowerCase()
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [instituteInquiries, kpiFilter, searchTerm, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filteredInquiries.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return filteredInquiries.slice(start, start + pageSize)
  }, [filteredInquiries, safePage, pageSize])

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const renderSortIcon = (key) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3 h-3 text-slate-400" />
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 text-slate-700" /> : <ArrowDown className="w-3 h-3 text-slate-700" />
  }

  const openAddInquiryModal = () => {
    setEditingLead(null)
    setFormState({
      studentName: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      gradeApplied: '',
      source: 'Not specified',
      nextFollowUpDate: '',
      notes: ''
    })
    setInquiryModalOpen(true)
  }

  const openEditInquiryModal = (lead) => {
    setEditingLead(lead)
    setFormState({
      studentName: lead.studentName || '',
      parentName: lead.parentName || '',
      parentPhone: lead.parentPhone || '',
      parentEmail: lead.parentEmail || '',
      gradeApplied: lead.gradeApplied || '',
      source: lead.source || 'Not specified',
      nextFollowUpDate: lead.followDate || '',
      notes: lead.notes || ''
    })
    setOpenRowMenuId(null)
    setInquiryModalOpen(true)
  }

  const handleSaveInquiry = async (e) => {
    e.preventDefault()
    if (!formState.studentName.trim() || !formState.parentPhone.trim() || !formState.gradeApplied.trim()) {
      toast('Please fill Student Name, Mobile Number, and Class Interested In.', 'warning')
      return
    }
    setIsSaving(true)
    try {
      const payload = {
        studentName: formState.studentName.trim(),
        parentName: formState.parentName.trim(),
        parentPhone: formState.parentPhone.trim(),
        parentEmail: formState.parentEmail.trim(),
        gradeApplied: formState.gradeApplied.trim(),
        source: formState.source || 'Not specified',
        nextFollowUpDate: formState.nextFollowUpDate || '',
        notes: formState.notes.trim(),
        instituteId: instId
      }

      if (editingLead) {
        await updateItem('admissionsPipeline', editingLead.id, payload)
        toast('Inquiry updated.', 'success')
      } else {
        await addItem('admissionsPipeline', {
          ...payload,
          stage: 'Inquiry Received',
          inquiryStatus: 'New',
          inquiryDate: todayIso,
          createdBy: user?.name || currentInstitute?.adminName || 'Admin',
          followUpHistory: formState.notes.trim()
            ? [{ date: new Date().toISOString(), by: user?.name || 'Admin', note: formState.notes.trim() }]
            : []
        })
        logAuditEvent?.(`Added Admission Inquiry for ${payload.studentName}`, currentInstitute?.name || 'Admin', 'Success')
        toast('Inquiry saved successfully.', 'success')
      }
      setInquiryModalOpen(false)
    } catch (err) {
      toast(err?.message || 'Failed to save inquiry.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const openFollowUpModal = (lead) => {
    setFollowUpLead(lead)
    setFollowUpForm({
      status: lead.computedStatus === 'New' ? 'In Follow-Up' : lead.computedStatus,
      nextFollowUpDate: lead.followDate || '',
      note: ''
    })
  }

  const handleSaveFollowUp = async (e) => {
    e.preventDefault()
    if (!followUpLead) return
    try {
      const prevHist = Array.isArray(followUpLead.followUpHistory) ? followUpLead.followUpHistory : []
      const nextHist = followUpForm.note.trim()
        ? [...prevHist, { date: new Date().toISOString(), by: user?.name || 'Admin', note: followUpForm.note.trim() }]
        : prevHist

      await updateItem('admissionsPipeline', followUpLead.id, {
        inquiryStatus: followUpForm.status,
        stage: statusToStage(followUpForm.status),
        nextFollowUpDate: followUpForm.nextFollowUpDate,
        followUpHistory: nextHist
      })
      toast('Follow-up updated.', 'success')
      setFollowUpLead(null)
    } catch (err) {
      toast(err?.message || 'Could not update follow-up.', 'error')
    }
  }

  const handleMarkClosed = async (lead) => {
    setOpenRowMenuId(null)
    try {
      await updateItem('admissionsPipeline', lead.id, {
        inquiryStatus: 'Closed',
        stage: 'Lost'
      })
      toast(`Marked ${lead.studentName}'s inquiry as Closed.`, 'info')
    } catch (err) {
      toast(err?.message || 'Could not update status.', 'error')
    }
  }

  const handleDeleteInquiry = async (lead) => {
    setOpenRowMenuId(null)
    const ok = window.confirm(`Delete admission inquiry for ${lead.studentName}? This cannot be undone.`)
    if (!ok) return
    try {
      await deleteItem('admissionsPipeline', lead.id)
      toast('Inquiry deleted.', 'info')
    } catch (err) {
      toast(err?.message || 'Could not delete inquiry.', 'error')
    }
  }

  const handleConfirmStudentEnrollment = async (lead, enrollData) => {
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
      inquiryStatus: 'Enrolled',
      stage: 'Enrolled',
      enrolledAt: new Date().toISOString()
    })
    toast(`${enrollData.name} enrolled successfully!`, 'success')
    setEnrollLead(null)
  }

  const handleSendSms = async (e) => {
    e.preventDefault()
    if (!smsLead || !smsText.trim()) return
    try {
      await sendCommunicationBlast?.({
        channel: 'SMS',
        recipientGroup: `${smsLead.studentName} (${smsLead.parentPhone})`,
        message: smsText.trim(),
        recipientsCount: 1
      })
      toast(`SMS sent to ${smsLead.parentPhone}.`, 'success')
      setSmsLead(null)
      setSmsText('')
    } catch {
      toast('Could not send SMS.', 'error')
    }
  }

  const handlePrintBlankForm = () => {
    const win = window.open('', '_blank', 'width=820,height=920')
    if (!win) {
      window.print()
      return
    }
    const instName = currentInstitute?.name || 'EduDigitize Demo'
    win.document.write(`<!doctype html><html><head><title>Admission Inquiry Form - ${instName}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:36px;color:#0f172a;font-size:13px;}
        h1{margin:0;font-size:20px;text-transform:uppercase;letter-spacing:.05em;}
        .sub{color:#475569;font-size:12px;margin-top:4px;}
        .hr{border-top:2px solid #0f172a;margin:16px 0 22px;}
        .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px 24px;}
        .field label{display:block;font-weight:700;font-size:11px;text-transform:uppercase;color:#334155;margin-bottom:6px;}
        .line{border-bottom:1px solid #64748b;height:24px;}
        .full{grid-column:1/-1;}
        .box{border:1px solid #94a3b8;height:90px;border-radius:4px;}
        .sig{margin-top:48px;display:flex;justify-content:space-between;}
        .sig div{width:200px;border-top:1px solid #0f172a;text-align:center;padding-top:6px;font-weight:700;font-size:11px;}
      </style></head><body>
      <h1>${instName}</h1>
      <div class="sub">Admission Inquiry Form &middot; Blank Printable Copy</div>
      <div class="hr"></div>
      <div class="grid">
        <div class="field"><label>Student Name</label><div class="line"></div></div>
        <div class="field"><label>Parent / Guardian Name</label><div class="line"></div></div>
        <div class="field"><label>Mobile Number</label><div class="line"></div></div>
        <div class="field"><label>Email</label><div class="line"></div></div>
        <div class="field"><label>Class Interested In</label><div class="line"></div></div>
        <div class="field"><label>How did they find us?</label><div class="line"></div></div>
        <div class="field"><label>Inquiry Date</label><div class="line"></div></div>
        <div class="field"><label>Next Follow-Up Date</label><div class="line"></div></div>
        <div class="field full"><label>Notes / Remarks</label><div class="box"></div></div>
      </div>
      <div class="sig"><div>Parent / Visitor Signature</div><div>Admissions Office</div></div>
      <script>window.onload=function(){window.print();}</script></body></html>`)
    win.document.close()
  }

  const buildExportRows = () => {
    const headers = ['S/N', 'Student', 'Guardian', 'Mobile', 'Class', 'Source', 'Status', 'Next Follow-Up']
    const rows = filteredInquiries.map((r, i) => [
      i + 1,
      r.studentName || '',
      r.parentName || '',
      r.parentPhone || '',
      r.gradeApplied || '',
      r.displaySource,
      r.computedStatus,
      r.followDate ? formatFollowUpDate(r.followDate) : '—'
    ])
    return { headers, rows }
  }

  const handleCopy = async () => {
    const { headers, rows } = buildExportRows()
    const tsv = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n')
    try {
      await navigator.clipboard.writeText(tsv)
      toast(`Copied ${rows.length} inquiry record(s) to clipboard.`, 'success')
    } catch {
      toast('Clipboard copy failed.', 'error')
    }
  }

  const handleExportExcel = () => {
    const { headers, rows } = buildExportRows()
    const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const html = `<html><head><meta charset="utf-8"/></head><body><table><thead><tr>${headers.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`
    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `admission_inquiries_${todayIso}.xls`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast(`Exported ${rows.length} inquiry record(s) to Excel.`, 'success')
  }

  const handleExportPdf = () => {
    const { rows } = buildExportRows()
    const lines = [
      { text: `${currentInstitute?.name || 'EduDigitize'} - Admission Inquiries`, bold: true },
      { text: `Generated: ${todayIso} | Total Records: ${rows.length}`, gap: -18 },
      { text: '-------------------------------------------------------------------------', gap: -16 }
    ]
    rows.forEach((r) => {
      lines.push({
        text: `${r[0]}. ${r[1]} (${r[2]}) | ${r[3]} | Class: ${r[4]} | ${r[6]} | Follow-Up: ${r[7]}`,
        gap: -15
      })
    })
    downloadSimplePdf(`admission_inquiries_${todayIso}.pdf`, lines)
    toast(`Exported ${rows.length} inquiry record(s) to PDF.`, 'success')
  }

  const kpiCards = [
    { key: 'all', count: kpis.all, label: 'All Inquiries', icon: List, boxCls: 'bg-slate-600 text-white', activeCls: 'border-blue-500 ring-1 ring-blue-500/20' },
    { key: 'due', count: kpis.due, label: 'Follow-Ups Due', icon: AlarmClock, boxCls: 'bg-rose-500 text-white', activeCls: 'border-rose-500 ring-1 ring-rose-500/20' },
    { key: 'New', count: kpis.New, label: 'New', icon: Star, boxCls: 'bg-orange-500 text-white', activeCls: 'border-orange-500 ring-1 ring-orange-500/20' },
    { key: 'In Follow-Up', count: kpis['In Follow-Up'], label: 'In Follow-Up', icon: MessageSquare, boxCls: 'bg-blue-500 text-white', activeCls: 'border-blue-500 ring-1 ring-blue-500/20' },
    { key: 'Enrolled', count: kpis.Enrolled, label: 'Enrolled', icon: CheckCircle2, boxCls: 'bg-emerald-500 text-white', activeCls: 'border-emerald-500 ring-1 ring-emerald-500/20' },
    { key: 'Closed', count: kpis.Closed, label: 'Closed', icon: XCircle, boxCls: 'bg-slate-500 text-white', activeCls: 'border-slate-500 ring-1 ring-slate-500/20' }
  ]

  const statusPillClass = (st) => {
    if (st === 'Enrolled') return 'bg-emerald-500 text-white'
    if (st === 'In Follow-Up') return 'bg-blue-500 text-white'
    if (st === 'Closed') return 'bg-slate-500 text-white'
    return 'bg-orange-500 text-white'
  }

  const startEntry = filteredInquiries.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const endEntry = Math.min(safePage * pageSize, filteredInquiries.length)

  return (
    <div className="space-y-4 pb-8 animate-fade-in">
      {/* Header matching Pick 1 */}
      <div>
        <div className="flex items-center gap-2 text-slate-900">
          <FileText className="w-5 h-5 text-slate-600" />
          <h1 className="text-lg font-bold tracking-tight">Admission Inquiries</h1>
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

      {/* 6 KPI Summary Filter Cards matching Pick 1 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpiCards.map((card) => {
          const Icon = card.icon
          const isActive = kpiFilter === card.key
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => {
                setKpiFilter(card.key)
                setCurrentPage(1)
              }}
              className={`bg-white rounded-xl border p-3.5 flex items-center gap-3 text-left transition-all cursor-pointer shadow-2xs ${
                isActive ? card.activeCls : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${card.boxCls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-extrabold text-slate-900 leading-tight">{card.count}</p>
                <p className="text-[11px] font-medium text-slate-500 truncate">{card.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Main White Table Card matching Picks 1 & 2 */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
        {/* Top Action Row */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={openAddInquiryModal}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Inquiry</span>
          </button>
          <button
            type="button"
            onClick={handlePrintBlankForm}
            className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Blank Form</span>
          </button>
        </div>

        {/* Filter & Export Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Filter:</span>
            <div className="relative">
              <input
                type="text"
                placeholder="Type to filter..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-52 sm:w-64 pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="inline-flex rounded-lg border border-slate-200 overflow-visible bg-white relative" ref={visMenuRef}>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium border-r border-slate-200 cursor-pointer"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium border-r border-slate-200 cursor-pointer"
              >
                Excel
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                className="px-3 py-1.5 hover:bg-slate-50 text-slate-700 font-medium border-r border-slate-200 cursor-pointer"
              >
                PDF
              </button>
              <button
                type="button"
                onClick={() => setVisMenuOpen((o) => !o)}
                className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold inline-flex items-center gap-1 rounded-r-lg cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Visibility</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {visMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-white border border-slate-200 shadow-lg py-1.5 z-30 text-xs">
                  {[
                    ['mobile', 'Mobile'],
                    ['class', 'Class'],
                    ['source', 'Source'],
                    ['status', 'Status'],
                    ['nextFollowUp', 'Next Follow-Up'],
                    ['actions', 'Actions']
                  ].map(([colKey, label]) => (
                    <label
                      key={colKey}
                      className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 cursor-pointer text-slate-700 font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={visibleCols[colKey]}
                        onChange={() =>
                          setVisibleCols((prev) => ({ ...prev, [colKey]: !prev[colKey] }))
                        }
                        className="rounded border-slate-300 text-blue-600"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[820px]">
            <thead className="border-b border-slate-200 text-slate-700 font-bold">
              <tr>
                <th onClick={() => toggleSort('sn')} className="py-2.5 px-3 w-14 cursor-pointer select-none">
                  <span className="inline-flex items-center gap-1">S/N {renderSortIcon('sn')}</span>
                </th>
                <th onClick={() => toggleSort('student')} className="py-2.5 px-3 cursor-pointer select-none">
                  <span className="inline-flex items-center gap-1">Student {renderSortIcon('student')}</span>
                </th>
                {visibleCols.mobile && (
                  <th onClick={() => toggleSort('mobile')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Mobile {renderSortIcon('mobile')}</span>
                  </th>
                )}
                {visibleCols.class && (
                  <th onClick={() => toggleSort('class')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Class {renderSortIcon('class')}</span>
                  </th>
                )}
                {visibleCols.source && (
                  <th onClick={() => toggleSort('source')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Source {renderSortIcon('source')}</span>
                  </th>
                )}
                {visibleCols.status && (
                  <th onClick={() => toggleSort('status')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Status {renderSortIcon('status')}</span>
                  </th>
                )}
                {visibleCols.nextFollowUp && (
                  <th onClick={() => toggleSort('followUp')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Next Follow-Up {renderSortIcon('followUp')}</span>
                  </th>
                )}
                {visibleCols.actions && (
                  <th onClick={() => toggleSort('actions')} className="py-2.5 px-3 cursor-pointer select-none">
                    <span className="inline-flex items-center gap-1">Actions {renderSortIcon('actions')}</span>
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No admission inquiries match your filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`transition-colors ${
                      row.isOverdue ? 'bg-rose-50/75 hover:bg-rose-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="py-3 px-3 text-slate-600 font-medium">{row.sn}</td>
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => setDrawerLead(row)}
                        className="font-semibold text-blue-600 hover:underline text-left cursor-pointer"
                      >
                        {row.studentName}
                      </button>
                      <div className="text-[11px] text-slate-400">{row.parentName || '—'}</div>
                    </td>
                    {visibleCols.mobile && (
                      <td className="py-3 px-3">
                        {row.parentPhone ? (
                          <a href={`tel:${row.parentPhone}`} className="text-blue-600 hover:underline font-medium">
                            {row.parentPhone}
                          </a>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {visibleCols.class && (
                      <td className="py-3 px-3 text-slate-700 font-medium">{row.gradeApplied || '—'}</td>
                    )}
                    {visibleCols.source && (
                      <td className="py-3 px-3 text-slate-600">{row.displaySource}</td>
                    )}
                    {visibleCols.status && (
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusPillClass(row.computedStatus)}`}>
                          {row.computedStatus}
                        </span>
                      </td>
                    )}
                    {visibleCols.nextFollowUp && (
                      <td className="py-3 px-3 whitespace-nowrap">
                        {row.followDate ? (
                          <span className="inline-flex items-center gap-1.5 text-slate-700">
                            <span>{formatFollowUpDate(row.followDate)}</span>
                            {row.isOverdue && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold">
                                Overdue
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    )}
                    {visibleCols.actions && (
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 relative" data-row-menu>
                          {(row.computedStatus === 'New' || row.computedStatus === 'In Follow-Up') && (
                            <>
                              <button
                                type="button"
                                onClick={() => openFollowUpModal(row)}
                                className="px-2.5 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white text-[11px] font-semibold cursor-pointer"
                              >
                                Follow Up
                              </button>
                              <button
                                type="button"
                                onClick={() => setEnrollLead(row)}
                                className="px-2.5 py-1 rounded border border-blue-400 text-blue-600 hover:bg-blue-50 text-[11px] font-semibold cursor-pointer"
                              >
                                Enroll
                              </button>
                            </>
                          )}
                          {row.computedStatus === 'Enrolled' && row.parentPhone && (
                            <button
                              type="button"
                              onClick={() => {
                                setSmsLead(row)
                                setSmsText(`Dear ${row.parentName || 'Parent'}, welcome to ${currentInstitute?.name || 'our institute'}!`)
                              }}
                              className="px-2.5 py-1 rounded border border-emerald-500 text-emerald-600 hover:bg-emerald-50 text-[11px] font-semibold cursor-pointer"
                            >
                              SMS
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setOpenRowMenuId((cur) => (cur === row.id ? null : row.id))}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                            aria-label="More inquiry actions"
                          >
                            <Menu className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </button>

                          {openRowMenuId === row.id && (
                            <div className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-white border border-slate-200 shadow-lg py-1 z-30 text-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenRowMenuId(null)
                                  setDrawerLead(row)
                                }}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditInquiryModal(row)}
                                className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-slate-700 font-medium cursor-pointer"
                              >
                                Edit Inquiry
                              </button>
                              {row.computedStatus !== 'Closed' && row.computedStatus !== 'Enrolled' && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkClosed(row)}
                                  className="w-full px-3 py-1.5 text-left hover:bg-slate-50 text-amber-700 font-medium cursor-pointer"
                                >
                                  Mark Closed
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteInquiry(row)}
                                className="w-full px-3 py-1.5 text-left hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Pagination matching Pick 2 */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing {startEntry} to {endEntry} of {filteredInquiries.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
              <button
                key={pg}
                type="button"
                onClick={() => setCurrentPage(pg)}
                className={`px-2.5 py-1 rounded font-semibold cursor-pointer ${
                  pg === safePage
                    ? 'bg-slate-800 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {pg}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Inquiry Modal matching Picks 3, 4 & 5 */}
      {inquiryModalOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Plus className="w-4 h-4 text-slate-700" />
                <span>{editingLead ? 'Edit Inquiry' : 'Add Inquiry'}</span>
              </div>
              <button
                type="button"
                onClick={() => setInquiryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInquiry} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Student Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState.studentName}
                    onChange={(e) => setFormState((p) => ({ ...p, studentName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    value={formState.parentName}
                    onChange={(e) => setFormState((p) => ({ ...p, parentName: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formState.parentPhone}
                    onChange={(e) => setFormState((p) => ({ ...p, parentPhone: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Email</label>
                  <input
                    type="email"
                    value={formState.parentEmail}
                    onChange={(e) => setFormState((p) => ({ ...p, parentEmail: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Class Interested In <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    list="inq-class-suggestions"
                    value={formState.gradeApplied}
                    onChange={(e) => setFormState((p) => ({ ...p, gradeApplied: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                  <datalist id="inq-class-suggestions">
                    {availableClasses.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">How did they find us?</label>
                  <select
                    value={formState.source}
                    onChange={(e) => setFormState((p) => ({ ...p, source: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {HOW_FOUND_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={formState.nextFollowUpDate}
                    onChange={(e) => setFormState((p) => ({ ...p, nextFollowUpDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Notes</label>
                <textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(e) => setFormState((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInquiryModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Saving...' : 'Save Inquiry'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Follow Up Modal */}
      {followUpLead && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Follow Up — {followUpLead.studentName}</span>
              <button type="button" onClick={() => setFollowUpLead(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveFollowUp} className="p-5 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={followUpForm.status}
                  onChange={(e) => setFollowUpForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-semibold"
                >
                  <option value="New">New</option>
                  <option value="In Follow-Up">In Follow-Up</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date</label>
                <input
                  type="date"
                  value={followUpForm.nextFollowUpDate}
                  onChange={(e) => setFollowUpForm((p) => ({ ...p, nextFollowUpDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Follow-Up Note</label>
                <textarea
                  rows={3}
                  placeholder="Call summary or parent response..."
                  value={followUpForm.note}
                  onChange={(e) => setFollowUpForm((p) => ({ ...p, note: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setFollowUpLead(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer">
                  Save Follow-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick SMS Modal */}
      {smsLead && (
        <div className="fixed inset-0 z-[110] bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Send SMS — {smsLead.studentName}</span>
              <button type="button" onClick={() => setSmsLead(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSendSms} className="p-5 space-y-3 text-xs">
              <p className="text-slate-500">To: <strong className="text-slate-800">{smsLead.parentPhone}</strong></p>
              <textarea
                rows={4}
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setSmsLead(null)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer">
                  Send SMS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Drawer & Enroll Student Modal */}
      {drawerLead && (
        <LeadDetailsDrawer
          isOpen={Boolean(drawerLead)}
          onClose={() => setDrawerLead(null)}
          lead={drawerLead}
          onUpdateLead={(id, data) => updateItem('admissionsPipeline', id, data)}
          onOpenEnroll={() => {
            setEnrollLead(drawerLead)
            setDrawerLead(null)
          }}
        />
      )}

      {enrollLead && (
        <ConvertStudentModal
          isOpen={Boolean(enrollLead)}
          onClose={() => setEnrollLead(null)}
          lead={enrollLead}
          currentInstitute={currentInstitute}
          classes={classes}
          students={students}
          onConfirmEnrollment={handleConfirmStudentEnrollment}
        />
      )}
    </div>
  )
}

export default AdmissionInquiriesView
