import React, { useState, useMemo } from 'react'
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
  const { user, logout } = useAuth()
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
  const isApplicant = user?.role === 'applicant'
  const isAlumni = user?.role === 'alumni'
  const isParent = user?.role === 'parent'
  const isStudent = user?.role === 'student'

  // Dynamic initial tab based on role and tier
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

  // Get fees for this student
  const studentFees = useMemo(() => {
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
  }, [isSchool, isCollege])

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

  // College BISE Board Slips & Registration
  const collegeBoardData = {
    boardName: 'Board of Intermediate and Secondary Education (BISE) Lahore',
    candidateName: 'Zainab Fatima',
    boardRollNo: '710429',
    enrollmentNo: 'BISE-LHR-2024-HSSC-88190',
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

          <div className="flex items-center gap-3 ml-auto">
            <div className="text-right hidden sm:block">
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
            </>
          )}

          {/* STANDARD STUDENT / PARENT TABS */}
          {!isApplicant && !isAlumni && (
            <>
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'overview' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Overview & Bio</span>
              </button>

              {/* School Specific: Homework Diary */}
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

              {/* College Specific: Timetable & Board Forms */}
              {isCollege && (
                <>
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'timetable' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>Lectures & Practical Timetable</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('board_slip')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'board_slip' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>BISE Board Slips & Registration</span>
                  </button>
                </>
              )}

              {/* University Specific: Course Registration & LMS */}
              {isUniversity && (
                <>
                  <button
                    onClick={() => setActiveTab('registration')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'registration' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <ClipboardListIcon className="w-4 h-4" />
                    <span>Registered Courses (18 Cr. Hrs)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('lms')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                      activeTab === 'lms' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Laptop className="w-4 h-4" />
                    <span>LMS & Lecture Slides</span>
                  </button>
                </>
              )}

              {/* Common: Attendance */}
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'attendance' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Attendance Record ({attendanceStats.percentage}%)</span>
              </button>

              {/* Common: Fees */}
              <button
                onClick={() => setActiveTab('fees')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'fees' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>{isUniversity ? 'Semester 1-Bill Challan' : 'Fee Challan & Concessions'}</span>
              </button>

              {/* Common: Results / Transcripts */}
              <button
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'results' ? 'border-purple-400 text-purple-300 bg-white/5' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>{isUniversity ? 'GPA / CGPA Transcript' : isCollege ? 'Pre-Board Gazette Marks' : 'Report Card & Marks'}</span>
              </button>

              {/* School / College Parent: PTM Appointments */}
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

              {/* Notices */}
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
                Total: 13 Credit Hours
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
      </main>
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
