import React, { useState, useMemo, useEffect } from 'react'
import { 
  Users, 
  ShieldCheck, 
  ArrowLeftRight, 
  CreditCard, 
  TrendingUp, 
  Search, 
  Building2, 
  Award, 
  CheckCircle2, 
  Clock, 
  Download, 
  Plus, 
  Check, 
  X, 
  Eye,
  EyeOff,
  Printer,
  Edit2,
  Trash2,
  UserCheck,
  AlertCircle,
  Calendar,
  DollarSign,
  Layers,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  GraduationCap
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import Modal from '../../../components/common/Modal'
import { StaffIdCardModal } from '../../institute-admin/teachers/StaffIdCardModal'
import { defaultInitialTeachers, DataService } from '../../../services/dataService'
import { hashPassword } from '../../../context/AuthContext'

export const SuperadminStaffFacultyView = ({ activeTab = 'all', onTabChange = () => {} }) => {
  const { teachers = [], institutes = [], users = [], addItem, updateItem, deleteItem } = useAppData()
  const { toast } = useToast()

  const [currentTab, setCurrentTab] = useState(activeTab)
  useEffect(() => {
    if (activeTab && activeTab !== currentTab) {
      setCurrentTab(activeTab)
    }
  }, [activeTab])

  const effectiveTab = currentTab || activeTab || 'all'
  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Formula-neutralized CSV sanitizer (=, +, -, @, \t, \r)
  const sanitizeCSV = (val) => {
    if (val === null || val === undefined) return '""'
    let str = String(val)
    if (/^[=\+\-@\t\r]/.test(str)) {
      str = "'" + str
    }
    return '"' + str.replace(/"/g, '""') + '"'
  }

  // -------------------------------------------------------------
  // 1. UNIFIED TEACHER NORMALIZATION ADAPTER
  // -------------------------------------------------------------
  const normalizedStaff = useMemo(() => {
    const rawList = (teachers && teachers.length > 0) ? teachers : defaultInitialTeachers

    return rawList.map(st => {
      const resolvedCampus = st.campus || (institutes.find(i => i.id === st.instituteId)?.name) || 'Beaconhouse Central High School'
      const resolvedInstId = st.instituteId || (institutes.find(i => i.name === resolvedCampus)?.id) || 'inst-1'
      const empId = st.empId || st.id
      const dept = st.department || 'Academics'
      const role = st.role || (st.isHod ? 'HOD / Senior Lecturer' : st.category === 'Non-Teaching' ? 'Administrative Staff' : 'Faculty Instructor')
      const qual = st.highestQualification || st.qualification || 'M.Phil / Master'
      const salary = st.salary || (st.grossSalary ? `PKR ${Number(st.grossSalary).toLocaleString()}` : 'PKR 125,000')
      const status = st.status || 'Active'
      const cnic = st.cnic || '35201-1122334-1'
      const email = st.email || `${(st.name || 'staff').toLowerCase().replace(/[^a-z]/g, '')}@sms.edu`
      const phone = st.phone || '0300-1234567'

      return {
        ...st,
        cleanCampus: resolvedCampus,
        cleanInstId: resolvedInstId,
        cleanEmpId: empId,
        cleanDept: dept,
        cleanRole: role,
        cleanQual: qual,
        cleanSalary: salary,
        cleanStatus: status,
        cleanCnic: cnic,
        cleanEmail: email,
        cleanPhone: phone
      }
    })
  }, [teachers, institutes])

  // -------------------------------------------------------------
  // TAB 1: FILTERS, SENSITIVITY TOGGLE & PAGINATION
  // -------------------------------------------------------------
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCampus, setSelectedCampus] = useState('ALL')
  const [selectedDept, setSelectedDept] = useState('ALL')
  const [selectedStatus, setSelectedStatus] = useState('ALL')
  const [showMaskedCNIC, setShowMaskedCNIC] = useState(true)
  const [sortField, setSortField] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Inspection & Printable Modals State
  const [inspectingStaff, setInspectingStaff] = useState(null)
  const [staffForIdCard, setStaffForIdCard] = useState(null)
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false)

  // Onboard Staff Form State
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    fatherHusbandName: '',
    gender: 'Male',
    cnic: '',
    phone: '',
    email: '',
    instituteId: 'inst-1',
    campus: 'Beaconhouse Central High School',
    department: 'Mathematics',
    designation: 'Senior Faculty Instructor',
    category: 'Teaching',
    qualification: 'M.Phil / Master',
    grossSalary: 125000,
    employmentType: 'Permanent',
    status: 'Active'
  })

  // Available unique departments for filter
  const departmentsList = useMemo(() => {
    const set = new Set()
    normalizedStaff.forEach(s => {
      if (s.cleanDept) set.add(s.cleanDept)
    })
    return Array.from(set).sort()
  }, [normalizedStaff])

  // Filtered & Sorted Staff
  const filteredStaff = useMemo(() => {
    let result = normalizedStaff.filter(s => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || 
        (s.name || '').toLowerCase().includes(q) || 
        (s.cleanEmpId || '').toLowerCase().includes(q) || 
        (s.designation || '').toLowerCase().includes(q) || 
        (s.cleanDept || '').toLowerCase().includes(q) ||
        (s.cleanCampus || '').toLowerCase().includes(q) ||
        (s.cleanEmail || '').toLowerCase().includes(q)

      const matchesCampus = selectedCampus === 'ALL' || s.cleanInstId === selectedCampus || s.cleanCampus === selectedCampus
      const matchesDept = selectedDept === 'ALL' || s.cleanDept === selectedDept
      const matchesStatus = selectedStatus === 'ALL' || s.cleanStatus === selectedStatus

      return matchesSearch && matchesCampus && matchesDept && matchesStatus
    })

    result.sort((a, b) => {
      let valA = a[sortField] || a[`clean${sortField.charAt(0).toUpperCase() + sortField.slice(1)}`] || ''
      let valB = b[sortField] || b[`clean${sortField.charAt(0).toUpperCase() + sortField.slice(1)}`] || ''
      if (typeof valA === 'string') valA = valA.toLowerCase()
      if (typeof valB === 'string') valB = valB.toLowerCase()

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [normalizedStaff, searchQuery, selectedCampus, selectedDept, selectedStatus, sortField, sortDirection])

  const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredStaff.slice(start, start + pageSize)
  }, [filteredStaff, currentPage, pageSize])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Export CSV
  const handleExportStaffCSV = () => {
    try {
      const headers = ['Employee ID', 'Name', 'Designation', 'Department', 'Role', 'Campus', 'National ID (CNIC)', 'Contact Phone', 'Email', 'Qualification', 'Gross Salary', 'Status']
      const rows = filteredStaff.map(s => [
        sanitizeCSV(s.cleanEmpId),
        sanitizeCSV(s.name),
        sanitizeCSV(s.designation),
        sanitizeCSV(s.cleanDept),
        sanitizeCSV(s.cleanRole),
        sanitizeCSV(s.cleanCampus),
        sanitizeCSV(showMaskedCNIC ? s.cleanCnic.replace(/^(\d{5})-?(\d{7})-?(\d)$/, '$1-*******-$3') : s.cleanCnic),
        sanitizeCSV(s.cleanPhone),
        sanitizeCSV(s.cleanEmail),
        sanitizeCSV(s.cleanQual),
        sanitizeCSV(s.cleanSalary),
        sanitizeCSV(s.cleanStatus)
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Platform_Faculty_Roster_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.(`Exported ${filteredStaff.length} faculty and staff records with formula sanitization.`)
    } catch {
      toast?.error?.('Failed to export staff CSV.')
    }
  }

  // Handle Onboard New Faculty Member
  const handleOnboardSubmit = async (e) => {
    e.preventDefault()
    if (!onboardForm.name.trim() || !onboardForm.cnic.trim()) {
      toast?.error?.('Please enter faculty full name and valid CNIC.')
      return
    }

    try {
      const matchingInst = institutes.find(i => i.id === onboardForm.instituteId)
      const campusName = matchingInst?.name || onboardForm.campus || 'Beaconhouse Central High School'
      const autoNum = normalizedStaff.length + 1
      const newEmpId = `STF-${String(autoNum).padStart(3, '0')}`

      const payload = {
        empId: newEmpId,
        name: onboardForm.name.trim(),
        fatherHusbandName: onboardForm.fatherHusbandName.trim(),
        gender: onboardForm.gender,
        cnic: onboardForm.cnic.trim(),
        phone: onboardForm.phone.trim(),
        email: onboardForm.email.trim() || `${newEmpId.toLowerCase()}@sms.edu`,
        instituteId: onboardForm.instituteId,
        campus: campusName,
        department: onboardForm.department,
        designation: onboardForm.designation,
        role: onboardForm.category === 'Teaching' ? 'Faculty Instructor' : 'Administrative Staff',
        category: onboardForm.category,
        qualification: onboardForm.qualification,
        highestQualification: onboardForm.qualification,
        grossSalary: Number(onboardForm.grossSalary) || 120000,
        netSalary: Math.round((Number(onboardForm.grossSalary) || 120000) * 0.92),
        salary: `PKR ${(Number(onboardForm.grossSalary) || 120000).toLocaleString()}`,
        employmentType: onboardForm.employmentType,
        status: onboardForm.status,
        joiningDate: new Date().toISOString().split('T')[0]
      }

      await addItem('teachers', payload)

      // Auto-provision teacher portal user account
      const username = newEmpId.toLowerCase().replace(/[^a-z0-9]/g, '')
      const userEmail = payload.email
      const existingUser = users.find(u => u.email === userEmail || u.username === username)
      if (!existingUser) {
        await addItem('users', {
          name: payload.name,
          username: username,
          email: userEmail,
          role: 'teacher',
          instituteId: payload.instituteId,
          campus: campusName,
          status: 'Active',
          designation: payload.designation,
          department: payload.department,
          password: hashPassword('Teacher@123'),
          requiresPasswordChange: true
        })
      }

      toast?.success?.(`Faculty member "${payload.name}" (${payload.empId}) onboarded successfully!`)
      setIsOnboardModalOpen(false)
      setOnboardForm({
        name: '',
        fatherHusbandName: '',
        gender: 'Male',
        cnic: '',
        phone: '',
        email: '',
        instituteId: 'inst-1',
        campus: 'Beaconhouse Central High School',
        department: 'Mathematics',
        designation: 'Senior Faculty Instructor',
        category: 'Teaching',
        qualification: 'M.Phil / Master',
        grossSalary: 125000,
        employmentType: 'Permanent',
        status: 'Active'
      })
    } catch (err) {
      console.error(err)
      toast?.error?.('Failed to onboard faculty member.')
    }
  }

  // -------------------------------------------------------------
  // TAB 2: STAFF ROLE ASSIGNMENTS (PERSISTED MATRIX)
  // -------------------------------------------------------------
  const [roleAssignments, setRoleAssignments] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_staff_roles')
      if (stored) return JSON.parse(stored)
    } catch {}
    return [
      { id: 'ROLE-01', staffId: 'tch-1', staffName: 'Prof. Tariq Jamil', empId: 'STF-001', campus: 'Beaconhouse Central High School', roleType: 'Head of Department (HOD)', department: 'Mathematics', tenure: '2024 - 2027', privilegeLevel: 'Academic Council Board', status: 'Active' },
      { id: 'ROLE-02', staffId: 'tch-2', staffName: 'Dr. Nadia Hashmi', empId: 'STF-002', campus: 'City School Model Town Campus', roleType: 'Faculty Specialist & Research Lead', department: 'Chemistry', tenure: '2025 - 2028', privilegeLevel: 'Senior Research Fellow', status: 'Active' },
      { id: 'ROLE-03', staffId: 'tch-3', staffName: 'Syed Ali Raza', empId: 'STF-003', campus: 'Beaconhouse Central High School', roleType: 'Section Coordinator', department: 'Physics', tenure: '2025 - 2026', privilegeLevel: 'Middle & Senior Wing', status: 'Active' },
      { id: 'ROLE-04', staffId: 'tch-5', staffName: 'Muhammad Waqas', empId: 'STF-005', campus: 'Beaconhouse Central High School', roleType: 'Campus Bursar & Finance Officer', department: 'Accounts & Finance', tenure: 'Permanent Appointment', privilegeLevel: 'Treasury & Challans', status: 'Active' },
      { id: 'ROLE-05', staffId: 'tch-4', staffName: 'Amina Batool', empId: 'STF-004', campus: 'Roots International College & Academy', roleType: 'Examination Controller', department: 'English Literature', tenure: '2025 - 2026', privilegeLevel: 'Assessment Committee', status: 'Active' },
      { id: 'ROLE-06', staffId: 'tch-6', staffName: 'Engr. Bilal Zubair', empId: 'STF-006', campus: 'Institute of Applied Sciences & Undergraduates', roleType: 'Curriculum & AI Lab Lead', department: 'Computer Science & AI', tenure: '2024 - 2027', privilegeLevel: 'Computing Syndicate', status: 'Active' }
    ]
  })

  const saveRolesToStorage = (roles) => {
    setRoleAssignments(roles)
    try { localStorage.setItem('sms_staff_roles', JSON.stringify(roles)) } catch {}
  }

  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false)
  const [roleFormData, setRoleFormData] = useState({
    staffId: '',
    roleType: 'Head of Department (HOD)',
    department: 'Mathematics',
    tenure: '2026 - 2028',
    privilegeLevel: 'Academic Council'
  })

  // Metrics for roles
  const roleMetrics = useMemo(() => {
    const hodCount = roleAssignments.filter(r => r.roleType.includes('HOD') || r.roleType.includes('Head')).length
    const coordCount = roleAssignments.filter(r => r.roleType.includes('Coordinator')).length
    const bursarCount = roleAssignments.filter(r => r.roleType.includes('Bursar') || r.roleType.includes('Finance')).length
    const examCount = roleAssignments.filter(r => r.roleType.includes('Exam') || r.roleType.includes('Assessment') || r.roleType.includes('Curriculum')).length
    return { hodCount, coordCount, bursarCount, examCount }
  }, [roleAssignments])

  const handleAssignRoleSubmit = (e) => {
    e.preventDefault()
    const selected = normalizedStaff.find(s => s.id === roleFormData.staffId || s.cleanEmpId === roleFormData.staffId)
    if (!selected) {
      toast?.error?.('Please select a valid faculty member.')
      return
    }

    const newAssignment = {
      id: `ROLE-${Date.now().toString().slice(-4)}`,
      staffId: selected.id,
      staffName: selected.name,
      empId: selected.cleanEmpId,
      campus: selected.cleanCampus,
      roleType: roleFormData.roleType,
      department: roleFormData.department,
      tenure: roleFormData.tenure,
      privilegeLevel: roleFormData.privilegeLevel,
      status: 'Active'
    }

    const updated = [newAssignment, ...roleAssignments]
    saveRolesToStorage(updated)
    toast?.success?.(`Assigned leadership role "${roleFormData.roleType}" to ${selected.name}!`)
    setIsAssignRoleModalOpen(false)
  }

  const handleRevokeRole = (roleId, staffName) => {
    const updated = roleAssignments.filter(r => r.id !== roleId)
    saveRolesToStorage(updated)
    toast?.success?.(`Revoked leadership assignment for ${staffName}.`)
  }

  // -------------------------------------------------------------
  // TAB 3: INTER-CAMPUS STAFF TRANSFERS (PERSISTED & MUTATING)
  // -------------------------------------------------------------
  const [staffTransfers, setStaffTransfers] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_staff_transfers')
      if (stored) return JSON.parse(stored)
    } catch {}
    return [
      { id: 'STR-201', staffId: 'tch-3', staffName: 'Syed Ali Raza', empId: 'STF-003', fromCampus: 'Beaconhouse Central High School', fromInstId: 'inst-1', toCampus: 'City School Model Town Campus', toInstId: 'inst-2', reason: 'Promoted to Campus Academic Coordinator', status: 'Pending Superadmin Approval', date: '2026-10-24' },
      { id: 'STR-202', staffId: 'tch-4', staffName: 'Amina Batool', empId: 'STF-004', fromCampus: 'Roots International College & Academy', fromInstId: 'inst-3', toCampus: 'Beaconhouse Central High School', toInstId: 'inst-1', reason: 'Mutual Faculty Exchange Request', status: 'Authorized', date: '2026-10-15' }
    ]
  })

  const saveTransfersToStorage = (transfers) => {
    setStaffTransfers(transfers)
    try { localStorage.setItem('sms_staff_transfers', JSON.stringify(transfers)) } catch {}
  }

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferFormData, setTransferFormData] = useState({
    staffId: '',
    toCampus: '',
    reason: 'Promoted to Senior Academic Lead',
    date: new Date().toISOString().split('T')[0]
  })

  const openNewTransferModal = (preselectedStaff = null) => {
    const staff = preselectedStaff || normalizedStaff[0]
    const currentCampus = staff?.cleanCampus || institutes[0]?.name || 'Beaconhouse Central High School'
    const altCampus = institutes.find(i => i.name !== currentCampus)?.name || 'City School Model Town Campus'

    setTransferFormData({
      staffId: staff?.id || '',
      toCampus: altCampus,
      reason: 'Promoted to Senior Academic Lead',
      date: new Date().toISOString().split('T')[0]
    })
    setIsTransferModalOpen(true)
  }

  const handleInitiateTransferSubmit = (e) => {
    e.preventDefault()
    const staff = normalizedStaff.find(s => s.id === transferFormData.staffId || s.cleanEmpId === transferFormData.staffId)
    if (!staff) {
      toast?.error?.('Please select a valid staff member to transfer.')
      return
    }

    if (staff.cleanCampus === transferFormData.toCampus) {
      toast?.error?.('Destination campus must be different from current campus.')
      return
    }

    const targetInst = institutes.find(i => i.name === transferFormData.toCampus)
    const newTransfer = {
      id: `STR-${Math.floor(200 + Math.random() * 800)}`,
      staffId: staff.id,
      staffName: staff.name,
      empId: staff.cleanEmpId,
      fromCampus: staff.cleanCampus,
      fromInstId: staff.cleanInstId,
      toCampus: transferFormData.toCampus,
      toInstId: targetInst?.id || 'inst-2',
      reason: transferFormData.reason.trim(),
      status: 'Pending Superadmin Approval',
      date: transferFormData.date
    }

    const updated = [newTransfer, ...staffTransfers]
    saveTransfersToStorage(updated)
    toast?.success?.(`Inter-campus transfer initiated for ${staff.name}.`)
    setIsTransferModalOpen(false)
  }

  const handleApproveStaffTransfer = async (transferId) => {
    const transfer = staffTransfers.find(t => t.id === transferId)
    if (!transfer) return

    try {
      const targetInst = institutes.find(i => i.name === transfer.toCampus || i.id === transfer.toInstId)
      const targetInstId = targetInst?.id || transfer.toInstId || 'inst-2'

      // Mutate real teacher record in database/store
      await updateItem('teachers', transfer.staffId, {
        campus: transfer.toCampus,
        instituteId: targetInstId
      })

      // Log official audit entry
      if (DataService && DataService.logAuditEvent) {
        DataService.logAuditEvent({
          action: `Authorized Staff Transfer: ${transfer.staffName} (${transfer.empId}) transferred from ${transfer.fromCampus} to ${transfer.toCampus}`,
          category: 'Staff & Faculty'
        })
      }

      // Update transfer status
      const updatedTransfers = staffTransfers.map(t => 
        t.id === transferId ? { ...t, status: 'Authorized', authorizedAt: new Date().toISOString() } : t
      )
      saveTransfersToStorage(updatedTransfers)
      toast?.success?.(`Transfer ${transferId} authorized! ${transfer.staffName} re-mapped to ${transfer.toCampus}.`)
    } catch (err) {
      console.error(err)
      toast?.error?.('Failed to process staff transfer.')
    }
  }

  const handleCancelStaffTransfer = (transferId) => {
    const updated = staffTransfers.map(t => t.id === transferId ? { ...t, status: 'Cancelled' } : t)
    saveTransfersToStorage(updated)
    toast?.info?.(`Transfer ${transferId} has been cancelled.`)
  }

  // -------------------------------------------------------------
  // TAB 4: LEAVE & PAYROLL POLICIES (FULL CRUD)
  // -------------------------------------------------------------
  const [payrollPolicies, setPayrollPolicies] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_payroll_policies')
      if (stored) return JSON.parse(stored)
    } catch {}
    return [
      { id: 'POL-01', title: 'Annual Casual Leave Entitlement', rule: '14 Days / Academic Year (Paid)', scope: 'All Campuses', type: 'Leave Entitlement', status: 'Active' },
      { id: 'POL-02', title: 'Medical / Sick Leave with Hospital Certificate', rule: '10 Days Full Pay, 15 Days Half Pay', scope: 'All Staff', type: 'Leave Entitlement', status: 'Active' },
      { id: 'POL-03', title: 'Provident Fund Matching Contribution', rule: '8.33% Basic Salary matched by Platform Institute', scope: 'Permanent Faculty', type: 'Provident & Gratuity', status: 'Active' },
      { id: 'POL-04', title: 'Overtime & Substitute Lecture Honorarium', rule: 'PKR 1,500 per extra substituted lesson period', scope: 'Teaching Faculty', type: 'Allowance & Honorarium', status: 'Active' },
      { id: 'POL-05', title: 'Maternity & Paternity Benefit Directive', rule: '90 Days Paid Maternity as per Provincial Labor Code', scope: 'Permanent Female Staff', type: 'Leave Entitlement', status: 'Active' }
    ]
  })

  const savePoliciesToStorage = (policies) => {
    setPayrollPolicies(policies)
    try { localStorage.setItem('sms_payroll_policies', JSON.stringify(policies)) } catch {}
  }

  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [policyForm, setPolicyForm] = useState({
    title: '',
    rule: '',
    scope: 'All Campuses',
    type: 'Leave Entitlement',
    status: 'Active'
  })

  const openAddPolicyModal = () => {
    setEditingPolicy(null)
    setPolicyForm({
      title: '',
      rule: '',
      scope: 'All Campuses',
      type: 'Leave Entitlement',
      status: 'Active'
    })
    setIsPolicyModalOpen(true)
  }

  const openEditPolicyModal = (policy) => {
    setEditingPolicy(policy)
    setPolicyForm({
      title: policy.title,
      rule: policy.rule,
      scope: policy.scope,
      type: policy.type,
      status: policy.status || 'Active'
    })
    setIsPolicyModalOpen(true)
  }

  const handlePolicyFormSubmit = (e) => {
    e.preventDefault()
    if (!policyForm.title.trim() || !policyForm.rule.trim()) {
      toast?.error?.('Please enter directive title and rule definition.')
      return
    }

    if (editingPolicy) {
      const updated = payrollPolicies.map(p => p.id === editingPolicy.id ? { ...p, ...policyForm } : p)
      savePoliciesToStorage(updated)
      toast?.success?.(`Policy directive "${policyForm.title}" updated.`)
    } else {
      const newPolicy = {
        id: `POL-${String(payrollPolicies.length + 1).padStart(2, '0')}`,
        ...policyForm
      }
      const updated = [newPolicy, ...payrollPolicies]
      savePoliciesToStorage(updated)
      toast?.success?.(`New platform policy directive "${policyForm.title}" enacted!`)
    }
    setIsPolicyModalOpen(false)
  }

  const handleDeletePolicy = (policyId, title) => {
    const updated = payrollPolicies.filter(p => p.id !== policyId)
    savePoliciesToStorage(updated)
    toast?.success?.(`Policy directive "${title}" removed.`)
  }

  // -------------------------------------------------------------
  // TAB 5: EVALUATION & STAFF REPORTS (CAMPUS-WISE MATRIX)
  // -------------------------------------------------------------
  const campusAnalyticsMatrix = useMemo(() => {
    const targetInsts = institutes.length > 0 ? institutes : [
      { id: 'inst-1', name: 'Beaconhouse Central High School' },
      { id: 'inst-2', name: 'City School Model Town Campus' },
      { id: 'inst-3', name: 'Roots International College & Academy' },
      { id: 'inst-4', name: 'Institute of Applied Sciences & Undergraduates' }
    ]

    return targetInsts.map(inst => {
      const campusStaff = normalizedStaff.filter(s => s.cleanInstId === inst.id || s.cleanCampus === inst.name)
      const teachingCount = campusStaff.filter(s => s.category === 'Teaching' || !s.category).length
      const nonTeachingCount = campusStaff.filter(s => s.category === 'Non-Teaching').length
      const activeCount = campusStaff.filter(s => s.cleanStatus === 'Active').length
      const onLeaveCount = campusStaff.filter(s => s.cleanStatus === 'On Leave').length
      const hodsCount = roleAssignments.filter(r => (r.campus === inst.name || r.staffId && campusStaff.some(s => s.id === r.staffId)) && r.roleType.includes('HOD')).length

      const total = campusStaff.length
      const activeRate = total > 0 ? Math.round((activeCount / total) * 100) : 100

      return {
        id: inst.id,
        name: inst.name,
        totalFaculty: total,
        teachingCount,
        nonTeachingCount,
        activeCount,
        onLeaveCount,
        activeRate: `${activeRate}%`,
        hodsCount
      }
    })
  }, [normalizedStaff, institutes, roleAssignments])

  const handleExportPerformanceReport = () => {
    try {
      const headers = ['Campus Institute', 'Total Faculty', 'Teaching Faculty', 'Non-Teaching Staff', 'Active On-Duty', 'On Leave', 'Active Ratio', 'HOD Appointments']
      const rows = campusAnalyticsMatrix.map(c => [
        sanitizeCSV(c.name),
        c.totalFaculty,
        c.teachingCount,
        c.nonTeachingCount,
        c.activeCount,
        c.onLeaveCount,
        sanitizeCSV(c.activeRate),
        c.hodsCount
      ])

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `Multi_Campus_Faculty_Performance_Report_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast?.success?.('Multi-campus faculty performance report exported.')
    } catch {
      toast?.error?.('Failed to export performance report.')
    }
  }

  // Tab Navigation Bar Config
  const tabsConfig = [
    { key: 'all', label: 'All Staff (Cross-Campus)', icon: Users, badge: normalizedStaff.length },
    { key: 'roles', label: 'Staff Role Assignments', icon: ShieldCheck, badge: roleAssignments.length },
    { key: 'transfers', label: 'Inter-Campus Staff Transfers', icon: ArrowLeftRight, badge: staffTransfers.filter(t => t.status.includes('Pending')).length },
    { key: 'payroll', label: 'Leave & Payroll Policies', icon: CreditCard, badge: payrollPolicies.length },
    { key: 'reports', label: 'Evaluation & Staff Reports', icon: TrendingUp }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Central Faculty & Staff Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Staff & Faculty Central Oversight
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Consolidated human resources directory, inter-campus teaching transfers, platform payroll and benefits frameworks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-2xl text-right">
              <span className="text-[11px] text-slate-300 block uppercase font-mono tracking-wider">Total Faculty</span>
              <strong className="text-xl font-bold font-mono text-white">{normalizedStaff.length} Members</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOnboardModalOpen(true)}
              className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Onboard Staff</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabSwitch(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: ALL STAFF CROSS-CAMPUS DIRECTORY */}
      {/* ========================================================= */}
      {effectiveTab === 'all' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex-1 w-full md:w-auto flex items-center gap-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Search staff by Name, ID, Designation, Department, or Campus..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              {/* Campus Filter */}
              <select
                value={selectedCampus}
                onChange={(e) => {
                  setSelectedCampus(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Affiliated Campuses</option>
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.name}</option>
                ))}
              </select>

              {/* Department Filter */}
              <select
                value={selectedDept}
                onChange={(e) => {
                  setSelectedDept(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value)
                  setCurrentPage(1)
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="Active">Active Enrolled</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>

              {/* CNIC Privacy Toggle */}
              <button
                type="button"
                onClick={() => setShowMaskedCNIC(prev => !prev)}
                className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  showMaskedCNIC ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                }`}
                title={showMaskedCNIC ? 'Click to reveal full CNIC numbers' : 'Click to mask CNIC numbers'}
              >
                {showMaskedCNIC ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{showMaskedCNIC ? 'Masked PII' : 'Plain PII'}</span>
              </button>

              {/* Export CSV */}
              <button
                type="button"
                onClick={handleExportStaffCSV}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </div>
          </div>

          {/* Staff Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th onClick={() => handleSort('name')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Staff Member & ID</span>
                        {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('designation')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Designation & Role</span>
                        {sortField === 'designation' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                      </div>
                    </th>
                    <th onClick={() => handleSort('cleanCampus')} className="py-3.5 px-4 cursor-pointer hover:bg-slate-100/70 select-none">
                      <div className="flex items-center gap-1.5">
                        <span>Affiliated Campus</span>
                        {sortField === 'cleanCampus' ? (sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 text-purple-600" /> : <ArrowDown className="w-3 h-3 text-purple-600" />) : <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                      </div>
                    </th>
                    <th className="py-3.5 px-4">Contact & CNIC</th>
                    <th className="py-3.5 px-4">Qualification</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedStaff.length > 0 ? (
                    paginatedStaff.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{st.name}</div>
                          <span className="font-mono text-[10px] text-purple-700 font-bold">{st.cleanEmpId}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-800">{st.designation}</div>
                          <div className="text-[10.5px] text-slate-400 flex items-center gap-1">
                            <span className="font-medium text-purple-700">{st.cleanDept}</span>
                            <span>•</span>
                            <span>{st.cleanRole}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{st.cleanCampus}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                          <div>{st.cleanPhone}</div>
                          <div className="text-[10px] text-slate-400">
                            {showMaskedCNIC ? st.cleanCnic.replace(/^(\d{5})-?(\d{7})-?(\d)$/, '$1-*******-$3') : st.cleanCnic}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-600">
                          <div>{st.cleanQual}</div>
                          <span className="text-[10px] font-mono text-emerald-700 font-bold">{st.cleanSalary}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            st.cleanStatus === 'Active' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : st.cleanStatus === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {st.cleanStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectingStaff(st)}
                              className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg cursor-pointer"
                              title="View Comprehensive 360 Faculty Dossier"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setStaffForIdCard(st)
                                setIsIdCardModalOpen(true)
                              }}
                              className="p-1.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-lg cursor-pointer"
                              title="Print Faculty Photographic ID Card"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => openNewTransferModal(st)}
                              className="p-1.5 text-amber-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg cursor-pointer"
                              title="Initiate Inter-Campus Transfer"
                            >
                              <ArrowLeftRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No faculty or staff members found matching the specified filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Bar */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing <strong>{filteredStaff.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to <strong>{Math.min(currentPage * pageSize, filteredStaff.length)}</strong> of <strong>{filteredStaff.length}</strong> faculty members
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <span className="font-bold text-slate-700 px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STAFF ROLE ASSIGNMENTS (INTERACTIVE MATRIX) */}
      {/* ========================================================= */}
      {effectiveTab === 'roles' && (
        <div className="space-y-4">
          {/* Dynamically computed Role Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="font-bold text-xs text-slate-500 uppercase block">Department Heads (HODs)</span>
              <div className="text-2xl font-black font-mono text-purple-700">{roleMetrics.hodCount} Appointed</div>
              <p className="text-[11px] text-slate-400">Curriculum delivery & teacher evaluations</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="font-bold text-xs text-slate-500 uppercase block">Section Coordinators</span>
              <div className="text-2xl font-black font-mono text-indigo-700">{roleMetrics.coordCount} Assigned</div>
              <p className="text-[11px] text-slate-400">Timetable slots & daily lesson coordination</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="font-bold text-xs text-slate-500 uppercase block">Campus Bursars & Finance</span>
              <div className="text-2xl font-black font-mono text-emerald-700">{roleMetrics.bursarCount} Officers</div>
              <p className="text-[11px] text-slate-400">Fee challan reconciliation & payroll control</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="font-bold text-xs text-slate-500 uppercase block">Exam & Curriculum Incharges</span>
              <div className="text-2xl font-black font-mono text-amber-700">{roleMetrics.examCount} Officers</div>
              <p className="text-[11px] text-slate-400">Exam papers, date-sheets & grading board</p>
            </div>
          </div>

          {/* Action Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Faculty Leadership & Administrative Role Matrix</h3>
              <p className="text-xs text-slate-500">Designate HODs, Coordinators, Bursars, and Syndicate Chairs across platform campuses.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsAssignRoleModalOpen(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Appoint Leadership Role</span>
            </button>
          </div>

          {/* Role Assignments Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[850px]">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Faculty Member & ID</th>
                    <th className="py-3.5 px-4">Current Branch</th>
                    <th className="py-3.5 px-4">Designated Leadership Role</th>
                    <th className="py-3.5 px-4">Department / Scope</th>
                    <th className="py-3.5 px-4">Tenure / Term</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roleAssignments.map(ra => (
                    <tr key={ra.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{ra.staffName}</div>
                        <span className="font-mono text-[10px] text-purple-700 font-bold">{ra.empId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{ra.campus}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-purple-900">{ra.roleType}</div>
                        <span className="text-[10px] text-slate-400">{ra.privilegeLevel}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{ra.department}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{ra.tenure}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {ra.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(ra.id, ra.staffName)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                          title="Revoke Leadership Role"
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: INTER-CAMPUS STAFF TRANSFERS */}
      {/* ========================================================= */}
      {effectiveTab === 'transfers' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Inter-Campus Faculty Relocation & Transfer Queue</h3>
              <p className="text-xs text-slate-500">Superadmin clearance synchronizes faculty records, compensation budgets, and timetable slots to destination campuses.</p>
            </div>
            <button
              type="button"
              onClick={() => openNewTransferModal()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Initiate Staff Transfer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Transfer ID & Faculty</th>
                    <th className="py-3.5 px-4">Current Branch</th>
                    <th className="py-3.5 px-4">Destination Branch</th>
                    <th className="py-3.5 px-4">Justification</th>
                    <th className="py-3.5 px-4">Transfer Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Superadmin Clearance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffTransfers.map(st => (
                    <tr key={st.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{st.staffName}</div>
                        <span className="font-mono text-[10px] text-slate-400">{st.id} &bull; {st.empId}</span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{st.fromCampus}</td>
                      <td className="py-3.5 px-4 font-medium text-purple-700">{st.toCampus}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">{st.reason}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">{st.date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.status === 'Authorized' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : st.status === 'Cancelled'
                            ? 'bg-slate-100 text-slate-500 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {st.status === 'Pending Superadmin Approval' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveStaffTransfer(st.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                            >
                              <Check className="w-3 h-3" />
                              <span>Authorize</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCancelStaffTransfer(st.id)}
                              className="px-2.5 py-1 text-slate-500 hover:bg-slate-100 rounded-lg text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : st.status === 'Authorized' ? (
                          <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Authorized</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LEAVE & PAYROLL POLICIES (FULL CRUD) */}
      {/* ========================================================= */}
      {effectiveTab === 'payroll' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Platform Leave, Benefits & Payroll Directives</h3>
              <p className="text-xs text-slate-500">Statutory leave quotas, overtime lecture honorariums, and provident fund rules enforced across tenant campuses.</p>
            </div>
            <button
              type="button"
              onClick={openAddPolicyModal}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enact New Directive</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {payrollPolicies.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3 relative group">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 text-xs block">{p.title}</span>
                    <span className="font-mono text-[10px] text-purple-700 font-bold">{p.id} &bull; {p.type}</span>
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-bold border border-purple-100">
                    {p.status || 'Active'}
                  </span>
                </div>
                <div className="text-xs text-slate-700">
                  Rule Definition: <strong className="font-mono text-purple-700 block mt-0.5">{p.rule}</strong>
                </div>
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-50">
                  <span>Scope: <strong className="text-slate-700">{p.scope}</strong></span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditPolicyModal(p)}
                      className="p-1 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded cursor-pointer"
                      title="Edit Policy"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePolicy(p.id, p.title)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                      title="Delete Directive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: EVALUATION & STAFF REPORTS */}
      {/* ========================================================= */}
      {effectiveTab === 'reports' && (
        <div className="space-y-4">
          {/* Real Metrics Derived from Live State */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Faculty Retention Index</span>
              <div className="text-2xl font-bold font-mono text-purple-700">
                {normalizedStaff.length > 0 ? Math.round((normalizedStaff.filter(s => s.cleanStatus === 'Active').length / normalizedStaff.length) * 100) : 100}%
              </div>
              <p className="text-[11px] text-slate-400">Ratio of active confirmed faculty across network.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Teaching vs Support Ratio</span>
              <div className="text-2xl font-bold font-mono text-emerald-700">
                {normalizedStaff.filter(s => s.category === 'Teaching' || !s.category).length} : {normalizedStaff.filter(s => s.category === 'Non-Teaching').length}
              </div>
              <p className="text-[11px] text-slate-400">Pedagogical instructional staff vs campus administration.</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase">Multi-Campus Headcount</span>
              <div className="text-2xl font-bold font-mono text-indigo-700">{normalizedStaff.length} Faculty</div>
              <p className="text-[11px] text-slate-400">Dispersed across all affiliated platform institutes.</p>
            </div>
          </div>

          {/* Action Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Campus-Wise Faculty Allocation & Governance Breakdown</h3>
              <p className="text-xs text-slate-500">Live operational capacity, instructional density, and attendance rates per institute.</p>
            </div>
            <button
              type="button"
              onClick={handleExportPerformanceReport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Performance Audit (CSV)</span>
            </button>
          </div>

          {/* Campus Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Campus Institute</th>
                    <th className="py-3.5 px-4">Total Faculty</th>
                    <th className="py-3.5 px-4">Teaching</th>
                    <th className="py-3.5 px-4">Non-Teaching</th>
                    <th className="py-3.5 px-4">Active On-Duty</th>
                    <th className="py-3.5 px-4">On Leave</th>
                    <th className="py-3.5 px-4">Active Ratio</th>
                    <th className="py-3.5 px-4 text-right">HODs Assigned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campusAnalyticsMatrix.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{c.totalFaculty}</td>
                      <td className="py-3.5 px-4 font-mono text-purple-700">{c.teachingCount}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{c.nonTeachingCount}</td>
                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{c.activeCount}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-700">{c.onLeaveCount}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          {c.activeRate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                        {c.hodsCount} HODs
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 360 STAFF DOSSIER INSPECTION MODAL */}
      {/* ========================================================= */}
      {inspectingStaff && (
        <Modal
          isOpen={true}
          onClose={() => setInspectingStaff(null)}
          title={`Comprehensive Faculty Dossier: ${inspectingStaff.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectingStaff.name}</h4>
                <p className="text-purple-700 font-mono text-xs font-bold mt-0.5">
                  {inspectingStaff.designation} &bull; {inspectingStaff.cleanEmpId}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{inspectingStaff.cleanCampus}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                inspectingStaff.cleanStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {inspectingStaff.cleanStatus}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">National CNIC / ID</span>
                <span className="font-mono font-semibold text-slate-900 text-xs">
                  {showMaskedCNIC ? inspectingStaff.cleanCnic.replace(/^(\d{5})-?(\d{7})-?(\d)$/, '$1-*******-$3') : inspectingStaff.cleanCnic}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Official Contact</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.cleanPhone}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Department & Role</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.cleanDept} &bull; {inspectingStaff.cleanRole}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Highest Qualification</span>
                <span className="font-semibold text-slate-900 text-xs">{inspectingStaff.cleanQual}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Salary Grade</span>
                <span className="font-mono font-bold text-emerald-700 text-xs">{inspectingStaff.cleanSalary}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Official Email</span>
                <span className="font-semibold text-slate-900 text-xs truncate block">{inspectingStaff.cleanEmail}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setStaffForIdCard(inspectingStaff)
                  setIsIdCardModalOpen(true)
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official ID Card</span>
              </button>
              <button
                type="button"
                onClick={() => setInspectingStaff(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* ONBOARD NEW FACULTY MODAL */}
      {/* ========================================================= */}
      {isOnboardModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsOnboardModalOpen(false)}
          title="Onboard Faculty / Staff Member"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleOnboardSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Haris Mahmood"
                  value={onboardForm.name}
                  onChange={(e) => setOnboardForm({ ...onboardForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Father / Husband Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mahmood Akhtar"
                  value={onboardForm.fatherHusbandName}
                  onChange={(e) => setOnboardForm({ ...onboardForm, fatherHusbandName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">National CNIC *</label>
                <input
                  type="text"
                  required
                  placeholder="35201-1234567-1"
                  value={onboardForm.cnic}
                  onChange={(e) => setOnboardForm({ ...onboardForm, cnic: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  placeholder="0300-1234567"
                  value={onboardForm.phone}
                  onChange={(e) => setOnboardForm({ ...onboardForm, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus Institute *</label>
                <select
                  value={onboardForm.instituteId}
                  onChange={(e) => {
                    const inst = institutes.find(i => i.id === e.target.value)
                    setOnboardForm({ ...onboardForm, instituteId: e.target.value, campus: inst?.name || '' })
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  {institutes.map(inst => (
                    <option key={inst.id} value={inst.id}>{inst.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science"
                  value={onboardForm.department}
                  onChange={(e) => setOnboardForm({ ...onboardForm, department: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  placeholder="e.g. Associate Professor"
                  value={onboardForm.designation}
                  onChange={(e) => setOnboardForm({ ...onboardForm, designation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. / MS"
                  value={onboardForm.qualification}
                  onChange={(e) => setOnboardForm({ ...onboardForm, qualification: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Gross Salary (PKR)</label>
                <input
                  type="number"
                  placeholder="125000"
                  value={onboardForm.grossSalary}
                  onChange={(e) => setOnboardForm({ ...onboardForm, grossSalary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category & Type</label>
                <select
                  value={onboardForm.category}
                  onChange={(e) => setOnboardForm({ ...onboardForm, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Teaching">Teaching Faculty</option>
                  <option value="Non-Teaching">Non-Teaching Administrative</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsOnboardModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Onboard Faculty
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* APPOINT LEADERSHIP ROLE MODAL */}
      {/* ========================================================= */}
      {isAssignRoleModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAssignRoleModalOpen(false)}
          title="Appoint Leadership / Administrative Role"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleAssignRoleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Faculty Member *</label>
              <select
                required
                value={roleFormData.staffId}
                onChange={(e) => setRoleFormData({ ...roleFormData, staffId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="">-- Choose Faculty Member --</option>
                {normalizedStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.cleanEmpId} &bull; {s.cleanCampus})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Leadership Role Designation *</label>
              <select
                value={roleFormData.roleType}
                onChange={(e) => setRoleFormData({ ...roleFormData, roleType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="Head of Department (HOD)">Head of Department (HOD)</option>
                <option value="Section Coordinator">Section Coordinator</option>
                <option value="Campus Bursar & Finance Officer">Campus Bursar & Finance Officer</option>
                <option value="Examination Controller">Examination Controller</option>
                <option value="Vice Principal / Academic Dean">Vice Principal / Academic Dean</option>
                <option value="Curriculum & Research Syndicate Lead">Curriculum & Research Syndicate Lead</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Appointed Department / Subject</label>
              <input
                type="text"
                value={roleFormData.department}
                onChange={(e) => setRoleFormData({ ...roleFormData, department: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointed Term / Tenure</label>
                <input
                  type="text"
                  value={roleFormData.tenure}
                  onChange={(e) => setRoleFormData({ ...roleFormData, tenure: e.target.value })}
                  placeholder="2026 - 2028"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Privilege Level</label>
                <input
                  type="text"
                  value={roleFormData.privilegeLevel}
                  onChange={(e) => setRoleFormData({ ...roleFormData, privilegeLevel: e.target.value })}
                  placeholder="Academic Board"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAssignRoleModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Confirm Appointment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* INITIATE INTER-CAMPUS STAFF TRANSFER MODAL */}
      {/* ========================================================= */}
      {isTransferModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsTransferModalOpen(false)}
          title="Initiate Inter-Campus Faculty Transfer"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleInitiateTransferSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Faculty Member *</label>
              <select
                required
                value={transferFormData.staffId}
                onChange={(e) => {
                  const s = normalizedStaff.find(st => st.id === e.target.value)
                  const alt = institutes.find(i => i.name !== s?.cleanCampus)?.name || 'City School Model Town Campus'
                  setTransferFormData({ ...transferFormData, staffId: e.target.value, toCampus: alt })
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
              >
                {normalizedStaff.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.cleanEmpId} &bull; Current: {s.cleanCampus})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Target Destination Campus *</label>
              <select
                required
                value={transferFormData.toCampus}
                onChange={(e) => setTransferFormData({ ...transferFormData, toCampus: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
              >
                {institutes.map(inst => (
                  <option key={inst.id} value={inst.name}>{inst.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Transfer Justification / Reason *</label>
              <textarea
                required
                rows={3}
                value={transferFormData.reason}
                onChange={(e) => setTransferFormData({ ...transferFormData, reason: e.target.value })}
                placeholder="e.g. Promoted to Senior Academic Lead, Family relocation, or Subject faculty coverage."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Effective Transfer Date</label>
              <input
                type="date"
                value={transferFormData.date}
                onChange={(e) => setTransferFormData({ ...transferFormData, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                Submit Transfer Request
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* ADD / EDIT POLICY DIRECTIVE MODAL */}
      {/* ========================================================= */}
      {isPolicyModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPolicyModalOpen(false)}
          title={editingPolicy ? `Edit Directive: ${editingPolicy.id}` : 'Enact New Policy Directive'}
          maxWidth="max-w-md"
        >
          <form onSubmit={handlePolicyFormSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Policy Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sabbatical & Academic Research Leave"
                value={policyForm.title}
                onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Rule Definition & Quota *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. 6 Months Paid Sabbatical for Ph.D. Completion with 2 Years bond."
                value={policyForm.rule}
                onChange={(e) => setPolicyForm({ ...policyForm, rule: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Policy Category</label>
                <select
                  value={policyForm.type}
                  onChange={(e) => setPolicyForm({ ...policyForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none cursor-pointer"
                >
                  <option value="Leave Entitlement">Leave Entitlement</option>
                  <option value="Provident & Gratuity">Provident & Gratuity</option>
                  <option value="Allowance & Honorarium">Allowance & Honorarium</option>
                  <option value="Code of Conduct">Code of Conduct</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Applicable Scope</label>
                <input
                  type="text"
                  placeholder="All Campuses"
                  value={policyForm.scope}
                  onChange={(e) => setPolicyForm({ ...policyForm, scope: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsPolicyModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold cursor-pointer"
              >
                {editingPolicy ? 'Save Changes' : 'Enact Directive'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================= */}
      {/* REAL PHOTOGRAPHIC STAFF ID CARD MODAL */}
      {/* ========================================================= */}
      {isIdCardModalOpen && staffForIdCard && (
        <StaffIdCardModal
          isOpen={isIdCardModalOpen}
          onClose={() => {
            setIsIdCardModalOpen(false)
            setStaffForIdCard(null)
          }}
          selectedStaff={staffForIdCard}
        />
      )}
    </div>
  )
}

export default SuperadminStaffFacultyView
