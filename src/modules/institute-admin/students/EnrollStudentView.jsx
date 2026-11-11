import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  FileText,
  ArrowLeft,
  ArrowRight,
  UserPlus,
  DollarSign,
  ArrowDown,
  MessageSquare,
  Check,
  Edit3,
  Pencil,
  User,
  Users,
  Plus,
  X,
  Camera
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'
import { compressAvatarImage } from '../../../utils/profileUtils'
import { filterClassesByInstituteTier } from '../../../utils/tierGating'
import { normalizeClassSections } from '../../../constants/academicLevels'

const STEPS = [
  { id: 1, label: 'Student Personal Information' },
  { id: 2, label: 'Parent & Guardian Information' },
  { id: 3, label: 'Communication' },
  { id: 4, label: 'Academic Information' },
  { id: 5, label: 'Fee Setup' }
]

const DEFAULT_STATES_AND_CITIES = {
  Punjab: ['Lahore', 'Rawalpindi', 'Faisalabad', 'Multan', 'Gujranwala', 'Sialkot', 'Bahawalpur'],
  Sindh: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
  'Khyber Pakhtunkhwa': ['Peshawar', 'Abbottabad', 'Mardan', 'Swat'],
  Balochistan: ['Quetta', 'Gwadar', 'Turbat'],
  'Islamabad Capital Territory': ['Islamabad'],
  'Azad Kashmir': ['Muzaffarabad', 'Mirpur'],
  'Gilgit-Baltistan': ['Gilgit', 'Skardu']
}

const DEFAULT_BOARDS = ['BISE Lahore', 'BISE Rawalpindi', 'FBISE Islamabad', 'Cambridge O-Level', 'Govt / District Board', 'Private / Independent']
const DEFAULT_FEE_TYPES = ['Tuition Fee', 'Admission Fee', 'Transport Fee', 'Hostel / Boarding Fee', 'Exam Fee', 'Lab / Library Fee', 'Stationery / Books']

export const EnrollStudentView = ({
  currentInstitute,
  onRouteChange,
  onOpenQuickPayment,
  onOpenSendSms,
  editingStudentId = null,
  onCancelEdit,
  onSavedEdit
}) => {
  const { students = [], classes = [], fees = [], addItem, updateItem, logAuditEvent } = useAppData()
  const { toast } = useToast()
  const photoInputRef = useRef(null)
  const instId = currentInstitute?.id || 'default'

  const editingStudent = useMemo(
    () => (editingStudentId ? students.find((s) => s.id === editingStudentId) || null : null),
    [editingStudentId, students]
  )
  const isEditMode = Boolean(editingStudent)

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  // Dynamic inline "+ Add New" lists
  const [nationalities, setNationalities] = useState(['Pakistani', 'Overseas Pakistani', 'International'])
  const [statesMap, setStatesMap] = useState(DEFAULT_STATES_AND_CITIES)
  const [boards, setBoards] = useState(DEFAULT_BOARDS)
  const [addingField, setAddingField] = useState(null) // 'nationality' | 'state' | 'city' | 'board'
  const [inlineInput, setInlineInput] = useState('')

  const [showStudentPass, setShowStudentPass] = useState(false)
  const [showParentPass, setShowParentPass] = useState(false)
  const [parentMode, setParentMode] = useState('new') // 'existing' | 'new'
  const [selectedExistingParentId, setSelectedExistingParentId] = useState('')

  const [form, setForm] = useState({
    // Step 1: Student Personal Information
    fullName: '',
    gender: '',
    studentEmail: '',
    studentPassword: '',
    nationalId: '',
    nationality: 'Pakistani',
    stateProvince: '',
    cityDistrict: '',
    address: '',
    dob: '',
    bloodGroup: '',
    caste: '',
    medicalNotes: '',
    photoUrl: null,
    photoFileName: '',

    // Step 2: Parent & Guardian Information
    fatherName: '',
    parentEmail: '',
    parentPassword: '',
    parentNationalId: '',
    motherName: '',
    motherNationalId: '',

    // Step 3: Communication
    commRows: {
      studentMobile: { label: 'Student mobile', number: '', placeholder: '03078888888', whatsapp: false, sms: false },
      studentOther: { label: 'Student other number', number: '', placeholder: '042-1234567', whatsapp: false, sms: false },
      parentMobile: { label: 'Parent mobile', number: '', placeholder: '03078888888', whatsapp: false, sms: false },
      parentOther: { label: 'Parent other number', number: '', placeholder: '042-1234567', whatsapp: false, sms: false }
    },

    // Step 4: Academic Information
    classSection: '',
    educationBoard: '',
    customRegNo: '',
    admissionDate: new Date().toISOString().split('T')[0],
    hostelId: '',
    roomBedNumber: '',
    sportHouse: '',

    // Step 5: Fee Setup
    voucherDuration: 'Monthly',
    feeItems: [{ id: 'fi-1', feeType: '', amount: '' }],
    discountAmount: 0,
    referralSource: '',
    additionalNotes: ''
  })

  useEffect(() => {
    if (!editingStudent) return
    setStep(1)
    const savedSetup = editingStudent.feeSetup || {}
    const latestStudentFee = fees.find((f) => f.studentId === editingStudent.id && Number(f.amount || 0) > 0)
    const fallbackTuition = Number(
      editingStudent.monthlyFee ?? editingStudent.tuitionFee ?? savedSetup.tuitionTotal ?? latestStudentFee?.amount ?? 0
    )
    const prefilledFeeItems =
      Array.isArray(savedSetup.items) && savedSetup.items.length > 0
        ? savedSetup.items.map((it, idx) => ({
            id: `fi-edit-${idx + 1}`,
            feeType: it.feeType || 'Tuition Fee',
            amount: String(it.amount ?? 0)
          }))
        : fallbackTuition > 0
          ? [{ id: 'fi-edit-1', feeType: 'Tuition Fee', amount: String(fallbackTuition) }]
          : [{ id: 'fi-1', feeType: '', amount: '' }]

    const savedComm = editingStudent.communicationPreferences || {}
    const clsVal = editingStudent.className
      ? `${editingStudent.className}|||${editingStudent.section || 'A'}`
      : ''

    if (editingStudent.province && !statesMap[editingStudent.province]) {
      setStatesMap((prev) => ({
        ...prev,
        [editingStudent.province]: editingStudent.city ? [editingStudent.city] : []
      }))
    } else if (editingStudent.province && editingStudent.city && !statesMap[editingStudent.province]?.includes(editingStudent.city)) {
      setStatesMap((prev) => ({
        ...prev,
        [editingStudent.province]: [...(prev[editingStudent.province] || []), editingStudent.city]
      }))
    }

    setForm({
      fullName: editingStudent.fullName || editingStudent.name || '',
      gender: editingStudent.gender || 'Male',
      studentEmail: editingStudent.email || '',
      studentPassword: '',
      nationalId: editingStudent.bFormCnic || '',
      nationality: editingStudent.nationality || 'Pakistani',
      stateProvince: editingStudent.province || 'Punjab',
      cityDistrict: editingStudent.city || '',
      address: editingStudent.address || '',
      dob: editingStudent.dob || '',
      bloodGroup: editingStudent.bloodGroup || '',
      caste: editingStudent.caste || '',
      medicalNotes: editingStudent.medicalNotes || '',
      photoUrl: editingStudent.photoUrl || editingStudent.photo || null,
      photoFileName: '',
      fatherName: editingStudent.fatherName || editingStudent.guardianName || '',
      parentEmail: editingStudent.parentEmail || '',
      parentPassword: '',
      parentNationalId: editingStudent.fatherCnic || editingStudent.parentCnic || '',
      motherName: editingStudent.motherName || '',
      motherNationalId: editingStudent.motherCnic || '',
      commRows: {
        studentMobile: savedComm.studentMobile || { label: 'Student mobile', number: editingStudent.phone || '', placeholder: '03078888888', whatsapp: false, sms: false },
        studentOther: savedComm.studentOther || { label: 'Student other number', number: editingStudent.altPhone || '', placeholder: '042-1234567', whatsapp: false, sms: false },
        parentMobile: savedComm.parentMobile || { label: 'Parent mobile', number: editingStudent.guardianPhone || editingStudent.parentPhone || '', placeholder: '03078888888', whatsapp: false, sms: true },
        parentOther: savedComm.parentOther || { label: 'Parent other number', number: '', placeholder: '042-1234567', whatsapp: false, sms: false }
      },
      classSection: clsVal,
      educationBoard: editingStudent.educationBoard || '',
      customRegNo: editingStudent.customRegNo || editingStudent.rollNumber || '',
      admissionDate: editingStudent.admissionDate || new Date().toISOString().split('T')[0],
      hostelId: editingStudent.hostelId || '',
      roomBedNumber: editingStudent.roomBedNumber || '',
      sportHouse: editingStudent.sportHouse || '',
      voucherDuration: savedSetup.feeType || editingStudent.feeType || 'Monthly',
      feeItems: prefilledFeeItems,
      discountAmount: Number(savedSetup.discount ?? editingStudent.discount ?? 0),
      referralSource: savedSetup.referralSource ?? editingStudent.referralSource ?? '',
      additionalNotes: savedSetup.notes ?? editingStudent.notes ?? ''
    })
  }, [editingStudent?.id])

  const instStudents = useMemo(
    () => students.filter(s => !currentInstitute?.id || s.instituteId === currentInstitute.id),
    [students, currentInstitute?.id]
  )

  const existingParents = useMemo(() => {
    const seen = new Set()
    const list = []
    instStudents.forEach(s => {
      if (s.fatherName && !seen.has(`${s.fatherName}-${s.fatherCnic || s.guardianPhone || ''}`)) {
        seen.add(`${s.fatherName}-${s.fatherCnic || s.guardianPhone || ''}`)
        list.push(s)
      }
    })
    return list
  }, [instStudents])

  const classSectionOptions = useMemo(() => {
    const scoped = filterClassesByInstituteTier(classes, currentInstitute)
    const options = []
    scoped.forEach(c => {
      const secs = normalizeClassSections(c)
      if (secs.length > 0) {
        secs.forEach(sec => {
          options.push({
            value: `${c.name}|||${sec.name}`,
            label: `${c.name} - Section ${sec.name}`
          })
        })
      } else {
        options.push({
          value: `${c.name}|||A`,
          label: `${c.name} (Section A)`
        })
      }
    })
    return options
  }, [classes, currentInstitute])

  const hostelsList = useMemo(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`eims_school_hostels_${instId}`) || '{}')
      return Array.isArray(saved.rooms) ? saved.rooms : []
    } catch {
      return []
    }
  }, [instId])

  const cityOptions = useMemo(() => {
    if (!form.stateProvince) return []
    return statesMap[form.stateProvince] || []
  }, [form.stateProvince, statesMap])

  const commCounts = useMemo(() => {
    const rows = Object.values(form.commRows)
    const waCount = rows.filter(r => r.whatsapp && r.number.trim()).length
    const smsCount = rows.filter(r => r.sms && r.number.trim()).length
    return { waCount, smsCount }
  }, [form.commRows])

  const feeSummary = useMemo(() => {
    const gross = form.feeItems.reduce((sum, item) => sum + Math.max(0, Number(item.amount) || 0), 0)
    const discount = Math.max(0, Number(form.discountAmount) || 0)
    const net = Math.max(0, gross - discount)
    return { gross, discount, net }
  }, [form.feeItems, form.discountAmount])

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await compressAvatarImage(file, 256)
      setForm(prev => ({ ...prev, photoUrl: dataUrl, photoFileName: file.name }))
      toast?.success?.('Student photo attached.')
    } catch (err) {
      toast?.error?.(err?.message || 'Unable to read photo file.')
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = ''
    }
  }

  const handleConfirmInlineAdd = () => {
    const val = inlineInput.trim()
    if (!val) return
    if (addingField === 'nationality') {
      if (!nationalities.includes(val)) setNationalities(prev => [...prev, val])
      setForm(prev => ({ ...prev, nationality: val }))
    } else if (addingField === 'state') {
      if (!statesMap[val]) setStatesMap(prev => ({ ...prev, [val]: [] }))
      setForm(prev => ({ ...prev, stateProvince: val, cityDistrict: '' }))
    } else if (addingField === 'city') {
      const state = form.stateProvince || 'Punjab'
      setStatesMap(prev => ({
        ...prev,
        [state]: Array.from(new Set([...(prev[state] || []), val]))
      }))
      setForm(prev => ({ ...prev, stateProvince: state, cityDistrict: val }))
    } else if (addingField === 'board') {
      if (!boards.includes(val)) setBoards(prev => [...prev, val])
      setForm(prev => ({ ...prev, educationBoard: val }))
    }
    setInlineInput('')
    setAddingField(null)
  }

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.fullName.trim()) {
        toast?.error?.('Student Full Name is required.')
        return
      }
      if (!form.gender) {
        toast?.error?.('Please select Gender.')
        return
      }
      if (!isEditMode && (!form.nationality.trim() || !form.stateProvince || !form.cityDistrict)) {
        toast?.error?.('Nationality, State / Province, and City / District are required.')
        return
      }
    }
    if (step === 4 && !isEditMode) {
      if (!form.classSection && classSectionOptions.length > 0) {
        toast?.error?.('Please choose a Class & Section.')
        return
      }
      if (!form.admissionDate) {
        toast?.error?.('Admission Date is required.')
        return
      }
    }
    setStep(prev => Math.min(5, prev + 1))
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const [classNamePart, sectionPart] = (form.classSection || 'General|||A').split('|||')
      const year = new Date().getFullYear()
      const seqNum = String(instStudents.length + 1).padStart(4, '0')
      const admissionNo = editingStudent?.systemAdmissionNo || editingStudent?.admissionNo || `ED-${year}-${seqNum}`

      const primaryStudentPhone = form.commRows.studentMobile.number.trim() || form.commRows.studentOther.number.trim()
      const primaryParentPhone = form.commRows.parentMobile.number.trim() || form.commRows.parentOther.number.trim() || primaryStudentPhone
      const whatsappNum = Object.values(form.commRows).find(r => r.whatsapp && r.number.trim())?.number.trim() || primaryParentPhone

      const selectedRoom = hostelsList.find(r => r.id === form.hostelId)
      const nowIso = new Date().toISOString()
      const cleanedFeeItems = form.feeItems
        .filter((fi) => fi.feeType || Number(fi.amount) > 0)
        .map((fi) => ({ feeType: fi.feeType || 'Tuition Fee', amount: Math.max(0, Number(fi.amount) || 0), routeId: '' }))

      const studentPayload = {
        instituteId: currentInstitute?.id || editingStudent?.instituteId || 'inst-1',
        name: form.fullName.trim(),
        fullName: form.fullName.trim(),
        rollNumber: form.customRegNo.trim() || editingStudent?.rollNumber || admissionNo,
        systemAdmissionNo: admissionNo,
        customRegNo: form.customRegNo.trim(),
        gender: form.gender || 'Male',
        email: form.studentEmail.trim(),
        bFormCnic: form.nationalId.trim(),
        nationality: form.nationality,
        province: form.stateProvince,
        city: form.cityDistrict,
        address: form.address.trim(),
        dob: form.dob,
        bloodGroup: form.bloodGroup,
        caste: form.caste.trim(),
        medicalNotes: form.medicalNotes.trim(),
        photoUrl: form.photoUrl,
        fatherName: form.fatherName.trim() || 'Parent / Guardian',
        parentEmail: form.parentEmail.trim(),
        fatherCnic: form.parentNationalId.trim(),
        motherName: form.motherName.trim(),
        motherCnic: form.motherNationalId.trim(),
        phone: primaryStudentPhone || primaryParentPhone,
        guardianPhone: primaryParentPhone,
        guardianWhatsapp: whatsappNum,
        communicationPreferences: form.commRows,
        className: form.classSection ? classNamePart : (editingStudent?.className || classNamePart),
        section: form.classSection ? (sectionPart || 'A') : (editingStudent?.section || 'A'),
        educationBoard: form.educationBoard,
        admissionDate: form.admissionDate,
        hostelName: selectedRoom ? `${selectedRoom.hostelName} - Room ${selectedRoom.roomNumber}` : (editingStudent?.hostelName || ''),
        roomBedNumber: form.roomBedNumber.trim(),
        sportHouse: form.sportHouse.trim(),
        referralSource: form.referralSource.trim(),
        notes: form.additionalNotes.trim(),
        monthlyFee: feeSummary.net,
        tuitionFee: feeSummary.gross,
        discount: feeSummary.discount,
        feeSetup: {
          feeType: form.voucherDuration,
          tuitionTotal: feeSummary.gross,
          discount: feeSummary.discount,
          finalAmount: feeSummary.net,
          items: cleanedFeeItems.length > 0 ? cleanedFeeItems : [{ feeType: 'Tuition Fee', amount: 0, routeId: '' }],
          referralSource: form.referralSource.trim(),
          notes: form.additionalNotes.trim(),
          createdAt: editingStudent?.feeSetup?.createdAt || editingStudent?.createdAt || nowIso,
          updatedAt: nowIso
        },
        updatedAt: nowIso
      }

      if (isEditMode) {
        await updateItem('students', editingStudent.id, studentPayload)
        logAuditEvent?.(`Updated student profile ${form.fullName.trim()} (${admissionNo})`, 'Students', 'Success')
        toast?.success?.(`Student "${form.fullName.trim()}" updated successfully!`)
        if (onSavedEdit) {
          onSavedEdit(editingStudent.id)
        } else {
          onRouteChange?.('inst-students')
        }
        return
      }

      const newStudent = await addItem('students', {
        ...studentPayload,
        feeStatus: feeSummary.net > 0 ? 'Pending' : 'Paid',
        status: 'Active',
        academicSession: '2026-2027'
      })

      if (feeSummary.net > 0 || form.feeItems.some(fi => fi.feeType && Number(fi.amount) > 0)) {
        const feeTitle = form.feeItems
          .filter(fi => fi.feeType && Number(fi.amount) > 0)
          .map(fi => fi.feeType)
          .join(', ') || 'Admission & Tuition Voucher'

        await addItem('fees', {
          instituteId: currentInstitute?.id || 'inst-1',
          studentId: newStudent?.id,
          studentName: form.fullName.trim(),
          rollNumber: newStudent?.rollNumber || admissionNo,
          className: classNamePart,
          feeType: feeTitle,
          month: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
          duration: form.voucherDuration,
          amount: feeSummary.gross,
          discount: feeSummary.discount,
          paidAmount: 0,
          dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
          status: 'Pending'
        })
      }

      if (logAuditEvent) {
        logAuditEvent(`Enrolled student ${form.fullName.trim()} (${admissionNo}) in ${classNamePart}`, 'Admissions', 'Success')
      }

      toast?.success?.(`Student "${form.fullName.trim()}" enrolled successfully (${admissionNo})!`)
      onRouteChange?.('inst-students')
    } catch (err) {
      toast?.error?.(isEditMode ? 'Unable to update student. Please try again.' : 'Unable to complete enrollment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1440px] mx-auto">
      {/* Top Action Header Matching Dashboard Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[var(--text-muted)]" />
            <h1 className="text-lg sm:text-xl font-bold text-[var(--text)]">
              {isEditMode ? 'Edit Student' : 'Enroll Student'}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => (isEditMode && onCancelEdit ? onCancelEdit() : onRouteChange?.('inst-dashboard'))}
            className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text)] flex items-center gap-1 mt-1 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Enrollment</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenQuickPayment ? onOpenQuickPayment() : onRouteChange?.('inst-fees'))}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Add Payment</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-fees')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Invoice</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteChange?.('inst-accounts-expenses')}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Manage Expense</span>
          </button>
          <button
            type="button"
            onClick={() => (onOpenSendSms ? onOpenSendSms() : onRouteChange?.('inst-communication'))}
            className="px-3.5 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:bg-slate-50 text-[var(--text)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Send SMS</span>
          </button>
        </div>
      </div>

      {/* Main 5-Step Wizard Container */}
      <form
        onSubmit={handleSubmitForm}
        className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 sm:p-8 shadow-soft space-y-8"
      >
        {isEditMode && (
          <div className="flex items-center gap-2 pb-4 border-b border-[var(--border)] text-sm font-bold text-[var(--text)]">
            <Pencil className="w-4 h-4 text-[var(--text-muted)]" />
            <span>Edit {editingStudent.fullName || editingStudent.name}</span>
          </div>
        )}
        {/* Stepper Header */}
        <div className="relative flex items-start justify-between gap-2 overflow-x-auto pb-2">
          {STEPS.map((s, idx) => {
            const isCompleted = step > s.id
            const isCurrent = step === s.id
            return (
              <div key={s.id} className="flex-1 min-w-[110px] flex flex-col items-center relative">
                {idx < STEPS.length - 1 && (
                  <div
                    className={`hidden sm:block absolute top-4 left-1/2 w-full h-[2px] -z-0 ${
                      step > s.id ? 'bg-cyan-500' : 'bg-slate-200'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => { if (isEditMode || s.id < step) setStep(s.id) }}
                  className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                    isCompleted
                      ? 'bg-cyan-500 border-cyan-500 text-white cursor-pointer'
                      : isCurrent
                        ? 'bg-white border-cyan-500 text-cyan-600 shadow-sm'
                        : isEditMode
                          ? 'bg-white border-slate-300 text-slate-600 hover:border-cyan-400 cursor-pointer'
                          : 'bg-white border-slate-300 text-slate-400 cursor-default'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : isCurrent ? <Edit3 className="w-3.5 h-3.5" /> : s.id}
                </button>
                <span
                  className={`mt-2 text-[11px] sm:text-xs font-semibold text-center ${
                    isCompleted ? 'text-emerald-700' : isCurrent ? 'text-cyan-700' : 'text-[var(--text-muted)]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Inline Add New Helper Strip */}
        {addingField && (
          <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-sky-900 capitalize">Add New {addingField}:</span>
            <input
              type="text"
              autoFocus
              value={inlineInput}
              onChange={(e) => setInlineInput(e.target.value)}
              placeholder={`Enter new ${addingField}...`}
              className="px-3 py-1.5 rounded-lg border border-sky-300 bg-white text-xs text-slate-900 flex-1 min-w-[180px]"
            />
            <button type="button" onClick={handleConfirmInlineAdd} className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer">
              Add
            </button>
            <button type="button" onClick={() => { setAddingField(null); setInlineInput('') }} className="p-1.5 text-slate-500 hover:text-slate-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: STUDENT PERSONAL INFORMATION */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Student Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ali Ahmed Khan"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                >
                  <option value="">Choose..</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text)]">Student Login Email</label>
                  <button
                    type="button"
                    onClick={() => setShowStudentPass(prev => !prev)}
                    className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                  >
                    {showStudentPass ? 'Hide Password' : 'Set Password'}
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="student@email.com"
                  value={form.studentEmail}
                  onChange={(e) => setForm({ ...form, studentEmail: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
                {showStudentPass && (
                  <input
                    type="password"
                    placeholder="Portal login password..."
                    value={form.studentPassword}
                    onChange={(e) => setForm({ ...form, studentPassword: e.target.value })}
                    className="mt-2 w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Student National ID <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="35202-1234567-1"
                  value={form.nationalId}
                  onChange={(e) => setForm({ ...form, nationalId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    Nationality <span className="text-rose-500">*</span>
                  </label>
                  <button type="button" onClick={() => setAddingField('nationality')} className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer">
                    Add New
                  </button>
                </div>
                <select
                  value={form.nationality}
                  onChange={(e) => setForm({ ...form, nationality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                >
                  {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    State / Province <span className="text-rose-500">*</span>
                  </label>
                  <button type="button" onClick={() => setAddingField('state')} className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer">
                    Add New
                  </button>
                </div>
                <select
                  value={form.stateProvince}
                  onChange={(e) => setForm({ ...form, stateProvince: e.target.value, cityDistrict: '' })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                >
                  <option value="">Choose..</option>
                  {Object.keys(statesMap).map(st => <option key={st} value={st}>{st}</option>)}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-[var(--text)]">
                    City / District <span className="text-rose-500">*</span>
                  </label>
                  <button type="button" onClick={() => setAddingField('city')} className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer">
                    Add New
                  </button>
                </div>
                <select
                  value={form.cityDistrict}
                  onChange={(e) => setForm({ ...form, cityDistrict: e.target.value })}
                  disabled={!form.stateProvince}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)] disabled:opacity-60"
                >
                  <option value="">{form.stateProvince ? 'Choose city..' : 'Select state first'}</option>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Home Address <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Street, Area, City"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Date of Birth <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Blood Group <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                >
                  <option value="">Choose..</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Caste <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter caste"
                  value={form.caste}
                  onChange={(e) => setForm({ ...form, caste: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Medical / Health Notes <span className="text-[var(--text-muted)] font-normal">(admin only, optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Allergies, medical conditions..."
                  value={form.medicalNotes}
                  onChange={(e) => setForm({ ...form, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>
            </div>

            {/* Student Photo Upload Card */}
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Student Photo <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <div className="p-4 rounded-xl border border-[var(--border)] bg-slate-50/50 flex items-center gap-4">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="Student Preview" className="w-16 h-16 rounded-full object-cover border-2 border-cyan-500" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-cyan-500/40 flex items-center justify-center text-sky-600">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <p className="text-xs text-[var(--text-muted)]">JPG, PNG, GIF or WebP, up to 3 MB.</p>
                  <div className="flex items-center gap-2">
                    <input
                      ref={photoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="px-3 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Choose file</span>
                    </button>
                    <span className="text-xs text-[var(--text-muted)]">
                      {form.photoFileName || 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PARENT & GUARDIAN INFORMATION */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="flex items-center border-b border-[var(--border)] gap-2">
              <button
                type="button"
                onClick={() => setParentMode('existing')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  parentMode === 'existing'
                    ? 'border-sky-500 text-sky-700'
                    : 'border-transparent text-[var(--text-muted)]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Select Existing Parent</span>
              </button>
              <button
                type="button"
                onClick={() => setParentMode('new')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 cursor-pointer ${
                  parentMode === 'new'
                    ? 'border-sky-500 text-sky-700'
                    : 'border-transparent text-[var(--text-muted)]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Parent</span>
              </button>
            </div>

            {parentMode === 'existing' ? (
              <div className="space-y-3 max-w-xl">
                <label className="block text-xs font-semibold text-[var(--text)]">Select Existing Guardian Record</label>
                {existingParents.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] py-3">
                    No existing parents found yet. Switch to &ldquo;Register New Parent&rdquo; tab to add parent details.
                  </p>
                ) : (
                  <select
                    value={selectedExistingParentId}
                    onChange={(e) => {
                      const picked = existingParents.find(p => p.id === e.target.value)
                      setSelectedExistingParentId(e.target.value)
                      if (picked) {
                        setForm(prev => ({
                          ...prev,
                          fatherName: picked.fatherName || '',
                          parentEmail: picked.parentEmail || '',
                          parentNationalId: picked.fatherCnic || '',
                          motherName: picked.motherName || '',
                          motherNationalId: picked.motherCnic || '',
                          commRows: {
                            ...prev.commRows,
                            parentMobile: { ...prev.commRows.parentMobile, number: picked.guardianPhone || picked.phone || '' }
                          }
                        }))
                        toast?.success?.(`Loaded parent details for ${picked.fatherName}`)
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  >
                    <option value="">Choose parent / guardian...</option>
                    {existingParents.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fatherName} {p.fatherCnic ? `(${p.fatherCnic})` : ''} — Child: {p.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Father / Guardian Name</label>
                  <input
                    type="text"
                    placeholder="Father or guardian full name"
                    value={form.fatherName}
                    onChange={(e) => setForm({ ...form, fatherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[var(--text)]">
                      Parent Login Email <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowParentPass(prev => !prev)}
                      className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer"
                    >
                      {showParentPass ? 'Hide Password' : 'Set Password'}
                    </button>
                  </div>
                  <input
                    type="email"
                    placeholder="parent@email.com"
                    value={form.parentEmail}
                    onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  />
                  {showParentPass && (
                    <input
                      type="password"
                      placeholder="Parent portal password..."
                      value={form.parentPassword}
                      onChange={(e) => setForm({ ...form, parentPassword: e.target.value })}
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">Parent National ID</label>
                  <input
                    type="text"
                    placeholder="35202-1234567-1"
                    value={form.parentNationalId}
                    onChange={(e) => setForm({ ...form, parentNationalId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Mother Name <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Mother full name"
                    value={form.motherName}
                    onChange={(e) => setForm({ ...form, motherName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                    Mother National ID <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="35202-1234567-1"
                    value={form.motherNationalId}
                    onChange={(e) => setForm({ ...form, motherNationalId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: COMMUNICATION */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="border border-[var(--border)] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-[var(--border)] text-slate-700 font-semibold">
                    <tr>
                      <th className="py-3 px-4 w-48">Contact</th>
                      <th className="py-3 px-4">Number</th>
                      <th className="py-3 px-4 text-center w-36">WhatsApp Alert</th>
                      <th className="py-3 px-4 text-center w-36">SMS Alert</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {Object.entries(form.commRows).map(([key, row]) => (
                      <tr key={key}>
                        <td className="py-2.5 px-4 font-medium text-[var(--text)]">{row.label}</td>
                        <td className="py-2.5 px-4">
                          <input
                            type="text"
                            placeholder={row.placeholder}
                            value={row.number}
                            onChange={(e) =>
                              setForm(prev => ({
                                ...prev,
                                commRows: {
                                  ...prev.commRows,
                                  [key]: { ...prev.commRows[key], number: e.target.value }
                                }
                              }))
                            }
                            className="w-full max-w-sm px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text)]"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={row.whatsapp}
                            onChange={(e) =>
                              setForm(prev => ({
                                ...prev,
                                commRows: {
                                  ...prev.commRows,
                                  [key]: { ...prev.commRows[key], whatsapp: e.target.checked }
                                }
                              }))
                            }
                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={row.sms}
                            onChange={(e) =>
                              setForm(prev => ({
                                ...prev,
                                commRows: {
                                  ...prev.commRows,
                                  [key]: { ...prev.commRows[key], sms: e.target.checked }
                                }
                              }))
                            }
                            className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-xs font-medium text-amber-600">
              {commCounts.waCount} numbers will get WhatsApp alerts, {commCounts.smsCount} numbers will get SMS alerts.
            </p>
          </div>
        )}

        {/* STEP 4: ACADEMIC INFORMATION */}
        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Class &amp; Section <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.classSection}
                onChange={(e) => setForm({ ...form, classSection: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              >
                <option value="">Choose class..</option>
                {classSectionOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[var(--text)]">
                  Education Board <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <button type="button" onClick={() => setAddingField('board')} className="text-[11px] font-semibold text-sky-600 hover:underline cursor-pointer">
                  Add New Board
                </button>
              </div>
              <select
                value={form.educationBoard}
                onChange={(e) => setForm({ ...form, educationBoard: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              >
                <option value="">Govt, Fed, or any..</option>
                {boards.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Custom Registration Number <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. REG-2026-001"
                value={form.customRegNo}
                onChange={(e) => setForm({ ...form, customRegNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              />
              <span className="text-[10px] text-[var(--text-muted)]">Your institute&apos;s own registration reference</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">System Admission Number</label>
              <input
                type="text"
                disabled
                value={`Auto-generated on save (ED-${new Date().getFullYear()}-...)`}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-slate-100 text-xs text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-[var(--text-muted)]">System-generated — cannot be edited</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Admission Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Dormitory / Hostel <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <select
                value={form.hostelId}
                onChange={(e) => setForm({ ...form, hostelId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              >
                <option value="">Select if applicable..</option>
                {hostelsList.map(h => (
                  <option key={h.id} value={h.id}>{h.hostelName} — Room {h.roomNumber}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Room / Bed Number <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Room 5, Bed 2"
                value={form.roomBedNumber}
                onChange={(e) => setForm({ ...form, roomBedNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                Sport House <span className="text-[var(--text-muted)] font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Red House"
                value={form.sportHouse}
                onChange={(e) => setForm({ ...form, sportHouse: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              />
            </div>
          </div>
        )}

        {/* STEP 5: FEE SETUP */}
        {step === 5 && (
          <div className="space-y-5">
            <div className="max-w-md">
              <label className="block text-xs font-semibold text-[var(--text)] mb-1">Regular class voucher duration</label>
              <select
                value={form.voucherDuration}
                onChange={(e) => setForm({ ...form, voucherDuration: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
              >
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Bi-Annual">Bi-Annual</option>
                <option value="Annual">Annual</option>
                <option value="One-Time">One-Time</option>
              </select>
              <span className="text-[11px] text-[var(--text-muted)]">How often this student is billed.</span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text)]">Fee items for regular invoices</span>
                <button
                  type="button"
                  onClick={() =>
                    setForm(prev => ({
                      ...prev,
                      feeItems: [...prev.feeItems, { id: `fi-${Date.now()}`, feeType: '', amount: '' }]
                    }))
                  }
                  className="px-3 py-1.5 rounded-lg border border-sky-400 text-sky-600 hover:bg-sky-50 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add fee item</span>
                </button>
              </div>

              <div className="space-y-2">
                {form.feeItems.map((fi, idx) => (
                  <div key={fi.id} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                    <div className="sm:col-span-9">
                      {idx === 0 && <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">FEE / CHARGE TYPE</label>}
                      <select
                        value={fi.feeType}
                        onChange={(e) =>
                          setForm(prev => ({
                            ...prev,
                            feeItems: prev.feeItems.map(item => item.id === fi.id ? { ...item, feeType: e.target.value } : item)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                      >
                        <option value="">Select..</option>
                        {DEFAULT_FEE_TYPES.map(ft => <option key={ft} value={ft}>{ft}</option>)}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      {idx === 0 && <label className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">AMOUNT (PKR)</label>}
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                        value={fi.amount}
                        onChange={(e) =>
                          setForm(prev => ({
                            ...prev,
                            feeItems: prev.feeItems.map(item => item.id === fi.id ? { ...item, amount: e.target.value } : item)
                          }))
                        }
                        className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end pt-4 sm:pt-0">
                      <button
                        type="button"
                        disabled={form.feeItems.length <= 1}
                        onClick={() =>
                          setForm(prev => ({
                            ...prev,
                            feeItems: prev.feeItems.filter(item => item.id !== fi.id)
                          }))
                        }
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-30"
                        title="Remove fee item"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Discount amount <span className="text-[var(--text-muted)] font-normal">(PKR)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.discountAmount}
                  onChange={(e) => setForm({ ...form, discountAmount: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">Regular Net voucher amount</label>
                <div className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-slate-50 text-xs sm:text-sm font-bold text-slate-900">
                  {feeSummary.net > 0 ? `PKR ${feeSummary.net.toLocaleString()}` : '—'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Referral source <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Parent referral, walk-in"
                  value={form.referralSource}
                  onChange={(e) => setForm({ ...form, referralSource: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text)] mb-1">
                  Additional notes <span className="text-[var(--text-muted)] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Discount approved by principal"
                  value={form.additionalNotes}
                  onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs sm:text-sm text-[var(--text)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Step Controls */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border)]">
          <button
            type="button"
            disabled={step === 1}
            onClick={() => setStep(prev => Math.max(1, prev - 1))}
            className="px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs font-semibold text-[var(--text)] hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>{submitting ? (isEditMode ? 'Updating...' : 'Submitting...') : (isEditMode ? 'Update student' : 'Submit form')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default EnrollStudentView
