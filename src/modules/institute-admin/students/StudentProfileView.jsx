import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  UserPlus,
  DollarSign,
  FileText,
  ArrowDownCircle,
  MessageSquare,
  Printer,
  Bus,
  Sliders,
  Pencil,
  Gift,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  User,
  GraduationCap,
  Users,
  Calendar,
  CreditCard,
  Eye,
  Award,
  Phone,
  Mail,
  Info,
  BarChart3,
  Link2,
  History,
  Wallet,
  Check
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useAuth } from '../../../context/AuthContext'
import { useToast } from '../../../context/ToastContext'
import { resolveStudentFeeSetup } from '../fees/StudentFeeSetupView'
import { downloadSimplePdf } from '../../../utils/pdfExport'
import { InvoiceTransactionsModal, formatTxnDateTime } from '../../../components/common/InvoiceTransactionsModal'
import EnrollStudentView from './EnrollStudentView'

const formatMoney = (val) => `PKR ${Number(val || 0).toLocaleString()}`

const renderFieldValue = (val) => {
  if (val === undefined || val === null || String(val).trim() === '') {
    return <span className="text-slate-400 font-normal">Not set</span>
  }
  return <span className="font-semibold text-slate-800">{val}</span>
}

export const StudentProfileView = ({
  studentId,
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms,
  onBackToList,
  onBack,
  onOpenFeeSetup,
  onOpenBillingHistory,
  onOpenAttendanceReport
}) => {
  const {
    students = [],
    classes = [],
    fees = [],
    attendance = {},
    exams = [],
    transport = [],
    updateItem,
    logAuditEvent
  } = useAppData()
    const { user: authUser } = useAuth() || {}
    const { toast } = useToast()
    const actorName = authUser?.name || currentInstitute?.adminName || 'Admin'

  const instituteStudents = useMemo(() => {
    if (!currentInstitute?.id) return students
    return students.filter((s) => s.instituteId === currentInstitute.id || !s.instituteId)
  }, [students, currentInstitute?.id])

  const student = useMemo(() => {
    if (studentId) {
      const exact = instituteStudents.find((s) => s.id === studentId)
      if (exact) return exact
    }
    return instituteStudents[0] || null
  }, [instituteStudents, studentId])

  const instituteRoutes = useMemo(() => {
    if (!currentInstitute?.id) return transport
    return transport.filter((t) => t.instituteId === currentInstitute.id || !t.instituteId)
  }, [transport, currentInstitute?.id])

  const [subView, setSubView] = useState('profile') // 'profile' | 'transport' | 'edit' | 'welcome'
  const [editInitialStep, setEditInitialStep] = useState(1)
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'results' | 'guardian' | 'attendance' | 'fees'
  const [txnModalFee, setTxnModalFee] = useState(null)
  const [saving, setSaving] = useState(false)

  // Route Edit Form
  const [usesTransport, setUsesTransport] = useState(false)
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [pickupPoint, setPickupPoint] = useState('')

  useEffect(() => {
    if (!student) return
    setSelectedRouteId(student.transportRouteId || '')
    setPickupPoint(student.pickupPoint || '')
    setUsesTransport(Boolean(student.transportRouteId || student.transportRouteName || student.pickupPoint))
  }, [student])

  useEffect(() => {
    setSubView('profile')
  }, [studentId])

  const resolvedSetup = useMemo(
    () => resolveStudentFeeSetup(student, classes, fees),
    [student, classes, fees]
  )

  const studentFees = useMemo(() => {
    if (!student) return []
    return fees.filter(
      (f) =>
        (!currentInstitute?.id || f.instituteId === currentInstitute.id || !f.instituteId) &&
        ((f.studentId && f.studentId === student.id) ||
          (f.studentName || '').toLowerCase().trim() === (student.fullName || student.name || '').toLowerCase().trim())
    )
  }, [fees, student, currentInstitute?.id])

  const feeSummary = useMemo(() => {
    let pendingDues = 0
    let totalPaid = 0
    let totalWaivers = 0
    let pendingLinesCount = 0
    let paidLinesCount = 0
    const recentTxns = []

    studentFees.forEach((f) => {
      const billed = Number(f.amount || 0) + Number(f.fine || f.lateFine || 0)
      const paid = Number(f.paidAmount || 0)
      const waiver = Number(f.discount || f.waiver || 0)
      const remaining = Math.max(0, billed - paid - waiver)
      const refNum = f.receiptNo || f.invoiceNo || String(f.id).slice(-8)
      const invTitle = f.title || f.feeType || 'Tuition'
      const freq = f.frequency || f.duration || 'Monthly'
      const invLabel = `Invoice #${refNum} — ${invTitle} — ${freq}`

      totalPaid += paid
      totalWaivers += waiver
      if (f.status === 'Paid' || remaining <= 0) {
        paidLinesCount += 1
      } else {
        pendingLinesCount += 1
        pendingDues += remaining
      }

      if (Array.isArray(f.transactions) && f.transactions.length > 0) {
        f.transactions.forEach((t, tIdx) => {
          const dtIso = String(t.date || '')
          const lower = String(t.type || '').toLowerCase()
          const isWaiver = lower.includes('waiver')
          recentTxns.push({
            id: t.id || `${f.id}-t-${tIdx}`,
            sortDate: dtIso,
            dateLabel: formatTxnDateTime(dtIso),
            invoiceLabel: invLabel,
            type: isWaiver ? 'Waiver' : 'Cash',
            amount: Math.abs(Number(t.amount || 0)),
            by: t.by || actorName,
            reason: t.reason || '—'
          })
        })
      } else {
        if (paid > 0) {
          const dtIso = f.paidAt || f.updatedAt || f.createdAt || f.dueDate || ''
          recentTxns.push({
            id: `${f.id}-cash`,
            sortDate: String(dtIso),
            dateLabel: formatTxnDateTime(dtIso),
            invoiceLabel: invLabel,
            type: 'Cash',
            amount: paid,
            by: f.recordedBy || f.collectedBy || actorName,
            reason: f.notes || '—'
          })
        }
        if (waiver > 0) {
          const dtIso = f.waivedAt || f.paidAt || f.updatedAt || f.createdAt || f.dueDate || ''
          recentTxns.push({
            id: `${f.id}-waiver`,
            sortDate: String(dtIso),
            dateLabel: formatTxnDateTime(dtIso),
            invoiceLabel: invLabel,
            type: 'Waiver',
            amount: waiver,
            by: f.waivedBy || f.recordedBy || actorName,
            reason: f.discountReason || 'Concession'
          })
        }
      }
    })

    recentTxns.sort((a, b) => b.sortDate.localeCompare(a.sortDate))
    return { pendingDues, totalPaid, totalWaivers, pendingLinesCount, paidLinesCount, recentTxns }
  }, [studentFees, actorName])

  const monthlyAttendance = useMemo(() => {
    const now = new Date()
    const nowMonth = now.toISOString().slice(0, 7)
    const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!student) {
      return { present: 0, absent: 0, late: 0, leave: 0, rate: 0, recordedDays: 0, monthLabel, byYear: [], records: [] }
    }
    let present = 0
    let absent = 0
    let late = 0
    let leave = 0
    const records = []
    const yearMap = {}
    const monthDates = new Set()

    Object.entries(attendance || {}).forEach(([key, recMap]) => {
      if (!recMap || typeof recMap !== 'object') return
      const dateMatch = key.match(/\d{4}-\d{2}-\d{2}/)
      const dateStr = dateMatch ? dateMatch[0] : key
      if (dateStr.startsWith(nowMonth)) monthDates.add(dateStr)

      const entry = recMap[student.id]
      if (!entry) return
      const status = String(entry.status || entry || '')
      const lower = status.toLowerCase()
      records.push({ date: dateStr, status, note: entry.note || '' })

      const yearKey = dateStr.slice(0, 4) || String(now.getFullYear())
      if (!yearMap[yearKey]) {
        yearMap[yearKey] = { year: yearKey, days: 0, present: 0, absent: 0, late: 0, leave: 0 }
      }
      yearMap[yearKey].days += 1
      if (lower === 'present') yearMap[yearKey].present += 1
      else if (lower === 'absent') yearMap[yearKey].absent += 1
      else if (lower === 'late') yearMap[yearKey].late += 1
      else if (lower === 'leave') yearMap[yearKey].leave += 1

      if (dateStr.startsWith(nowMonth)) {
        if (lower === 'present') present++
        else if (lower === 'absent') absent++
        else if (lower === 'late') late++
        else if (lower === 'leave') leave++
      }
    })

    records.sort((a, b) => b.date.localeCompare(a.date))
    const byYear = Object.values(yearMap)
      .sort((a, b) => b.year.localeCompare(a.year))
      .map((y) => ({
        ...y,
        presentPct: y.days > 0 ? Math.round(((y.present + y.late) / y.days) * 100) : 0
      }))
    const total = present + absent + late + leave
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return {
      present: present + late,
      exactPresent: present,
      absent,
      late,
      leave,
      rate,
      recordedDays: monthDates.size || total,
      monthLabel,
      byYear,
      records
    }
  }, [attendance, student])

  const studentExams = useMemo(() => {
    if (!student) return []
    return exams.filter((ex) => {
      if (currentInstitute?.id && ex.instituteId && ex.instituteId !== currentInstitute.id) return false
      if (ex.results && typeof ex.results === 'object' && ex.results[student.id] !== undefined) return true
      return (ex.className || '').toLowerCase() === (student.className || '').toLowerCase()
    })
  }, [exams, student, currentInstitute?.id])

  const assignedTransportRoute = useMemo(() => {
    const setupItem = resolvedSetup.items.find((it) => (it.feeType || '').toLowerCase().includes('transport'))
    const rId = student?.transportRouteId || setupItem?.routeId
    const routeObj = rId ? instituteRoutes.find((r) => String(r.id) === String(rId)) : null
    return {
      routeObj,
      feeAmount: Number(setupItem?.amount || 0),
      routeName: student?.transportRouteName || routeObj?.routeName || routeObj?.name || ''
    }
  }, [resolvedSetup.items, student, instituteRoutes])

  const handleSaveRoute = async (e) => {
    e.preventDefault()
    if (!student || saving) return
    setSaving(true)
    try {
      const rt = usesTransport ? instituteRoutes.find((r) => String(r.id) === String(selectedRouteId)) : null
      await updateItem('students', student.id, {
        transportRouteId: usesTransport ? selectedRouteId : '',
        transportRouteName: usesTransport && rt ? rt.routeName || rt.name : '',
        pickupPoint: usesTransport ? pickupPoint.trim() : ''
      })
      logAuditEvent?.(
        usesTransport
          ? `Updated transport route for ${student.fullName || student.name}`
          : `Cleared transport route assignment for ${student.fullName || student.name}`,
        'Student Transport',
        'Success'
      )
      toast?.success?.('Route details saved successfully.')
    } catch {
      toast?.error?.('Unable to update transport route.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrintProfile = () => {
    setSubView('profile')
    if (activeTab !== 'overview') {
      setActiveTab('overview')
      setTimeout(() => window.print(), 80)
    } else {
      window.print()
    }
  }

  const handleExportPdf = () => {
    if (!student) return
    const name = student.fullName || student.name || 'Student'
    const adm =
      student.admissionNo ||
      student.registrationNo ||
      student.systemAdmissionNo ||
      String(student.id || '').slice(-8).toUpperCase()
    const safeSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'student'

    const lines = [
      { text: `${currentInstitute?.name || 'Institute Portal'} - Student Profile`, bold: true },
      { text: `Generated on: ${new Date().toLocaleString('en-GB')}`, gap: -18 },
      { text: `PERSONAL INFORMATION`, bold: true, gap: -22 },
      `Full Name: ${name}`,
      `Class: ${student.className || student.course || 'Unassigned'} (${student.section || 'A'})`,
      `Roll Number: ${student.rollNumber || 'N/A'} | Admission No: ${adm}`,
      `Gender: ${student.gender || 'Male'} | Status: ${student.status || 'Active'}`,
      `Phone: ${student.phone || student.guardianPhone || 'N/A'} | Email: ${student.email || 'Not set'}`,
      `CNIC / B-Form: ${student.bFormCnic || 'Not set'} | DOB: ${student.dob || 'Not set'}`,
      `Address: ${student.address || 'Not set'} (${student.city || ''} ${student.province || ''})`,
      { text: `PARENT / GUARDIAN DETAILS`, bold: true, gap: -22 },
      `Father / Guardian: ${student.fatherName || student.guardianName || 'Not linked'}`,
      `Guardian CNIC: ${student.fatherCnic || student.parentCnic || 'Not set'} | Phone: ${student.guardianPhone || student.parentPhone || 'N/A'}`,
      { text: `ATTENDANCE & FEE SUMMARY`, bold: true, gap: -22 },
      `Present This Month: ${monthlyAttendance.present} (${monthlyAttendance.rate}%) | Absent: ${monthlyAttendance.absent}`,
      `Pending Dues: ${formatMoney(feeSummary.pendingDues)} | Total Paid: ${formatMoney(feeSummary.totalPaid)}`,
      `Fee Schedule: ${resolvedSetup.feeType} | Net Regular Voucher: ${formatMoney(resolvedSetup.finalAmount)}`,
      `Transport Route: ${assignedTransportRoute.routeName || 'No route assigned'}`
    ]

    downloadSimplePdf(`student-profile-${safeSlug}.pdf`, lines)
    toast?.success?.(`Downloaded PDF profile for ${name}.`)
  }

  if (!student) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center space-y-3 bg-white rounded-2xl border border-slate-200 mt-6">
        <User className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-800">No student selected</p>
        <button
          type="button"
          onClick={() => onBackToList?.()}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
        >
          Back to All Students
        </button>
      </div>
    )
  }

  const studentName = student.fullName || student.name || 'Student'
  const admissionNo =
    student.admissionNo ||
    student.registrationNo ||
    student.systemAdmissionNo ||
    String(student.id || '').slice(-8).toUpperCase()
  const portalUsername = student.portalUsername || admissionNo

  const quickActionsToolbar = (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.(student.id)}
        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
      >
        <DollarSign className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
      >
        <ArrowDownCircle className="w-3.5 h-3.5 text-slate-500" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenSendSms?.()}
        className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
        <span>Send SMS</span>
      </button>
    </div>
  )

  if (subView === 'welcome') {
    const issuedDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    const instName = (currentInstitute?.name || 'EduDigize Demo').toUpperCase()
    const instPhone = currentInstitute?.phone || '0300-0000000'
    const instEmail = currentInstitute?.email || 'accounts@institute.edu'

    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto print:p-0 print:max-w-none">
        {/* Top Action Toolbar matching Pick 4 */}
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-center gap-2.5 shadow-2xs print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Print
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => setSubView('profile')}
            className="px-4 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Back
          </button>
        </div>

        {/* Full-Page Gradient Frame Welcome Card matching Picks 4 & 5 */}
        <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 sm:p-10 rounded-lg shadow-2xl print:shadow-none print:p-6">
          <div className="bg-white p-4 sm:p-6 relative shadow-inner">
            {/* Dashed Inner Frame */}
            <div className="border border-dashed border-indigo-200 p-6 sm:p-10 relative">
              {/* 4 Corner L-Brackets */}
              <span className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-indigo-500 pointer-events-none" />
              <span className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-indigo-500 pointer-events-none" />
              <span className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-indigo-500 pointer-events-none" />
              <span className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-indigo-500 pointer-events-none" />

              <div className="max-w-lg mx-auto text-center space-y-5 font-serif">
                {/* Institute Crest & Uppercase Name */}
                <div className="flex flex-col items-center gap-3">
                  {currentInstitute?.logo ? (
                    <img
                      src={currentInstitute.logo}
                      alt={instName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-sans font-black text-base shadow-sm border-2 border-sky-100">
                      {instName.slice(0, 2)}
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl font-bold tracking-[0.14em] text-slate-800">{instName}</h2>
                  <div className="w-14 h-0.5 bg-indigo-400/60" />
                </div>

                {/* Graduation Crest + WELCOME Heading */}
                <div className="space-y-1.5 pt-1">
                  <GraduationCap className="w-10 h-10 text-indigo-700 mx-auto" />
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-[0.18em] text-slate-800">WELCOME</h1>
                  <p className="text-sm italic text-indigo-500">To Our Institute Community</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                  We are delighted to extend a warm welcome to you as you begin your educational journey with us. We
                  look forward to supporting your growth and success.
                </p>

                {/* Student Summary Card Box */}
                <div className="rounded-xl border border-indigo-200 bg-slate-50/70 px-5 sm:px-8 py-5 shadow-xs space-y-2.5 text-xs sm:text-sm">
                  <h3 className="text-xl font-bold text-slate-900 pb-1">{studentName}</h3>
                  <div className="divide-y divide-dotted divide-slate-200 text-xs">
                    {[
                      ['Class:', student.className || student.course || 'Unassigned'],
                      ['Section:', student.section || 'A'],
                      ['Roll Number:', student.rollNumber || 'N/A'],
                      ['Admission Number:', admissionNo]
                    ].map(([label, val]) => (
                      <div key={label} className="py-1.5 flex items-center justify-center gap-3">
                        <span className="font-bold text-indigo-600">{label}</span>
                        <span className="text-slate-700">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Divider & Institute Contact Footer */}
                <div className="pt-6 border-t border-slate-200 space-y-1.5">
                  <p className="text-sm font-bold tracking-[0.1em] text-slate-800">{instName}</p>
                  <p className="text-[11px] text-slate-500 flex flex-wrap items-center justify-center gap-2 font-sans">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3 text-rose-500" />
                      <span>{instPhone}</span>
                    </span>
                    <span>|</span>
                    <span className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3 text-indigo-500" />
                      <span>{instEmail}</span>
                    </span>
                  </p>
                  <p className="text-[11px] italic text-slate-400">Issued on {issuedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (subView === 'edit') {
    return (
      <EnrollStudentView
        editingStudentId={student.id}
        initialStep={editInitialStep}
        currentInstitute={currentInstitute}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
        onCancelEdit={() => setSubView('profile')}
        onSavedEdit={() => setSubView('profile')}
      />
    )
  }

  if (subView === 'transport') {
    return (
      <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">Institute transport — {studentName}</h1>
            </div>
            <button
              type="button"
              onClick={() => setSubView('profile')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
          {quickActionsToolbar}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="bg-sky-500 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Bus className="w-4 h-4" />
                <span>Institute transport</span>
              </div>
              <p className="text-[11px] text-white/90 mt-0.5">{studentName} · Route &amp; pickup only</p>
            </div>
            <button
              type="button"
              onClick={() => setSubView('profile')}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Back to profile
            </button>
          </div>

          <form onSubmit={handleSaveRoute} className="p-6 space-y-5 text-xs">
            <div className="rounded-xl border border-cyan-300 bg-cyan-50/70 px-4 py-3 text-cyan-900 leading-relaxed">
              This page is for <strong className="font-bold">route &amp; pickup</strong> only. Transport fee is part of{' '}
              <strong className="font-bold">Fee Setup</strong> (fee item &ldquo;Transport Fee&rdquo;) and is billed with the regular voucher.
            </div>

            <div className="rounded-xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 bg-white">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TRANSPORT FEE (FROM FEE SETUP)</p>
                {assignedTransportRoute.feeAmount > 0 ? (
                  <p className="text-base font-extrabold text-slate-900">{formatMoney(assignedTransportRoute.feeAmount)}</p>
                ) : (
                  <>
                    <p className="text-base font-medium text-slate-400">Not set</p>
                    <p className="text-[11px] text-slate-400">Add a Transport Fee item in Fee Setup to bill transport.</p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => onOpenFeeSetup?.(student.id, 'edit')}
                className="px-3.5 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit in Fee Setup</span>
              </button>
            </div>

            <div className="space-y-4 pt-1">
              <label className="inline-flex items-center gap-2 font-bold text-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={usesTransport}
                  onChange={(e) => setUsesTransport(e.target.checked)}
                  className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                />
                <span>Student uses school transport (assign route)</span>
              </label>

              {usesTransport && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Transport Route</label>
                    <select
                      value={selectedRouteId}
                      onChange={(e) => setSelectedRouteId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
                    >
                      <option value="">Select route...</option>
                      {instituteRoutes.map((rt) => (
                        <option key={rt.id} value={rt.id}>
                          {rt.routeName || rt.name || `Route ${rt.id}`}
                          {rt.monthlyFee || rt.fee ? ` (${formatMoney(rt.monthlyFee || rt.fee)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Pickup Point / Stop</label>
                    <input
                      type="text"
                      value={pickupPoint}
                      onChange={(e) => setPickupPoint(e.target.value)}
                      placeholder="e.g. Main Gate Stop"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold shadow-xs disabled:opacity-50 cursor-pointer transition-colors"
                >
                  {saving ? 'Saving...' : 'Save route details'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto print:p-0 print:space-y-4">
      {/* Print-Only Formal Header matching Picks 2 & 3 */}
      <div className="hidden print:flex items-center justify-between text-[11px] text-slate-700 border-b border-slate-200 pb-2">
        <span>{new Date().toLocaleDateString('en-GB')}, {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        <span className="font-semibold">Student Profile - {studentName} | {currentInstitute?.name || 'EduDigize Demo'}</span>
        <span />
      </div>

      {/* Top Header & Quick Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-600" />
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">Student Profile - {studentName}</h1>
          </div>
          <button
            type="button"
            onClick={() => (onBack ? onBack() : onBackToList?.())}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 mt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
        {quickActionsToolbar}
      </div>

      {/* Deep Indigo Profile Banner (Pick 2) */}
      <div className="bg-gradient-to-r from-indigo-900 via-violet-800 to-indigo-700 rounded-2xl p-5 sm:p-6 text-white shadow-md flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-sky-600/30 border-4 border-white/80 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            {student.photo || student.photoUrl ? (
              <img src={student.photo || student.photoUrl} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-sky-600 flex items-center justify-center">
                <User className="w-9 h-9 text-white" />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{studentName}</h2>
            <p className="text-xs text-white/90 flex items-center gap-1.5 font-medium">
              <GraduationCap className="w-3.5 h-3.5 text-white/80" />
              <span>{student.className || student.course || 'Unassigned'}</span>
            </p>
            <p className="text-[11px] text-white/85 flex flex-wrap items-center gap-2">
              <span># Roll: {student.rollNumber || 'N/A'}</span>
              <span>·</span>
              <span>ADM: {admissionNo}</span>
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-emerald-100 text-[10px] font-bold">
                {student.status || 'Active'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-white text-[10px] font-semibold">
                {student.gender || 'Male'}
              </span>
            </div>
          </div>
        </div>

        {/* Banner Action Buttons Grid */}
        <div className="flex flex-col items-start xl:items-end gap-2 shrink-0 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePrintProfile}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print profile</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('transport')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Transport route</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenFeeSetup?.(student.id, 'details')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Fee Setup</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setEditInitialStep(1)
                setSubView('edit')
              }}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-indigo-900 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onBackToList?.(student.className || 'ALL')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Back to List</span>
            </button>
            <button
              type="button"
              onClick={() => setSubView('welcome')}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/30 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Welcome Card</span>
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards Below Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-2 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs space-y-1">
          <CheckCircle2 className="w-4 h-4 text-sky-500 mx-auto" />
          <p className="text-lg font-extrabold text-sky-600">{monthlyAttendance.present}</p>
          <p className="text-[11px] text-slate-400 font-medium">
            Present This Month — {monthlyAttendance.rate}%
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs space-y-1">
          <XCircle className="w-4 h-4 text-rose-500 mx-auto" />
          <p className="text-lg font-extrabold text-rose-600">{monthlyAttendance.absent}</p>
          <p className="text-[11px] text-slate-400 font-medium">Absent This Month</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs space-y-1">
          <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto" />
          <p className="text-lg font-extrabold text-amber-600">{formatMoney(feeSummary.pendingDues)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Pending Dues</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 text-center shadow-2xs space-y-1">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
          <p className="text-lg font-extrabold text-emerald-600">{formatMoney(feeSummary.totalPaid)}</p>
          <p className="text-[11px] text-slate-400 font-medium">Total Paid</p>
        </div>
      </div>

      {/* 5 Tabs Strip */}
      <div className="border-b border-slate-200 flex flex-wrap items-center gap-1 text-xs print:hidden">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'results', label: 'Results & exams', icon: Award },
          { id: 'guardian', label: 'Parent / Guardian', icon: Users },
          { id: 'attendance', label: 'Attendance', icon: Calendar },
          { id: 'fees', label: 'Fee & Payments', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 font-semibold inline-flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? 'border-slate-800 text-slate-900 bg-white rounded-t-lg border-t border-x border-slate-200 -mb-px'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Overview (Picks 2 & 3) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 print:block print:space-y-4 gap-5 items-start">
          {/* Left Column: Personal Information */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
              <User className="w-4 h-4 text-sky-600" />
              <span>Personal Information</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                ['Full Name', studentName],
                ['Gender', student.gender || 'Male'],
                ['Date of Birth', student.dob],
                ['Blood Group', student.bloodGroup],
                ['Caste', student.caste],
                ['CNIC / B-Form', student.bFormCnic],
                ['Address', student.address],
                ['Mobile', student.phone],
                ['Alternate Phone', student.altPhone || student.guardianPhone],
                ['Student Login Email', student.email],
                ['Nationality', student.nationality || 'Pakistani'],
                ['State / Province', student.province || 'Punjab'],
                ['City', student.city],
                ['Health Notes', student.medicalNotes]
              ].map(([label, val]) => (
                <div key={label} className="px-5 py-2.5 grid grid-cols-12 gap-3">
                  <div className="col-span-5 sm:col-span-4 font-bold text-slate-700">{label}</div>
                  <div className="col-span-7 sm:col-span-8">{renderFieldValue(val)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Academic Information + Fee Setup + Institute Transport */}
          <div className="lg:col-span-5 space-y-5">
            {/* Academic Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Academic Information</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {[
                  ['Class', student.className || student.course || 'Unassigned'],
                  ['Roll Number', student.rollNumber || 'N/A'],
                  ['Admission No.', admissionNo],
                  ['Registration No.', student.registrationNo || student.customRegNo],
                  ['Admission Date', student.admissionDate],
                  ['Education Board', student.educationBoard],
                  ['Session', student.academicSession || '2026-2027']
                ].map(([label, val]) => (
                  <div key={label} className="px-5 py-2.5 grid grid-cols-12 gap-3">
                    <div className="col-span-5 font-bold text-slate-700">{label}</div>
                    <div className="col-span-7">{renderFieldValue(val)}</div>
                  </div>
                ))}
                <div className="px-5 py-2.5 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5 font-bold text-slate-700">Status</div>
                  <div className="col-span-7">
                    <span className="inline-block px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
                      {student.status || 'Active'}
                    </span>
                  </div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-12 gap-3">
                  <div className="col-span-5 font-bold text-slate-700">Dormitory</div>
                  <div className="col-span-7">{renderFieldValue(student.hostelName || student.dormitory)}</div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-12 gap-3">
                  <div className="col-span-5 font-bold text-slate-700">Sport House</div>
                  <div className="col-span-7">{renderFieldValue(student.sportHouse)}</div>
                </div>
                <div className="px-5 py-2.5 grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5 font-bold text-slate-700">Portal Username</div>
                  <div className="col-span-7">
                    <code className="px-2 py-0.5 rounded bg-rose-50 text-rose-600 font-mono text-[11px] font-semibold">
                      {portalUsername}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Fee Setup Summary Card (Pick 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Sliders className="w-4 h-4 text-sky-600" />
                <span>Fee Setup</span>
              </div>
              <div className="p-5 space-y-3 text-xs">
                <p className="text-slate-600">
                  Regular voucher duration: <strong className="text-slate-900">{resolvedSetup.feeType}</strong>
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {resolvedSetup.items.map((item, idx) => (
                    <div key={`${item.feeType}-${idx}`} className="px-3.5 py-2 flex items-center justify-between">
                      <span className="text-slate-700">{item.feeType || 'Tuition Fee'}</span>
                      <span className="font-bold text-slate-900">{formatMoney(item.amount)}</span>
                    </div>
                  ))}
                  {resolvedSetup.discount > 0 && (
                    <div className="px-3.5 py-2 flex items-center justify-between text-cyan-700">
                      <span>Discount</span>
                      <span className="font-bold">- {formatMoney(resolvedSetup.discount)}</span>
                    </div>
                  )}
                  <div className="px-3.5 py-2 flex items-center justify-between bg-slate-100/90 font-bold text-slate-900">
                    <span>Net regular voucher amount · {resolvedSetup.feeType}</span>
                    <span>{formatMoney(resolvedSetup.finalAmount)}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenFeeSetup?.(student.id, 'details')}
                  className="w-full py-2 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Full Fee Setup</span>
                </button>
              </div>
            </div>

            {/* Institute Transport Card (Pick 3) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                <Bus className="w-4 h-4 text-indigo-600" />
                <span>Institute transport</span>
              </div>
              <div className="p-5 space-y-3 text-xs">
                {assignedTransportRoute.routeName || assignedTransportRoute.feeAmount > 0 ? (
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    {assignedTransportRoute.routeName && (
                      <p>
                        <strong>Route:</strong> {assignedTransportRoute.routeName}
                      </p>
                    )}
                    {student.pickupPoint && (
                      <p>
                        <strong>Pickup Point:</strong> {student.pickupPoint}
                      </p>
                    )}
                    {assignedTransportRoute.feeAmount > 0 && (
                      <p className="text-emerald-700 font-bold">
                        Transport Fee: {formatMoney(assignedTransportRoute.feeAmount)}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-400">No transport fee in Fee Setup and no route assigned.</p>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setSubView('transport')}
                    className="w-full py-2 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit route / pickup</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenFeeSetup?.(student.id, 'edit')}
                    className="w-full py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Edit transport fee in Fee Setup</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Results & Exams (Pick 2) */}
      {activeTab === 'results' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] text-slate-400">
              Exam and marks history by session year. Open the full report card (all subjects) or use Print profile for a paper copy of this page.
            </p>
            {studentExams.length > 0 && (
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-exams-report-cards')}
                className="px-3 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold cursor-pointer"
              >
                Open Full Report Card
              </button>
            )}
          </div>
          {studentExams.length === 0 ? (
            <div className="rounded-xl border border-cyan-300 bg-cyan-50/80 px-4 py-3 flex items-center gap-2 text-cyan-800 font-medium">
              <Info className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>No exam or marks records found for this student yet.</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-[10px] uppercase text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">Exam / Subject</th>
                    <th className="py-2.5 px-4">Session</th>
                    <th className="py-2.5 px-4">Date</th>
                    <th className="py-2.5 px-4 text-right">Obtained / Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentExams.map((ex) => {
                    const mark = ex.results?.[student.id]
                    return (
                      <tr key={ex.id}>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{ex.title || ex.name || ex.subject || 'Exam'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{ex.academicSession || student.academicSession || '2026-2027'}</td>
                        <td className="py-2.5 px-4 text-slate-500">{ex.date || '—'}</td>
                        <td className="py-2.5 px-4 text-right font-bold text-indigo-700">
                          {mark !== undefined ? `${mark} / ${ex.totalMarks || 100}` : 'Scheduled'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Parent / Guardian (Pick 3) */}
      {activeTab === 'guardian' && (() => {
        const hasLinkedGuardian = Boolean(
          (student.fatherName && student.fatherName.trim() && student.fatherName.trim() !== 'Parent / Guardian') ||
            student.guardianName ||
            student.fatherCnic ||
            student.parentCnic ||
            student.guardianPhone ||
            student.parentPhone ||
            student.motherName
        )

        if (!hasLinkedGuardian) {
          return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 text-xs">
              <div className="rounded-xl border border-amber-200 bg-amber-50/75 px-4 py-3 flex flex-wrap items-center gap-3 text-amber-900">
                <span className="inline-flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No parent / guardian is linked to this student.</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setEditInitialStep(2)
                    setSubView('edit')
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-2xs cursor-pointer transition-colors"
                >
                  Edit Profile to Add Parent
                </button>
              </div>
            </div>
          )
        }

        return (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-sm">Parent / Guardian Details</span>
              <button
                type="button"
                onClick={() => {
                  setEditInitialStep(2)
                  setSubView('edit')
                }}
                className="px-3 py-1 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 font-semibold cursor-pointer"
              >
                Edit Guardian Info
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {[
                ['Father / Guardian Name', student.fatherName || student.guardianName],
                ['Parent CNIC', student.parentCnic || student.fatherCnic || student.cnic],
                ['Guardian Phone', student.guardianPhone || student.parentPhone || student.phone],
                ['WhatsApp Number', student.guardianWhatsapp],
                ['Parent Email', student.parentEmail],
                ['Mother Name', student.motherName],
                ['Mother CNIC', student.motherCnic],
                ['Residential Address', student.address]
              ].map(([label, val]) => (
                <div key={label} className="px-5 py-3 grid grid-cols-12 gap-3">
                  <div className="col-span-5 sm:col-span-4 font-bold text-slate-700">{label}</div>
                  <div className="col-span-7 sm:col-span-8">{renderFieldValue(val)}</div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Tab 4: Attendance (Pick 4) */}
      {activeTab === 'attendance' && (() => {
        const mTotal = monthlyAttendance.exactPresent + monthlyAttendance.absent + monthlyAttendance.late + monthlyAttendance.leave
        const pPct = mTotal > 0 ? Math.round((monthlyAttendance.exactPresent / mTotal) * 100) : 0
        const lPct = mTotal > 0 ? Math.round((monthlyAttendance.late / mTotal) * 100) : 0
        const lvPct = mTotal > 0 ? Math.round((monthlyAttendance.leave / mTotal) * 100) : 0
        const aPct = mTotal > 0 ? Math.max(0, 100 - pPct - lPct - lvPct) : 0
        const currentYear = String(new Date().getFullYear())
        const yearRows =
          monthlyAttendance.byYear.length > 0
            ? monthlyAttendance.byYear
            : [{ year: currentYear, days: 0, present: 0, absent: 0, late: 0, leave: 0, presentPct: 0 }]

        return (
          <div className="space-y-5 text-xs">
            {/* Calendar Year Attendance Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                <BarChart3 className="w-4 h-4 text-sky-600" />
                <span>Attendance by calendar year (general)</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold text-slate-600">
                    <tr>
                      <th className="py-2.5 px-5">Year</th>
                      <th className="py-2.5 px-4 text-center">Days recorded</th>
                      <th className="py-2.5 px-4 text-center">Present</th>
                      <th className="py-2.5 px-4 text-center">Absent</th>
                      <th className="py-2.5 px-4 text-center">Late</th>
                      <th className="py-2.5 px-4 text-center">Leave</th>
                      <th className="py-2.5 px-5 text-center">Present %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {yearRows.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-50/60">
                        <td className="py-3 px-5 font-extrabold text-slate-900">{row.year}</td>
                        <td className="py-3 px-4 text-center text-slate-700 font-semibold">{row.days}</td>
                        <td className="py-3 px-4 text-center text-emerald-700 font-semibold">{row.present}</td>
                        <td className="py-3 px-4 text-center text-rose-600 font-semibold">{row.absent}</td>
                        <td className="py-3 px-4 text-center text-amber-600 font-semibold">{row.late}</td>
                        <td className="py-3 px-4 text-center text-cyan-600 font-semibold">{row.leave}</td>
                        <td className="py-3 px-5 text-center font-bold text-slate-900">{row.presentPct}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-2.5 border-t border-slate-100 text-[10px] text-slate-400">
                Percentages use present days vs total general attendance entries for that year.
              </div>
            </div>

            {/* Monthly Summary + Quick Links */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <span>{monthlyAttendance.monthLabel} — Attendance Summary</span>
                </div>
                <div className="p-5 space-y-4">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">Attendance Rate</span>
                      <span className="font-extrabold text-indigo-700">{monthlyAttendance.rate}%</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden flex">
                      {pPct > 0 && <div className="bg-emerald-500 h-full" style={{ width: `${pPct}%` }} />}
                      {lPct > 0 && <div className="bg-amber-400 h-full" style={{ width: `${lPct}%` }} />}
                      {lvPct > 0 && <div className="bg-cyan-500 h-full" style={{ width: `${lvPct}%` }} />}
                      {aPct > 0 && <div className="bg-rose-500 h-full" style={{ width: `${aPct}%` }} />}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] font-bold">
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-white">Present</span>
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-900">Late</span>
                      <span className="px-2 py-0.5 rounded bg-cyan-500 text-white">Leave</span>
                      <span className="px-2 py-0.5 rounded bg-rose-500 text-white">Absent</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl bg-emerald-50/70 border border-emerald-100 py-4 text-center">
                      <p className="text-lg font-extrabold text-emerald-700">{monthlyAttendance.exactPresent}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Present</p>
                    </div>
                    <div className="rounded-xl bg-rose-50/70 border border-rose-100 py-4 text-center">
                      <p className="text-lg font-extrabold text-rose-600">{monthlyAttendance.absent}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Absent</p>
                    </div>
                    <div className="rounded-xl bg-amber-50/70 border border-amber-100 py-4 text-center">
                      <p className="text-lg font-extrabold text-amber-600">{monthlyAttendance.late}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Late</p>
                    </div>
                    <div className="rounded-xl bg-cyan-50/70 border border-cyan-100 py-4 text-center">
                      <p className="text-lg font-extrabold text-cyan-600">{monthlyAttendance.leave}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">Leave</p>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 pt-1">
                    Total school days recorded this month: <strong className="text-slate-700">{monthlyAttendance.recordedDays}</strong>
                  </p>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 font-bold text-slate-800 text-sm">
                  <Link2 className="w-4 h-4 text-sky-600" />
                  <span>Quick Links</span>
                </div>
                <div className="p-5">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAttendanceReport) {
                        onOpenAttendanceReport(student.className || 'All Classes')
                      } else {
                        onRouteChange?.('inst-attendance-student-report')
                      }
                    }}
                    className="w-full py-2.5 px-4 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold inline-flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Class Attendance Reports</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Tab 5: Fee & Payments (Picks 1 & 2) */}
      {activeTab === 'fees' && (
        <div className="space-y-5 text-xs">
          {/* Top Helper & Open Billing & Pay Button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Cash collected and waivers/discounts across class invoices and individual charges.</span>
            </p>
            <button
              type="button"
              onClick={() => onOpenBillingHistory?.(student.id)}
              className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold inline-flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Open billing &amp; pay</span>
            </button>
          </div>

          {/* 3 Colored Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-amber-200 bg-amber-50/75 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider">TOTAL PENDING</p>
                <p className="text-xl font-extrabold text-amber-700 mt-1">{formatMoney(feeSummary.pendingDues)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{feeSummary.pendingLinesCount} pending invoice line(s)</p>
              </div>
              <AlertTriangle className="w-7 h-7 text-amber-300 shrink-0" />
            </div>

            <div className="rounded-xl border border-emerald-200 bg-emerald-50/75 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">CASH RECEIVED</p>
                <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatMoney(feeSummary.totalPaid)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{feeSummary.paidLinesCount} paid line(s)</p>
              </div>
              <Check className="w-7 h-7 text-emerald-300 shrink-0" />
            </div>

            <div className="rounded-xl border border-sky-200 bg-sky-50/75 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-extrabold text-sky-700 uppercase tracking-wider">REGULAR VOUCHER</p>
                <p className="text-xl font-extrabold text-sky-700 mt-1">{formatMoney(resolvedSetup.finalAmount)}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fee setup · {resolvedSetup.feeType}</p>
              </div>
              <CreditCard className="w-7 h-7 text-sky-300 shrink-0" />
            </div>
          </div>

          {/* Recent Transactions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-indigo-700 text-sm inline-flex items-center gap-2">
                <History className="w-4 h-4" />
                <span>Recent transactions</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{feeSummary.recentTxns.length} record(s)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-2.5 px-4">DATE</th>
                    <th className="py-2.5 px-4">INVOICE</th>
                    <th className="py-2.5 px-4">TYPE</th>
                    <th className="py-2.5 px-4 text-right">AMOUNT</th>
                    <th className="py-2.5 px-4">BY</th>
                    <th className="py-2.5 px-4">REASON</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {feeSummary.recentTxns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        No payment or waiver transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    feeSummary.recentTxns.map((txn) => (
                      <tr key={txn.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-4 text-slate-600 whitespace-nowrap">{txn.dateLabel}</td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">{txn.invoiceLabel}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] text-white ${
                              txn.type === 'Cash' ? 'bg-emerald-600' : 'bg-sky-500'
                            }`}
                          >
                            {txn.type}
                          </span>
                        </td>
                        <td
                          className={`py-2.5 px-4 text-right font-bold ${
                            txn.type === 'Cash' ? 'text-emerald-600' : 'text-sky-600'
                          }`}
                        >
                          {formatMoney(txn.amount)}
                        </td>
                        <td className="py-2.5 px-4 text-slate-600">{txn.by}</td>
                        <td className="py-2.5 px-4 text-slate-500">{txn.reason}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regular Fee Invoices Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-indigo-700 text-sm inline-flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Regular fee invoices</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">{studentFees.length} line(s)</span>
            </div>
            {studentFees.length === 0 ? (
              <p className="text-slate-400 py-8 text-center">No regular fee invoices recorded for {studentName}.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/70 border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="py-2.5 px-4">#</th>
                      <th className="py-2.5 px-4">INVOICE</th>
                      <th className="py-2.5 px-4 text-right">DUE / BILLED</th>
                      <th className="py-2.5 px-4 text-right">CASH RECEIVED</th>
                      <th className="py-2.5 px-4 text-right">WAIVER</th>
                      <th className="py-2.5 px-4 text-center">DUE DATE</th>
                      <th className="py-2.5 px-4 text-center">STATUS</th>
                      <th className="py-2.5 px-4 text-right" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentFees.map((f, idx) => {
                      const billed = Number(f.amount || 0) + Number(f.fine || f.lateFine || 0)
                      const paid = Number(f.paidAmount || 0)
                      const waiver = Number(f.discount || f.waiver || 0)
                      const rem = f.status === 'Paid' ? 0 : Math.max(0, billed - paid - waiver)
                      const refNum = f.receiptNo || f.invoiceNo || String(f.id).slice(-8)
                      const freq = f.frequency || f.duration || 'Monthly'
                      const st = f.status === 'Paid' || rem <= 0 ? 'Paid' : paid > 0 || waiver > 0 ? 'Partial' : 'Pending'
                      const formattedDue = f.dueDate
                        ? new Date(`${String(f.dueDate).slice(0, 10)}T12:00:00`).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })
                        : '—'

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/60">
                          <td className="py-3 px-4 text-slate-500 font-medium">{idx + 1}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{f.feeMonth || f.title || 'Tuition Fee'}</div>
                            <div className="text-[10px] text-slate-400">
                              #{refNum} · {freq}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {st === 'Paid' ? (
                              <span className="font-bold text-slate-900">{formatMoney(billed)}</span>
                            ) : (
                              <div>
                                <div className="font-bold text-rose-600">{formatMoney(rem)}</div>
                                {st === 'Partial' && (
                                  <div className="text-[10px] text-slate-400">of {formatMoney(billed)}</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-700">
                            {paid > 0 ? formatMoney(paid) : '—'}
                          </td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-700">
                            {waiver > 0 ? formatMoney(waiver) : '—'}
                          </td>
                          <td className="py-3 px-4 text-center text-slate-600 whitespace-nowrap">{formattedDue}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded font-bold text-[10px] text-white ${
                                st === 'Paid' ? 'bg-emerald-600' : st === 'Partial' ? 'bg-orange-500' : 'bg-amber-400 text-slate-900'
                              }`}
                            >
                              {st}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {(paid > 0 || waiver > 0 || (Array.isArray(f.transactions) && f.transactions.length > 0)) && (
                              <button
                                type="button"
                                onClick={() => setTxnModalFee(f)}
                                className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                <History className="w-3 h-3" />
                                <span>Transactions</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="bg-slate-50/60 border-t border-slate-200 text-xs">
                    <tr>
                      <td colSpan={2} className="py-2.5 px-4 text-right font-bold text-slate-700">
                        Class invoices — outstanding:
                      </td>
                      <td colSpan={6} className="py-2.5 px-4 font-extrabold text-rose-600">
                        {formatMoney(feeSummary.pendingDues)}
                      </td>
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td colSpan={2} className="py-2.5 px-4 text-right font-bold text-slate-700">
                        Class invoices — waivers:
                      </td>
                      <td colSpan={6} className="py-2.5 px-4 font-extrabold text-cyan-600">
                        {formatMoney(feeSummary.totalWaivers)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shared Invoice Transaction History Modal */}
      <InvoiceTransactionsModal
        fee={txnModalFee}
        onClose={() => setTxnModalFee(null)}
        defaultBy={actorName}
        formatMoney={formatMoney}
      />
    </div>
  )
}

export default StudentProfileView
