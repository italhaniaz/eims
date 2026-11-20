const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const normalizeEmail = (value) => String(value || '').trim().toLowerCase()

export const mapStoredRole = (role) => {
  const r = String(role || '').toLowerCase().replace(/[\s-]+/g, '_')
  if (r === 'superadmin' || r === 'super_admin') return 'superadmin'
  if (r === 'teacher' || r === 'faculty') return 'teacher'
  if (r === 'student') return 'student'
  if (r === 'parent' || r === 'guardian') return 'parent'
  return 'institute_admin'
}

export const roleTitleFor = (role) => {
  switch (mapStoredRole(role)) {
    case 'superadmin':
      return 'Superadmin'
    case 'teacher':
      return 'Faculty / Subject Teacher'
    case 'student':
      return 'Student'
    case 'parent':
      return 'Parent'
    default:
      return 'School Principal / Admin'
  }
}

export const roleScopeFor = (role) => {
  switch (mapStoredRole(role)) {
    case 'superadmin':
      return 'Schools Platform Administration'
    case 'teacher':
      return 'Teacher Academic Portal'
    case 'student':
      return 'Student Academic Portal'
    case 'parent':
      return 'Parent Monitoring & Engagement Portal'
    default:
      return 'School Administration (K-10)'
  }
}

const sameText = (a, b) => String(a || '').trim().toLowerCase() === String(b || '').trim().toLowerCase()

export const isParentLinkedToStudent = (student, user) => {
  if (!student || !user) return false
  const mail = normalizeEmail(user.email)
  const linkedIds = Array.isArray(user.linkedStudentIds) ? user.linkedStudentIds : []
  if (linkedIds.includes(student.id)) return true
  if (mail && (
    normalizeEmail(student.parentEmail) === mail ||
    normalizeEmail(student.guardianEmail) === mail ||
    normalizeEmail(student.fatherEmail) === mail
  )) return true
  if (user.name && user.name !== 'Parent / Guardian' && user.name !== 'Unknown') {
    if (sameText(student.fatherName, user.name) || sameText(student.guardianName, user.name)) return true
  }
  const phone = String(user.phone || user.guardianPhone || '').replace(/\D/g, '')
  if (phone.length >= 10) {
    const studentPhone = String(student.guardianPhone || student.parentPhone || '').replace(/\D/g, '')
    if (studentPhone && studentPhone.slice(-10) === phone.slice(-10)) return true
  }
  return false
}

export const findStudentRecord = (students = [], user) => {
  if (!user) return null
  const mail = normalizeEmail(user.email)
  const byId = students.find((s) => s && (s.id === user.studentId || s.id === user.id))
  if (byId) return byId
  if (mail) {
    const byEmail = students.find((s) => normalizeEmail(s.email) === mail || normalizeEmail(s.studentEmail) === mail)
    if (byEmail) return byEmail
  }
  if (user.rollNumber) {
    const byRoll = students.find((s) => sameText(s.rollNumber, user.rollNumber) || sameText(s.systemAdmissionNo, user.admissionNumber))
    if (byRoll) return byRoll
  }
  return null
}

export const findTeacherRecord = (teachers = [], user) => {
  if (!user) return null
  const mail = normalizeEmail(user.email)
  return teachers.find((t) => t && (
    t.id === user.teacherId ||
    t.id === user.id ||
    (mail && normalizeEmail(t.email) === mail)
  )) || null
}

const feeAmount = (fee) => Number(fee?.amount ?? fee?.total ?? 0)
const feePaid = (fee) => Number(fee?.paidAmount ?? fee?.paid ?? 0)
const feeRemaining = (fee) => Math.max(0, feeAmount(fee) - feePaid(fee))

export const isFeePaid = (fee) => {
  const status = String(fee?.status || '').toLowerCase()
  return status === 'paid' || status === 'settled' || (feeRemaining(fee) <= 0 && feeAmount(fee) > 0 && status !== 'pending')
}

export const isFeePending = (fee) => {
  if (!fee) return false
  if (isFeePaid(fee)) return false
  const status = String(fee?.status || '').toLowerCase()
  const approval = String(fee?.approvalStatus || '').toLowerCase()
  if (approval === 'pending') return true
  return status === 'pending' || status === 'unpaid' || status === 'due' || feeRemaining(fee) > 0
}

const formatFeeDate = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const mapFeeToStudentVoucher = (fee) => {
  const total = feeAmount(fee)
  const paid = feePaid(fee)
  const remaining = Math.max(0, total - paid)
  const approval = String(fee.approvalStatus || '').toLowerCase()
  return {
    id: fee.id,
    title: fee.feeType || fee.title || fee.month || 'Fee voucher',
    badge: fee.duration || fee.month || 'Fee',
    refNo: fee.refNo || fee.id,
    receiptNo: fee.receiptNo || fee.id,
    progress: total > 0 ? Number(((paid / total) * 100).toFixed(1)) : 0,
    total,
    paid,
    remaining,
    type: /fine|charge/i.test(String(fee.feeType || '')) ? 'charge' : 'monthly',
    accentColor: remaining > 0 ? 'border-l-red-500' : 'border-l-emerald-500',
    status: approval === 'pending' ? 'pending_approval' : (isFeePaid(fee) ? 'paid' : 'pending'),
    dueDate: formatFeeDate(fee.dueDate),
    paidDate: formatFeeDate(fee.paidDate || fee.updatedAt),
    date: formatFeeDate(fee.paidDate || fee.updatedAt || fee.dueDate),
    paymentMode: fee.paymentMethod || '',
    approvalStatus: fee.approvalStatus || null,
    status: approval === 'pending' ? 'Pending approval' : (isFeePaid(fee) ? 'Paid' : 'Pending')
  }
}

export const mapFeeToParentVoucher = (fee) => {
  const mapped = mapFeeToStudentVoucher(fee)
  return {
    id: mapped.id,
    title: mapped.title,
    type: mapped.badge,
    refNo: mapped.refNo,
    receiptNo: mapped.receiptNo,
    total: mapped.total,
    paid: mapped.paid,
    status: mapped.status,
    dueDate: mapped.dueDate,
    paidDate: mapped.paidDate,
    paymentMode: mapped.paymentMode
  }
}

const summarizeAttendance = (attendance = {}, student) => {
  if (!student?.id) {
    return { present: 0, absent: 0, leave: 0, workingDays: 0, percent: 0 }
  }
  let present = 0
  let absent = 0
  let leave = 0
  let late = 0
  Object.values(attendance || {}).forEach((records) => {
    if (!records) return
    const entry = Array.isArray(records)
      ? records.find((r) => r.studentId === student.id)
      : records[student.id]
    if (!entry) return
    const status = String(entry.status || '').toLowerCase()
    if (status === 'present') present += 1
    else if (status === 'absent') absent += 1
    else if (status === 'leave') leave += 1
    else if (status === 'late') late += 1
  })
  const workingDays = present + absent + leave + late
  const percent = workingDays > 0 ? Number((((present + late) / workingDays) * 100).toFixed(1)) : 0
  return { present, absent, leave, late, workingDays, percent }
}

export const mapStudentToParentChild = (student, fees = [], attendance = {}, index = 0) => {
  const studentFees = fees.filter((f) => f.studentId === student.id || f.student_id === student.id)
  const pending = studentFees.filter(isFeePending)
  const completed = studentFees.filter(isFeePaid)
  const att = summarizeAttendance(attendance, student)
  const pendingTotal = pending.reduce((sum, f) => sum + feeRemaining(f), 0)
  return {
    id: student.id,
    sn: index + 1,
    name: student.name || student.fullName || 'Student',
    admissionNo: student.systemAdmissionNo || student.customRegNo || student.rollNumber || student.id,
    rollNo: student.rollNumber || '—',
    className: student.className || '—',
    section: student.section || '—',
    sectionFull: [student.className, student.section].filter(Boolean).join(' ') || '—',
    email: student.email || 'N/A',
    dob: student.dob || '—',
    bloodGroup: student.bloodGroup || '—',
    gender: student.gender || '—',
    photoType: 'avatar',
    avatarBg: 'bg-blue-600',
    pendingFees: pendingTotal,
    attendancePercent: att.percent,
    attendanceStats: { present: att.present, absent: att.absent, leave: att.leave, workingDays: att.workingDays },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: pending.map(mapFeeToParentVoucher),
    completedVouchers: completed.map(mapFeeToParentVoucher)
  }
}

export const buildParentChildren = (user, students = [], fees = [], attendance = {}) => {
  const linked = (students || []).filter((s) => isParentLinkedToStudent(s, user))
  return linked.map((student, index) => mapStudentToParentChild(student, fees, attendance, index))
}

export const mapStudentToTeacherRoster = (student) => ({
  id: student.id,
  name: student.name || student.fullName || 'Student',
  rollNo: student.rollNumber || student.rollNo || '',
  classRoll: student.classRoll || '',
  className: student.className || 'Nursery',
  section: student.section || 'A',
  admissionNo: student.systemAdmissionNo || student.customRegNo || student.rollNumber || student.id,
  admissionDate: String(student.admissionDate || student.createdAt || '').slice(0, 10),
  parentName: student.fatherName || student.guardianName || '',
  studentPhone: student.phone || '—',
  parentPhone: student.guardianPhone || student.parentPhone || '—',
  house: student.sportHouse || student.house || '—',
  educationBoard: student.educationBoard || 'Federal Board (FBISE)',
  onTransport: Boolean(student.onTransport || student.transportRouteId),
  isActive: String(student.status || 'Active').toLowerCase() !== 'inactive',
  gender: student.gender || 'Male',
  dob: student.dob || '',
  instituteId: student.instituteId,
  email: student.email || '',
  parentEmail: student.parentEmail || ''
})

export const mapAssignmentForStudent = (item) => ({
  id: item.id,
  title: item.title,
  description: item.description || '',
  hasAttachment: Boolean(item.hasImage || item.attachmentUrl),
  attachmentType: item.attachmentType || (item.hasImage ? 'Image' : null),
  attachmentName: item.attachmentName || null,
  attachmentUrl: item.attachmentUrl || null,
  subject: item.subject || 'General',
  date: item.date || formatFeeDate(item.createdAt),
  isoDate: item.isoDate || String(item.createdAt || '').slice(0, 10),
  teacher: item.teacherName || item.teacher || 'Teacher',
  instructions: item.description || item.instructions || '',
  className: item.className
})

export const mapNoticeForStudent = (item, index = 0) => ({
  id: item.id || index + 1,
  title: item.title || item.text || 'Notice',
  isNew: !item.read,
  author: item.author || item.createdBy || 'School Admin',
  date: item.date || item.timestamp || formatFeeDate(item.createdAt),
  scope: item.audience || item.scope || 'Institute-wide',
  hasAttachment: Boolean(item.hasAttachment || item.attachmentName),
  attachmentName: item.attachmentName || null,
  type: item.type || item.channel || 'Notice',
  content: item.message || item.content || item.text || item.title || ''
})

export const filterAssignmentsForStudent = (assignments = [], student) => {
  if (!student) return []
  const className = String(student.className || '').trim().toLowerCase()
  const section = String(student.section || '').trim().toLowerCase()
  return assignments
    .filter((item) => {
      const itemClass = String(item.className || '').trim().toLowerCase()
      if (!itemClass || itemClass === 'all classes' || itemClass === 'all') return true
      if (className && itemClass === className) return true
      if (className && section && itemClass === `${className} ${section}`) return true
      return false
    })
    .map(mapAssignmentForStudent)
}

export const studentFeesFor = (fees = [], student) => {
  if (!student?.id) return []
  return (fees || []).filter((f) => f.studentId === student.id || f.student_id === student.id)
}

export async function ensurePortalAccount(addItem, users = [], payload) {
  const email = normalizeEmail(payload?.email)
  if (!email || !EMAIL_RE.test(email) || typeof addItem !== 'function') return null
  const existing = users.find((u) => normalizeEmail(u.email) === email)
  if (existing) return existing
  return addItem('users', {
    name: payload.name || roleTitleFor(payload.role),
    email,
    role: mapStoredRole(payload.role),
    roleTitle: roleTitleFor(payload.role),
    instituteId: payload.instituteId || null,
    instituteName: payload.instituteName || '',
    password: payload.password || 'password123',
    status: 'Active',
    studentId: payload.studentId || undefined,
    linkedStudentIds: payload.linkedStudentIds || undefined
  })
}

export const enrichSessionUser = (user, db = {}) => {
  if (!user) return user
  const role = mapStoredRole(user.role)
  const students = db.students || []
  const teachers = db.teachers || []
  const institutes = db.institutes || []
  const base = {
    ...user,
    role,
    roleTitle: user.roleTitle || roleTitleFor(role),
    scope: user.scope && !String(user.scope).includes('School Administration (K-10)')
      ? user.scope
      : roleScopeFor(role)
  }

  if (role === 'student') {
    const record = findStudentRecord(students, base)
    if (record) {
      const inst = institutes.find((i) => i.id === record.instituteId)
      return {
        ...base,
        studentId: record.id,
        name: record.name || record.fullName || base.name,
        rollNumber: record.rollNumber || base.rollNumber,
        admissionNumber: record.systemAdmissionNo || record.customRegNo || base.admissionNumber,
        className: record.className || base.className,
        section: record.section || base.section,
        instituteId: record.instituteId || base.instituteId,
        instituteName: inst?.name || base.instituteName
      }
    }
  }

  if (role === 'parent') {
    const kids = students.filter((s) => isParentLinkedToStudent(s, base))
    const inst = institutes.find((i) => i.id === (kids[0]?.instituteId || base.instituteId))
    return {
      ...base,
      name: (base.name && base.name !== 'Parent / Guardian') ? base.name : (kids[0]?.fatherName || kids[0]?.guardianName || base.name),
      linkedStudentIds: kids.map((k) => k.id),
      studentName: kids[0]?.name,
      studentClass: kids[0]?.className,
      studentSection: kids[0]?.section,
      studentRoll: kids[0]?.rollNumber,
      studentAdmissionNo: kids[0]?.systemAdmissionNo,
      instituteId: kids[0]?.instituteId || base.instituteId,
      instituteName: inst?.name || base.instituteName
    }
  }

  if (role === 'teacher') {
    const record = findTeacherRecord(teachers, base)
    if (record) {
      const inst = institutes.find((i) => i.id === record.instituteId)
      return {
        ...base,
        teacherId: record.id,
        name: record.name || base.name,
        instituteId: record.instituteId || base.instituteId,
        instituteName: inst?.name || base.instituteName
      }
    }
  }

  return base
}

export const resolveLoginIdentity = (mail, db = {}) => {
  const email = normalizeEmail(mail)
  if (!email) return null
  const users = db.users || []
  const students = db.students || []
  const teachers = db.teachers || []
  const userHit = users.find((u) => normalizeEmail(u.email) === email)
  if (userHit) return { kind: 'user', record: userHit, role: mapStoredRole(userHit.role) }
  const studentHit = students.find((s) => normalizeEmail(s.email) === email || normalizeEmail(s.studentEmail) === email)
  if (studentHit) return { kind: 'student', record: studentHit, role: 'student' }
  const parentHit = students.find((s) => normalizeEmail(s.parentEmail) === email || normalizeEmail(s.guardianEmail) === email)
  if (parentHit) return { kind: 'parent', record: parentHit, role: 'parent' }
  const teacherHit = teachers.find((t) => normalizeEmail(t.email) === email)
  if (teacherHit) return { kind: 'teacher', record: teacherHit, role: 'teacher' }
  return null
}
