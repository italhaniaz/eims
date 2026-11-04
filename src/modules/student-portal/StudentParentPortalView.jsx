import React, { useState, useMemo, useEffect } from 'react'
import { 
  GraduationCap, 
  CalendarCheck, 
  Receipt, 
  Award, 
  Megaphone, 
  Clock, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  School, 
  Calendar,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  LogOut,
  FileText,
  Building2,
  Sparkles,
  Laptop,
  Briefcase,
  FileCheck,
  PhoneCall,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'

export const StudentParentPortalView = () => {
  const { user, logout, login } = useAuth()
  const { toast } = useToast()
  const { 
    students = [], 
    fees = [], 
    exams = [], 
    notices = [], 
    classes = [], 
    timetable = {}, 
    attendance = {} 
  } = useAppData()

  const tier = user?.tier || (user?.instituteType?.toLowerCase() === 'university' ? 'university' : user?.instituteType?.toLowerCase() === 'college' ? 'college' : 'school')
  const isSchool = tier === 'school'
  const isCollege = tier === 'college'
  const isUniversity = tier === 'university'
  const isApplicant = user?.role === 'applicant' || user?.role === 'uni_applicant'
  const isAlumni = user?.role === 'alumni' || user?.role === 'uni_alumni'
  const isParent = ['parent', 'school_parent', 'college_parent', 'uni_parent'].includes(user?.role)
  const isStudent = ['student', 'school_student', 'college_student', 'uni_student'].includes(user?.role)

  // Dynamic initial tab based on role and tier
  const [isGuardianPinModalOpen, setIsGuardianPinModalOpen] = useState(false)
  const [isSlipUploadModalOpen, setIsSlipUploadModalOpen] = useState(false)
  const [selectedFeeForUpload, setSelectedFeeForUpload] = useState(null)
  const [slipUploadForm, setSlipUploadForm] = useState({ bankBranch: "HBL Main Branch", depositDate: "2026-11-03", amount: 15000, fileAttached: true })
  const slipsStorageKey = `sms_uploaded_slips_${user?.id || 'portal'}`
  const [uploadedSlips, setUploadedSlips] = useState(() => {
    try {
      const saved = localStorage.getItem(slipsStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return {}
  })

  useEffect(() => {
    try {
      localStorage.setItem(slipsStorageKey, JSON.stringify(uploadedSlips))
    } catch {}
  }, [uploadedSlips, slipsStorageKey])

  const [isPtmBookModalOpen, setIsPtmBookModalOpen] = useState(false)
  const ptmStorageKey = `sms_booked_ptm_${user?.id || 'portal'}`
  const [bookedPtmSlot, setBookedPtmSlot] = useState(() => {
    try {
      const saved = localStorage.getItem(ptmStorageKey)
      if (saved) return JSON.parse(saved)
    } catch {}
    return { teacher: "Mrs. Nasreen Akhtar (Mathematics)", time: "09:30 AM - 09:45 AM" }
  })

  useEffect(() => {
    try {
      localStorage.setItem(ptmStorageKey, JSON.stringify(bookedPtmSlot))
    } catch {}
  }, [bookedPtmSlot, ptmStorageKey])
  const [guardianPinInput, setGuardianPinInput] = useState('')
  const [activeTab, setActiveTab] = useState(() => {
    if (isApplicant) return 'merit'
    if (isAlumni) return 'alumni_profile'
    if (isSchool && isParent) return 'diary'
    if (isCollege) return 'timetable'
    if (isUniversity) return 'registration'
    return 'overview'
  })

  // Match the student profile from central context based on user payload or fallback
  const studentProfile = useMemo(() => {
    const match = students.find(s => 
      (user?.studentId && s.id === user.studentId) ||
      (user?.studentId && s.rollNumber === user.studentId) ||
      (user?.email && s.email === user.email) ||
      (user?.wardRollNo && s.rollNumber === user.wardRollNo)
    )
    if (match) return match

    if (isSchool) {
      return {
        id: user?.studentId || 'CSM-2026-104',
        studentName: user?.wardName || user?.name || 'Hamza Farooq',
        rollNumber: user?.wardRollNo || user?.studentId || 'CSM-2026-104',
        className: user?.wardClass || user?.className || 'Grade 10 - Section A',
        section: 'Section A',
        campusName: 'City School Model Town Campus',
        fatherName: 'Farooq Ahmed',
        gender: 'Male',
        dob: '2010-04-12',
        emergencyContact: '+92 300 1234567',
        bloodGroup: 'B+',
        status: 'Active'
      }
    }

    if (isCollege) {
      return {
        id: user?.studentId || 'COL-24-101',
        studentName: user?.wardName || user?.name || 'Zainab Fatima',
        rollNumber: user?.wardRollNo || user?.studentId || 'COL-24-101',
        boardRollNo: '710429 (BISE Lahore)',
        className: user?.wardClass || user?.className || 'F.Sc Pre-Medical (Part II)',
        section: 'Pre-Med A',
        campusName: 'Roots International College & Academy',
        fatherName: 'Tariq Sheikh',
        gender: 'Female',
        dob: '2008-09-18',
        emergencyContact: '+92 321 9876543',
        bloodGroup: 'O+',
        status: 'Active'
      }
    }

    return {
      id: user?.studentId || 'BSCS-F23-018',
      studentName: user?.wardName || user?.name || 'Daniyal Qureshi',
      rollNumber: user?.wardRollNo || user?.studentId || 'BSCS-F23-018',
      className: user?.wardClass || user?.className || 'BS Computer Science - Semester 6',
      section: 'Cohort A',
      campusName: 'Institute of Applied Sciences & Undergraduates',
      fatherName: 'Qureshi Nadeem',
      gender: 'Male',
      dob: '2004-11-20',
      emergencyContact: '+92 333 4455667',
      bloodGroup: 'A+',
      cgpa: '3.72',
      status: 'Active'
    }
  }, [students, user, isSchool, isCollege])

  // Get fees for this student dynamically from live context
  const studentFees = useMemo(() => {
    const studentRoll = studentProfile?.rollNumber || user?.studentId || user?.wardRollNo || ''
    const studentName = studentProfile?.studentName || studentProfile?.name || user?.name || ''
    const liveStudentFees = (fees || []).filter(f => 
      (studentRoll && (f.rollNumber === studentRoll || f.studentRoll === studentRoll)) ||
      (studentName && f.studentName && f.studentName.toLowerCase() === studentName.toLowerCase())
    )

    if (liveStudentFees.length > 0) {
      return liveStudentFees.map((f, idx) => ({
        id: f.id || `fee-live-${idx}`,
        challanNo: f.challanNo || f.oneBillId || `CH-${String(f.id || '').slice(-6)}`,
        month: f.feeTitle || f.month || 'Current Session Fee',
        title: f.feeTitle || 'Tuition Fee Challan',
        amount: Number(f.amount || 15000),
        netPayable: Number(f.amount || 15000),
        concession: f.discountAmount ? `PKR ${f.discountAmount}` : 'Nil',
        dueDate: f.dueDate || '2026-11-10',
        status: f.status || 'Pending',
        paymentDate: f.paymentDate || null,
        paidVia: f.paidVia || (f.status === 'Paid' ? 'Online 1Link' : null)
      }))
    }

    if (isSchool) {
      return [
        { id: 'fee-sch-1', challanNo: 'CSM-OCT-892', month: 'October 2026', title: 'Monthly Tuition & Computer Lab Fee', amount: 16500, dueDate: '2026-10-25', status: 'Paid', paymentDate: '2026-10-18', paidVia: '1Link Online' },
        { id: 'fee-sch-2', challanNo: 'CSM-NOV-914', month: 'November 2026', title: 'Monthly Tuition & Sports Activity', amount: 16500, dueDate: '2026-11-10', status: 'Pending', paymentDate: null, paidVia: null }
      ]
    }
    if (isCollege) {
      return [
        { id: 'fee-col-1', challanNo: 'RIA-OCT-441', month: 'October 2026', title: 'Intermediate Tuition & BISE Practical Fund', amount: 24000, concession: 'PKR 4,000 (Merit Waiver)', netPayable: 20000, dueDate: '2026-10-25', status: 'Paid', paymentDate: '2026-10-20', paidVia: 'Bank Alfalah Challan' },
        { id: 'fee-col-2', challanNo: 'RIA-NOV-509', month: 'November 2026', title: 'Intermediate Tuition & Science Apparatus', amount: 24000, concession: 'PKR 4,000 (Merit Waiver)', netPayable: 20000, dueDate: '2026-11-10', status: 'Pending', paymentDate: null, paidVia: null }
      ]
    }
    return [
      { id: 'fee-uni-1', challanNo: '1LINK-IAS-2026-08', month: 'Fall 2026 Semester', title: 'Undergraduate Semester Tuition (18 Cr. Hrs)', amount: 98000, concession: 'PKR 15,000 (Dean’s Honor List)', netPayable: 83000, dueDate: '2026-10-15', status: 'Paid', paymentDate: '2026-10-10', paidVia: '1-Bill Sub-50ms KuickPay' },
      { id: 'fee-uni-2', challanNo: '1LINK-IAS-2027-01', month: 'Spring 2027 Semester', title: 'Semester Advance Registration Deposit', amount: 25000, concession: 'Nil', netPayable: 25000, dueDate: '2026-12-15', status: 'Pending', paymentDate: null, paidVia: null }
    ]
  }, [fees, studentProfile, user, isSchool, isCollege])

  // Attendance stats
  const attendanceStats = useMemo(() => {
    const totalDays = isSchool ? 50 : isCollege ? 46 : 42
    const presentDays = isSchool ? 48 : isCollege ? 42 : 39
    const percentage = Math.round((presentDays / totalDays) * 100)
    return {
      totalDays,
      presentDays,
      leaveDays: 2,
      absentDays: totalDays - presentDays - 2,
      percentage,
      isShortage: percentage < 75
    }
  }, [isSchool, isCollege])

  // School Homework Diary Entries
  const diaryEntries = [
    { id: 'dia-1', date: '2026-10-31 (Today)', subject: 'Mathematics', teacher: 'Sir Salman Ahmed', task: 'Complete Exercise 4.2 Questions 5 through 12 in homework notebook.', status: 'Completed' },
    { id: 'dia-2', date: '2026-10-31 (Today)', subject: 'Physics', teacher: 'Syed Ali Raza', task: 'Revise Snell’s Law and solve numerical problems 3 & 4 on page 112.', status: 'Pending' },
    { id: 'dia-3', date: '2026-10-30', subject: 'English Literature', teacher: 'Ms. Amina Batool', task: 'Write an essay of 200 words on "Digital Technology in Everyday Life".', status: 'Checked by Teacher' }
  ]

  // School PTM Appointments
  const ptmSlots = [
    { id: 'ptm-1', term: 'Mid-Term Parent-Teacher Meeting (PTM)', date: 'Saturday, Nov 15, 2026', timeSlot: '10:30 AM - 11:00 AM', teacher: 'Sir Salman Ahmed (Class Incharge)', venue: 'Room 14, Secondary Wing', status: 'Confirmed' }
  ]

  // College BISE Board Slips & Registration (Dynamic per student profile)
  const collegeBoardData = {
    boardName: 'Board of Intermediate and Secondary Education (BISE) Lahore',
    candidateName: studentProfile?.studentName || 'Zainab Fatima',
    boardRollNo: studentProfile?.rollNumber ? (String(studentProfile.rollNumber).replace(/[^0-9]/g, '') || '710429') : '710429',
    enrollmentNo: 'BISE-LHR-2024-HSSC-' + (studentProfile?.rollNumber ? String(studentProfile.rollNumber).replace(/[^0-9]/g, '').slice(-5) : '88190'),
    centerName: 'Govt. Model College for Women, Hall A, Lahore',
    practicalCenter: 'Govt. Model College Chemistry & Bio Labs',
    status: 'Verified & Roll Number Slip Issued'
  }

  // University Course Registration Data
  const uniCourses = [
    { code: 'CS-301', title: 'Design & Analysis of Algorithms', cr: 3, section: 'A', instructor: 'Dr. Nadia Hashmi', venue: 'Lecture Hall 1', attendance: '92%' },
    { code: 'CS-308', title: 'Artificial Intelligence & Neural Nets', cr: 4, section: 'A', instructor: 'Dr. Nadia Hashmi', venue: 'AI Lab Complex', attendance: '94%' },
    { code: 'SE-302', title: 'Software Architecture & Design', cr: 3, section: 'B', instructor: 'Prof. Tariq Jamil', venue: 'Seminar Hall 2', attendance: '88%' },
    { code: 'HU-201', title: 'Technical & Business Writing', cr: 3, section: 'C', instructor: 'Ms. Amina Batool', venue: 'Room 204', attendance: '96%' }
  ]
  const totalUniCredits = useMemo(() => uniCourses.reduce((sum, c) => sum + (c.cr || 0), 0), [uniCourses])

  // University Applicant Data
  const applicantData = {
    appId: 'APP-2026-892',
    name: 'Sarah Khan',
    program: 'BS Artificial Intelligence (4-Year HEC Accredited)',
    matricScore: '1042 / 1100 (94.7%)',
    interScore: '478 / 520 (91.9%)',
    entryTestScore: '84 / 100',
    aggregate: '88.24%',
    meritRank: '#14 in Open Merit',
    meritStatus: 'Selected in 1st Merit List (Offer Issued)',
    feeChallanNo: 'ADM-IAS-88192',
    feeAmount: 85000,
    feeDeadline: 'November 10, 2026',
    feeStatus: 'Pending Payment'
  }

  // University Alumni Data
  const alumniData = {
    name: 'Farhan Zaidi',
    degree: 'BS Computer Science (Class of 2024)',
    cgpa: '3.84 (Gold Medalist)',
    currentCompany: 'Amazon Web Services (AWS)',
    position: 'Cloud Support Engineer (Dubai, UAE)',
    mentorStatus: 'Active Mentor (3 Undergraduates Mentees Assigned)',
    transcriptStatus: 'Official HEC Attestation Dispatched via DHL'
  }


  // Additional comprehensive Portal Datasets
  const resultsData = [
    { subject: isUniversity ? 'Design & Analysis of Algorithms (CS-301)' : isCollege ? 'Physics Part-II (Theory & Practical)' : 'Mathematics (General / Science)', total: 100, obtained: 92, grade: 'A+', gpa: '4.00', remarks: 'Exceptional Performance' },
    { subject: isUniversity ? 'Artificial Intelligence & Neural Nets (CS-308)' : isCollege ? 'Chemistry Part-II (Theory & Practical)' : 'Physics (SSC)', total: 100, obtained: 88, grade: 'A', gpa: '3.70', remarks: 'Very Good' },
    { subject: isUniversity ? 'Software Architecture & Design (SE-302)' : isCollege ? 'Computer Science / Biology' : 'English Literature', total: 100, obtained: 85, grade: 'A', gpa: '3.70', remarks: 'Strong Analytical Concept' },
    { subject: isUniversity ? 'Technical & Business Writing (HU-201)' : isCollege ? 'English Compulsory' : 'Urdu Compulsory', total: 100, obtained: 79, grade: 'B+', gpa: '3.30', remarks: 'Good Effort' },
    { subject: isUniversity ? 'Probability & Statistics (MT-202)' : isCollege ? 'Pakistan Studies & Islamic Edu' : 'Islamiat & Pak Studies', total: 50, obtained: 46, grade: 'A+', gpa: '4.00', remarks: 'Outstanding Score' }
  ]

  const timetableSchedule = [
    { time: '08:30 - 09:15 AM', period: 'Period 1', subject: isUniversity ? 'CS-301 Algorithms' : isCollege ? 'Physics Part-II' : 'Mathematics', teacher: 'Sir Salman Ahmed', venue: isUniversity ? 'Lecture Hall 1' : isCollege ? 'Hall B-2' : 'Room 14' },
    { time: '09:15 - 10:00 AM', period: 'Period 2', subject: isUniversity ? 'CS-308 AI & Neural Nets' : isCollege ? 'Chemistry Part-II' : 'Physics', teacher: 'Dr. Nadia Hashmi', venue: isUniversity ? 'AI Lab 3' : isCollege ? 'Chem Lab 1' : 'Room 14' },
    { time: '10:00 - 10:30 AM', period: 'Morning Break', subject: 'Break & Refreshment', teacher: 'Campus Cafeteria', venue: 'Student Center' },
    { time: '10:30 - 11:15 AM', period: 'Period 3', subject: isUniversity ? 'SE-302 Architecture' : isCollege ? 'Biology / Computer' : 'English Literature', teacher: 'Ms. Amina Batool', venue: isUniversity ? 'Seminar Hall 2' : isCollege ? 'Bio Lab' : 'Room 14' },
    { time: '11:15 - 12:00 PM', period: 'Period 4', subject: isUniversity ? 'HU-201 Tech Writing' : isCollege ? 'Urdu Literature' : 'Pakistan Studies', teacher: 'Syed Ali Raza', venue: isUniversity ? 'Room 204' : isCollege ? 'Room 108' : 'Room 14' }
  ]

  const lmsMaterials = useMemo(() => {
    if (isSchool) {
      return [
        { title: 'Mathematics (Class 10): Chapter 4 Quadratic Equations Formulas & Solved Examples', course: 'Matric Mathematics', file: 'math_ch4_quadratics.pdf', size: '2.1 MB', date: 'Oct 28, 2026', downloaded: true },
        { title: 'Physics SSC-II: Chapter 14 Current Electricity Numerical Solved Guide', course: 'Matric Physics', file: 'physics_ch14_solved.pdf', size: '3.4 MB', date: 'Oct 26, 2026', downloaded: true },
        { title: 'English Literature: Model Essays, Idioms & Comprehension Worksheets', course: 'English Compulsory', file: 'english_essays_model.pdf', size: '1.5 MB', date: 'Oct 24, 2026', downloaded: false },
        { title: 'Pakistan Studies: Short Questions & Historical Dates Summary Sheet', course: 'Pakistan Studies', file: 'pakstudies_short_qa.pdf', size: '1.2 MB', date: 'Oct 20, 2026', downloaded: false }
      ]
    }
    if (isCollege) {
      return [
        { title: 'F.Sc Physics Part-II: Practical Manual, Circuit Diagrams & Viva Questions', course: 'Physics Intermediate', file: 'fsc_physics_practical_manual.pdf', size: '4.1 MB', date: 'Oct 29, 2026', downloaded: true },
        { title: 'Chemistry Part-II: Organic Reaction Mechanisms & Synthesis Flowchart', course: 'Chemistry Intermediate', file: 'organic_chemistry_reactions.pdf', size: '2.8 MB', date: 'Oct 27, 2026', downloaded: true },
        { title: 'Biology Part-II: Genetics & Biotechnology Key Concepts Lecture Slides', course: 'Biology Pre-Medical', file: 'bio_genetics_slides.pdf', size: '3.6 MB', date: 'Oct 23, 2026', downloaded: false },
        { title: 'Intermediate English: Comprehension Passages & Official Letter Formats', course: 'English Compulsory', file: 'inter_english_letters.pdf', size: '1.8 MB', date: 'Oct 19, 2026', downloaded: false }
      ]
    }
    return [
      { title: 'Lecture 12: Dynamic Programming & Bellman-Ford Shortest Path Algorithm', course: 'CS-301 Algorithms', file: 'lecture_12_dp.pdf', size: '3.4 MB', date: 'Oct 28, 2026', downloaded: true },
      { title: 'Lab Handout 5: Convolutional Neural Networks with PyTorch & GPU Acceleration', course: 'CS-308 AI & Neural Nets', file: 'lab5_cnn.ipynb', size: '1.8 MB', date: 'Oct 25, 2026', downloaded: false },
      { title: 'Reading Assignment: Microservices vs Monolith Architectural Tradeoffs Case Study', course: 'SE-302 Software Arch', file: 'reading_assignment_2.pdf', size: '2.1 MB', date: 'Oct 20, 2026', downloaded: false },
      { title: 'Technical Writing: IEEE Standard Format Manuscript Template', course: 'HU-201 Tech Writing', file: 'ieee_template_latex.zip', size: '2.5 MB', date: 'Oct 18, 2026', downloaded: true }
    ]
  }, [isSchool, isCollege])

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-y-auto">
      {/* Top Header */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white border-b border-slate-800 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${
              isSchool ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              isCollege ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
              'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            }`}>
              {isSchool ? <School className="w-5 h-5" /> : isCollege ? <Building2 className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {isApplicant ? 'University Admissions & Merit Portal' :
                   isAlumni ? 'Global Alumni Network & Records Portal' :
                   isParent ? (isSchool ? 'School Parent & Guardian Portal' : isCollege ? 'College Parent Portal' : 'University Guardian Portal') :
                   (isSchool ? 'School Student Portal' : isCollege ? 'College Academic Portal' : 'University CMS & Student Portal')}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                  isSchool ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  isCollege ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {isApplicant ? 'Applicant Intake' : isAlumni ? 'Alumni' : isParent ? 'Guardian' : 'Student'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {studentProfile.campusName} • {isApplicant ? 'Application: APP-2026-892' : isAlumni ? 'BSCS Class 2024' : studentProfile.className}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-auto flex-wrap">
            {/* Quick Portal Switcher (Student <-> Parent) with Guardian PIN Security */}
            {!isApplicant && !isAlumni && (
              <button
                type="button"
                onClick={() => {
                  const targetRole = isSchool
                    ? (isParent ? 'school_student' : 'school_parent')
                    : isCollege
                    ? (isParent ? 'college_student' : 'college_parent')
                    : (isParent ? 'uni_student' : 'uni_parent')
                  if (!isParent) {
                    // Student attempting to switch to Parent Portal requires Guardian PIN
                    setGuardianPinInput('')
                    setIsGuardianPinModalOpen(true)
                  } else {
                    login?.(targetRole)
                    toast.info('Switched to Student Portal view.')
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                title="Switch between Student and Parent Portal"
              >
                <Layers className="w-3.5 h-3.5 text-purple-300" />
                <span>Switch to {isParent ? 'Student' : 'Parent'} View</span>
              </button>
            )}



            <div className="text-right hidden sm:block pl-2 border-l border-slate-700/80">
              <div className="text-xs font-semibold text-white">{user?.name}</div>
              <div className="text-[11px] text-slate-400 font-mono">
                {isApplicant ? 'Rank #14' : isAlumni ? 'AWS Dubai' : studentProfile.rollNumber}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-1">
          {/* APPLICANT TABS */}
          {isApplicant && (
            <>
              <button
                onClick={() => setActiveTab('merit')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'merit' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Merit List & Application Status</span>
              </button>
              <button
                onClick={() => setActiveTab('applicant_challan')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'applicant_challan' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Admission Fee Challan (PKR 85,000)</span>
              </button>
            </>
          )}

          {/* ALUMNI TABS */}
          {isAlumni && (
            <>
              <button
                onClick={() => setActiveTab('alumni_profile')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'alumni_profile' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Alumni Profile & Degree</span>
              </button>
              <button
                onClick={() => setActiveTab('alumni_requests')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'alumni_requests' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>HEC Transcript Attestation & Requests</span>
              </button>
              <button
                onClick={() => setActiveTab('alumni_events')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'alumni_events' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Convocation & Homecoming</span>
              </button>
              <button
                onClick={() => setActiveTab('alumni_donations')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'alumni_donations' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>Alumni Endowment & Donations</span>
              </button>
            </>
          )}

          {/* STANDARD STUDENT / PARENT TABS */}
          {!isApplicant && !isAlumni && (
            <>
              {/* Overview & Bio */}
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Overview & Bio</span>
              </button>

              {/* 1. Timetable (For all students across School, College, and University) */}
              {isStudent && (
                <button
                  onClick={() => setActiveTab('timetable')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'timetable' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>{isSchool ? 'Class Timetable' : isCollege ? 'Lectures & Practical Timetable' : 'Lecture Schedule & Timetable'}</span>
                </button>
              )}

              {/* 2. Homework Diary (School Parent and School Student) */}
              {isSchool && (
                <button
                  onClick={() => setActiveTab('diary')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'diary' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Homework Diary</span>
                </button>
              )}

              {/* 3. University Course Registration */}
              {isUniversity && isStudent && (
                <button
                  onClick={() => setActiveTab('registration')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'registration' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ClipboardListIcon className="w-4 h-4" />
                  <span>Registered Courses ({totalUniCredits} Cr. Hrs)</span>
                </button>
              )}

              {/* 4. College Board Slips & Registration */}
              {isCollege && isStudent && (
                <button
                  onClick={() => setActiveTab('board_slip')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'board_slip' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCheck className="w-4 h-4" />
                  <span>BISE Board Slips & Registration</span>
                </button>
              )}

              {/* 5. Attendance Record */}
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'attendance' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Attendance Record ({attendanceStats.percentage}%)</span>
              </button>

              {/* 6. Examination Results / Tabulation */}
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'results' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{isUniversity ? 'GPA / CGPA Transcript' : isCollege ? 'Pre-Board Gazette Marks' : 'Report Card & Marks'}</span>
              </button>

              {/* 7. Notes & Study Materials / LMS (Students across all tiers) */}
              {isStudent && (
                <button
                  onClick={() => setActiveTab('lms')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'lms' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  <span>{isSchool ? 'Study Notes & Homework Files' : isCollege ? 'Lecture Notes & Slides' : 'LMS & Lecture Slides'}</span>
                </button>
              )}

              {/* 8. Fees & Bank Challan */}
              <button
                onClick={() => setActiveTab('fees')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'fees' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{isUniversity ? 'Semester 1-Bill Challan' : isParent ? 'Fee Challan & Bank Voucher (Download)' : 'Fee Challan & Concessions'}</span>
              </button>

              {/* 9. PTM & Teacher Appointments (For Parents) */}
              {isParent && (
                <button
                  onClick={() => setActiveTab('ptm')}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                    activeTab === 'ptm' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>PTM & Teacher Meeting</span>
                </button>
              )}

              {/* 10. Campus Circulars & Notices */}
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'notices' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Campus Circulars</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
        {/* TAB: APPLICANT MERIT */}
        {activeTab === 'merit' && isApplicant && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 rounded-2xl shadow-md">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {applicantData.meritStatus}
              </span>
              <h2 className="text-2xl font-black mt-2">{applicantData.name} — Admission Offer</h2>
              <p className="text-sm text-purple-200 mt-1">Program: {applicantData.program}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Merit Rank</span>
                <div className="text-2xl font-black text-purple-700">{applicantData.meritRank}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Calculated Aggregate</span>
                <div className="text-2xl font-black text-slate-800">{applicantData.aggregate}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Entry Test Score</span>
                <div className="text-2xl font-black text-slate-800">{applicantData.entryTestScore}</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Fee Status</span>
                <div className="text-2xl font-black text-amber-600">{applicantData.feeStatus}</div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-800">Download Official Admission Offer & Fee Challan</h4>
                <p className="text-xs text-slate-500">Payable at any HBL branch or via 1Link Sub-50ms biller code</p>
              </div>
              <button
                onClick={() => toast.success('Admission Fee Challan voucher downloaded.')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 cursor-pointer shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>Download Challan</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: SCHOOL HOMEWORK DIARY */}
        {activeTab === 'diary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Daily Homework Diary & Class Notes</h3>
              <span className="text-xs text-purple-700 font-bold bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                City School Academic Diary
              </span>
            </div>
            <div className="space-y-3">
              {diaryEntries.map((d) => (
                <div key={d.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-purple-700 text-sm">{d.subject}</span>
                      <span className="text-xs text-slate-400">• {d.date}</span>
                      <span className="text-xs text-slate-500">({d.teacher})</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium">{d.task}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 self-start md:self-auto ${
                    d.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                    d.status === 'Checked by Teacher' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: COLLEGE BOARD SLIPS */}
        {activeTab === 'board_slip' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{collegeBoardData.boardName}</span>
                <h3 className="text-lg font-black text-slate-800 mt-1">HSSC Annual Examination Roll Number Slip (Composite)</h3>
              </div>
              <button
                onClick={() => toast.success('BISE Roll Number slip printed.')}
                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div><span className="font-bold text-slate-500">Candidate Name:</span> <span className="font-bold text-slate-800">{collegeBoardData.candidateName}</span></div>
                <div><span className="font-bold text-slate-500">Board Roll No:</span> <span className="font-mono font-bold text-indigo-700">{collegeBoardData.boardRollNo}</span></div>
                <div><span className="font-bold text-slate-500">BISE Registration:</span> <span className="font-mono text-slate-700">{collegeBoardData.enrollmentNo}</span></div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div><span className="font-bold text-slate-500">Theory Center:</span> <span className="text-slate-800 font-semibold">{collegeBoardData.centerName}</span></div>
                <div><span className="font-bold text-slate-500">Practical Center:</span> <span className="text-slate-800 font-semibold">{collegeBoardData.practicalCenter}</span></div>
                <div><span className="font-bold text-slate-500">Status:</span> <span className="text-emerald-700 font-bold">{collegeBoardData.status}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: UNIVERSITY REGISTERED COURSES */}
        {activeTab === 'registration' && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Fall 2026 Undergraduate Registered Courses</h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Total: {totalUniCredits} Credit Hours
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Instructor</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {uniCourses.map((c) => (
                    <tr key={c.code} className="hover:bg-purple-50/20">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{c.title}</div>
                        <div className="text-[11px] font-mono text-purple-700 font-bold">{c.code}</div>
                      </td>
                      <td className="py-3 px-4 font-bold">{c.cr} Cr. Hrs</td>
                      <td className="py-3 px-4">{c.instructor}</td>
                      <td className="py-3 px-4 text-slate-500">{c.venue}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          {c.attendance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Total Working Days</span>
                <div className="text-2xl font-black text-slate-800">{attendanceStats.totalDays} Days</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Present</span>
                <div className="text-2xl font-black text-emerald-600">{attendanceStats.presentDays} Days</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Approved Leaves</span>
                <div className="text-2xl font-black text-amber-600">{attendanceStats.leaveDays} Days</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400">Attendance Percentage</span>
                <div className="text-2xl font-black text-purple-700">{attendanceStats.percentage}%</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                  ✓ Above 75% Examination Gate
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FEES & CHALLAN */}
        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Official Bank Fee Challans & Vouchers</h3>
              <span className="text-xs font-bold text-slate-500">1Link Computerized Barcoded</span>
            </div>
            <div className="space-y-3">
              {studentFees.map((f) => (
                <div key={f.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{f.title}</span>
                      <span className="text-xs text-slate-400">({f.month})</span>
                    </div>
                    <div className="text-xs font-mono text-purple-700 font-bold">Challan: {f.challanNo}</div>
                    {f.concession && (
                      <div className="text-xs text-emerald-600 font-semibold">Scholarship / Concession: {f.concession}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-base font-black text-slate-900">PKR {(f.netPayable || f.amount).toLocaleString()}</div>
                      <div className="text-[11px] text-slate-400">Due: {f.dueDate}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      f.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {f.status}
                    </span>
                    {f.status !== "Paid" && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFeeForUpload(f)
                          setSlipUploadForm({ ...slipUploadForm, amount: f.netPayable || f.amount || 15000 })
                          setIsSlipUploadModalOpen(true)
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                        title="Upload photo of stamped bank challan"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadedSlips[f.id] ? "Slip Uploaded" : "Upload Slip"}</span>
                      </button>
                    )}
                    <button
                      onClick={() => toast.success(`Downloaded bank voucher for ${f.challanNo}`)}
                      className="p-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-lg cursor-pointer transition-colors"
                      title="Download PDF Challan"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-lg">
                  {studentProfile.studentName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{studentProfile.studentName}</h3>
                  <p className="text-xs text-purple-700 font-mono font-bold">{studentProfile.rollNumber}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                <div><span className="font-bold text-slate-500">Institution:</span> {studentProfile.campusName}</div>
                <div><span className="font-bold text-slate-500">Class/Section:</span> {studentProfile.className}</div>
                <div><span className="font-bold text-slate-500">Guardian:</span> {studentProfile.fatherName}</div>
                <div><span className="font-bold text-slate-500">Blood Group:</span> {studentProfile.bloodGroup}</div>
                {studentProfile.cgpa && (
                  <div><span className="font-bold text-slate-500">Cumulative CGPA:</span> <span className="font-bold text-purple-700">{studentProfile.cgpa} / 4.00</span></div>
                )}
              </div>
            </div>

            <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
              <h3 className="font-bold text-slate-800 text-base">Academic Status & Notifications</h3>
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900 space-y-1">
                  <div className="font-bold">Next Academic Milestone</div>
                  <p>Semester examinations scheduled for December 2026. Hall admit cards and clearance slips will be issued upon 75% lecture verification.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTICES */}
        {activeTab === 'notices' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-800 text-sm">Official Institutional Circulars</h3>
            <div className="space-y-3">
              {[
                { id: '1', title: 'Winter Timetable & Session Break Notice', date: 'Oct 28, 2026', body: 'Please note the revised winter morning class timings effective from Monday.' },
                { id: '2', title: 'Library Book Returns & Clearance Notice', date: 'Oct 22, 2026', body: 'All students are requested to clear issued textbooks before mid-term exams.' }
              ].map(n => (
                <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                    <span className="text-xs text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-xs text-slate-600">{n.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* TAB: RESULTS / TRANSCRIPT */}
        {activeTab === 'results' && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded bg-white/20 text-purple-200">
                  {isUniversity ? 'HEC Standard Semester Gazette' : isCollege ? 'Intermediate Pre-Board Examination' : 'Mid-Term Examination Report Card'}
                </span>
                <h3 className="text-xl font-black mt-2">
                  Academic Performance & Grade Sheet
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Candidate: {studentProfile.studentName} • Roll No: {studentProfile.rollNumber} • {studentProfile.className}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-wider block">
                    {isUniversity ? 'Current CGPA' : 'Total Marks'}
                  </span>
                  <span className="text-xl font-black text-white">
                    {isUniversity ? (studentProfile.cgpa || '3.72') : '440 / 450'}
                  </span>
                </div>
                <button
                  onClick={() => toast.success('Official Result Transcript PDF downloaded successfully.')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Subject-wise Marks & Grade Breakdown</h4>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  Status: Passed with Distinction
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4 text-center">Total Marks</th>
                      <th className="py-3 px-4 text-center">Obtained Marks</th>
                      <th className="py-3 px-4 text-center">Grade</th>
                      {isUniversity && <th className="py-3 px-4 text-center">GPA</th>}
                      <th className="py-3 px-4 text-right">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {resultsData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-slate-900">{r.subject}</td>
                        <td className="py-3 px-4 text-center text-slate-500">{r.total}</td>
                        <td className="py-3 px-4 text-center font-bold text-purple-700">{r.obtained}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800">
                            {r.grade}
                          </span>
                        </td>
                        {isUniversity && (
                          <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">{r.gpa}</td>
                        )}
                        <td className="py-3 px-4 text-right text-xs text-slate-600">{r.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: TIMETABLE SCHEDULE */}
        {activeTab === 'timetable' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Weekly Class & Lecture Schedule</h3>
                <p className="text-xs text-slate-500">{studentProfile.className} • Effective Academic Schedule</p>
              </div>
              <button
                onClick={() => toast.success('Weekly Timetable printed successfully.')}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Schedule</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Period & Timing</th>
                      <th className="py-3 px-4">Subject</th>
                      <th className="py-3 px-4">Instructor</th>
                      <th className="py-3 px-4 text-right">Room / Lab</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {timetableSchedule.map((t, i) => (
                      <tr key={i} className={t.subject.includes('Break') ? 'bg-amber-50/40 text-amber-900' : 'hover:bg-slate-50/50'}>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          <div>{t.time}</div>
                          <span className="text-[10px] text-slate-400 uppercase font-sans">{t.period}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{t.subject}</td>
                        <td className="py-3.5 px-4 text-slate-600">{t.teacher}</td>
                        <td className="py-3.5 px-4 text-right font-semibold text-purple-700">{t.venue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PTM APPOINTMENTS */}
        {activeTab === 'ptm' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Parent-Teacher Meeting (PTM) Schedule</h3>
                <p className="text-xs text-slate-500">Reserved consultation slots with class and subject teachers</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
                  Semester 1 PTM
                </span>
                <button
                  onClick={() => setIsPtmBookModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Book 15-Min Slot</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {ptmSlots.map((slot) => (
                <div key={slot.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {slot.status}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{slot.term}</h4>
                    </div>
                    <div className="text-xs text-slate-600 flex items-center gap-3">
                      <span><strong>Date:</strong> {slot.date}</span>
                      <span>•</span>
                      <span><strong>Slot:</strong> {slot.timeSlot}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      In-charge: <strong>{slot.teacher}</strong> • Venue: {slot.venue}
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => toast.success('PTM Appointment slip downloaded.')}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Download Pass
                    </button>
                    <button
                      onClick={() => toast.info('PTM slot change request submitted to school administration.')}
                      className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      Request Reschedule
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: LMS & LECTURE MATERIALS */}
        {activeTab === 'lms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Learning Management System (LMS) Repository</h3>
                <p className="text-xs text-slate-500">Course slides, syllabus packets, and laboratory handouts</p>
              </div>
              <button
                onClick={() => toast.success('Course packet archive (.zip) downloaded successfully.')}
                className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-100 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download All Slides</span>
              </button>
            </div>

            <div className="space-y-3">
              {lmsMaterials.map((mat, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                        {mat.course}
                      </span>
                      <span className="text-xs text-slate-400">• Uploaded {mat.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{mat.title}</h4>
                    <p className="text-xs text-slate-500">{mat.file} • Size: {mat.size}</p>
                  </div>
                  <button
                    onClick={() => toast.success(`Downloaded ${mat.file}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-purple-100 hover:text-purple-700 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer self-start md:self-auto"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: APPLICANT CHALLAN */}
        {activeTab === 'applicant_challan' && isApplicant && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">1Link Standard Voucher</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Undergraduate Admission Fee Challan</h3>
                <p className="text-xs text-slate-500">Applicant: {applicantData.name} ({applicantData.appId})</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-2xl font-black text-purple-700">PKR {applicantData.feeAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div><span className="font-bold text-slate-500">Voucher No:</span> <span className="font-mono font-bold text-purple-700">{applicantData.feeChallanNo}</span></div>
                <div><span className="font-bold text-slate-500">Program:</span> <span className="font-bold text-slate-800">{applicantData.program}</span></div>
                <div><span className="font-bold text-slate-500">Merit Status:</span> <span className="text-emerald-700 font-bold">{applicantData.meritStatus}</span></div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                <div><span className="font-bold text-slate-500">Payment Due Date:</span> <span className="font-bold text-rose-600">{applicantData.feeDeadline}</span></div>
                <div><span className="font-bold text-slate-500">Accepted Banks:</span> <span className="text-slate-700">Any HBL / Meezan Branch, 1Link 1Bill</span></div>
                <div><span className="font-bold text-slate-500">1Bill Consumer ID:</span> <span className="font-mono font-bold text-slate-800">100882-990142</span></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => toast.success('Admission Fee Challan downloaded.')}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Print Ready Voucher (PDF)</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB: ALUMNI PROFILE */}
        {activeTab === 'alumni_profile' && isAlumni && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-xl text-white">
                  {alumniData.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{alumniData.name}</h3>
                  <p className="text-xs text-purple-200 mt-0.5">{alumniData.degree} • {alumniData.cgpa}</p>
                  <p className="text-xs text-emerald-300 font-semibold mt-1">Currently: {alumniData.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold text-white border border-white/20">
                  {alumniData.mentorStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-400">Official Graduation</span>
                <div className="text-base font-black text-slate-800">Class of 2024</div>
                <p className="text-xs text-slate-500">Degree Roll: BSCS-F20-004</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-400">Employer & Location</span>
                <div className="text-base font-black text-slate-800">{alumniData.currentCompany}</div>
                <p className="text-xs text-slate-500">Dubai Internet City, UAE</p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-400">HEC Verification</span>
                <div className="text-base font-black text-emerald-600">Dispatched & Attested</div>
                <p className="text-xs text-slate-500">Tracking: DHL-PK-991204</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ALUMNI REQUESTS */}
        {activeTab === 'alumni_requests' && isAlumni && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">HEC Attestation & Official Transcript Requests</h3>
            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-purple-950">Official Transcript & HEC Equivalence Packet</div>
                <div className="text-xs text-purple-700">Request # HEC-TR-2026-881 • Courier: DHL Express Worldwide</div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Dispatched
              </span>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => toast.info('New document request form opened.')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                + Request Additional Duplicate / Certificate
              </button>
            </div>
          </div>
        )}

        {/* TAB: ALUMNI EVENTS */}
        {activeTab === 'alumni_donations' && isAlumni && (
          <div className="space-y-5 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Alumni Endowment & Scholarship Fund</h3>
                <p className="text-xs text-slate-500">Support deserving undergraduates, research labs, and campus development projects</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Tax-Exempt Under FBR Section 61</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold mb-3">
                  🎓
                </div>
                <h4 className="text-sm font-bold text-slate-900">Need-Based Student Scholarships</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Directly sponsors tuition and hostel dues for underprivileged, high-achieving STEM scholars.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Fund Progress:</span>
                  <span className="font-bold text-emerald-700">PKR 1.8M / 2.5M Target</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold mb-3">
                  ⚡
                </div>
                <h4 className="text-sm font-bold text-slate-900">AI Computing & GPU Research Lab</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Procuring high-performance NVIDIA compute clusters for final-year thesis researchers.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Fund Progress:</span>
                  <span className="font-bold text-indigo-700">PKR 3.4M / 5.0M Target</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-3">
                  🏥
                </div>
                <h4 className="text-sm font-bold text-slate-900">Emergency Medical Welfare Fund</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Provides immediate zero-delay medical and surgical relief for students on campus.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Fund Progress:</span>
                  <span className="font-bold text-emerald-700">PKR 650K Active Reserve</span>
                </div>
              </div>
            </div>

            {/* Donation Quick Form Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white shadow-md">
              <h4 className="text-sm sm:text-base font-bold text-white mb-2">Make an Alumni Gift or Donation</h4>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed mb-4">
                Select your contribution tier below. An official digital acknowledgement certificate and FBR tax exemption receipt will be issued immediately.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {['PKR 5,000', 'PKR 10,000', 'PKR 25,000', 'PKR 50,000', 'PKR 100,000'].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toast.success(`Selected contribution tier ${amt}. Click 'Proceed with 1-Bill Contribution' to finalize.`)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => toast.success('Alumni donation voucher generated via KuickPay 1-Bill with 0% gateway fee.')}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
              >
                <span>Proceed with 1-Bill / Online Banking Contribution</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'alumni_events' && isAlumni && (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-2xs space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Convocation 2026 & Annual Alumni Homecoming</h3>
            <div className="p-5 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm">Grand Alumni Gala & Innovation Dinner 2026</h4>
                <span className="text-xs text-purple-700 font-bold">Dec 18, 2026</span>
              </div>
              <p className="text-xs text-slate-600">Main Campus Marquee, Islamabad • Keynote by Distinguished Alumnus & Chancellor</p>
              <button
                onClick={() => toast.success('Your seat for Alumni Gala 2026 is confirmed!')}
                className="mt-2 px-3.5 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 cursor-pointer"
              >
                Confirm Attendance
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Bank Challan Slip Upload Modal */}
      {isSlipUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Upload Bank Deposit Challan</h3>
              </div>
              <button onClick={() => setIsSlipUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs">
              <div className="font-bold text-emerald-900">{selectedFeeForUpload?.title || 'Fee Challan'}</div>
              <div className="text-slate-500 font-mono mt-0.5">Challan No: {selectedFeeForUpload?.challanNo || 'CH-001'}</div>
              <div className="text-slate-700 font-semibold mt-1">Payable Amount: <span className="font-bold text-emerald-700">PKR {Number(selectedFeeForUpload?.netPayable || selectedFeeForUpload?.amount || 15000).toLocaleString()}</span></div>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              setUploadedSlips(prev => ({
                ...prev,
                [selectedFeeForUpload?.id || 'fee-current']: {
                  ...slipUploadForm,
                  uploadedAt: new Date().toISOString()
                }
              }))
              setIsSlipUploadModalOpen(false)
              toast.success('Stamped bank challan uploaded successfully! Accounts office has been notified for clearance verification.')
            }} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Deposit Bank</label>
                <select
                  value={slipUploadForm.bankName || 'Habib Bank Limited (HBL)'}
                  onChange={(e) => setSlipUploadForm({ ...slipUploadForm, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Habib Bank Limited (HBL)">Habib Bank Limited (HBL)</option>
                  <option value="Meezan Bank Ltd">Meezan Bank Ltd</option>
                  <option value="Allied Bank Limited (ABL)">Allied Bank Limited (ABL)</option>
                  <option value="MCB Bank Ltd">MCB Bank Ltd</option>
                  <option value="National Bank of Pakistan (NBP)">National Bank of Pakistan (NBP)</option>
                  <option value="United Bank Limited (UBL)">United Bank Limited (UBL)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Branch Code / City</label>
                  <input
                    type="text"
                    required
                    value={slipUploadForm.bankBranch || 'Main Branch'}
                    onChange={(e) => setSlipUploadForm({ ...slipUploadForm, bankBranch: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Deposit Date</label>
                  <input
                    type="date"
                    required
                    value={slipUploadForm.depositDate || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSlipUploadForm({ ...slipUploadForm, depositDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Attach Stamped Receipt / Voucher Photo</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 rounded-xl p-3 text-center cursor-pointer bg-slate-50">
                  <Upload className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <span className="font-bold text-slate-700 block text-[11px]">Click or drag stamped challan slip here</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG, or PDF up to 5MB</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsSlipUploadModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Confirm & Submit Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PTM Slot Booking Modal */}
      {isPtmBookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Book Parent-Teacher Meeting (PTM)</h3>
              </div>
              <button onClick={() => setIsPtmBookModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault()
              setIsPtmBookModalOpen(false)
              toast.success(`PTM Slot confirmed with ${bookedPtmSlot.teacher} for ${bookedPtmSlot.time}. Confirmation SMS sent to guardian phone.`)
            }} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Faculty / Teacher</label>
                <select
                  value={bookedPtmSlot.teacher}
                  onChange={(e) => setBookedPtmSlot({ ...bookedPtmSlot, teacher: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Mrs. Nasreen Akhtar (Mathematics)">Mrs. Nasreen Akhtar (Mathematics Incharge)</option>
                  <option value="Sir Salman Ahmed (Physics / Class Incharge)">Sir Salman Ahmed (Physics / Class Incharge)</option>
                  <option value="Dr. Nadia Hashmi (Computer Science & AI)">Dr. Nadia Hashmi (Computer Science & AI)</option>
                  <option value="Prof. Tariq Jamil (Dean of Academics)">Prof. Tariq Jamil (Dean of Academics)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Preferred 15-Minute Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {['09:00 AM - 09:15 AM', '09:30 AM - 09:45 AM', '10:15 AM - 10:30 AM', '11:00 AM - 11:15 AM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setBookedPtmSlot({ ...bookedPtmSlot, time: slot })}
                      className={`p-2 text-center rounded-xl border font-bold transition-all cursor-pointer ${
                        bookedPtmSlot.time === slot
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Consultation Mode & Location</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium text-[11px]">
                  <span>Campus Academic Wing • Room 14 (Secondary Conference Room)</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setIsPtmBookModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Confirm Consultation Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guardian PIN Verification Modal */}
      {isGuardianPinModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Guardian PIN Required</h3>
              </div>
              <button onClick={() => setIsGuardianPinModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Please enter the 4-digit Guardian Security PIN to access confidential parent financials and disciplinary notices.
            </p>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (guardianPinInput === '1234' || guardianPinInput === '0000') {
                setIsGuardianPinModalOpen(false)
                const targetRole = isSchool ? 'school_parent' : isCollege ? 'college_parent' : 'uni_parent'
                login?.(targetRole)
                toast.success('Guardian PIN verified. Switched to Parent Portal view.')
              } else {
                toast.error('Invalid Guardian PIN. (Default demo PIN is 1234).')
              }
            }} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Guardian PIN</label>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  required
                  value={guardianPinInput}
                  onChange={(e) => setGuardianPinInput(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 text-center text-lg font-mono tracking-widest rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-400 mt-1 text-center font-medium">Default demo PIN: 1234</p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsGuardianPinModalOpen(false)} className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors cursor-pointer shadow-sm">
                  Verify & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ClipboardListIcon(props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1"/>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <path d="M12 11h4"/>
      <path d="M12 16h4"/>
      <path d="M8 11h.01"/>
      <path d="M8 16h.01"/>
    </svg>
  )
}

export default StudentParentPortalView
