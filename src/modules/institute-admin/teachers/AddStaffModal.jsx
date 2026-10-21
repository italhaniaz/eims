import React, { useState, useMemo, useRef } from 'react'
import { 
  X, 
  Camera, 
  Check, 
  AlertTriangle, 
  AlertCircle, 
  Upload, 
  RefreshCw, 
  User, 
  Briefcase, 
  GraduationCap, 
  FileCheck, 
  CreditCard,
  Building2,
  DollarSign,
  Calendar,
  Layers,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import Modal from '../../../components/common/Modal'
import { useToast } from '../../../context/ToastContext'
import { detectProgramLevel } from '../../../constants/academicLevels'

export const AddStaffModal = ({
  isOpen,
  onClose,
  editingStaff = null,
  classes = [],
  teachers = [],
  currentInstitute,
  onSaveStaff
}) => {
  const { toast } = useToast()
  const photoInputRef = useRef(null)
  const [activeStep, setActiveStep] = useState(1) // 1: Personal, 2: Job, 3: Academic, 4: Documents, 5: Payroll
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Auto-generate next unique sequential Employee ID starting at 1
  const autoEmpId = useMemo(() => {
    if (editingStaff?.empId) return editingStaff.empId
    const existingNums = teachers.map(t => {
      const match = String(t.empId || '').match(/([0-9]+)$/)
      return match ? parseInt(match[1], 10) : 0
    }).filter(n => !isNaN(n) && n > 0)
    const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0
    return `EMP-${String(maxNum + 1).padStart(3, '0')}`
  }, [teachers, editingStaff])

  // Initial Clean Form State (All select dropdowns start as "" / unselected!)
  const initialFormState = {
    // 1. Personal
    name: '',
    fatherHusbandName: '',
    dob: '',
    gender: '', // starts empty!
    cnic: '',
    phone: '',
    whatsapp: '',
    sameAsPhone: true,
    email: '',
    address: '',
    city: 'Lahore',
    photoUrl: null,
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',

    // 2. Job
    empId: autoEmpId,
    category: 'Teaching', // 'Teaching' | 'Non-Teaching'
    level: 'school', // 'school' | 'college' | 'university'
    department: '', // starts empty!
    designation: '', // starts empty!
    employmentType: '', // starts empty!
    joiningDate: '',
    probationEndDate: '',
    contractEndDate: '',
    reportingTo: 'Principal / Head of Institute',
    status: 'Active', // 'Active' | 'Probation' | 'On Leave'

    // 3. Academic & Workload (Teaching only)
    highestQualification: '', // starts empty!
    specialization: '',
    subjectsCanTeach: [],
    experienceYears: '',
    isClassTeacher: false,
    classTeacherClass: '',
    classTeacherSection: '',
    isHod: false,
    maxPeriodsPerWeek: 24, // or credit hours
    assignedSubjects: [], // [{ subject: '', className: '', section: '', periods: 4 }]
    availabilityDays: 'Monday - Friday',

    // 4. Documents Checklist
    documents: {
      cnicCopy: false,
      degreesCopy: false,
      experienceCert: false,
      photos: false,
      policeVerification: false,
      signedAgreement: false
    },

    // 5. Payroll
    salaryType: 'Monthly Fixed', // 'Monthly Fixed' | 'Visiting Per-Lecture'
    basicSalary: '',
    houseRent: '',
    medicalAllowance: '',
    transportAllowance: '',
    otherAllowance: '',
    deductionEobi: '1500',
    deductionTax: '',
    deductionLoan: '0',
    perLectureRate: '2500',
    lecturesPerMonth: '20',
    bankName: '',
    bankAccount: '', // IBAN
    paymentMethod: 'Bank Transfer'
  }

  const [formData, setFormData] = useState(() => {
    if (editingStaff) {
      return {
        ...initialFormState,
        ...editingStaff,
        documents: { ...initialFormState.documents, ...(editingStaff.documents || {}) }
      }
    }
    return initialFormState
  })

  const [formErrors, setFormErrors] = useState({})

  // Format Pakistani Phone: +92 3XX XXXXXXX
  const formatPhoneNumber = (val = '') => {
    const cleaned = val.replace(/[^0-9+]/g, '')
    if (cleaned.startsWith('03')) {
      return '+92 ' + cleaned.slice(1, 4) + ' ' + cleaned.slice(4, 11)
    }
    if (cleaned.startsWith('+92')) {
      const rest = cleaned.slice(3).replace(/\s/g, '')
      if (rest.length > 3) {
        return '+92 ' + rest.slice(0, 3) + ' ' + rest.slice(3, 10)
      }
      return '+92 ' + rest
    }
    return cleaned
  }

  // Format Pakistani CNIC: 35201-1234567-1
  const formatCnicNumber = (val = '') => {
    const digits = val.replace(/[^0-9]/g, '').slice(0, 13)
    if (digits.length > 12) {
      return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`
    }
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`
    }
    return digits
  }

  // Duplicate Check for CNIC & Phone
  const duplicateWarning = useMemo(() => {
    if (!formData.cnic && !formData.phone) return null
    const cleanCnic = formData.cnic.trim()
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '')

    const match = teachers.find(t => {
      if (editingStaff && t.id === editingStaff.id) return false
      if (cleanCnic && t.cnic && t.cnic.trim() === cleanCnic) return true
      const tPhone = (t.phone || '').replace(/[^0-9]/g, '')
      if (cleanPhone && cleanPhone.length >= 10 && tPhone === cleanPhone) return true
      return false
    })
    return match || null
  }, [formData.cnic, formData.phone, teachers, editingStaff])

  // Single Class Teacher Conflict Check
  const classTeacherConflict = useMemo(() => {
    if (!formData.isClassTeacher || !formData.classTeacherClass) return null
    const targetClass = formData.classTeacherClass
    const targetSection = formData.classTeacherSection || 'A'

    const conflictingTeacher = teachers.find(t => {
      if (editingStaff && t.id === editingStaff.id) return false
      if (t.isClassTeacher && t.classTeacherClass === targetClass) {
        if (!t.classTeacherSection || t.classTeacherSection === targetSection) {
          return true
        }
      }
      return false
    })

    return conflictingTeacher || null
  }, [formData.isClassTeacher, formData.classTeacherClass, formData.classTeacherSection, teachers, editingStaff])

  // Step Validation Handlers
  const validateStep = (step) => {
    const errors = {}

    if (step === 1) {
      if (!formData.name?.trim()) errors.name = 'Full name is required.'
      if (!formData.fatherHusbandName?.trim()) errors.fatherHusbandName = "Father / Husband name is required."
      if (!formData.dob) {
        errors.dob = 'Date of birth is required.'
      } else {
        const birthDate = new Date(formData.dob)
        const today = new Date()
        let age = today.getFullYear() - birthDate.getFullYear()
        const m = today.getMonth() - birthDate.getMonth()
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
        if (age < 18) errors.dob = 'Staff member must be at least 18 years of age.'
      }
      if (!formData.gender) errors.gender = 'Please select gender.'
      if (!formData.cnic?.trim()) {
        errors.cnic = 'CNIC number is required.'
      } else if (!/^[0-9]{5}-[0-9]{7}-[0-9]{1}$/.test(formData.cnic.trim())) {
        errors.cnic = 'CNIC format must be 35201-1234567-1.'
      }
      if (!formData.phone?.trim()) {
        errors.phone = 'Phone number is required.'
      } else if (formData.phone.replace(/[^0-9]/g, '').length < 10) {
        errors.phone = 'Enter valid Pakistani phone (e.g. +92 3XX XXXXXXX).'
      }
      if (!formData.email?.trim()) {
        errors.email = 'Email address is required.'
      }
      if (!formData.address?.trim()) errors.address = 'Residential address is required.'
    }

    if (step === 2) {
      if (!formData.department) errors.department = 'Please select a department.'
      if (!formData.designation) errors.designation = 'Please select a designation.'
      if (!formData.employmentType) errors.employmentType = 'Please select employment type.'
      if (!formData.joiningDate) {
        errors.joiningDate = 'Joining date is required.'
      } else if (new Date(formData.joiningDate) > new Date()) {
        errors.joiningDate = 'Joining date cannot be in the future.'
      }
    }

    if (step === 3 && formData.category === 'Teaching') {
      if (!formData.highestQualification) errors.highestQualification = 'Highest qualification is required.'
      if (!formData.specialization?.trim()) errors.specialization = 'Subject specialization is required.'
      if (formData.isClassTeacher) {
        if (!formData.classTeacherClass) errors.classTeacherClass = 'Please select class assigned.'
        if (classTeacherConflict) {
          errors.classTeacherClass = `${formData.classTeacherClass} is already assigned to ${classTeacherConflict.name}.`
        }
      }
    }

    if (step === 5) {
      if (formData.salaryType === 'Monthly Fixed') {
        if (!formData.basicSalary || Number(formData.basicSalary) <= 0) {
          errors.basicSalary = 'Basic salary must be greater than 0.'
        }
      } else {
        if (!formData.perLectureRate || Number(formData.perLectureRate) <= 0) {
          errors.perLectureRate = 'Per-lecture rate is required for visiting faculty.'
        }
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Handle Next
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      if (activeStep === 2 && formData.category === 'Non-Teaching') {
        // Skip Academic step for Non-Teaching staff
        setActiveStep(4)
      } else {
        setActiveStep(prev => Math.min(5, prev + 1))
      }
    } else {
      toast.error('Please resolve the required fields before proceeding.')
    }
  }

  // Handle Photo Upload with 2MB check
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG, or WEBP portrait images are allowed.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo size exceeds 2MB limit.')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      setFormData(prev => ({ ...prev, photoUrl: evt.target.result }))
      setIsFormDirty(true)
      toast.info('Staff passport photo uploaded.')
    }
    reader.readAsDataURL(file)
  }

  // Submit Handler
  const handleSubmit = async (mode = 'save') => {
    // Validate current step
    if (!validateStep(activeStep)) {
      toast.error('Please complete all required fields.')
      return
    }

    // Verify critical steps
    if (!validateStep(1) || !validateStep(2)) {
      toast.error('Incomplete information in Personal or Job step.')
      return
    }

    if (duplicateWarning) {
      toast.error('Duplicate CNIC or Phone number detected. Each staff record must be unique.')
      return
    }

    if (formData.isClassTeacher && classTeacherConflict) {
      toast.error(`Class Teacher Conflict: ${classTeacherConflict.name} is already assigned to this class.`)
      return
    }

    setIsSubmitting(true)
    try {
      // Calculate Net Salary
      const basic = Number(formData.basicSalary) || 0
      const hRent = Number(formData.houseRent) || 0
      const med = Number(formData.medicalAllowance) || 0
      const trans = Number(formData.transportAllowance) || 0
      const other = Number(formData.otherAllowance) || 0
      const gross = basic + hRent + med + trans + other

      const eobi = Number(formData.deductionEobi) || 0
      const tax = Number(formData.deductionTax) || 0
      const loan = Number(formData.deductionLoan) || 0
      const totalDeductions = eobi + tax + loan

      const netSalary = formData.salaryType === 'Visiting Per-Lecture'
        ? (Number(formData.perLectureRate) * Number(formData.lecturesPerMonth))
        : Math.max(0, gross - totalDeductions)

      const payload = {
        ...formData,
        empId: formData.empId || autoEmpId,
        grossSalary: gross,
        totalDeductions: totalDeductions,
        netSalary: netSalary,
        instituteId: currentInstitute?.id || 'inst-1',
        updatedAt: new Date().toISOString()
      }

      if (onSaveStaff) {
        await onSaveStaff(payload, Boolean(editingStaff))
      }

      setIsFormDirty(false)

      if (mode === 'addAnother') {
        setFormData({
          ...initialFormState,
          empId: `EMP-${String(parseInt(autoEmpId.replace(/[^0-9]/g, '')) + 1).padStart(3, '0')}`
        })
        setActiveStep(1)
        toast.info('Ready to register next staff member.')
      } else {
        onClose()
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to save staff record. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Level-Adaptive Designations
  const availableDesignations = useMemo(() => {
    if (formData.category === 'Non-Teaching') {
      return [
        'Registrar / Admin Officer',
        'Accounts & Finance Officer',
        'Librarian',
        'IT Lab Engineer / Technician',
        'Campus Security Supervisor',
        'Transport Incharge',
        'Office Assistant',
        'Medical Nurse'
      ]
    }
    if (formData.level === 'college') {
      return [
        'Lecturer',
        'Senior Lecturer',
        'Assistant Professor',
        'Associate Professor',
        'Vice Principal',
        'Principal (College Wing)',
        'Visiting Lecturer'
      ]
    }
    if (formData.level === 'university') {
      return [
        'Lecturer',
        'Assistant Professor',
        'Associate Professor',
        'Professor',
        'Head of Department (HOD)',
        'Dean of Faculty',
        'Visiting Faculty / Adjunct'
      ]
    }
    // School default
    return [
      'Primary School Teacher (PST)',
      'Elementary School Teacher (EST)',
      'Secondary School Teacher (SST)',
      'Senior Subject Teacher',
      'Headmaster / Headmistress',
      'Vice Principal',
      'Principal'
    ]
  }, [formData.category, formData.level])

  // Departments List
  const availableDepartments = [
    'Sciences',
    'Computer Science & IT',
    'Mathematics',
    'English & Linguistics',
    'Urdu & Regional Languages',
    'Islamiyat & Ethics',
    'Social Sciences & Pakistan Studies',
    'Commerce & Accounting',
    'Administration & Human Resources',
    'Finance & Accounts',
    'Campus Security & Transport',
    'Physical Education & Sports'
  ]

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (isFormDirty) setIsDiscardConfirmOpen(true)
        else onClose()
      }}
      title={editingStaff ? `Edit Staff Member: ${editingStaff.name}` : "Add Staff Member"}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Stepper Progress Bar */}
        <div className="border-b border-slate-200 pb-3">
          <div className="flex items-center justify-between mb-2">
            {[
              { num: 1, label: 'Personal', icon: User },
              { num: 2, label: 'Job Details', icon: Briefcase },
              { num: 3, label: 'Academic & Workload', icon: GraduationCap, disabled: formData.category === 'Non-Teaching' },
              { num: 4, label: 'Documents', icon: FileCheck },
              { num: 5, label: 'Payroll', icon: CreditCard }
            ].map(step => {
              if (step.disabled) return null
              const isCurrent = activeStep === step.num
              const isCompleted = activeStep > step.num

              return (
                <button
                  key={step.num}
                  type="button"
                  onClick={() => {
                    if (step.num < activeStep || validateStep(activeStep)) {
                      setActiveStep(step.num)
                    }
                  }}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isCurrent 
                      ? 'text-emerald-700' 
                      : isCompleted 
                        ? 'text-slate-700 hover:text-emerald-600' 
                        : 'text-slate-400'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                    isCurrent 
                      ? 'bg-emerald-600 text-white shadow-2xs' 
                      : isCompleted 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </span>
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              )
            })}
          </div>

          <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(activeStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Duplicate Alert Banner */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-center gap-2 text-xs text-amber-900 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>DUPLICATE WARNING:</strong> A staff member with matching CNIC or phone already exists ({duplicateWarning.name} - {duplicateWarning.empId} in {duplicateWarning.department}).
            </span>
          </div>
        )}

        {/* STEP 1: PERSONAL DETAILS */}
        {activeStep === 1 && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            {/* Photo Upload with 2MB check */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-slate-200 border-2 border-dashed border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 relative">
                {formData.photoUrl ? (
                  <img src={formData.photoUrl} alt="Staff" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-800 block text-xs">Staff Passport Photo (ID Card & Dossier)</span>
                <span className="text-[11px] text-slate-500 block mb-1.5">Max 2MB • JPG or PNG • Professional framing</span>
                <input
                  type="file"
                  ref={photoInputRef}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded text-xs cursor-pointer shadow-2xs"
                >
                  Upload Photo
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Shahida Parveen"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.name) setFormErrors({ ...formErrors, name: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white focus:outline-none ${
                    formErrors.name ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.name && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Father / Husband Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Father / Husband Name"
                  value={formData.fatherHusbandName}
                  onChange={(e) => {
                    setFormData({ ...formData, fatherHusbandName: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.fatherHusbandName) setFormErrors({ ...formErrors, fatherHusbandName: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white focus:outline-none ${
                    formErrors.fatherHusbandName ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.fatherHusbandName && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.fatherHusbandName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Date of Birth (Age &ge; 18) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dob}
                  onChange={(e) => {
                    setFormData({ ...formData, dob: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.dob) setFormErrors({ ...formErrors, dob: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    formErrors.dob ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.dob && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.dob}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => {
                    setFormData({ ...formData, gender: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.gender) setFormErrors({ ...formErrors, gender: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-medium ${
                    formErrors.gender ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.gender}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  National CNIC Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="35201-1234567-1"
                  value={formData.cnic}
                  onChange={(e) => {
                    setFormData({ ...formData, cnic: formatCnicNumber(e.target.value) })
                    setIsFormDirty(true)
                    if (formErrors.cnic) setFormErrors({ ...formErrors, cnic: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-mono ${
                    formErrors.cnic ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.cnic && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.cnic}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Calling Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.phone}
                  onChange={(e) => {
                    const formatted = formatPhoneNumber(e.target.value)
                    setFormData({
                      ...formData,
                      phone: formatted,
                      whatsapp: formData.sameAsPhone ? formatted : formData.whatsapp
                    })
                    setIsFormDirty(true)
                    if (formErrors.phone) setFormErrors({ ...formErrors, phone: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-mono ${
                    formErrors.phone ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.phone && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.phone}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] font-bold text-slate-700 uppercase">WhatsApp</label>
                  <label className="text-[9px] text-slate-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.sameAsPhone}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData({
                          ...formData,
                          sameAsPhone: checked,
                          whatsapp: checked ? formData.phone : formData.whatsapp
                        })
                      }}
                      className="rounded border-slate-300 text-emerald-600"
                    />
                    <span>Same as phone</span>
                  </label>
                </div>
                <input
                  type="tel"
                  disabled={formData.sameAsPhone}
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: formatPhoneNumber(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Official Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="faculty@sms.edu.pk"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.email) setFormErrors({ ...formErrors, email: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    formErrors.email ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.email && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Residential Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street address, house no, area..."
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.address) setFormErrors({ ...formErrors, address: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    formErrors.address ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.address && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.address}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="text-[11px] font-bold text-slate-800 uppercase block">Emergency Next of Kin Contact</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <input
                    type="text"
                    placeholder="Emergency Contact Name"
                    value={formData.emergencyName}
                    onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Relationship (e.g. Spouse, Brother)"
                    value={formData.emergencyRelation}
                    onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Emergency Phone Number"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: formatPhoneNumber(e.target.value) })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: JOB & INSTITUTIONAL APPOINTMENT */}
        {activeStep === 2 && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            {/* Category Switcher: Teaching vs Non-Teaching */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Staff Role Category</span>
                <span className="text-[11px] text-slate-500">Differentiates academic faculty from administrative personnel</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 font-bold text-xs">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'Teaching' })}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    formData.category === 'Teaching' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Teaching Faculty
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, category: 'Non-Teaching' })}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    formData.category === 'Non-Teaching' ? 'bg-slate-800 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Non-Teaching Staff
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Employee ID (Auto)</label>
                <input
                  type="text"
                  readOnly
                  value={formData.empId}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-100 font-mono font-black text-slate-800 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Educational Tier / Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => {
                    setFormData({ ...formData, level: e.target.value, designation: '' })
                    setIsFormDirty(true)
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="school">Primary & Secondary School</option>
                  <option value="college">Higher Secondary / College Wing</option>
                  <option value="university">University / Higher Education</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Department <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.department}
                  onChange={(e) => {
                    setFormData({ ...formData, department: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.department) setFormErrors({ ...formErrors, department: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-bold ${
                    formErrors.department ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Department --</option>
                  {availableDepartments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.department && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.department}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Designation / Role Title <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.designation}
                  onChange={(e) => {
                    setFormData({ ...formData, designation: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.designation) setFormErrors({ ...formErrors, designation: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-bold ${
                    formErrors.designation ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Designation --</option>
                  {availableDesignations.map(des => (
                    <option key={des} value={des}>{des}</option>
                  ))}
                </select>
                {formErrors.designation && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.designation}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Employment Engagement Type <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.employmentType}
                  onChange={(e) => {
                    const nextVal = e.target.value
                    setFormData({
                      ...formData,
                      employmentType: nextVal,
                      salaryType: nextVal === 'Visiting' ? 'Visiting Per-Lecture' : 'Monthly Fixed'
                    })
                    setIsFormDirty(true)
                    if (formErrors.employmentType) setFormErrors({ ...formErrors, employmentType: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-bold ${
                    formErrors.employmentType ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Employment Type --</option>
                  <option value="Permanent">Permanent Faculty</option>
                  <option value="Contract">Contractual (Fixed Term)</option>
                  <option value="Part-time">Part-Time</option>
                  <option value="Visiting">Visiting Faculty</option>
                </select>
                {formErrors.employmentType && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.employmentType}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Date of Joining <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.joiningDate}
                  onChange={(e) => {
                    setFormData({ ...formData, joiningDate: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.joiningDate) setFormErrors({ ...formErrors, joiningDate: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    formErrors.joiningDate ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.joiningDate && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.joiningDate}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Probation End Date</label>
                <input
                  type="date"
                  value={formData.probationEndDate}
                  onChange={(e) => setFormData({ ...formData, probationEndDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Contract Expiry Date</label>
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Reporting Supervisor</label>
                <input
                  type="text"
                  value={formData.reportingTo}
                  onChange={(e) => setFormData({ ...formData, reportingTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Staff Employment Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value="Active">Active Duty</option>
                  <option value="Probation">On Probation</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: ACADEMIC QUALIFICATION & TEACHING WORKLOAD */}
        {activeStep === 3 && formData.category === 'Teaching' && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Highest Degree Qualification <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.highestQualification}
                  onChange={(e) => {
                    setFormData({ ...formData, highestQualification: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.highestQualification) setFormErrors({ ...formErrors, highestQualification: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white font-bold ${
                    formErrors.highestQualification ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                >
                  <option value="">-- Select Qualification --</option>
                  <option value="PhD / Doctorate">PhD / Doctorate</option>
                  <option value="M.Phil / MS (18 Years)">M.Phil / MS (18 Years)</option>
                  <option value="Master Degree (MA / MSc)">Master Degree (MA / MSc)</option>
                  <option value="BS / Bachelor (16 Years)">BS / Bachelor (16 Years)</option>
                  <option value="B.Ed / M.Ed">B.Ed / M.Ed Certified</option>
                </select>
                {formErrors.highestQualification && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.highestQualification}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  Subject Specialization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Theoretical Physics / Calculus"
                  value={formData.specialization}
                  onChange={(e) => {
                    setFormData({ ...formData, specialization: e.target.value })
                    setIsFormDirty(true)
                    if (formErrors.specialization) setFormErrors({ ...formErrors, specialization: null })
                  }}
                  className={`w-full px-3 py-2 rounded-lg border bg-white ${
                    formErrors.specialization ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                  }`}
                />
                {formErrors.specialization && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.specialization}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Teaching Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            {/* Class Teacher Allocation with Single Class Teacher Constraint */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Class Teacher Mentorship Assignment</span>
                  <span className="text-[10px] text-slate-500">Each class section can have strictly ONE primary class teacher</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    checked={formData.isClassTeacher}
                    onChange={(e) => {
                      setFormData({ ...formData, isClassTeacher: e.target.checked })
                      setIsFormDirty(true)
                    }}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Assign as Class Teacher</span>
                </label>
              </div>

              {formData.isClassTeacher && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                      Target Class <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.classTeacherClass}
                      onChange={(e) => {
                        setFormData({ ...formData, classTeacherClass: e.target.value })
                        setIsFormDirty(true)
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map(c => (
                        <option key={c.id || c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Assigned Section</label>
                    <select
                      value={formData.classTeacherSection}
                      onChange={(e) => setFormData({ ...formData, classTeacherSection: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>

                  {classTeacherConflict && (
                    <div className="sm:col-span-2 p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-900 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>
                        <strong>ASSIGNMENT CONFLICT:</strong> Class {formData.classTeacherClass} (Sec {formData.classTeacherSection || 'A'}) is already assigned to <strong>{classTeacherConflict.name}</strong> ({classTeacherConflict.empId}). Only one Class Teacher permitted per section.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weekly Teaching Workload Constraint */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                  {formData.level === 'university' ? 'Weekly Credit Hours Workload' : 'Max Periods Per Week'}
                </label>
                <input
                  type="number"
                  min="4"
                  max="40"
                  value={formData.maxPeriodsPerWeek}
                  onChange={(e) => setFormData({ ...formData, maxPeriodsPerWeek: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Teaching Days Availability</label>
                <input
                  type="text"
                  value={formData.availabilityDays}
                  onChange={(e) => setFormData({ ...formData, availabilityDays: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: MANDATORY DOCUMENTS CHECKLIST */}
        {activeStep === 4 && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            <p className="text-slate-500">
              Verify credentials and records submitted by the faculty member for HR dossier compliance:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: 'cnicCopy', label: 'NADRA CNIC Copy', desc: 'Valid Pakistani National Identity Card' },
                { key: 'degreesCopy', label: 'Attested Degrees & Transcripts', desc: 'HEC / IBCC certified documentation' },
                { key: 'experienceCert', label: 'Experience Certificates', desc: 'Relieving letters from prior institutions' },
                { key: 'photos', label: 'Four (4) Passport Photographs', desc: 'Formal blue background' },
                { key: 'policeVerification', label: 'Police Character Verification', desc: 'District police clearance' },
                { key: 'signedAgreement', label: 'Signed Appointment Agreement', desc: 'Countersigned terms of employment' }
              ].map(item => {
                const isChecked = Boolean(formData.documents?.[item.key])

                return (
                  <div
                    key={item.key}
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        documents: { ...prev.documents, [item.key]: !isChecked }
                      }))
                      setIsFormDirty(true)
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isChecked 
                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950' 
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="mt-0.5 rounded border-slate-300 text-emerald-600 pointer-events-none"
                    />
                    <div>
                      <strong className="block font-bold text-xs">{item.label}</strong>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{item.desc}</span>
                      <span className={`inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        isChecked ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isChecked ? 'Verified / Received' : 'Pending Document'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* STEP 5: PAYROLL, SALARY & COMPENSATION */}
        {activeStep === 5 && (
          <div className="space-y-4 text-xs animate-in fade-in duration-150">
            {/* Compensation Mode Switcher */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Salary Disbursement Model</span>
                <span className="text-[10px] text-slate-500">Regular monthly package vs per-lecture rate for visiting faculty</span>
              </div>
              <select
                value={formData.salaryType}
                onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-xs"
              >
                <option value="Monthly Fixed">Monthly Fixed Salary</option>
                <option value="Visiting Per-Lecture">Visiting Faculty (Per-Lecture)</option>
              </select>
            </div>

            {formData.salaryType === 'Monthly Fixed' ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    Earnings & Allowances (PKR)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Basic Pay <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="e.g. 65000"
                        value={formData.basicSalary}
                        onChange={(e) => {
                          setFormData({ ...formData, basicSalary: e.target.value })
                          setIsFormDirty(true)
                          if (formErrors.basicSalary) setFormErrors({ ...formErrors, basicSalary: null })
                        }}
                        className={`w-full px-3 py-1.5 rounded-lg border font-bold bg-white ${
                          formErrors.basicSalary ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                        }`}
                      />
                      {formErrors.basicSalary && <p className="text-[10px] text-rose-600 mt-0.5">{formErrors.basicSalary}</p>}
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">House Rent Allowance</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 15000"
                        value={formData.houseRent}
                        onChange={(e) => setFormData({ ...formData, houseRent: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Medical Allowance</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 5000"
                        value={formData.medicalAllowance}
                        onChange={(e) => setFormData({ ...formData, medicalAllowance: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Transport / Conveyance Allowance</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 5000"
                        value={formData.transportAllowance}
                        onChange={(e) => setFormData({ ...formData, transportAllowance: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Other Special Allowances</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 0"
                        value={formData.otherAllowance}
                        onChange={(e) => setFormData({ ...formData, otherAllowance: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                    Statutory Deductions (PKR)
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">EOBI / Pension Fund</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.deductionEobi}
                        onChange={(e) => setFormData({ ...formData, deductionEobi: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Income Tax Withholding</label>
                      <input
                        type="number"
                        min="0"
                        placeholder="e.g. 2000"
                        value={formData.deductionTax}
                        onChange={(e) => setFormData({ ...formData, deductionTax: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Loan / Salary Advance</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.deductionLoan}
                        onChange={(e) => setFormData({ ...formData, deductionLoan: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Visiting Per-Lecture Model */
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                <span className="font-bold text-amber-950 block text-xs">Visiting Faculty Lecture-Based Compensation</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">
                      Rate Per Delivered Lecture (PKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="500"
                      value={formData.perLectureRate}
                      onChange={(e) => setFormData({ ...formData, perLectureRate: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-amber-900 uppercase mb-1">Estimated Lectures / Month</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.lecturesPerMonth}
                      onChange={(e) => setFormData({ ...formData, lecturesPerMonth: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-amber-300 bg-white font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bank Details */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                Disbursement Bank Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    <option value="Bank Transfer">Electronic Bank Transfer</option>
                    <option value="Cash">Cash at Accounts Counter</option>
                    <option value="Cheque">Bank Cross Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Bank Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Habib Bank Limited / Meezan"
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Account / IBAN</label>
                  <input
                    type="text"
                    placeholder="PK72HABB000192837465"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Wizard Navigation Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t">
          <div>
            {activeStep > 1 && (
              <button
                type="button"
                onClick={() => {
                  if (activeStep === 4 && formData.category === 'Non-Teaching') {
                    setActiveStep(2)
                  } else {
                    setActiveStep(prev => Math.max(1, prev - 1))
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Previous Step
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (isFormDirty) setIsDiscardConfirmOpen(true)
                else onClose()
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>

            {activeStep < 5 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1 cursor-pointer"
              >
                <span>Continue</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                {!editingStaff && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit('addAnother')}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs cursor-pointer disabled:opacity-50"
                  >
                    Save & Add Another
                  </button>
                )}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit('save')}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingStaff ? 'Update Staff Member' : 'Register Staff Member'}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      {isDiscardConfirmOpen && (
        <Modal
          isOpen={isDiscardConfirmOpen}
          onClose={() => setIsDiscardConfirmOpen(false)}
          title="Discard Unsaved Changes?"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-600">
              You have unsaved staff information. Leaving will discard all changes made in this form.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsDiscardConfirmOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Keep Editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDiscardConfirmOpen(false)
                  onClose()
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Discard & Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </Modal>
  )
}

export default AddStaffModal
