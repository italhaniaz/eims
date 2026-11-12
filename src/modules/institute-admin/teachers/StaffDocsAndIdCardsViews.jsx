import React, { useState, useMemo, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Upload,
  Download,
  Trash2,
  Eye,
  Printer,
  Settings,
  CheckSquare,
  Square,
  Search,
  FolderOpen,
  IdCard,
  X,
  QrCode,
  Phone,
  Mail,
  Globe
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const DOC_TYPES = ['CNIC / National ID', 'Degree / Transcript', 'Contract', 'Experience Letter', 'Resume / CV', 'Other']

const DEFAULT_TEMPLATE = {
  subject: 'LETTER OF APPOINTMENT',
  body:
    'Dear {{name}},\n\nWe are pleased to offer you an appointment as {{role}} (Employee Code: {{code}}) at {{institute}}, effective {{joiningDate}}.\n\nYour initial monthly remuneration will be {{salary}}, subject to standard institutional policies, code of conduct, and attendance regulations.\n\nWe look forward to your valuable contribution to our academic community.',
  signatoryName: 'Principal / Director',
  signatoryTitle: 'Administration Office'
}

const formatDisplayDate = (iso) => {
  if (!iso) return '—'
  const dt = new Date(`${String(iso).slice(0, 10)}T12:00:00`)
  if (Number.isNaN(dt.getTime())) return String(iso).slice(0, 10)
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const makeStaffCode = (id, idx) => {
  const raw = String(id || idx + 1)
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
  return (raw + 'X7K9M2P4Q1').slice(0, 10)
}

const QuickHeader = ({ title, onBack, onRouteChange, onOpenQuickPayment, onOpenSendSms }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
    <div>
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-slate-600" />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-admissions-enroll')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>New Enrollment</span>
      </button>
      <button
        type="button"
        onClick={() => onOpenQuickPayment?.()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <CreditCard className="w-3.5 h-3.5" />
        <span>Add Payment</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-fees')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <Receipt className="w-3.5 h-3.5" />
        <span>Generate Invoice</span>
      </button>
      <button
        type="button"
        onClick={() => onRouteChange?.('inst-accounts-expenses')}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        <span>Manage Expense</span>
      </button>
      <button
        type="button"
        onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-comm-sms'))}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Send SMS</span>
      </button>
    </div>
  </div>
)

// Clean deterministic SVG QR matrix visual for staff ID cards
const MiniQrSvg = ({ value, size = 64 }) => {
  const seed = String(value || 'STAFF')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0) * 17, 7)
  const cells = 9
  const rects = []
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const isCorner =
        (r < 3 && c < 3) || (r < 3 && c >= cells - 3) || (r >= cells - 3 && c < 3)
      const filled = isCorner
        ? r === 0 ||
          r === 2 ||
          c === 0 ||
          c === 2 ||
          (r === 1 && c === 1) ||
          (r === 1 && c === cells - 2) ||
          (r === cells - 2 && c === 1)
        : ((seed + r * 31 + c * 13 + r * c) % 3) !== 0
      if (filled) {
        rects.push(<rect key={`${r}-${c}`} x={c * 4} y={r * 4} width="3.5" height="3.5" fill="#0f172a" />)
      }
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${cells * 4} ${cells * 4}`} className="bg-white p-1 rounded border border-slate-200">
      {rects}
    </svg>
  )
}

export const StaffDocsAndIdCardsViews = ({
  mode = 'docs', // 'docs' | 'letters' | 'idcards'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { teachers = [], users = [] } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'
  const instName = currentInstitute?.name || 'EduDigize Demo'

  const hrExtrasKey = `sms_campus_hr_extras_${instId}`
  const docsKey = `sms_campus_staff_docs_${instId}`
  const templateKey = `sms_campus_appointment_template_${instId}`

  const [hrExtras, setHrExtras] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(hrExtrasKey) || '{}')
    } catch {
      return {}
    }
  })

  const campusStaff = useMemo(() => {
    const instTeachers = teachers.filter((t) => !t.instituteId || t.instituteId === instId)
    const instUsers = users.filter(
      (u) =>
        (!u.instituteId || u.instituteId === instId) &&
        !['student', 'parent', 'superadmin'].includes(String(u.role || '').toLowerCase())
    )
    const map = new Map()
    instTeachers.forEach((t, idx) => {
      const ex = hrExtras[t.id] || {}
      const roles = Array.isArray(ex.roles) && ex.roles.length > 0 ? ex.roles : [ex.role || t.role || 'Teacher']
      map.set(t.id, {
        id: t.id,
        name: t.name || 'Staff Member',
        email: t.email || ex.email || '',
        phone: t.phone || ex.phone || '',
        userType: roles.join(' '),
        primaryRole: roles[0] || 'Teacher',
        employeeId: ex.staffCode || t.employeeCode || `ED/STAFF/${String(idx + 1).padStart(4, '0')}`,
        letterCode: ex.letterCode || makeStaffCode(t.id, idx),
        dob: t.dob || ex.dob || '—',
        bloodGroup: t.bloodGroup || ex.bloodGroup || '—',
        salary: Number(ex.salary ?? t.salary ?? 0),
        joiningDate: ex.joiningDate || t.joiningDate || new Date().toISOString().slice(0, 10)
      })
    })
    instUsers.forEach((u, idx) => {
      const existsEmail = u.email && [...map.values()].some((s) => s.email && s.email.toLowerCase() === u.email.toLowerCase())
      if (map.has(u.id) || existsEmail) return
      const ex = hrExtras[u.id] || {}
      const roleCap = u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Admin'
      map.set(u.id, {
        id: u.id,
        name: u.name || 'Admin User',
        email: u.email || '',
        phone: u.phone || ex.phone || '',
        userType: roleCap,
        primaryRole: roleCap,
        employeeId: ex.staffCode || u.username || `ED/STAFF/${String(idx + 10).padStart(4, '0')}`,
        letterCode: ex.letterCode || makeStaffCode(u.id, idx + 10),
        dob: ex.dob || '—',
        bloodGroup: ex.bloodGroup || '—',
        salary: Number(ex.salary || 0),
        joiningDate: ex.joiningDate || new Date().toISOString().slice(0, 10)
      })
    })
    return [...map.values()]
  }, [teachers, users, instId, hrExtras])

  // ==========================
  // MODE: STAFF DOCUMENTS (Pick 1)
  // ==========================
  const [docs, setDocs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(docsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })
  const [docEmployeeFilter, setDocEmployeeFilter] = useState('all')
  const [appliedDocEmployee, setAppliedDocEmployee] = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [docForm, setDocForm] = useState({
    employeeId: '',
    type: 'Other',
    title: '',
    uploadedDate: new Date().toISOString().slice(0, 10),
    fileName: '',
    fileDataUrl: ''
  })

  // ==========================
  // MODE: APPOINTMENT LETTERS (Pick 2)
  // ==========================
  const [template, setTemplate] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(templateKey) || 'null')
      if (saved) return saved
    } catch {}
    return DEFAULT_TEMPLATE
  })
  const [editTemplateOpen, setEditTemplateOpen] = useState(false)
  const [viewingLetterStaff, setViewingLetterStaff] = useState(null)

  // ==========================
  // MODE: STAFF ID CARDS (Picks 3-6)
  // ==========================
  const [cardTypeFilter, setCardTypeFilter] = useState('all')
  const [cardSearch, setCardSearch] = useState('')
  const [appliedCardFilters, setAppliedCardFilters] = useState({ type: 'all', search: '' })
  const [showWatermark, setShowWatermark] = useState(true)
  const [showQr, setShowQr] = useState(true)
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [cardLayout, setCardLayout] = useState('horizontal') // 'horizontal' | 'vertical'
  const [customBackText, setCustomBackText] = useState('')
  const [selectedCardIds, setSelectedCardIds] = useState([])

  useEffect(() => {
    try {
      setHrExtras(JSON.parse(localStorage.getItem(hrExtrasKey) || '{}'))
    } catch {
      setHrExtras({})
    }
    try {
      const d = JSON.parse(localStorage.getItem(docsKey) || '[]')
      setDocs(Array.isArray(d) ? d : [])
    } catch {
      setDocs([])
    }
    try {
      const t = JSON.parse(localStorage.getItem(templateKey) || 'null')
      setTemplate(t || DEFAULT_TEMPLATE)
    } catch {
      setTemplate(DEFAULT_TEMPLATE)
    }
  }, [instId, hrExtrasKey, docsKey, templateKey])

  const persistDocs = (next) => {
    setDocs(next)
    try {
      localStorage.setItem(docsKey, JSON.stringify(next))
    } catch {}
  }

  const persistTemplate = (next) => {
    setTemplate(next)
    try {
      localStorage.setItem(templateKey, JSON.stringify(next))
    } catch {}
  }

  const filteredDocs = useMemo(() => {
    if (appliedDocEmployee === 'all') return docs
    return docs.filter((d) => d.employeeId === appliedDocEmployee)
  }, [docs, appliedDocEmployee])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 1500000) {
      toast.error('File exceeds 1.5 MB limit for local storage.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setDocForm((p) => ({
        ...p,
        fileName: file.name,
        title: p.title || file.name,
        fileDataUrl: String(reader.result || '')
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleUploadDoc = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === docForm.employeeId)
    if (!staff) {
      toast.error('Please select an employee.')
      return
    }
    const cleanTitle = docForm.title.trim()
    if (!cleanTitle) {
      toast.error('Document title is required.')
      return
    }
    const newDoc = {
      id: `DOC-${Date.now()}`,
      employeeId: staff.id,
      employeeName: staff.name,
      type: docForm.type,
      title: cleanTitle,
      uploadedDate: docForm.uploadedDate,
      fileName: docForm.fileName || `${cleanTitle}.pdf`,
      fileDataUrl: docForm.fileDataUrl || ''
    }
    persistDocs([newDoc, ...docs])
    toast.success(`Uploaded "${cleanTitle}" for ${staff.name}.`)
    setUploadModalOpen(false)
    setDocForm({
      employeeId: '',
      type: 'Other',
      title: '',
      uploadedDate: new Date().toISOString().slice(0, 10),
      fileName: '',
      fileDataUrl: ''
    })
  }

  const handleDownloadDoc = (doc) => {
    if (doc.fileDataUrl) {
      const a = document.createElement('a')
      a.href = doc.fileDataUrl
      a.download = doc.fileName || `${doc.title}.pdf`
      a.click()
      return
    }
    downloadSimplePdf({
      title: `${instName} — Staff Document`,
      subtitle: `${doc.employeeName} | ${doc.type}`,
      columns: ['Field', 'Value'],
      rows: [
        ['Employee', doc.employeeName],
        ['Document Type', doc.type],
        ['Title', doc.title],
        ['Uploaded Date', formatDisplayDate(doc.uploadedDate)]
      ],
      filename: `${doc.title.replace(/\s+/g, '_')}.pdf`
    })
  }

  const renderLetterBody = (staff) => {
    return template.body
      .replaceAll('{{name}}', staff.name)
      .replaceAll('{{role}}', staff.primaryRole)
      .replaceAll('{{code}}', staff.letterCode)
      .replaceAll('{{institute}}', instName)
      .replaceAll('{{joiningDate}}', formatDisplayDate(staff.joiningDate))
      .replaceAll('{{salary}}', staff.salary > 0 ? `PKR ${staff.salary.toLocaleString()}` : 'As per policy')
  }

  const handlePrintLetter = (staff) => {
    downloadSimplePdf({
      title: `${instName} — ${template.subject}`,
      subtitle: `Ref: ${staff.letterCode} | Date: ${formatDisplayDate(new Date().toISOString())}`,
      columns: ['Details', 'Information'],
      rows: [
        ['Employee Name', staff.name],
        ['Designation', staff.userType],
        ['Email', staff.email || 'N/A'],
        ['Phone', staff.phone || 'N/A'],
        ['Letter', renderLetterBody(staff)],
        ['Authorized By', `${template.signatoryName} (${template.signatoryTitle})`]
      ],
      filename: `appointment-letter-${staff.name.replace(/\s+/g, '_')}.pdf`
    })
    toast.success(`Generated Appointment Letter PDF for ${staff.name}.`)
  }

  const filteredIdCardStaff = useMemo(() => {
    const q = appliedCardFilters.search.trim().toLowerCase()
    return campusStaff.filter((s) => {
      if (
        appliedCardFilters.type !== 'all' &&
        !s.userType.toLowerCase().includes(appliedCardFilters.type.toLowerCase())
      ) {
        return false
      }
      if (q) {
        const hay = `${s.name} ${s.email} ${s.employeeId} ${s.userType}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [campusStaff, appliedCardFilters])

  const handlePrintIdCards = () => {
    const targets =
      selectedCardIds.length > 0
        ? filteredIdCardStaff.filter((s) => selectedCardIds.includes(s.id))
        : filteredIdCardStaff
    if (targets.length === 0) {
      toast.error('No staff ID cards available to print.')
      return
    }
    downloadSimplePdf({
      title: `${instName} — Staff ID Cards (${academicYear})`,
      subtitle: `Layout: ${cardLayout} | Cards: ${targets.length}`,
      columns: ['Employee ID', 'Name', 'Designation', 'Phone', 'Email'],
      rows: targets.map((s) => [
        s.employeeId,
        s.name,
        s.primaryRole,
        s.phone || 'N/A',
        s.email || 'N/A'
      ]),
      filename: `staff-id-cards-${instId}.pdf`
    })
    toast.success(`Prepared ${targets.length} Staff ID Card(s) for printing.`)
  }

  // ==========================
  // RENDER: APPOINTMENT LETTERS (Pick 2)
  // ==========================
  if (mode === 'letters') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Appointment Letters"
          onBack={() => onRouteChange?.('inst-teachers')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 bg-sky-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="w-4 h-4" />
              <span>Appointment Letters</span>
            </div>
            <button
              type="button"
              onClick={() => setEditTemplateOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Edit Template</span>
            </button>
          </div>

          <div className="p-5 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-3 w-12">#</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">User Type</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {campusStaff.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      No staff members found.
                    </td>
                  </tr>
                ) : (
                  campusStaff.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{s.name}</td>
                      <td className="py-3 px-3 text-slate-600">{s.email || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-600">{s.phone || 'N/A'}</td>
                      <td className="py-3 px-3 text-slate-700">{s.userType}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{s.letterCode}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingLetterStaff(s)}
                            className="px-2.5 py-1 rounded bg-sky-500 hover:bg-sky-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintLetter(s)}
                            className="px-2.5 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Appointment Letter Modal */}
        {viewingLetterStaff && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{template.subject}</h3>
                  <p className="text-[11px] text-slate-500">
                    {instName} • Ref: {viewingLetterStaff.letterCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingLetterStaff(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {renderLetterBody(viewingLetterStaff)}
              </div>
              <div className="pt-2 text-xs text-slate-600">
                <div className="font-bold text-slate-900">{template.signatoryName}</div>
                <div>{template.signatoryTitle}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handlePrintLetter(viewingLetterStaff)}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingLetterStaff(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {editTemplateOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Edit Appointment Letter Template</h3>
                <button
                  type="button"
                  onClick={() => setEditTemplateOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject / Title</label>
                  <input
                    type="text"
                    value={template.subject}
                    onChange={(e) => setTemplate((p) => ({ ...p, subject: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Body (placeholders: {'{{name}}'}, {'{{role}}'}, {'{{code}}'}, {'{{institute}}'}, {'{{joiningDate}}'}, {'{{salary}}'})
                  </label>
                  <textarea
                    rows={6}
                    value={template.body}
                    onChange={(e) => setTemplate((p) => ({ ...p, body: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Signatory Name</label>
                    <input
                      type="text"
                      value={template.signatoryName}
                      onChange={(e) => setTemplate((p) => ({ ...p, signatoryName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Signatory Title</label>
                    <input
                      type="text"
                      value={template.signatoryTitle}
                      onChange={(e) => setTemplate((p) => ({ ...p, signatoryTitle: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTemplateOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    persistTemplate(template)
                    toast.success('Appointment letter template saved.')
                    setEditTemplateOpen(false)
                  }}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: STAFF ID CARDS (Picks 3-6)
  // ==========================
  if (mode === 'idcards') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Staff ID Cards"
          onBack={() => onRouteChange?.('inst-teachers')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2 text-sm font-semibold text-slate-800">
            <IdCard className="w-4 h-4 text-slate-600" />
            <span>Staff ID Cards</span>
          </div>

          <div className="p-5 space-y-4">
            {/* Filter Row */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3.5 rounded-xl border border-slate-200 bg-slate-50/40">
              <div className="sm:col-span-5">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  User Type
                </label>
                <select
                  value={cardTypeFilter}
                  onChange={(e) => setCardTypeFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                >
                  <option value="all">All Staff Types</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Admin">Admin</option>
                  <option value="Principal">Principal</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Driver">Driver</option>
                </select>
              </div>
              <div className="sm:col-span-6">
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Search</label>
                <input
                  type="text"
                  value={cardSearch}
                  onChange={(e) => setCardSearch(e.target.value)}
                  placeholder="Name, username, email, or employee ID"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                />
              </div>
              <div className="sm:col-span-1">
                <button
                  type="button"
                  onClick={() =>
                    setAppliedCardFilters({ type: cardTypeFilter, search: cardSearch })
                  }
                  className="w-full px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Filter</span>
                </button>
              </div>
            </div>

            {/* Print Options */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/30 space-y-3">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                PRINT OPTIONS · <span className="font-normal lowercase">this print only</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <label className="sm:col-span-4 p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={(e) => setShowWatermark(e.target.checked)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">Logo watermark</div>
                    <div className="text-[10px] text-slate-400">Faded logo on background</div>
                  </div>
                </label>

                <label className="sm:col-span-4 p-2.5 rounded-lg border border-slate-200 bg-white flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showQr}
                    onChange={(e) => setShowQr(e.target.checked)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-xs font-semibold text-slate-800">QR code</div>
                    <div className="text-[10px] text-slate-400">Show on card</div>
                  </div>
                </label>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Academic year
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Card layout
                  </label>
                  <div className="inline-flex rounded-lg border border-slate-200 overflow-hidden w-full">
                    <button
                      type="button"
                      onClick={() => setCardLayout('horizontal')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold cursor-pointer ${
                        cardLayout === 'horizontal'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      Horizontal
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardLayout('vertical')}
                      className={`flex-1 py-1.5 text-[11px] font-semibold cursor-pointer ${
                        cardLayout === 'vertical'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600'
                      }`}
                    >
                      Vertical
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Custom text on card back <span className="text-slate-400">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  value={customBackText}
                  onChange={(e) => setCustomBackText(e.target.value)}
                  placeholder="Printed exactly as typed on the back of each card"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>

            {/* Selection Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCardIds(filteredIdCardStaff.map((s) => s.id))}
                  className="px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Select All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCardIds([])}
                  className="px-3 py-1.5 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Square className="w-3.5 h-3.5" />
                  <span>Deselect All</span>
                </button>
                <span className="text-xs text-slate-500 ml-1">
                  {selectedCardIds.length} selected
                </span>
              </div>

              <button
                type="button"
                onClick={handlePrintIdCards}
                className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print ID Cards</span>
              </button>
            </div>

            {/* ID Cards Preview Grid */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-6">
              {filteredIdCardStaff.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No staff members match your filters.
                </div>
              ) : (
                filteredIdCardStaff.map((s) => {
                  const checked = selectedCardIds.includes(s.id)
                  return (
                    <div
                      key={s.id}
                      className="flex flex-col lg:flex-row items-center justify-center gap-6 pb-6 border-b border-slate-200 last:border-b-0 last:pb-0"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) =>
                          setSelectedCardIds((prev) =>
                            e.target.checked
                              ? [...prev, s.id]
                              : prev.filter((id) => id !== s.id)
                          )
                        }
                        className="w-4 h-4 cursor-pointer"
                      />

                      {/* FRONT CARD */}
                      <div className="flex flex-col items-center">
                        <span className="px-3 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase mb-1.5">
                          FRONT
                        </span>
                        <div
                          className={`relative rounded-xl border border-slate-300 bg-white shadow-md overflow-hidden flex flex-col justify-between ${
                            cardLayout === 'vertical' ? 'w-64 min-h-[320px]' : 'w-80 min-h-[200px]'
                          }`}
                        >
                          {showWatermark && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06]">
                              <div className="w-28 h-28 rounded-full border-4 border-sky-600 flex items-center justify-center font-black text-sky-700 text-xs text-center">
                                {instName.toUpperCase()}
                              </div>
                            </div>
                          )}

                          {/* Card Top Header */}
                          <div className="px-3.5 py-2.5 flex items-start justify-between border-b border-slate-100 relative z-10">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center">
                                {instName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-[11px] font-extrabold text-slate-900 uppercase">
                                  {instName}
                                </div>
                                <div className="text-[9px] text-slate-400">
                                  Excellence in Education
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold">
                                {academicYear}
                              </span>
                              <div className="text-[9px] font-bold text-teal-600 uppercase mt-0.5">
                                STAFF
                              </div>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="px-3.5 py-2.5 flex items-center gap-3 relative z-10 flex-1">
                            <div className="w-16 h-16 rounded-lg border-2 border-teal-500 bg-sky-50 text-sky-700 font-bold text-lg flex items-center justify-center shrink-0">
                              {s.name
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div className="text-[10px] space-y-0.5 min-w-0 flex-1">
                              <div className="font-extrabold text-slate-900 text-xs uppercase truncate">
                                {s.name}
                              </div>
                              {s.phone && (
                                <div className="text-slate-500 font-mono">{s.phone}</div>
                              )}
                              <div>
                                <span className="text-slate-400">Employee ID : </span>
                                <span className="font-semibold text-slate-700">{s.employeeId}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Designation : </span>
                                <span className="font-semibold text-slate-700">{s.primaryRole}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Date of Birth : </span>
                                <span className="text-slate-700">{s.dob}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Blood Group : </span>
                                <span className="text-slate-700">{s.bloodGroup}</span>
                              </div>
                            </div>
                            {showQr && (
                              <div className="self-end shrink-0">
                                <MiniQrSvg value={s.employeeId} size={42} />
                              </div>
                            )}
                          </div>

                          {/* Bottom Strip */}
                          <div className="bg-slate-900 text-white text-[9px] text-center py-1.5 tracking-wide font-medium">
                            Integrity · Commitment · Excellence
                          </div>
                        </div>
                      </div>

                      {/* BACK CARD */}
                      <div className="flex flex-col items-center">
                        <span className="px-3 py-0.5 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase mb-1.5">
                          BACK
                        </span>
                        <div
                          className={`relative rounded-xl border border-slate-300 bg-white shadow-md overflow-hidden flex flex-col justify-between ${
                            cardLayout === 'vertical' ? 'w-64 min-h-[320px]' : 'w-80 min-h-[200px]'
                          }`}
                        >
                          <div className="pt-3 px-4 text-center">
                            <div className="text-xs font-extrabold text-slate-900 uppercase">
                              {instName}
                            </div>
                            <div className="text-[9px] text-slate-400">Excellence in Education</div>
                          </div>

                          <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 gap-1.5">
                            {showQr ? (
                              <MiniQrSvg value={`${instName}:${s.employeeId}`} size={76} />
                            ) : (
                              <QrCode className="w-10 h-10 text-slate-200" />
                            )}
                            {customBackText.trim() && (
                              <p className="text-[9px] text-center text-slate-600 whitespace-pre-line">
                                {customBackText}
                              </p>
                            )}
                          </div>

                          <div className="px-4 pb-2 flex items-center justify-between text-[9px] text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Phone className="w-2.5 h-2.5 text-teal-600" />
                              {currentInstitute?.phone || '+92-310-7173162'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 text-teal-600" />
                              {currentInstitute?.email || 'info@edudigitize.io'}
                            </span>
                          </div>

                          <div className="bg-slate-900 text-white text-[9px] text-center py-1.5 inline-flex items-center justify-center gap-1">
                            <Globe className="w-2.5 h-2.5 text-teal-400" />
                            <span>https://demo.edudigitize.io/</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: STAFF DOCUMENTS (Pick 1)
  // ==========================
  return (
    <div className="space-y-4">
      <QuickHeader
        title="Staff Documents"
        onBack={() => onRouteChange?.('inst-teachers')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <FolderOpen className="w-4 h-4 text-slate-600" />
            <span>Staff Documents</span>
          </div>

          <button
            type="button"
            onClick={() => setUploadModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-4">
              <select
                value={docEmployeeFilter}
                onChange={(e) => setDocEmployeeFilter(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
              >
                <option value="all">All employees</option>
                {campusStaff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={() => setAppliedDocEmployee(docEmployeeFilter)}
                className="w-full px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                  <th className="py-2.5 px-3 w-14">#</th>
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Uploaded</th>
                  <th className="py-2.5 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-400">
                      No staff documents uploaded yet. Click{' '}
                      <button
                        type="button"
                        onClick={() => setUploadModalOpen(true)}
                        className="text-sky-600 font-semibold hover:underline cursor-pointer"
                      >
                        Upload
                      </button>{' '}
                      to add one.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((d, idx) => (
                    <tr key={d.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-medium text-slate-900">{d.employeeName}</td>
                      <td className="py-3 px-3 text-slate-700">{d.type}</td>
                      <td className="py-3 px-3 text-slate-800">{d.title}</td>
                      <td className="py-3 px-3 text-slate-600">
                        {formatDisplayDate(d.uploadedDate)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleDownloadDoc(d)}
                            className="px-2.5 py-1 rounded border border-sky-400 text-sky-600 hover:bg-sky-50 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              persistDocs(docs.filter((x) => x.id !== d.id))
                              toast.success('Document deleted.')
                            }}
                            className="px-2.5 py-1 rounded border border-rose-400 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upload Staff Document Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadDoc}
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Upload Staff Document</h3>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Employee *</label>
                <select
                  value={docForm.employeeId}
                  onChange={(e) => setDocForm((p) => ({ ...p, employeeId: e.target.value }))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  <option value="">Select Employee...</option>
                  {campusStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Document Type</label>
                  <select
                    value={docForm.type}
                    onChange={(e) => setDocForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Upload Date</label>
                  <input
                    type="date"
                    value={docForm.uploadedDate}
                    onChange={(e) => setDocForm((p) => ({ ...p, uploadedDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={docForm.title}
                  onChange={(e) => setDocForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., CNIC Copy / Contract PDF"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Attach File (optional, max 1.5 MB)
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Save Document
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default StaffDocsAndIdCardsViews
