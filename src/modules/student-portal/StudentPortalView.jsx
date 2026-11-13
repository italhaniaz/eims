import React, { useState, useMemo } from 'react'
import {
  Home,
  BookOpen,
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Bell,
  Wallet,
  Receipt,
  UserCheck,
  Megaphone,
  Printer,
  Download,
  Check,
  AlertCircle,
  Sun,
  Moon,
  IdCard,
  FileText,
  Search,
  Filter,
  CreditCard,
  Building2,
  CalendarDays,
  FileCheck,
  Award,
  BookMarked,
  Layers,
  Send,
  Upload,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

// Demo student profile data
const DEFAULT_STUDENT_PROFILE = {
  id: 'std-demo-1',
  name: 'Saleem Ahmed',
  rollNumber: 'CSM-2026-042',
  admissionNumber: 'ADM-2026-108',
  className: 'Class 10',
  section: 'A',
  fatherName: 'Muhammad Ahmed',
  gender: 'Male',
  dob: '2010-08-14',
  bloodGroup: 'B+',
  email: 'student@schoolms.com',
  phone: '+92 300 1234567',
  address: 'House # 42, Block C, Model Town, Lahore',
  admissionDate: '2023-04-05',
  session: '2025-2026',
  campus: 'City School Model Town Campus'
}

// Demo weekly timetable schedule
const TIMETABLE_SCHEDULE = {
  Monday: [
    { period: 1, time: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacher: 'Prof. Tariq Mehmood', room: 'Room 101', type: 'Lecture' },
    { period: 2, time: '08:45 AM - 09:30 AM', subject: 'English Language', teacher: 'Ms. Ayesha Khan', room: 'Room 101', type: 'Lecture' },
    { period: 3, time: '09:30 AM - 10:15 AM', subject: 'Physics', teacher: 'Sir Imran Nazir', room: 'Science Lab A', type: 'Lab / Practical' },
    { period: 0, time: '10:15 AM - 10:45 AM', subject: 'Recess & Assembly', teacher: 'Supervisory Staff', room: 'Courtyard', type: 'Break' },
    { period: 4, time: '10:45 AM - 11:30 AM', subject: 'Chemistry', teacher: 'Dr. Bilal Farooq', room: 'Chemistry Lab', type: 'Lecture' },
    { period: 5, time: '11:30 AM - 12:15 PM', subject: 'Computer Science', teacher: 'Ms. Sadia Noor', room: 'Computer Lab 1', type: 'Practical' },
    { period: 6, time: '12:15 PM - 01:00 PM', subject: 'Pakistan Studies', teacher: 'Sir Naveed Aslam', room: 'Room 101', type: 'Lecture' },
    { period: 7, time: '01:00 PM - 01:45 PM', subject: 'Islamiat', teacher: 'Qari Usman Ali', room: 'Room 101', type: 'Lecture' }
  ],
  Tuesday: [
    { period: 1, time: '08:00 AM - 08:45 AM', subject: 'English Literature', teacher: 'Ms. Ayesha Khan', room: 'Room 101', type: 'Lecture' },
    { period: 2, time: '08:45 AM - 09:30 AM', subject: 'Mathematics', teacher: 'Prof. Tariq Mehmood', room: 'Room 101', type: 'Tutorial' },
    { period: 3, time: '09:30 AM - 10:15 AM', subject: 'Biology', teacher: 'Ms. Hina Zahid', room: 'Bio Lab', type: 'Lab' },
    { period: 0, time: '10:15 AM - 10:45 AM', subject: 'Recess', teacher: 'Supervisory Staff', room: 'Cafeteria', type: 'Break' },
    { period: 4, time: '10:45 AM - 11:30 AM', subject: 'Physics', teacher: 'Sir Imran Nazir', room: 'Room 101', type: 'Lecture' },
    { period: 5, time: '11:30 AM - 12:15 PM', subject: 'Chemistry', teacher: 'Dr. Bilal Farooq', room: 'Room 101', type: 'Lecture' },
    { period: 6, time: '12:15 PM - 01:00 PM', subject: 'Urdu', teacher: 'Sir Naveed Aslam', room: 'Room 101', type: 'Lecture' },
    { period: 7, time: '01:00 PM - 01:45 PM', subject: 'Physical Education / Sports', teacher: 'Coach Rashid', room: 'Ground', type: 'Activity' }
  ],
  Wednesday: [
    { period: 1, time: '08:00 AM - 08:45 AM', subject: 'Physics', teacher: 'Sir Imran Nazir', room: 'Science Lab A', type: 'Lecture' },
    { period: 2, time: '08:45 AM - 09:30 AM', subject: 'Chemistry', teacher: 'Dr. Bilal Farooq', room: 'Chemistry Lab', type: 'Lab' },
    { period: 3, time: '09:30 AM - 10:15 AM', subject: 'Mathematics', teacher: 'Prof. Tariq Mehmood', room: 'Room 101', type: 'Lecture' },
    { period: 0, time: '10:15 AM - 10:45 AM', subject: 'Recess', teacher: 'Supervisory Staff', room: 'Courtyard', type: 'Break' },
    { period: 4, time: '10:45 AM - 11:30 AM', subject: 'English Language', teacher: 'Ms. Ayesha Khan', room: 'Room 101', type: 'Lecture' },
    { period: 5, time: '11:30 AM - 12:15 PM', subject: 'Computer Science', teacher: 'Ms. Sadia Noor', room: 'Computer Lab 1', type: 'Lecture' },
    { period: 6, time: '12:15 PM - 01:00 PM', subject: 'Islamiat', teacher: 'Qari Usman Ali', room: 'Room 101', type: 'Lecture' },
    { period: 7, time: '01:00 PM - 01:45 PM', subject: 'Library & Reading', teacher: 'Librarian Tahir', room: 'Main Library', type: 'Self Study' }
  ],
  Thursday: [
    { period: 1, time: '08:00 AM - 08:45 AM', subject: 'Mathematics', teacher: 'Prof. Tariq Mehmood', room: 'Room 101', type: 'Problem Solving' },
    { period: 2, time: '08:45 AM - 09:30 AM', subject: 'Physics', teacher: 'Sir Imran Nazir', room: 'Science Lab A', type: 'Lab' },
    { period: 3, time: '09:30 AM - 10:15 AM', subject: 'Chemistry', teacher: 'Dr. Bilal Farooq', room: 'Room 101', type: 'Lecture' },
    { period: 0, time: '10:15 AM - 10:45 AM', subject: 'Recess', teacher: 'Supervisory Staff', room: 'Courtyard', type: 'Break' },
    { period: 4, time: '10:45 AM - 11:30 AM', subject: 'English Literature', teacher: 'Ms. Ayesha Khan', room: 'Room 101', type: 'Lecture' },
    { period: 5, time: '11:30 AM - 12:15 PM', subject: 'Pakistan Studies', teacher: 'Sir Naveed Aslam', room: 'Room 101', type: 'Lecture' },
    { period: 6, time: '12:15 PM - 01:00 PM', subject: 'Urdu', teacher: 'Sir Naveed Aslam', room: 'Room 101', type: 'Lecture' },
    { period: 7, time: '01:00 PM - 01:45 PM', subject: 'Computer Science', teacher: 'Ms. Sadia Noor', room: 'Computer Lab 1', type: 'Practical' }
  ],
  Friday: [
    { period: 1, time: '08:00 AM - 08:45 AM', subject: 'Islamiat / Ethics', teacher: 'Qari Usman Ali', room: 'Room 101', type: 'Lecture' },
    { period: 2, time: '08:45 AM - 09:30 AM', subject: 'Mathematics Test', teacher: 'Prof. Tariq Mehmood', room: 'Room 101', type: 'Assessment' },
    { period: 3, time: '09:30 AM - 10:15 AM', subject: 'English Composition', teacher: 'Ms. Ayesha Khan', room: 'Room 101', type: 'Writing Lab' },
    { period: 0, time: '10:15 AM - 10:45 AM', subject: 'Recess', teacher: 'Supervisory Staff', room: 'Courtyard', type: 'Break' },
    { period: 4, time: '10:45 AM - 11:30 AM', subject: 'Biology / Computer Science', teacher: 'Faculty Members', room: 'Lab 2', type: 'Practical' },
    { period: 5, time: '11:30 AM - 12:30 PM', subject: 'Friday Congregational Prayers & Dismissal', teacher: 'All Faculty', room: 'School Mosque', type: 'Assembly' }
  ],
  Saturday: [
    { period: 1, time: '08:30 AM - 09:30 AM', subject: 'Stem & Robotics Club', teacher: 'Dr. Bilal / Sir Imran', room: 'Innovation Lab', type: 'Club' },
    { period: 2, time: '09:30 AM - 10:30 AM', subject: 'Debating & Speech Society', teacher: 'Ms. Ayesha Khan', room: 'Auditorium', type: 'Co-Curricular' },
    { period: 3, time: '10:30 AM - 11:30 AM', subject: 'Sports Practice (Cricket / Football)', teacher: 'Coach Rashid', room: 'Main Ground', type: 'Sports' }
  ]
}

// Demo attendance logs
const DEMO_ATTENDANCE_SUMMARY = {
  totalWorkingDays: 120,
  presentDays: 113,
  absentDays: 4,
  leaveDays: 3,
  attendancePercentage: 94.2
}

const DEMO_ATTENDANCE_LOGS = [
  { date: '2026-11-13', status: 'Present', punchIn: '07:51 AM', punchOut: '01:50 PM', remarks: 'On time' },
  { date: '2026-11-12', status: 'Present', punchIn: '07:48 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-11-11', status: 'Present', punchIn: '07:55 AM', punchOut: '01:48 PM', remarks: 'On time' },
  { date: '2026-11-10', status: 'Leave', punchIn: '-', punchOut: '-', remarks: 'Approved medical leave' },
  { date: '2026-11-09', status: 'Present', punchIn: '07:45 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-11-06', status: 'Present', punchIn: '07:50 AM', punchOut: '12:35 PM', remarks: 'Friday dismissal' },
  { date: '2026-11-05', status: 'Present', punchIn: '07:54 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-11-04', status: 'Present', punchIn: '07:49 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-11-03', status: 'Absent', punchIn: '-', punchOut: '-', remarks: 'Unexcused' },
  { date: '2026-11-02', status: 'Present', punchIn: '07:52 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-10-30', status: 'Present', punchIn: '07:45 AM', punchOut: '12:35 PM', remarks: 'Friday' },
  { date: '2026-10-29', status: 'Present', punchIn: '07:50 AM', punchOut: '01:45 PM', remarks: 'On time' },
  { date: '2026-10-28', status: 'Present', punchIn: '07:58 AM', punchOut: '01:45 PM', remarks: 'On time' }
]

// Demo Challans & Invoices
const INITIAL_CHALLANS = [
  {
    id: 'CH-2026-1101',
    challanNo: 'CH-2026-1101',
    month: 'November 2026',
    issueDate: '2026-11-01',
    dueDate: '2026-11-15',
    tuitionFee: 6500,
    examFee: 500,
    labCharges: 300,
    discount: 500,
    totalPayable: 6800,
    paidAmount: 6800,
    status: 'Paid',
    paidDate: '2026-11-05',
    paymentMethod: 'Online Bank Transfer',
    transactionRef: 'FT261105991823'
  },
  {
    id: 'CH-2026-1001',
    challanNo: 'CH-2026-1001',
    month: 'October 2026',
    issueDate: '2026-10-01',
    dueDate: '2026-10-15',
    tuitionFee: 6500,
    examFee: 0,
    labCharges: 300,
    discount: 500,
    totalPayable: 6300,
    paidAmount: 6300,
    status: 'Paid',
    paidDate: '2026-10-06',
    paymentMethod: 'Easypaisa Mobile Wallet',
    transactionRef: 'EP7723910012'
  },
  {
    id: 'CH-2026-0901',
    challanNo: 'CH-2026-0901',
    month: 'September 2026',
    issueDate: '2026-09-01',
    dueDate: '2026-09-15',
    tuitionFee: 6500,
    examFee: 0,
    labCharges: 300,
    discount: 500,
    totalPayable: 6300,
    paidAmount: 6300,
    status: 'Paid',
    paidDate: '2026-09-08',
    paymentMethod: 'Bank Cash Counter',
    transactionRef: 'BNK-BR-409'
  }
]

// Demo Exam Results
const EXAM_RESULTS_DATA = [
  { subject: 'Mathematics', maxMarks: 100, passMarks: 40, obtained: 95, grade: 'A+', remarks: 'Outstanding analytical skills' },
  { subject: 'Physics', maxMarks: 100, passMarks: 40, obtained: 92, grade: 'A+', remarks: 'Excellent lab and theoretical work' },
  { subject: 'Chemistry', maxMarks: 100, passMarks: 40, obtained: 88, grade: 'A', remarks: 'Very good conceptual grasp' },
  { subject: 'English Language', maxMarks: 100, passMarks: 40, obtained: 89, grade: 'A', remarks: 'Impressive essay and vocabulary' },
  { subject: 'Computer Science', maxMarks: 100, passMarks: 40, obtained: 98, grade: 'A+', remarks: 'Top scorer in coding and practical' },
  { subject: 'Pakistan Studies', maxMarks: 50, passMarks: 20, obtained: 46, grade: 'A+', remarks: 'Well-researched answers' },
  { subject: 'Islamiat', maxMarks: 50, passMarks: 20, obtained: 47, grade: 'A+', remarks: 'Exemplary performance' }
]

// Demo Assignments
const INITIAL_ASSIGNMENTS = [
  {
    id: 'asn-1',
    title: 'Calculus & Quadratic Equations Worksheet',
    subject: 'Mathematics',
    teacher: 'Prof. Tariq Mehmood',
    assignedDate: '2026-11-10',
    dueDate: '2026-11-16',
    maxScore: 20,
    status: 'Pending',
    description: 'Complete questions 1 to 15 from Exercise 4.2 in your notebook and upload clear photos or PDF solution.',
    attachment: 'Math_Quadratic_Practice_Set.pdf'
  },
  {
    id: 'asn-2',
    title: 'Electromagnetic Induction Lab Report',
    subject: 'Physics',
    teacher: 'Sir Imran Nazir',
    assignedDate: '2026-11-08',
    dueDate: '2026-11-14',
    maxScore: 25,
    status: 'Submitted',
    submissionDate: '2026-11-12',
    description: 'Write a comprehensive lab report outlining the experiment on Faraday’s Law of Electromagnetic Induction.',
    attachment: 'Physics_Lab_Manual_Exp4.pdf',
    mySubmission: 'Saleem_Ahmed_Physics_Lab_Report.pdf'
  },
  {
    id: 'asn-3',
    title: 'Chemical Equilibrium Simulation Analysis',
    subject: 'Chemistry',
    teacher: 'Dr. Bilal Farooq',
    assignedDate: '2026-11-01',
    dueDate: '2026-11-07',
    maxScore: 20,
    obtainedScore: 19,
    status: 'Graded',
    submissionDate: '2026-11-05',
    feedback: 'Excellent explanation of Le Chatelier’s principle. Well structured graph curves.',
    description: 'Analyze the effects of temperature, pressure, and concentration on dynamic chemical equilibrium.',
    attachment: 'Chemistry_Equilibrium_Task.pdf'
  }
]

export default function StudentPortalView() {
  const { user, logout } = useAuth()
  const { notices = [] } = useAppData()
  const { isDark, toggleThemeMode } = useTheme()
  const { toast } = useToast()

  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Sub-features state
  const [selectedTimetableDay, setSelectedTimetableDay] = useState('Monday')
  const [challansList, setChallansList] = useState(INITIAL_CHALLANS)
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState(null)
  const [selectedChallanForPayment, setSelectedChallanForPayment] = useState(null)
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false)
  const [isIdCardModalOpen, setIsIdCardModalOpen] = useState(false)

  // Leave application state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [leaveType, setLeaveType] = useState('Sick Leave')
  const [leaveStartDate, setLeaveStartDate] = useState('')
  const [leaveEndDate, setLeaveEndDate] = useState('')
  const [leaveReason, setLeaveReason] = useState('')
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 'lv-1', type: 'Medical Leave', from: '2026-11-10', to: '2026-11-10', reason: 'Viral flu and doctor visit', status: 'Approved', approvedBy: 'Principal Office' }
  ])

  // Assignments state
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS)
  const [assignmentFilter, setAssignmentFilter] = useState('All')
  const [submittingAssignment, setSubmittingAssignment] = useState(null)
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [submissionFileName, setSubmissionFileName] = useState('')

  // Notice board search & category
  const [noticeSearch, setNoticeSearch] = useState('')
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState('All')
  const [viewingNotice, setViewingNotice] = useState(null)

  // Online payment state
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [txnRefNumber, setTxnRefNumber] = useState('')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Student Identity data
  const student = useMemo(() => {
    return {
      ...DEFAULT_STUDENT_PROFILE,
      name: user?.name || DEFAULT_STUDENT_PROFILE.name,
      rollNumber: user?.rollNumber || DEFAULT_STUDENT_PROFILE.rollNumber,
      admissionNumber: user?.admissionNumber || DEFAULT_STUDENT_PROFILE.admissionNumber,
      className: user?.className || DEFAULT_STUDENT_PROFILE.className,
      section: user?.section || DEFAULT_STUDENT_PROFILE.section,
      email: user?.email || DEFAULT_STUDENT_PROFILE.email,
      campus: user?.instituteName || DEFAULT_STUDENT_PROFILE.campus
    }
  }, [user])

  // Total calculated exam marks
  const examStats = useMemo(() => {
    const totalMax = EXAM_RESULTS_DATA.reduce((sum, item) => sum + item.maxMarks, 0)
    const totalObtained = EXAM_RESULTS_DATA.reduce((sum, item) => sum + item.obtained, 0)
    const percentage = ((totalObtained / totalMax) * 100).toFixed(1)
    return {
      totalMax,
      totalObtained,
      percentage,
      grade: percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : 'C',
      rank: '3rd in Class 10-A',
      status: 'Passed with Distinction'
    }
  }, [])

  // Combined notices list
  const allNotices = useMemo(() => {
    const defaultStudentNotices = [
      {
        id: 'sn-1',
        title: 'Mid-Term Examinations Schedule Announced',
        category: 'Examinations',
        date: '2026-11-12',
        priority: 'High',
        author: 'Controller of Examinations',
        content: 'The Mid-Term Examinations for classes 9 and 10 will commence from Monday, 1st December 2026. Admit cards will be available for download starting 25th November. Please ensure all library books and fee dues are cleared.'
      },
      {
        id: 'sn-2',
        title: 'Annual Inter-House Sports Gala 2026',
        category: 'Sports',
        date: '2026-11-08',
        priority: 'Normal',
        author: 'Sports Committee',
        content: 'The Annual Sports Gala will be celebrated from 20th to 22nd November. Trials for Cricket, Badminton, Football, and Athletics begin this Thursday during club hours.'
      },
      {
        id: 'sn-3',
        title: 'Winter Uniform Mandatory Notice',
        category: 'General',
        date: '2026-11-05',
        priority: 'Normal',
        author: 'Discipline Department',
        content: 'All students are reminded that official navy blue blazers/sweaters become compulsory starting 15th November. Proper neckties and polished shoes are mandatory.'
      }
    ]
    return [...defaultStudentNotices, ...(notices || [])]
  }, [notices])

  // Filtered notices
  const filteredNotices = useMemo(() => {
    return allNotices.filter(n => {
      const matchCat = selectedNoticeCategory === 'All' || n.category === selectedNoticeCategory
      const matchSearch = !noticeSearch.trim() || 
        n.title.toLowerCase().includes(noticeSearch.toLowerCase()) || 
        (n.content && n.content.toLowerCase().includes(noticeSearch.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [allNotices, selectedNoticeCategory, noticeSearch])

  // Filtered assignments
  const filteredAssignments = useMemo(() => {
    if (assignmentFilter === 'All') return assignments
    return assignments.filter(a => a.status === assignmentFilter)
  }, [assignments, assignmentFilter])

  // Submit assignment handler
  const handleAssignmentSubmit = (e) => {
    e.preventDefault()
    if (!submittingAssignment) return

    setAssignments(prev =>
      prev.map(a =>
        a.id === submittingAssignment.id
          ? {
              ...a,
              status: 'Submitted',
              submissionDate: new Date().toISOString().slice(0, 10),
              mySubmission: submissionFileName || 'student_solution.pdf',
              submissionNotes
            }
          : a
      )
    )

    toast?.success?.('Assignment submitted successfully!') || alert('Assignment submitted!')
    setSubmittingAssignment(null)
    setSubmissionNotes('')
    setSubmissionFileName('')
  }

  // Submit leave request handler
  const handleLeaveSubmit = (e) => {
    e.preventDefault()
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      alert('Please fill out all required fields.')
      return
    }

    const newLeave = {
      id: `lv-${Date.now()}`,
      type: leaveType,
      from: leaveStartDate,
      to: leaveEndDate,
      reason: leaveReason,
      status: 'Pending',
      approvedBy: 'Pending Class Teacher Review'
    }

    setLeaveRequests(prev => [newLeave, ...prev])
    toast?.success?.('Leave application submitted for approval!') || alert('Leave application submitted!')
    setIsLeaveModalOpen(false)
    setLeaveStartDate('')
    setLeaveEndDate('')
    setLeaveReason('')
  }

  // Handle Online Payment
  const handlePaymentSubmit = (e) => {
    e.preventDefault()
    if (!selectedChallanForPayment) return

    setIsProcessingPayment(true)
    setTimeout(() => {
      const updatedTxn = txnRefNumber.trim() || `TXN-${Date.now()}`
      setChallansList(prev =>
        prev.map(c =>
          c.id === selectedChallanForPayment.id
            ? {
                ...c,
                status: 'Paid',
                paidAmount: c.totalPayable,
                paidDate: new Date().toISOString().slice(0, 10),
                paymentMethod,
                transactionRef: updatedTxn
              }
            : c
        )
      )
      setIsProcessingPayment(false)
      setSelectedChallanForPayment(null)
      setTxnRefNumber('')
      toast?.success?.('Payment recorded successfully! Fee challan cleared.') || alert('Payment recorded!')
    }, 800)
  }

  // Print function helper
  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f7fb] text-slate-800'}`}>
      {/* Top Navbar */}
      <header className={`sticky top-0 z-30 h-16 border-b transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} px-4 sm:px-6 flex items-center justify-between shadow-xs`}>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-amber-500/20 text-sm">
              ED
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white">
                  EduDigitize
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-[280px]">
                {student.campus}
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Session Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
            <span>Session: {student.session}</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Notifications & Alerts
                  </h4>
                  <span className="text-[11px] text-amber-600 font-semibold cursor-pointer" onClick={() => setIsNotifOpen(false)}>
                    Close
                  </span>
                </div>
                <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                    <p className="font-semibold text-amber-900 dark:text-amber-200">
                      Mid-Term Date Sheet Released
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Examinations start from 1st December 2026. Review syllabus in notice board.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                      Fee Cleared
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Your fee challan for November 2026 has been marked fully paid.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Student Profile Snapshot */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              SA
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {student.name}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {student.className}-{student.section} &bull; {student.rollNumber}
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-20 w-64 flex-col border-r transition-transform duration-200 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex`}
        >
          {/* Student Mini Card in Sidebar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-indigo-500/5 to-slate-100 dark:from-amber-950/30 dark:via-indigo-950/20 dark:to-slate-900 border border-amber-200/50 dark:border-amber-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  SA
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {student.name}
                  </h3>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    {student.className} &bull; Section {student.section}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>Roll: {student.rollNumber}</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Home },
              { id: 'timetable', label: 'My Timetable', icon: CalendarDays },
              { id: 'attendance', label: 'Attendance & Leaves', icon: UserCheck },
              { id: 'fees', label: 'Fees & Challans', icon: Receipt },
              { id: 'exams', label: 'Exams & Results', icon: GraduationCap },
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'notices', label: 'Notice Board', icon: Megaphone },
              { id: 'profile', label: 'Student ID & Profile', icon: IdCard }
            ].map(item => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 dark:bg-amber-600'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          {/* Bottom Card */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              type="button"
              onClick={() => setIsIdCardModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <IdCard className="w-3.5 h-3.5 text-amber-500" />
              <span>Digital Student Card</span>
            </button>
          </div>
        </aside>

        {/* Backdrop for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              {/* Welcome Hero Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-700 p-6 sm:p-8 text-white shadow-lg shadow-amber-500/10">
                <div className="relative z-10 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-xs mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> Academic Year {student.session}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Welcome back, {student.name}!
                  </h1>
                  <p className="mt-2 text-sm text-white/90 leading-relaxed">
                    You are enrolled in <span className="font-bold">{student.className} (Section {student.section})</span>. All your daily timetables, fee challans, exam results, and attendance records are up-to-date.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveTab('timetable')}
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <CalendarDays className="w-3.5 h-3.5 text-amber-600" /> View Today's Schedule
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('fees')}
                      className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors backdrop-blur-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Receipt className="w-3.5 h-3.5" /> Fee Challans
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsIdCardModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-colors backdrop-blur-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <IdCard className="w-3.5 h-3.5" /> Student Card
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Attendance Rate */}
                <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {DEMO_ATTENDANCE_SUMMARY.attendancePercentage}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Excellent</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {DEMO_ATTENDANCE_SUMMARY.presentDays} of {DEMO_ATTENDANCE_SUMMARY.totalWorkingDays} days present
                  </p>
                  <div className="mt-3 w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${DEMO_ATTENDANCE_SUMMARY.attendancePercentage}%` }} />
                  </div>
                </div>

                {/* 2. Fee Balance */}
                <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Balance</span>
                    <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      PKR 0
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">Cleared</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nov 2026 challan paid in full
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    View Challan Details &rarr;
                  </button>
                </div>

                {/* 3. Academic GPA */}
                <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Term Result</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {examStats.percentage}%
                    </span>
                    <span className="text-xs font-semibold text-purple-600">Grade {examStats.grade}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Position: {examStats.rank}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('exams')}
                    className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    View Report Card &rarr;
                  </button>
                </div>

                {/* 4. Homework & Deadlines */}
                <div className={`p-5 rounded-2xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assignments</span>
                    <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {assignments.filter(a => a.status === 'Pending').length} Pending
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Due this week: Mathematics 4.2
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="mt-3 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Open Assignments &rarr;
                  </button>
                </div>
              </div>

              {/* Main Content Two-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Today's Schedule */}
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 dark:text-white">
                        Today's Class Schedule (Monday)
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {TIMETABLE_SCHEDULE.Monday.length} scheduled periods today &bull; Class 10-A
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('timetable')}
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                    >
                      Full Weekly Timetable &rarr;
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {TIMETABLE_SCHEDULE.Monday.slice(0, 5).map((slot, idx) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          slot.period === 0
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            slot.period === 0
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                          }`}>
                            {slot.period === 0 ? 'B' : `P${slot.period}`}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {slot.subject}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>{slot.teacher}</span> &bull; <span>{slot.room}</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {slot.time}
                          </span>
                          <span className="block text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                            {slot.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Notices & Upcoming Events */}
                <div className="space-y-6">
                  {/* Notice Highlights */}
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Megaphone className="w-4 h-4 text-amber-500" />
                        Important Notices
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTab('notices')}
                        className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                      >
                        All &rarr;
                      </button>
                    </div>

                    <div className="space-y-3">
                      {allNotices.slice(0, 3).map((notice) => (
                        <div
                          key={notice.id}
                          onClick={() => {
                            setViewingNotice(notice)
                          }}
                          className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-amber-50/60 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                              {notice.category}
                            </span>
                            <span>{notice.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {notice.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                            {notice.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Card */}
                  <div className={`p-5 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Quick Self-Service
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setIsLeaveModalOpen(true)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-semibold"
                      >
                        <UserCheck className="w-4 h-4 text-emerald-500 mb-1" />
                        Apply Leave
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsReportCardModalOpen(true)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-semibold"
                      >
                        <Award className="w-4 h-4 text-purple-500 mb-1" />
                        Report Card
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedChallanForPrint(challansList[0])
                        }}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-semibold"
                      >
                        <Printer className="w-4 h-4 text-amber-500 mb-1" />
                        Print Challan
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsIdCardModalOpen(true)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors font-semibold"
                      >
                        <IdCard className="w-4 h-4 text-blue-500 mb-1" />
                        Student Card
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TIMETABLE */}
          {activeTab === 'timetable' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Class Academic Timetable
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {student.className} &bull; Section {student.section} &bull; Academic Session {student.session}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={triggerBrowserPrint}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-500" />
                    Print Timetable
                  </button>
                </div>
              </div>

              {/* Day Selector Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {Object.keys(TIMETABLE_SCHEDULE).map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedTimetableDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      selectedTimetableDay === day
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 dark:bg-amber-600'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              {/* Timetable Schedule Cards */}
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Schedule for {selectedTimetableDay}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {TIMETABLE_SCHEDULE[selectedTimetableDay]?.length || 0} Periods
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(TIMETABLE_SCHEDULE[selectedTimetableDay] || []).map((slot, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-2xl border transition-all ${
                        slot.period === 0
                          ? 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-200 dark:border-slate-700'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200/90 dark:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            slot.period === 0
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}>
                            {slot.period === 0 ? 'Break' : `P${slot.period}`}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {slot.subject}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {slot.teacher}
                            </p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {slot.type}
                        </span>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1.5 font-medium">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> {slot.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" /> {slot.room}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ATTENDANCE & LEAVES */}
          {activeTab === 'attendance' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Attendance Record & Leave Portal
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Monthly attendance breakdown and formal leave request submissions
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Apply for Leave
                </button>
              </div>

              {/* Attendance KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Working Days</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {DEMO_ATTENDANCE_SUMMARY.totalWorkingDays}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Days Present</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {DEMO_ATTENDANCE_SUMMARY.presentDays}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Days Absent</span>
                  <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {DEMO_ATTENDANCE_SUMMARY.absentDays}
                  </p>
                </div>
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Percentage</span>
                  <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                    {DEMO_ATTENDANCE_SUMMARY.attendancePercentage}%
                  </p>
                </div>
              </div>

              {/* Attendance Table & Leave History */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Daily Logs Table */}
                <div className={`lg:col-span-2 p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                    Daily Attendance Logs (November 2026)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                          <th className="py-2.5 px-3">Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Punch In</th>
                          <th className="py-2.5 px-3">Punch Out</th>
                          <th className="py-2.5 px-3">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {DEMO_ATTENDANCE_LOGS.map((log, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                              {log.date}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                log.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : log.status === 'Leave'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{log.punchIn}</td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{log.punchOut}</td>
                            <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{log.remarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Submitted Leave Applications */}
                <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Leave Applications
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {leaveRequests.length} filed
                    </span>
                  </div>

                  <div className="space-y-3">
                    {leaveRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {req.type}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
                            {req.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          Dates: {req.from} to {req.to}
                        </p>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-100 dark:border-slate-700">
                          "{req.reason}"
                        </p>
                        <span className="block text-[10px] text-slate-400 mt-2">
                          Note: {req.approvedBy}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEES & CHALLANS */}
          {activeTab === 'fees' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Fee Invoices & Bank Challans
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Download authentic 3-part bank challans and pay tuition dues online
                  </p>
                </div>
              </div>

              {/* Financial Status Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-xs font-bold uppercase text-slate-400">Total Billed (Session)</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    PKR 19,400
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">3 Terms / Months issued</p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-xs font-bold uppercase text-slate-400">Total Paid</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    PKR 19,400
                  </p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Cleared on record</p>
                </div>
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                  <span className="text-xs font-bold uppercase text-slate-400">Current Outstanding</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    PKR 0
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">No pending surcharge</p>
                </div>
              </div>

              {/* Challans Table */}
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Fee Challan Records
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-3 px-3">Challan #</th>
                        <th className="py-3 px-3">Billing Month</th>
                        <th className="py-3 px-3">Due Date</th>
                        <th className="py-3 px-3">Tuition Fee</th>
                        <th className="py-3 px-3">Lab / Other</th>
                        <th className="py-3 px-3">Net Payable</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {challansList.map((ch) => (
                        <tr key={ch.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            {ch.challanNo}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ch.month}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{ch.dueDate}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">PKR {ch.tuitionFee.toLocaleString()}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-300">PKR {(ch.labCharges + ch.examFee).toLocaleString()}</td>
                          <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                            PKR {ch.totalPayable.toLocaleString()}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                              ch.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                              {ch.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedChallanForPrint(ch)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                                title="Print 3-part bank challan"
                              >
                                <Printer className="w-3 h-3 text-amber-500" />
                                <span>Challan</span>
                              </button>
                              {ch.status !== 'Paid' && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedChallanForPayment(ch)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EXAMS & RESULTS */}
          {activeTab === 'exams' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Examination Results & Academic Performance
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Mid-Term Assessment 2025-2026 &bull; Class 10-A
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportCardModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm shadow-purple-600/20 cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5" />
                  Print Official Report Card
                </button>
              </div>

              {/* Performance Summary Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-purple-200">Total Marks</span>
                    <p className="text-2xl sm:text-3xl font-extrabold mt-1">
                      {examStats.totalObtained} / {examStats.totalMax}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-purple-200">Overall Percentage</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-1">
                      {examStats.percentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-purple-200">Grade</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-300 mt-1">
                      {examStats.grade}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-purple-200">Class Position</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                      {examStats.rank}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject-Wise Marks Sheet */}
              <div className={`p-6 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
                  Detailed Subject-Wise Marks Transcript
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                        <th className="py-3 px-3">Subject Name</th>
                        <th className="py-3 px-3">Max Marks</th>
                        <th className="py-3 px-3">Pass Marks</th>
                        <th className="py-3 px-3">Obtained</th>
                        <th className="py-3 px-3">Percentage</th>
                        <th className="py-3 px-3">Grade</th>
                        <th className="py-3 px-3">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {EXAM_RESULTS_DATA.map((row, idx) => {
                        const pct = ((row.obtained / row.maxMarks) * 100).toFixed(0)
                        return (
                          <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                              {row.subject}
                            </td>
                            <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.maxMarks}</td>
                            <td className="py-3 px-3 text-slate-500">{row.passMarks}</td>
                            <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                              {row.obtained}
                            </td>
                            <td className="py-3 px-3 text-slate-700 dark:text-slate-300">{pct}%</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                {row.grade}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-500 dark:text-slate-400">{row.remarks}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ASSIGNMENTS & HOMEWORK */}
          {activeTab === 'assignments' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Homework & Subject Assignments
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Track coursework, submit completed tasks, and view instructor remarks
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
                  {['All', 'Pending', 'Submitted', 'Graded'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAssignmentFilter(status)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        assignmentFilter === status
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignments Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredAssignments.map((asn) => (
                  <div
                    key={asn.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } shadow-xs hover:border-amber-300`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                          {asn.subject}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          asn.status === 'Graded'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                            : asn.status === 'Submitted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {asn.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {asn.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Assigned by {asn.teacher}
                      </p>

                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                        {asn.description}
                      </p>

                      {asn.feedback && (
                        <div className="mt-3 p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                          <span className="font-bold text-purple-900 dark:text-purple-200">
                            Teacher Feedback ({asn.obtainedScore} / {asn.maxScore} marks):
                          </span>
                          <p className="text-purple-700 dark:text-purple-300 mt-0.5">
                            {asn.feedback}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Due Date</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{asn.dueDate}</span>
                      </div>

                      {asn.status === 'Pending' ? (
                        <button
                          type="button"
                          onClick={() => setSubmittingAssignment(asn)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition-colors shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" /> Submit Solution
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Submitted on {asn.submissionDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: NOTICE BOARD */}
          {activeTab === 'notices' && (
            <div className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Official Notice Board
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Broadcast announcements, circulars, and institutional notifications
                  </p>
                </div>
              </div>

              {/* Search & Filter Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={noticeSearch}
                    onChange={(e) => setNoticeSearch(e.target.value)}
                    placeholder="Search announcements..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                  {['All', 'Examinations', 'Sports', 'General'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedNoticeCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        selectedNoticeCategory === cat
                          ? 'bg-amber-500 text-white dark:bg-amber-600'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notices Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotices.map((notice) => (
                  <div
                    key={notice.id}
                    onClick={() => setViewingNotice(notice)}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between cursor-pointer ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } shadow-xs hover:border-amber-400 hover:shadow-md`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {notice.category}
                        </span>
                        <span className="text-[11px] text-slate-400">{notice.date}</span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mt-1">
                        {notice.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {notice.content}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Issued by {notice.author || 'Administration'}</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">Read &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: STUDENT ID CARD & PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Student Profile & Digital ID Card
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Verified student credentials and printable photo identity card
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsIdCardModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-sm shadow-amber-500/20 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print ID Card
                </button>
              </div>

              {/* Digital ID Card Preview Component */}
              <div className="flex justify-center p-4 sm:p-8 bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
                <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-xl overflow-hidden text-slate-900 dark:text-white">
                  {/* Top Card Banner */}
                  <div className="bg-gradient-to-r from-amber-500 to-indigo-600 p-4 text-white text-center">
                    <h3 className="font-extrabold text-sm tracking-wide uppercase">
                      City School System
                    </h3>
                    <p className="text-[10px] text-white/80">Model Town Campus &bull; Student Identity Card</p>
                  </div>

                  {/* Body with Photo and Details */}
                  <div className="p-6 text-center">
                    <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-600 p-1 shadow-md">
                      <div className="w-full h-full rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-extrabold text-2xl text-slate-700 dark:text-slate-200">
                        SA
                      </div>
                    </div>

                    <h2 className="text-lg font-extrabold mt-3 text-slate-900 dark:text-white">
                      {student.name}
                    </h2>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {student.className} &bull; Section {student.section}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number</span>
                        <span className="font-bold text-slate-900 dark:text-white">{student.rollNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission #</span>
                        <span className="font-bold text-slate-900 dark:text-white">{student.admissionNumber}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                        <span className="font-bold text-slate-900 dark:text-white">{student.bloodGroup}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Valid Thru</span>
                        <span className="font-bold text-emerald-600">30 Jun 2026</span>
                      </div>
                    </div>

                    {/* Barcode representation */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
                      <div className="h-9 w-48 bg-slate-900 dark:bg-white rounded flex items-center justify-around px-2 text-[9px] text-white dark:text-slate-900 tracking-widest font-mono select-none">
                        ||||| | |||| ||||| ||| |||||||
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 mt-1">
                        *{student.admissionNumber}*
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comprehensive Profile Details Form */}
              <div className={`p-6 sm:p-8 rounded-3xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xs`}>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                  Registered Profile Particulars
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Full Name</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{student.name}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Father / Guardian Name</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{student.fatherName}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Date of Birth</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{student.dob}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Emergency Contact</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{student.phone}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Email Address</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block">{student.email}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Residential Address</span>
                    <span className="font-bold text-slate-900 dark:text-white text-sm mt-0.5 block truncate">{student.address}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL 1: 3-Part Bank Challan Print Modal */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Official 3-Part Bank Deposit Challan
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Challan
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChallanForPrint(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 3 Copy Slip Grid */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-300 p-4 rounded-2xl bg-slate-50/50 text-[11px]">
              {['Bank Copy', 'Institute Copy', 'Student Copy'].map((copyTitle, cIdx) => (
                <div key={cIdx} className={`p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between ${cIdx > 0 ? 'border-dashed border-l-slate-300' : ''}`}>
                  <div>
                    <div className="text-center pb-2 border-b border-slate-200">
                      <span className="font-extrabold uppercase text-[10px] text-amber-700 block">
                        Habib Bank Limited (HBL)
                      </span>
                      <h4 className="font-bold text-xs mt-0.5">City School System</h4>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[9px]">
                        {copyTitle}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Challan #:</span>
                        <span className="font-mono font-bold">{selectedChallanForPrint.challanNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-bold text-rose-600">{selectedChallanForPrint.dueDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold">{student.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Roll #:</span>
                        <span className="font-mono">{student.rollNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class:</span>
                        <span>{student.className}-{student.section}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span>Tuition Fee</span>
                        <span>PKR {selectedChallanForPrint.tuitionFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lab & Activity</span>
                        <span>PKR {selectedChallanForPrint.labCharges}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Exam Fee</span>
                        <span>PKR {selectedChallanForPrint.examFee}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600">
                        <span>Scholarship / Concession</span>
                        <span>- PKR {selectedChallanForPrint.discount}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-900">
                        <span>Total Payable</span>
                        <span>PKR {selectedChallanForPrint.totalPayable}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center">
                    <span className="text-[9px] text-slate-400 block">Bank Officer Signature & Stamp</span>
                    <div className="h-6" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChallanForPrint(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Online Fee Payment Modal */}
      {selectedChallanForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">
                Online Payment Gateway
              </h3>
              <button
                type="button"
                onClick={() => setSelectedChallanForPayment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                <span className="text-slate-500 block">Payable for {selectedChallanForPayment.month}</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">
                  PKR {selectedChallanForPayment.totalPayable.toLocaleString()}
                </span>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Bank Transfer', 'Easypaisa', 'JazzCash', 'Debit / Credit Card'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-left font-semibold transition-all ${
                        paymentMethod === m
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Transaction Reference / TID #
                </label>
                <input
                  type="text"
                  required
                  value={txnRefNumber}
                  onChange={(e) => setTxnRefNumber(e.target.value)}
                  placeholder="e.g. FT26110992381"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChallanForPayment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50"
                >
                  {isProcessingPayment ? 'Confirming...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Assignment Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">
                Submit Assignment: {submittingAssignment.title}
              </h3>
              <button
                type="button"
                onClick={() => setSubmittingAssignment(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignmentSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Instructions</span>
                <p className="text-slate-700 dark:text-slate-300 mt-1">{submittingAssignment.description}</p>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Attach Solution File (PDF / Images / Docs)
                </label>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-5 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <span className="font-semibold text-amber-600 block">Choose file or drag & drop</span>
                  <span className="text-[10px] text-slate-400">PDF, JPG, PNG up to 10MB</span>
                  <input
                    type="file"
                    className="hidden"
                    id="assignment-file"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setSubmissionFileName(e.target.files[0].name)
                      }
                    }}
                  />
                  <label htmlFor="assignment-file" className="mt-2 inline-block px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-semibold cursor-pointer">
                    Browse Computer
                  </label>
                  {submissionFileName && (
                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      Selected: {submissionFileName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Submission Notes for Teacher (Optional)
                </label>
                <textarea
                  rows={3}
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  placeholder="Add any comments or questions for your teacher..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Turn In Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Leave Application Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">
                Student Leave Application
              </h3>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Reason / Category
                </label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="Sick Leave">Sick / Medical Leave</option>
                  <option value="Casual Leave">Casual / Personal Leave</option>
                  <option value="Family Event">Family Emergency / Wedding</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                  Reason & Details
                </label>
                <textarea
                  rows={3}
                  required
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  placeholder="State the reason for absence..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
                >
                  Send Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Official Report Card Modal */}
      {isReportCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Official Student Academic Progress Report
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Report Card
                </button>
                <button
                  type="button"
                  onClick={() => setIsReportCardModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Sheet */}
            <div className="mt-6 border-2 border-slate-900 p-6 rounded-2xl bg-white text-xs">
              <div className="text-center pb-4 border-b-2 border-slate-900">
                <h2 className="text-xl font-extrabold uppercase tracking-wide">
                  City School System
                </h2>
                <p className="text-xs text-slate-600">Model Town Campus, Lahore &bull; Affiliated with BISE</p>
                <span className="inline-block mt-2 px-4 py-1 rounded-full bg-slate-100 font-extrabold uppercase text-xs tracking-wider">
                  Academic Progress Report &bull; Mid-Term 2025-2026
                </span>
              </div>

              {/* Student Header Particulars */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Student Name</span>
                  <p className="font-bold text-slate-900">{student.name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Roll Number</span>
                  <p className="font-bold text-slate-900 font-mono">{student.rollNumber}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Class & Section</span>
                  <p className="font-bold text-slate-900">{student.className} - {student.section}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Admission No</span>
                  <p className="font-bold text-slate-900 font-mono">{student.admissionNumber}</p>
                </div>
              </div>

              {/* Marks Table */}
              <div className="mt-5">
                <table className="w-full text-left text-xs border border-slate-300">
                  <thead className="bg-slate-100 border-b border-slate-300">
                    <tr className="text-[10px] uppercase font-bold text-slate-700">
                      <th className="p-2 border-r border-slate-300">Subject</th>
                      <th className="p-2 border-r border-slate-300 text-center">Max Marks</th>
                      <th className="p-2 border-r border-slate-300 text-center">Passing</th>
                      <th className="p-2 border-r border-slate-300 text-center">Obtained</th>
                      <th className="p-2 border-r border-slate-300 text-center">Grade</th>
                      <th className="p-2">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {EXAM_RESULTS_DATA.map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2 border-r border-slate-300 font-semibold">{row.subject}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{row.maxMarks}</td>
                        <td className="p-2 border-r border-slate-300 text-center">{row.passMarks}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold text-slate-900">{row.obtained}</td>
                        <td className="p-2 border-r border-slate-300 text-center font-bold">{row.grade}</td>
                        <td className="p-2 text-slate-600">{row.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <tr>
                      <td className="p-2 border-r border-slate-300 uppercase">Grand Total</td>
                      <td className="p-2 border-r border-slate-300 text-center">{examStats.totalMax}</td>
                      <td className="p-2 border-r border-slate-300 text-center">-</td>
                      <td className="p-2 border-r border-slate-300 text-center text-slate-900">{examStats.totalObtained}</td>
                      <td className="p-2 border-r border-slate-300 text-center text-purple-700">{examStats.grade}</td>
                      <td className="p-2">{examStats.percentage}% &bull; {examStats.rank}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Signatures Footer */}
              <div className="mt-10 pt-6 border-t border-slate-300 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="h-8 border-b border-slate-400 mx-auto w-32" />
                  <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">Class Teacher</span>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mx-auto w-32" />
                  <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">Exam Controller</span>
                </div>
                <div>
                  <div className="h-8 border-b border-slate-400 mx-auto w-32" />
                  <span className="text-[10px] uppercase font-bold text-slate-500 mt-1 block">Principal Stamp</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsReportCardModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: Digital Student ID Card Printable Modal */}
      {isIdCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold">
                Student Photo Identity Card
              </h3>
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 border-2 border-amber-500/40 rounded-3xl overflow-hidden shadow-lg bg-white text-center">
              <div className="bg-gradient-to-r from-amber-500 to-indigo-600 p-4 text-white">
                <h4 className="font-extrabold text-sm uppercase">City School System</h4>
                <p className="text-[10px] text-white/80">Model Town Campus &bull; Student Identity Card</p>
              </div>

              <div className="p-6">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-1 shadow-md">
                  <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center font-extrabold text-2xl text-slate-700">
                    SA
                  </div>
                </div>

                <h3 className="text-lg font-extrabold mt-3 text-slate-900">
                  {student.name}
                </h3>
                <p className="text-xs font-semibold text-amber-600">
                  {student.className} - {student.section}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-left text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number</span>
                    <span className="font-bold text-slate-900 font-mono">{student.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission #</span>
                    <span className="font-bold text-slate-900 font-mono">{student.admissionNumber}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Blood Group</span>
                    <span className="font-bold text-slate-900">{student.bloodGroup}</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Session</span>
                    <span className="font-bold text-emerald-600">{student.session}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col items-center">
                  <div className="h-8 w-44 bg-slate-900 rounded flex items-center justify-around px-2 text-[9px] text-white tracking-widest font-mono">
                    ||||| | |||| ||||| ||| |||||||
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 mt-1">
                    *{student.admissionNumber}*
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsIdCardModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={triggerBrowserPrint}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" /> Print Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: View Notice Modal */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                {viewingNotice.category}
              </span>
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-slate-400 block">{viewingNotice.date}</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {viewingNotice.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                {viewingNotice.content}
              </p>
              <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <span>Issued by: {viewingNotice.author || 'Institutional Administration'}</span>
                <button
                  type="button"
                  onClick={() => setViewingNotice(null)}
                  className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
