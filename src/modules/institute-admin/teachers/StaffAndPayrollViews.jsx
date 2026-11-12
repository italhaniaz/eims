import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  UserPlus,
  CreditCard,
  Receipt,
  ArrowDownCircle,
  MessageSquare,
  Users,
  UserCheck,
  Phone,
  List,
  Plus,
  Search,
  Eye,
  Edit3,
  Menu,
  ChevronDown,
  Trash2,
  Check,
  Download,
  FileSpreadsheet,
  Table,
  Filter,
  Settings,
  Calendar,
  CheckCircle2,
  Hourglass,
  Printer,
  Mail,
  X
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { downloadSimplePdf } from '../../../utils/pdfExport'

const EMPLOYMENT_TYPES = ['Permanent', 'Contractual', 'Visiting']
const STAFF_ROLES = ['Teacher', 'Admin', 'Principal', 'Accountant', 'Driver', 'Security Guard', 'Librarian', 'Clerk']
const PAY_TYPES = ['Salary', 'Bonus', 'Advance']
const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'Online Transfer', 'Cheque', 'EasyPaisa', 'JazzCash']
const FISCAL_YEARS = ['2024-2025', '2025-2026', '2026-2027']

const fmtPkr = (n) => `PKR ${Number(n || 0).toLocaleString()}`
const fmtNumPkr = (n) => `${Number(n || 0).toLocaleString()} PKR`

const formatMonthLabel = (ym) => {
  if (!ym) return '—'
  const [y, m] = String(ym).split('-')
  if (!y || !m) return ym
  const dt = new Date(Number(y), Number(m) - 1, 1)
  if (Number.isNaN(dt.getTime())) return ym
  return dt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

const formatCreatedDateTime = (iso) => {
  if (!iso) return '—'
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return String(iso)
  const datePart = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timePart = dt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${datePart}, ${timePart}`
}

const formatSentStamp = (iso) => {
  if (!iso) return ''
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return String(iso)
  const datePart = dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const timePart = dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
  return `${datePart}, ${timePart}`
}

const roleBadgeClass = (role) => {
  const r = String(role || '').toLowerCase()
  if (r.includes('admin')) return 'bg-rose-50 text-rose-600 border-rose-200'
  if (r.includes('teacher')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (r.includes('principal')) return 'bg-indigo-50 text-indigo-700 border-indigo-200'
  if (r.includes('accountant')) return 'bg-amber-50 text-amber-700 border-amber-200'
  return 'bg-slate-100 text-slate-700 border-slate-200'
}

const employmentBadgeClass = (emp) => {
  const e = String(emp || 'Permanent').toLowerCase()
  if (e === 'contractual') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (e === 'visiting') return 'bg-sky-50 text-sky-700 border-sky-200'
  return 'bg-emerald-50 text-emerald-700 border-emerald-200'
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

export const StaffAndPayrollViews = ({
  mode = 'staff', // 'staff' | 'payroll' | 'salary-setup'
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms
}) => {
  const { teachers = [], users = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()
  const instId = currentInstitute?.id || 'inst-1'

  const hrExtrasKey = `sms_campus_hr_extras_${instId}`
  const salaryPaymentsKey = `sms_campus_salary_payments_${instId}`
  const salarySetupsKey = `sms_campus_salary_setups_${instId}`

  const [hrExtras, setHrExtras] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(hrExtrasKey) || '{}')
    } catch {
      return {}
    }
  })

  const [salaryPayments, setSalaryPayments] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(salaryPaymentsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  const [salarySetups, setSalarySetups] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(salarySetupsKey) || '[]')
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      setHrExtras(JSON.parse(localStorage.getItem(hrExtrasKey) || '{}'))
    } catch {
      setHrExtras({})
    }
    try {
      const sp = JSON.parse(localStorage.getItem(salaryPaymentsKey) || '[]')
      setSalaryPayments(Array.isArray(sp) ? sp : [])
    } catch {
      setSalaryPayments([])
    }
    try {
      const ss = JSON.parse(localStorage.getItem(salarySetupsKey) || '[]')
      setSalarySetups(Array.isArray(ss) ? ss : [])
    } catch {
      setSalarySetups([])
    }
  }, [instId, hrExtrasKey, salaryPaymentsKey, salarySetupsKey])

  const persistHrExtras = (next) => {
    setHrExtras(next)
    try {
      localStorage.setItem(hrExtrasKey, JSON.stringify(next))
    } catch {}
  }

  const persistSalaryPayments = (next) => {
    setSalaryPayments(next)
    try {
      localStorage.setItem(salaryPaymentsKey, JSON.stringify(next))
    } catch {}
  }

  const persistSalarySetups = (next) => {
    setSalarySetups(next)
    try {
      localStorage.setItem(salarySetupsKey, JSON.stringify(next))
    } catch {}
  }

  // Unified campus staff roster
  const campusStaff = useMemo(() => {
    const instTeachers = teachers.filter((t) => !t.instituteId || t.instituteId === instId)
    const instUsers = users.filter(
      (u) =>
        (!u.instituteId || u.instituteId === instId) &&
        !['student', 'parent', 'superadmin'].includes(String(u.role || '').toLowerCase())
    )
    const combinedMap = new Map()
    instTeachers.forEach((t, idx) => {
      const ex = hrExtras[t.id] || {}
      const roles = Array.isArray(ex.roles) && ex.roles.length > 0
        ? ex.roles
        : [ex.role || t.role || t.designation || 'Teacher']
      combinedMap.set(t.id, {
        id: t.id,
        name: t.name || 'Staff Member',
        email: t.email || ex.email || '',
        phone: t.phone || ex.phone || '',
        roles,
        primaryRole: roles[0] || 'Teacher',
        employmentType: ex.employmentType || t.employmentType || 'Permanent',
        staffCode: ex.staffCode || t.employeeCode || t.staffCode || `ED/STAFF/${String(idx + 1).padStart(4, '0')}`,
        status: ex.status || t.status || 'Active',
        salary: Number(ex.salary ?? t.salary ?? 0),
        joiningDate: ex.joiningDate || t.joiningDate || '',
        welcomeSmsSentAt: ex.welcomeSmsSentAt || '',
        loginSmsSentAt: ex.loginSmsSentAt || '',
        loginEmailSentAt: ex.loginEmailSentAt || '',
        source: 'teachers'
      })
    })
    instUsers.forEach((u) => {
      const alreadyByEmail = u.email && [...combinedMap.values()].some((s) => s.email && s.email.toLowerCase() === u.email.toLowerCase())
      if (combinedMap.has(u.id) || alreadyByEmail) return
      const ex = hrExtras[u.id] || {}
      const roles = Array.isArray(ex.roles) && ex.roles.length > 0
        ? ex.roles
        : [u.role ? u.role.charAt(0).toUpperCase() + u.role.slice(1) : 'Admin']
      combinedMap.set(u.id, {
        id: u.id,
        name: u.name || 'Admin User',
        email: u.email || '',
        phone: u.phone || ex.phone || '',
        roles,
        primaryRole: roles[0] || 'Admin',
        employmentType: ex.employmentType || 'Permanent',
        staffCode: ex.staffCode || u.username || u.id,
        status: ex.status || u.status || 'Active',
        salary: Number(ex.salary || 0),
        joiningDate: ex.joiningDate || '',
        welcomeSmsSentAt: ex.welcomeSmsSentAt || '',
        loginSmsSentAt: ex.loginSmsSentAt || '',
        loginEmailSentAt: ex.loginEmailSentAt || '',
        source: 'users'
      })
    })
    return [...combinedMap.values()]
  }, [teachers, users, instId, hrExtras])

  // ==========================
  // STATE: ALL STAFF (Picks 1-2)
  // ==========================
  const [staffTab, setStaffTab] = useState('all') // 'all' | 'create'
  const [staffSearch, setStaffSearch] = useState('')
  const [staffRoleFilter, setStaffRoleFilter] = useState('all')
  const [staffStatusFilter, setStaffStatusFilter] = useState('all')
  const [staffEmpFilter, setStaffEmpFilter] = useState('all')
  const [staffActionMenuId, setStaffActionMenuId] = useState(null)
  const [viewingStaff, setViewingStaff] = useState(null)
  const [editingStaffId, setEditingStaffId] = useState(null)
  const [deleteStaffTarget, setDeleteStaffTarget] = useState(null)

  const [staffForm, setStaffForm] = useState({
    name: '',
    roles: ['Teacher'],
    employmentType: 'Permanent',
    staffCode: '',
    phone: '',
    email: '',
    status: 'Active',
    salary: ''
  })

  const staffMenuRef = useRef(null)

  // ==========================
  // STATE: PAYROLL (Pick 3)
  // ==========================
  const [payrollTab, setPayrollTab] = useState('all') // 'all' | 'pay'
  const [payrollFilters, setPayrollFilters] = useState({
    staffId: 'all',
    salaryMonth: '',
    createdDate: '',
    status: 'all'
  })
  const [appliedPayrollFilters, setAppliedPayrollFilters] = useState({
    staffId: 'all',
    salaryMonth: '',
    createdDate: '',
    status: 'all'
  })
  const [payrollExportOpen, setPayrollExportOpen] = useState(false)
  const [payrollActionId, setPayrollActionId] = useState(null)
  const [viewingPayslip, setViewingPayslip] = useState(null)
  const [payForm, setPayForm] = useState({
    staffId: '',
    salaryMonth: new Date().toISOString().slice(0, 7),
    type: 'Salary',
    basic: '',
    bonus: '0',
    deduction: '0',
    fine: '0',
    status: 'Paid',
    paymentMethod: 'Bank Transfer',
    notes: ''
  })

  const payrollExportRef = useRef(null)
  const payrollMenuRef = useRef(null)

  // ==========================
  // STATE: SALARY SETUP (Pick 4)
  // ==========================
  const [setupTab, setSetupTab] = useState('all') // 'all' | 'create'
  const [editingSetupId, setEditingSetupId] = useState(null)
  const [setupForm, setSetupForm] = useState({
    staffId: '',
    baseSalary: '',
    bonus: '0',
    deduction: '0',
    year: '2025-2026',
    notes: ''
  })

  useEffect(() => {
    const handleOutside = (e) => {
      if (staffMenuRef.current && !staffMenuRef.current.contains(e.target)) {
        setStaffActionMenuId(null)
      }
      if (payrollExportRef.current && !payrollExportRef.current.contains(e.target)) {
        setPayrollExportOpen(false)
      }
      if (payrollMenuRef.current && !payrollMenuRef.current.contains(e.target)) {
        setPayrollActionId(null)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  // Staff KPI stats
  const staffStats = useMemo(() => {
    const total = campusStaff.length
    const teachersCount = campusStaff.filter((s) =>
      s.roles.some((r) => r.toLowerCase().includes('teacher'))
    ).length
    const otherCount = Math.max(0, total - teachersCount)
    const withContact = campusStaff.filter((s) => Boolean(s.phone?.trim() || s.email?.trim())).length
    return { total, teachersCount, otherCount, withContact }
  }, [campusStaff])

  const filteredStaff = useMemo(() => {
    const q = staffSearch.trim().toLowerCase()
    return campusStaff.filter((s) => {
      if (q) {
        const hay = `${s.name} ${s.email} ${s.phone} ${s.staffCode} ${s.roles.join(' ')}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (staffRoleFilter !== 'all' && !s.roles.some((r) => r.toLowerCase() === staffRoleFilter.toLowerCase())) {
        return false
      }
      if (staffStatusFilter !== 'all' && s.status.toLowerCase() !== staffStatusFilter.toLowerCase()) {
        return false
      }
      if (staffEmpFilter !== 'all' && s.employmentType.toLowerCase() !== staffEmpFilter.toLowerCase()) {
        return false
      }
      return true
    })
  }, [campusStaff, staffSearch, staffRoleFilter, staffStatusFilter, staffEmpFilter])

  const handleSendCommAction = (staff, type) => {
    const now = new Date().toISOString()
    const field =
      type === 'welcome'
        ? 'welcomeSmsSentAt'
        : type === 'login_sms'
          ? 'loginSmsSentAt'
          : 'loginEmailSentAt'
    const label =
      type === 'welcome'
        ? 'Welcome SMS'
        : type === 'login_sms'
          ? 'Login SMS'
          : 'Login Email'

    if (type === 'login_email' && !staff.email) {
      toast.error(`No email address on file for ${staff.name}.`)
      return
    }
    if ((type === 'welcome' || type === 'login_sms') && !staff.phone) {
      toast.error(`No phone number on file for ${staff.name}.`)
      return
    }

    const next = {
      ...hrExtras,
      [staff.id]: {
        ...(hrExtras[staff.id] || {}),
        [field]: now
      }
    }
    persistHrExtras(next)
    toast.success(`${label} sent to ${staff.name}.`)
  }

  const startCreateStaff = () => {
    setEditingStaffId(null)
    setStaffForm({
      name: '',
      roles: ['Teacher'],
      employmentType: 'Permanent',
      staffCode: `ED/STAFF/${new Date().getFullYear()}/${String(campusStaff.length + 1).padStart(3, '0')}`,
      phone: '',
      email: '',
      status: 'Active',
      salary: ''
    })
    setStaffTab('create')
  }

  const startEditStaff = (staff) => {
    setStaffActionMenuId(null)
    setEditingStaffId(staff.id)
    setStaffForm({
      name: staff.name || '',
      roles: staff.roles.length > 0 ? staff.roles : ['Teacher'],
      employmentType: staff.employmentType || 'Permanent',
      staffCode: staff.staffCode || '',
      phone: staff.phone || '',
      email: staff.email || '',
      status: staff.status || 'Active',
      salary: staff.salary ? String(staff.salary) : ''
    })
    setStaffTab('create')
  }

  const handleSaveStaff = async (e) => {
    e.preventDefault()
    const cleanName = staffForm.name.trim()
    if (!cleanName) {
      toast.error('Employee name is required.')
      return
    }
    const rolesList = staffForm.roles.length > 0 ? staffForm.roles : ['Teacher']
    const salaryNum = Number(staffForm.salary || 0)

    if (editingStaffId) {
      const existing = campusStaff.find((s) => s.id === editingStaffId)
      if (existing?.source === 'teachers' && updateItem) {
        try {
          await updateItem('teachers', editingStaffId, {
            name: cleanName,
            email: staffForm.email.trim(),
            phone: staffForm.phone.trim(),
            role: rolesList[0],
            status: staffForm.status,
            salary: salaryNum
          })
        } catch {}
      }
      persistHrExtras({
        ...hrExtras,
        [editingStaffId]: {
          ...(hrExtras[editingStaffId] || {}),
          roles: rolesList,
          role: rolesList[0],
          employmentType: staffForm.employmentType,
          staffCode: staffForm.staffCode.trim(),
          phone: staffForm.phone.trim(),
          email: staffForm.email.trim(),
          status: staffForm.status,
          salary: salaryNum
        }
      })
      toast.success(`Updated staff profile for ${cleanName}.`)
    } else {
      const newId = `stf-${Date.now()}`
      if (addItem) {
        try {
          await addItem('teachers', {
            id: newId,
            instituteId: instId,
            name: cleanName,
            email: staffForm.email.trim(),
            phone: staffForm.phone.trim(),
            role: rolesList[0],
            employmentType: staffForm.employmentType,
            employeeCode: staffForm.staffCode.trim(),
            status: staffForm.status,
            salary: salaryNum
          })
        } catch {}
      }
      persistHrExtras({
        ...hrExtras,
        [newId]: {
          roles: rolesList,
          role: rolesList[0],
          employmentType: staffForm.employmentType,
          staffCode: staffForm.staffCode.trim(),
          phone: staffForm.phone.trim(),
          email: staffForm.email.trim(),
          status: staffForm.status,
          salary: salaryNum
        }
      })
      toast.success(`Added ${cleanName} to All Staff.`)
    }

    setEditingStaffId(null)
    setStaffTab('all')
  }

  const handleConfirmDeleteStaff = async () => {
    if (!deleteStaffTarget) return
    if (deleteStaffTarget.source === 'teachers' && deleteItem) {
      try {
        await deleteItem('teachers', deleteStaffTarget.id)
      } catch {}
    }
    const nextExtras = { ...hrExtras }
    delete nextExtras[deleteStaffTarget.id]
    persistHrExtras(nextExtras)
    toast.success(`Removed ${deleteStaffTarget.name} from staff roster.`)
    setDeleteStaffTarget(null)
  }

  // ==========================
  // PAYROLL LOGIC (Pick 3)
  // ==========================
  const previousMonthKey = useMemo(() => {
    const now = new Date()
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`
  }, [])

  const filteredPayslips = useMemo(() => {
    return salaryPayments.filter((p) => {
      if (appliedPayrollFilters.staffId !== 'all' && p.staffId !== appliedPayrollFilters.staffId) {
        return false
      }
      if (appliedPayrollFilters.salaryMonth && p.salaryMonth !== appliedPayrollFilters.salaryMonth) {
        return false
      }
      if (appliedPayrollFilters.createdDate) {
        const createdDay = String(p.createdAt || '').slice(0, 10)
        if (createdDay !== appliedPayrollFilters.createdDate) return false
      }
      if (appliedPayrollFilters.status !== 'all' && p.status !== appliedPayrollFilters.status) {
        return false
      }
      return true
    })
  }, [salaryPayments, appliedPayrollFilters])

  const payrollStats = useMemo(() => {
    const totalNet = filteredPayslips.reduce((s, p) => s + Number(p.total || 0), 0)
    const prevMonthList = filteredPayslips.filter((p) => p.salaryMonth === previousMonthKey)
    const prevMonthTotal = prevMonthList.reduce((s, p) => s + Number(p.total || 0), 0)
    const paidList = filteredPayslips.filter((p) => p.status === 'Paid')
    const paidTotal = paidList.reduce((s, p) => s + Number(p.total || 0), 0)
    const pendingList = filteredPayslips.filter((p) => p.status !== 'Paid')
    const pendingTotal = pendingList.reduce((s, p) => s + Number(p.total || 0), 0)
    return {
      totalNet,
      count: filteredPayslips.length,
      prevMonthTotal,
      prevMonthCount: prevMonthList.length,
      paidTotal,
      paidCount: paidList.length,
      pendingTotal,
      pendingCount: pendingList.length
    }
  }, [filteredPayslips, previousMonthKey])

  const handleSelectPayStaff = (sid) => {
    const setup = salarySetups.find((s) => s.staffId === sid)
    const staff = campusStaff.find((s) => s.id === sid)
    setPayForm((prev) => ({
      ...prev,
      staffId: sid,
      basic: setup ? String(setup.baseSalary) : staff?.salary ? String(staff.salary) : '',
      bonus: setup ? String(setup.bonus || 0) : '0',
      deduction: setup ? String(setup.deduction || 0) : '0'
    }))
  }

  const handleCreatePayslip = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === payForm.staffId)
    if (!staff) {
      toast.error('Please select a staff member.')
      return
    }
    const basic = Number(payForm.basic || 0)
    const bonus = Number(payForm.bonus || 0)
    const deduction = Number(payForm.deduction || 0)
    const fine = Number(payForm.fine || 0)
    const total = Math.max(0, basic + bonus - deduction - fine)
    if (basic <= 0 && bonus <= 0) {
      toast.error('Enter a valid basic salary or bonus amount.')
      return
    }

    const newSlip = {
      id: `PAY-${Date.now()}`,
      staffId: staff.id,
      employeeName: staff.name,
      employeeRole: staff.primaryRole,
      type: payForm.type,
      basic,
      bonus,
      deduction,
      fine,
      total,
      salaryMonth: payForm.salaryMonth,
      status: payForm.status,
      paymentMethod: payForm.paymentMethod,
      notes: payForm.notes.trim(),
      createdAt: new Date().toISOString(),
      issuedBy: 'Admin'
    }

    persistSalaryPayments([newSlip, ...salaryPayments])
    toast.success(`Payslip for ${staff.name} (${fmtNumPkr(total)}) recorded.`)
    setPayrollTab('all')
    setPayForm({
      staffId: '',
      salaryMonth: new Date().toISOString().slice(0, 7),
      type: 'Salary',
      basic: '',
      bonus: '0',
      deduction: '0',
      fine: '0',
      status: 'Paid',
      paymentMethod: 'Bank Transfer',
      notes: ''
    })
  }

  const handleTogglePayslipStatus = (slip) => {
    setPayrollActionId(null)
    const nextStatus = slip.status === 'Paid' ? 'Pending' : 'Paid'
    persistSalaryPayments(
      salaryPayments.map((p) => (p.id === slip.id ? { ...p, status: nextStatus } : p))
    )
    toast.success(`Payslip marked as ${nextStatus}.`)
  }

  const handleDeletePayslip = (slip) => {
    setPayrollActionId(null)
    persistSalaryPayments(salaryPayments.filter((p) => p.id !== slip.id))
    toast.success(`Deleted payslip for ${slip.employeeName}.`)
  }

  const handleExportPayrollCsv = (asExcel = false) => {
    setPayrollExportOpen(false)
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const header = ['S/N', 'Employee Name', 'Role', 'Type', 'Basic', 'Bonus', 'Deduction', 'Fine', 'Total', 'Month', 'Status', 'Created']
    const rows = filteredPayslips.map((p, idx) => [
      idx + 1,
      p.employeeName,
      p.employeeRole,
      p.type,
      p.basic,
      p.bonus,
      p.deduction,
      p.fine || 0,
      p.total,
      formatMonthLabel(p.salaryMonth),
      p.status,
      formatCreatedDateTime(p.createdAt)
    ])
    const csv = [header.map(esc).join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n')
    const blob = new Blob([asExcel ? '\uFEFF' + csv : csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll-${instId}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success(`Payroll exported as ${asExcel ? 'Excel (CSV)' : 'CSV'}.`)
  }

  const handleExportPayrollPdf = () => {
    setPayrollExportOpen(false)
    downloadSimplePdf({
      title: `${currentInstitute?.name || 'Institute'} — Payroll Registry`,
      subtitle: `Total Net Pay: ${fmtNumPkr(payrollStats.totalNet)} | Records: ${filteredPayslips.length}`,
      columns: ['S/N', 'Employee', 'Type', 'Basic', 'Bonus', 'Deduction', 'Total', 'Month', 'Status'],
      rows: filteredPayslips.map((p, idx) => [
        String(idx + 1),
        p.employeeName,
        p.type,
        fmtNumPkr(p.basic),
        fmtNumPkr(p.bonus),
        fmtNumPkr(Number(p.deduction || 0) + Number(p.fine || 0)),
        fmtNumPkr(p.total),
        formatMonthLabel(p.salaryMonth),
        p.status
      ]),
      filename: `payroll-${instId}.pdf`
    })
    toast.success('Payroll exported to PDF.')
  }

  // ==========================
  // SALARY SETUP LOGIC (Pick 4)
  // ==========================
  const startCreateSetup = () => {
    setEditingSetupId(null)
    setSetupForm({
      staffId: '',
      baseSalary: '',
      bonus: '0',
      deduction: '0',
      year: '2025-2026',
      notes: ''
    })
    setSetupTab('create')
  }

  const startEditSetup = (setup) => {
    setEditingSetupId(setup.id)
    setSetupForm({
      staffId: setup.staffId,
      baseSalary: String(setup.baseSalary ?? ''),
      bonus: String(setup.bonus ?? 0),
      deduction: String(setup.deduction ?? 0),
      year: setup.year || '2025-2026',
      notes: setup.notes || ''
    })
    setSetupTab('create')
  }

  const handleSaveSetup = (e) => {
    e.preventDefault()
    const staff = campusStaff.find((s) => s.id === setupForm.staffId)
    if (!staff) {
      toast.error('Please select an employee.')
      return
    }
    const baseSalary = Number(setupForm.baseSalary || 0)
    const bonus = Number(setupForm.bonus || 0)
    const deduction = Number(setupForm.deduction || 0)
    if (baseSalary <= 0) {
      toast.error('Base salary must be greater than 0.')
      return
    }

    if (editingSetupId) {
      const next = salarySetups.map((s) =>
        s.id === editingSetupId
          ? {
              ...s,
              staffId: staff.id,
              employeeName: staff.name,
              employeeRole: staff.primaryRole,
              baseSalary,
              bonus,
              deduction,
              year: setupForm.year,
              notes: setupForm.notes.trim()
            }
          : s
      )
      persistSalarySetups(next)
      toast.success(`Updated salary setup for ${staff.name}.`)
    } else {
      const existingForStaff = salarySetups.find(
        (s) => s.staffId === staff.id && s.year === setupForm.year
      )
      if (existingForStaff) {
        toast.error(`Salary setup already exists for ${staff.name} (${setupForm.year}). Edit the existing row instead.`)
        return
      }
      const next = [
        ...salarySetups,
        {
          id: `SET-${Date.now()}`,
          staffId: staff.id,
          employeeName: staff.name,
          employeeRole: staff.primaryRole,
          baseSalary,
          bonus,
          deduction,
          year: setupForm.year,
          notes: setupForm.notes.trim()
        }
      ]
      persistSalarySetups(next)
      toast.success(`Saved salary setup for ${staff.name}.`)
    }

    // Also sync base salary in hrExtras
    persistHrExtras({
      ...hrExtras,
      [staff.id]: {
        ...(hrExtras[staff.id] || {}),
        salary: baseSalary
      }
    })

    setEditingSetupId(null)
    setSetupTab('all')
  }

  // ==========================
  // RENDER: SALARY SETUP (Pick 4)
  // ==========================
  if (mode === 'salary-setup') {
    return (
      <div className="space-y-4">
        <QuickHeader
          title="Staff Salary Setup"
          onBack={() => onRouteChange?.('inst-payroll')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
          <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Staff Salary Setup</span>
            </div>
            <button
              type="button"
              onClick={() => onRouteChange?.('inst-payroll')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Salaries</span>
            </button>
          </div>

          <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
            <button
              type="button"
              onClick={() => setSetupTab('all')}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                setupTab === 'all'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>All Salary Setups</span>
            </button>
            <button
              type="button"
              onClick={startCreateSetup}
              className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
                setupTab === 'create'
                  ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingSetupId ? 'Edit Setup' : 'Create New Setup'}</span>
            </button>
          </div>

          {setupTab === 'all' ? (
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-3 w-16">S/N</th>
                    <th className="py-2.5 px-3">Employee Name</th>
                    <th className="py-2.5 px-3">Base Salary</th>
                    <th className="py-2.5 px-3">Bonus (PKR)</th>
                    <th className="py-2.5 px-3">Deduction (PKR)</th>
                    <th className="py-2.5 px-3">Year</th>
                    <th className="py-2.5 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {salarySetups.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No salary setups configured yet.{' '}
                        <button
                          type="button"
                          onClick={startCreateSetup}
                          className="text-sky-600 font-semibold hover:underline cursor-pointer"
                        >
                          + Create New Setup
                        </button>
                      </td>
                    </tr>
                  ) : (
                    salarySetups.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3 text-slate-600">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{s.employeeName}</div>
                          <div className="text-[11px] text-slate-500">{s.employeeRole}</div>
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">{fmtPkr(s.baseSalary)}</td>
                        <td className="py-3 px-3 text-slate-700">{fmtPkr(s.bonus)}</td>
                        <td className="py-3 px-3 text-slate-700">{fmtPkr(s.deduction)}</td>
                        <td className="py-3 px-3 text-slate-600">{s.year}</td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditSetup(s)}
                              className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                persistSalarySetups(salarySetups.filter((x) => x.id !== s.id))
                                toast.success(`Deleted salary setup for ${s.employeeName}.`)
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200 cursor-pointer"
                              title="Delete setup"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <form onSubmit={handleSaveSetup} className="p-6 max-w-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={setupForm.staffId}
                    onChange={(e) => setSetupForm((p) => ({ ...p, staffId: e.target.value }))}
                    required
                    disabled={Boolean(editingSetupId)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white disabled:bg-slate-50"
                  >
                    <option value="">Select Employee...</option>
                    {campusStaff.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Academic / Fiscal Year
                  </label>
                  <select
                    value={setupForm.year}
                    onChange={(e) => setSetupForm((p) => ({ ...p, year: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    {FISCAL_YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Base Salary (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={setupForm.baseSalary}
                    onChange={(e) => setSetupForm((p) => ({ ...p, baseSalary: e.target.value }))}
                    placeholder="e.g., 25000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bonus (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={setupForm.bonus}
                    onChange={(e) => setSetupForm((p) => ({ ...p, bonus: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deduction (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={setupForm.deduction}
                    onChange={(e) => setSetupForm((p) => ({ ...p, deduction: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={setupForm.notes}
                  onChange={(e) => setSetupForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional salary structure notes"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  {editingSetupId ? 'Update Setup' : 'Save Setup'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSetupId(null)
                    setSetupTab('all')
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    )
  }

  // ==========================
  // RENDER: PAYROLL (Pick 3)
  // ==========================
  if (mode === 'payroll') {
    const netPreview = Math.max(
      0,
      Number(payForm.basic || 0) +
        Number(payForm.bonus || 0) -
        Number(payForm.deduction || 0) -
        Number(payForm.fine || 0)
    )

    return (
      <div className="space-y-4">
        <QuickHeader
          title="Payroll"
          onBack={() => onRouteChange?.('inst-teachers')}
          onRouteChange={onRouteChange}
          onOpenQuickPayment={onOpenQuickPayment}
          onOpenSendSms={onOpenSendSms}
        />

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Total Net Pay</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {fmtNumPkr(payrollStats.totalNet)}
              </p>
              <p className="text-[10px] text-slate-400">{payrollStats.count} payslips in list</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">
                {formatMonthLabel(previousMonthKey)}
              </p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {fmtNumPkr(payrollStats.prevMonthTotal)}
              </p>
              <p className="text-[10px] text-slate-400">
                {payrollStats.prevMonthCount} payslips last month
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Paid Salaries</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {fmtNumPkr(payrollStats.paidTotal)}
              </p>
              <p className="text-[10px] text-slate-400">{payrollStats.paidCount} payslips paid</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0">
              <Hourglass className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Pending Salaries</p>
              <p className="text-lg font-extrabold text-slate-900 mt-0.5">
                {fmtNumPkr(payrollStats.pendingTotal)}
              </p>
              <p className="text-[10px] text-slate-400">
                {payrollStats.pendingCount} payslips pending
              </p>
            </div>
          </div>
        </div>

        {/* Main Payroll Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
          <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span>Payroll</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPayrollTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  payrollTab === 'all'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>All Salaries</span>
              </button>
              <button
                type="button"
                onClick={() => setPayrollTab('pay')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  payrollTab === 'pay'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Pay New Salary</span>
              </button>
              <button
                type="button"
                onClick={() => onRouteChange?.('inst-salary-setup')}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Salary Setup</span>
              </button>

              <div className="relative" ref={payrollExportRef}>
                <button
                  type="button"
                  onClick={() => setPayrollExportOpen((o) => !o)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {payrollExportOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white border border-slate-200 shadow-xl py-1.5 z-30 text-xs">
                    <button
                      type="button"
                      onClick={handleExportPayrollPdf}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Export as PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPayrollCsv(true)}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export as Excel</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportPayrollCsv(false)}
                      className="w-full px-3.5 py-2 text-left hover:bg-slate-50 font-medium text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Table className="w-3.5 h-3.5 text-sky-600" />
                      <span>Export as CSV</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {payrollTab === 'all' ? (
            <div className="p-5 space-y-4">
              {/* Filter Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    STAFF
                  </label>
                  <select
                    value={payrollFilters.staffId}
                    onChange={(e) =>
                      setPayrollFilters((p) => ({ ...p, staffId: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All Staff</option>
                    {campusStaff.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    SALARY MONTH
                  </label>
                  <input
                    type="month"
                    value={payrollFilters.salaryMonth}
                    onChange={(e) =>
                      setPayrollFilters((p) => ({ ...p, salaryMonth: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    CREATED DATE
                  </label>
                  <input
                    type="date"
                    value={payrollFilters.createdDate}
                    onChange={(e) =>
                      setPayrollFilters((p) => ({ ...p, createdDate: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  />
                </div>

                <div className="lg:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                    STATUS
                  </label>
                  <select
                    value={payrollFilters.status}
                    onChange={(e) =>
                      setPayrollFilters((p) => ({ ...p, status: e.target.value }))
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div className="lg:col-span-2 flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setAppliedPayrollFilters({ ...payrollFilters })}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Filter className="w-3 h-3" />
                    <span>Apply</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const empty = { staffId: 'all', salaryMonth: '', createdDate: '', status: 'all' }
                      setPayrollFilters(empty)
                      setAppliedPayrollFilters(empty)
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Payslips Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-y border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
                      <th className="py-2.5 px-3 w-14">S/N</th>
                      <th className="py-2.5 px-3">Employee Name</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Basic</th>
                      <th className="py-2.5 px-3 text-right">Bonus</th>
                      <th className="py-2.5 px-3 text-right">Deduction</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                      <th className="py-2.5 px-3">Month / Status</th>
                      <th className="py-2.5 px-3">Created</th>
                      <th className="py-2.5 px-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredPayslips.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-10 text-center text-slate-400">
                          No salary payments found.{' '}
                          <button
                            type="button"
                            onClick={() => setPayrollTab('pay')}
                            className="text-sky-600 font-semibold hover:underline cursor-pointer"
                          >
                            + Pay New Salary
                          </button>
                        </td>
                      </tr>
                    ) : (
                      filteredPayslips.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900">{p.employeeName}</div>
                            <div className="text-[11px] text-slate-500">{p.employeeRole}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded bg-sky-500 text-white text-[10px] font-semibold">
                              {p.type || 'Salary'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-800">
                            {fmtNumPkr(p.basic)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600">
                            {fmtNumPkr(p.bonus)}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="text-slate-700">{fmtNumPkr(p.deduction)}</div>
                            {Number(p.fine || 0) > 0 && (
                              <div className="text-[10px] text-rose-600 font-medium">
                                Fine: {Number(p.fine).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-sky-600">
                            {fmtNumPkr(p.total)}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex flex-col items-start gap-1">
                              <span className="px-2 py-0.5 rounded bg-orange-500 text-white text-[10px] font-semibold">
                                {formatMonthLabel(p.salaryMonth)}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  p.status === 'Paid'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-slate-800 font-medium">
                              {formatCreatedDateTime(p.createdAt)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Issued by {p.issuedBy || 'Admin'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div
                              className="relative inline-block"
                              ref={payrollActionId === p.id ? payrollMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setPayrollActionId((prev) => (prev === p.id ? null : p.id))
                                }
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {payrollActionId === p.id && (
                                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPayrollActionId(null)
                                      setViewingPayslip(p)
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-sky-600" />
                                    <span>View Payslip</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePayslipStatus(p)}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                      {p.status === 'Paid' ? 'Mark Pending' : 'Mark Paid'}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePayslip(p)}
                                    className="w-full px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Pay New Salary Form */
            <form onSubmit={handleCreatePayslip} className="p-6 max-w-2xl space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Staff Member <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={payForm.staffId}
                    onChange={(e) => handleSelectPayStaff(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="">Select Staff Member...</option>
                    {campusStaff.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.primaryRole})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Salary Month <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={payForm.salaryMonth}
                    onChange={(e) => setPayForm((p) => ({ ...p, salaryMonth: e.target.value }))}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Type</label>
                  <select
                    value={payForm.type}
                    onChange={(e) => setPayForm((p) => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    {PAY_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Basic Salary (PKR) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.basic}
                    onChange={(e) => setPayForm((p) => ({ ...p, basic: e.target.value }))}
                    placeholder="e.g., 25000"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bonus (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.bonus}
                    onChange={(e) => setPayForm((p) => ({ ...p, bonus: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Deduction (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.deduction}
                    onChange={(e) => setPayForm((p) => ({ ...p, deduction: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Fine (PKR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={payForm.fine}
                    onChange={(e) => setPayForm((p) => ({ ...p, fine: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={payForm.status}
                    onChange={(e) => setPayForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Method
                  </label>
                  <select
                    value={payForm.paymentMethod}
                    onChange={(e) => setPayForm((p) => ({ ...p, paymentMethod: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="w-full px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 text-xs">
                    <span className="text-slate-600 font-medium">Net Pay: </span>
                    <span className="font-extrabold text-sky-700">{fmtNumPkr(netPreview)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Notes</label>
                <input
                  type="text"
                  value={payForm.notes}
                  onChange={(e) => setPayForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional payment reference or remarks"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  Save & Issue Payslip
                </button>
                <button
                  type="button"
                  onClick={() => setPayrollTab('all')}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Payslip Detail Modal */}
        {viewingPayslip && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Salary Payslip</h3>
                  <p className="text-[11px] text-slate-500">
                    {formatMonthLabel(viewingPayslip.salaryMonth)} • {viewingPayslip.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingPayslip(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee</span>
                  <span className="font-semibold text-slate-900">
                    {viewingPayslip.employeeName} ({viewingPayslip.employeeRole})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Basic Salary</span>
                  <span className="font-semibold">{fmtNumPkr(viewingPayslip.basic)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bonus</span>
                  <span className="font-semibold text-emerald-600">
                    +{fmtNumPkr(viewingPayslip.bonus)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deduction & Fine</span>
                  <span className="font-semibold text-rose-600">
                    -{fmtNumPkr(Number(viewingPayslip.deduction || 0) + Number(viewingPayslip.fine || 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-900">Net Payable</span>
                  <span className="font-extrabold text-sky-600">{fmtNumPkr(viewingPayslip.total)}</span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    downloadSimplePdf({
                      title: `${currentInstitute?.name || 'Institute'} — Payslip (${viewingPayslip.employeeName})`,
                      subtitle: `${formatMonthLabel(viewingPayslip.salaryMonth)} | Status: ${viewingPayslip.status}`,
                      columns: ['Item', 'Amount'],
                      rows: [
                        ['Basic Salary', fmtNumPkr(viewingPayslip.basic)],
                        ['Bonus', fmtNumPkr(viewingPayslip.bonus)],
                        ['Deduction', fmtNumPkr(viewingPayslip.deduction)],
                        ['Fine', fmtNumPkr(viewingPayslip.fine || 0)],
                        ['Net Total', fmtNumPkr(viewingPayslip.total)]
                      ],
                      filename: `payslip-${viewingPayslip.id}.pdf`
                    })
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPayslip(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ==========================
  // RENDER: ALL STAFF (Picks 1-2)
  // ==========================
  return (
    <div className="space-y-4">
      <QuickHeader
        title="All Staff"
        onBack={() => onRouteChange?.('inst-dashboard')}
        onRouteChange={onRouteChange}
        onOpenQuickPayment={onOpenQuickPayment}
        onOpenSendSms={onOpenSendSms}
      />

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Staff</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{staffStats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Teachers</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {staffStats.teachersCount}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-cyan-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Other Staff</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{staffStats.otherCount}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">With Contact</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{staffStats.withContact}</p>
          </div>
        </div>
      </div>

      {/* Main All Staff Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-visible">
        <div className="flex items-center gap-2 px-5 pt-2 border-b border-slate-200 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setStaffTab('all')}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
              staffTab === 'all'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>All Staff</span>
          </button>
          <button
            type="button"
            onClick={startCreateStaff}
            className={`px-3.5 py-2 text-xs font-semibold inline-flex items-center gap-1.5 border-b-2 -mb-px cursor-pointer ${
              staffTab === 'create'
                ? 'border-sky-600 text-slate-900 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{editingStaffId ? 'Edit Staff' : 'Create New Staff'}</span>
          </button>
        </div>

        {staffTab === 'all' ? (
          <div className="p-5 space-y-4">
            {/* Search & Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70">
              <div className="lg:col-span-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  SEARCH
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={staffSearch}
                    onChange={(e) => setStaffSearch(e.target.value)}
                    placeholder="Name, email, phone..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  ROLE
                </label>
                <select
                  value={staffRoleFilter}
                  onChange={(e) => setStaffRoleFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="all">All types</option>
                  {STAFF_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  STATUS
                </label>
                <select
                  value={staffStatusFilter}
                  onChange={(e) => setStaffStatusFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="all">All statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  EMPLOYMENT
                </label>
                <select
                  value={staffEmpFilter}
                  onChange={(e) => setStaffEmpFilter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-700"
                >
                  <option value="all">All types</option>
                  {EMPLOYMENT_TYPES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                Showing <strong className="mx-1">{filteredStaff.length}</strong> of{' '}
                <strong className="ml-1">{campusStaff.length}</strong> employees
              </span>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-y border-slate-200 bg-slate-50/60 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    <th className="py-2.5 px-3 w-12">#</th>
                    <th className="py-2.5 px-3">EMPLOYEE</th>
                    <th className="py-2.5 px-3">ROLE</th>
                    <th className="py-2.5 px-3">STATUS</th>
                    <th className="py-2.5 px-3">CONTACT</th>
                    <th className="py-2.5 px-3 text-center">LOGIN SMS / EMAIL</th>
                    <th className="py-2.5 px-3 text-center">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No staff members match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-3 text-slate-500 font-medium">{idx + 1}</td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {s.name
                                .split(' ')
                                .map((w) => w[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{s.name}</div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded border text-[10px] font-semibold ${employmentBadgeClass(
                                    s.employmentType
                                  )}`}
                                >
                                  {s.employmentType}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {s.staffCode}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex flex-col items-start gap-1">
                            {s.roles.map((r) => (
                              <span
                                key={r}
                                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${roleBadgeClass(
                                  r
                                )}`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              s.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {s.phone || s.email ? (
                            <div className="space-y-0.5 text-[11px] text-slate-600">
                              {s.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{s.phone}</span>
                                </div>
                              )}
                              {s.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{s.email}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="italic text-slate-400 text-[11px]">
                              No contact on file
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="max-w-[230px] mx-auto space-y-1">
                            <div className="grid grid-cols-2 gap-1">
                              <button
                                type="button"
                                onClick={() => handleSendCommAction(s, 'welcome')}
                                className="px-2 py-1 rounded border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[10px] font-semibold cursor-pointer"
                              >
                                Welcome SMS
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendCommAction(s, 'login_sms')}
                                className="px-2 py-1 rounded border border-sky-300 text-sky-700 hover:bg-sky-50 text-[10px] font-semibold cursor-pointer"
                              >
                                Login SMS
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleSendCommAction(s, 'login_email')}
                              className="w-full px-2 py-1 rounded border border-cyan-300 text-cyan-700 hover:bg-cyan-50 text-[10px] font-semibold cursor-pointer"
                            >
                              Login Email
                            </button>
                            {s.welcomeSmsSentAt && (
                              <div className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px]">
                                <Check className="w-3 h-3 inline mr-1" />
                                Welcome SMS sent {formatSentStamp(s.welcomeSmsSentAt)}
                              </div>
                            )}
                            {s.loginSmsSentAt && (
                              <div className="px-2 py-1 rounded bg-sky-50 text-sky-700 text-[10px]">
                                <Check className="w-3 h-3 inline mr-1" />
                                Login SMS sent {formatSentStamp(s.loginSmsSentAt)}
                              </div>
                            )}
                            {s.loginEmailSentAt && (
                              <div className="px-2 py-1 rounded bg-cyan-50 text-cyan-700 text-[10px]">
                                <Check className="w-3 h-3 inline mr-1" />
                                Login email sent {formatSentStamp(s.loginEmailSentAt)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingStaff(s)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                              title="View profile"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => startEditStaff(s)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer"
                              title="Edit staff"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <div
                              className="relative"
                              ref={staffActionMenuId === s.id ? staffMenuRef : null}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setStaffActionMenuId((prev) => (prev === s.id ? null : s.id))
                                }
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <Menu className="w-3.5 h-3.5" />
                                <ChevronDown className="w-3 h-3" />
                              </button>
                              {staffActionMenuId === s.id && (
                                <div className="absolute right-0 mt-1 w-40 rounded-xl bg-white border border-slate-200 shadow-xl py-1 z-30 text-left text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStaffActionMenuId(null)
                                      onRouteChange?.('inst-salary-setup')
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <Settings className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Salary Setup</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextStatus = s.status === 'Active' ? 'Inactive' : 'Active'
                                      persistHrExtras({
                                        ...hrExtras,
                                        [s.id]: { ...(hrExtras[s.id] || {}), status: nextStatus }
                                      })
                                      setStaffActionMenuId(null)
                                      toast.success(`${s.name} marked ${nextStatus}.`)
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 cursor-pointer"
                                  >
                                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>
                                      {s.status === 'Active' ? 'Deactivate' : 'Activate'}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setStaffActionMenuId(null)
                                      setDeleteStaffTarget(s)
                                    }}
                                    className="w-full px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Create / Edit Staff Form */
          <form onSubmit={handleSaveStaff} className="p-6 max-w-2xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={staffForm.name}
                  onChange={(e) => setStaffForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Asad Ali"
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Code
                </label>
                <input
                  type="text"
                  value={staffForm.staffCode}
                  onChange={(e) => setStaffForm((p) => ({ ...p, staffCode: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Employment Type
                </label>
                <select
                  value={staffForm.employmentType}
                  onChange={(e) =>
                    setStaffForm((p) => ({ ...p, employmentType: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                <select
                  value={staffForm.status}
                  onChange={(e) => setStaffForm((p) => ({ ...p, status: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Phone</label>
                <input
                  type="text"
                  value={staffForm.phone}
                  onChange={(e) => setStaffForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="0300-1234567"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="staff@demo.com"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Basic Salary (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={staffForm.salary}
                  onChange={(e) => setStaffForm((p) => ({ ...p, salary: e.target.value }))}
                  placeholder="25000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Roles</label>
              <div className="flex flex-wrap gap-2">
                {STAFF_ROLES.map((r) => {
                  const selected = staffForm.roles.includes(r)
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() =>
                        setStaffForm((p) => ({
                          ...p,
                          roles: selected
                            ? p.roles.filter((x) => x !== r)
                            : [...p.roles, r]
                        }))
                      }
                      className={`px-3 py-1 rounded-full border text-xs font-semibold cursor-pointer ${
                        selected
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                {editingStaffId ? 'Update Staff' : 'Save Staff'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingStaffId(null)
                  setStaffTab('all')
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* View Staff Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{viewingStaff.name}</h3>
                <p className="text-[11px] text-slate-500">
                  {viewingStaff.staffCode} • {viewingStaff.employmentType}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Roles</span>
                <span className="font-semibold text-slate-900">{viewingStaff.roles.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-semibold text-slate-900">{viewingStaff.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone</span>
                <span className="font-semibold text-slate-900">{viewingStaff.phone || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">{viewingStaff.email || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Base Salary</span>
                <span className="font-semibold text-slate-900">{fmtPkr(viewingStaff.salary)}</span>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const s = viewingStaff
                  setViewingStaff(null)
                  startEditStaff(s)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold cursor-pointer"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setViewingStaff(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Staff Confirmation */}
      {deleteStaffTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-sm w-full p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Remove Staff Member</h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to remove{' '}
              <span className="font-semibold text-slate-900">{deleteStaffTarget.name}</span> from
              the staff directory?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteStaffTarget(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStaff}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffAndPayrollViews
