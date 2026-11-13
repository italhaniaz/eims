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
  Bell,
  Mail,
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
  ArrowRight,
  Smartphone,
  User,
  Pencil,
  FolderOpen,
  MessageSquare,
  Hourglass,
  HelpCircle,
  CheckSquare,
  Share2,
  ArrowLeft,
  List,
  Eye,
  Image,
  MapPin,
  Video,
  Play,
  PlaySquare,
  Paperclip,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Percent
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

export default function StudentPortalView() {
  const { user, logout } = useAuth()
  const { notices = [] } = useAppData()
  const { isDark, toggleThemeMode } = useTheme()
  const { toast } = useToast()

  // Student Name State (Default 'Unknown' as explicitly requested, editable by user)
  const [studentName, setStudentName] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_name')
      if (stored) return stored
      if (user?.name && user.name !== 'Saleem Ahmed' && user.name !== 'Muhammad Ali') {
        return user.name
      }
    } catch {}
    return 'Unknown'
  })

  // Student Class State (Default 'Nursery' as shown in the screenshot)
  const [studentClass, setStudentClass] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_class')
      if (stored) return stored
      return user?.className || 'Nursery'
    } catch {}
    return 'Nursery'
  })

  // Student Section State (Default 'Super' as shown in screenshot)
  const [studentSection, setStudentSection] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_student_custom_section')
      if (stored) return stored
      return user?.section || 'Super'
    } catch {}
    return 'Super'
  })

  // Modal to enter/edit student name
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
  const [editNameInput, setEditNameInput] = useState('')
  const [editClassInput, setEditClassInput] = useState('')
  const [editSectionInput, setEditSectionInput] = useState('')

  // Navigation Tabs:
  // 'dashboard' | 'timetable' | 'attendance' | 'assignments' | 'resources' |
  // 'report-cards' | 'announcements' | 'communication' | 'fees' | 'download-app' | 'account'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Timetable sub-tabs: 'weekly' | 'exam'
  const [timetableSubTab, setTimetableSubTab] = useState('weekly')

  // Attendance filter states (matching screenshots)
  const [attendanceViewMode, setAttendanceViewMode] = useState('Month calendar')
  const [attendanceCategory, setAttendanceCategory] = useState('General (daily)')
  const [attendanceSelectedMonth, setAttendanceSelectedMonth] = useState('November')
  const [attendanceSelectedYear, setAttendanceSelectedYear] = useState('2026')
  const [attendanceStats, setAttendanceStats] = useState({
    present: 0,
    absent: 0,
    percentage: '0.0',
    workingDays: 21
  })

  // Sub-feature states
  const [selectedChallanForPrint, setSelectedChallanForPrint] = useState(null)
  const [isReportCardModalOpen, setIsReportCardModalOpen] = useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [viewingNotice, setViewingNotice] = useState(null)

  // Assignments Filter and Modal states (matching screenshot media_1794575634893_bd2533fd.png)
  const [assignmentSubjectFilter, setAssignmentSubjectFilter] = useState('All subjects')
  const [assignmentDateFilter, setAssignmentDateFilter] = useState('')
  const [selectedAssignmentModal, setSelectedAssignmentModal] = useState(null)

  // Default assignments data matching the exact screenshot:
  const defaultAssignments = useMemo(() => [
    {
      id: 1,
      title: 'module intro',
      description: '',
      hasAttachment: true,
      attachmentType: 'Image',
      attachmentName: 'module-intro-worksheet.png',
      attachmentUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
      subject: 'English',
      date: '21 May 2026',
      isoDate: '2026-05-21',
      teacher: 'Sana Kosar',
      instructions: 'Please review the module introduction slides and complete the attached drawing activity.'
    },
    {
      id: 2,
      title: 'First Assignment',
      description: 'This is you first assignment, check image and draw same like that',
      hasAttachment: true,
      attachmentType: 'Image',
      attachmentName: 'assignment1-drawing-task.png',
      attachmentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80',
      subject: 'English',
      date: '19 May 2026',
      isoDate: '2026-05-19',
      teacher: 'Sana Kosar',
      instructions: 'This is you first assignment, check image and draw same like that. Practice tracing and submit during the morning class.'
    },
    {
      id: 3,
      title: 'Daily HomeWork',
      description: 'Demo Home Work',
      hasAttachment: false,
      attachmentType: null,
      attachmentName: null,
      attachmentUrl: null,
      subject: 'English',
      date: '15 Jan 2026',
      isoDate: '2026-01-15',
      teacher: 'Sana Kosar',
      instructions: 'Demo Home Work. Read pages 12 to 14 of the English Phonics booklet and practice writing letters.'
    }
  ], [])

  const filteredAssignments = useMemo(() => {
    return defaultAssignments.filter(item => {
      const matchSubject = assignmentSubjectFilter === 'All subjects' || item.subject.toLowerCase() === assignmentSubjectFilter.toLowerCase()
      const matchDate = !assignmentDateFilter || item.isoDate === assignmentDateFilter
      return matchSubject && matchDate
    })
  }, [defaultAssignments, assignmentSubjectFilter, assignmentDateFilter])

  // Sidebar Submenu Accordion states
  const [isResourcesOpen, setIsResourcesOpen] = useState(true)
  const [isCommunicationOpen, setIsCommunicationOpen] = useState(true)

  // Pick 1: Handouts state (media_1794575732921_b8b0357e.png)
  const [handoutSearchInput, setHandoutSearchInput] = useState('')
  const [handoutSubjectInput, setHandoutSubjectInput] = useState('All')
  const [handoutAppliedFilters, setHandoutAppliedFilters] = useState({ search: '', subject: 'All' })
  const [handoutsList, setHandoutsList] = useState([
    // Empty by default to match screenshot "No handouts found.", but structure prepared
  ])

  // Pick 2: Recorded Lectures state (media_1794575827803_05220938.png)
  const [lectureSearchInput, setLectureSearchInput] = useState('')
  const [lectureSubjectInput, setLectureSubjectInput] = useState('All')
  const [lectureAppliedFilters, setLectureAppliedFilters] = useState({ search: '', subject: 'All' })
  const [lecturesList, setLecturesList] = useState([])
  const [selectedLectureVideo, setSelectedLectureVideo] = useState(null)

  // Pick 3: Report Cards state (media_1794575863429_6166311b.png)
  const [reportCardSelectedYear, setReportCardSelectedYear] = useState('2026')
  const [showDetailedReportCard, setShowDetailedReportCard] = useState(false)

  // Pick 4: Announcements state (media_1794575902541_cbada2e1.png)
  const [announcementSearchTerm, setAnnouncementSearchTerm] = useState('')
  const [announcementTypeFilter, setAnnouncementTypeFilter] = useState('All Types')
  const [announcementsDataList, setAnnouncementsDataList] = useState([
    {
      id: 1,
      title: 'Summer Holidays',
      isNew: true,
      author: 'Ahmad Ali',
      date: '15 Jun 2026, 08:20 AM',
      scope: 'Institute-wide',
      hasAttachment: false,
      type: 'Holiday',
      content: 'Summer Holidays for all classes Event date: 06 Jun 2026 – 19 Jun 2026'
    },
    {
      id: 2,
      title: '25 December Holiday!',
      isNew: true,
      author: 'Superadmin Mirza',
      date: '15 Dec 2025, 09:14 AM',
      scope: 'Institute-wide',
      hasAttachment: true,
      attachmentName: '25_Dec_Holiday_Circular.pdf',
      type: 'Holiday',
      content: '25 December Holiday!'
    }
  ])
  const [appliedAnnouncementFilters, setAppliedAnnouncementFilters] = useState({ search: '', type: 'All Types' })

  // Pick 5 & 6: Notifications state (media_1794576296067_9544c674.png & media_1794576333271_67484292.png)
  const [notificationPage, setNotificationPage] = useState(1)
  const fullNotificationsList = useMemo(() => [
    { id: 1, title: 'Marks updated', date: '21 Oct 2026, 11:51 AM', message: 'Marks have been saved for Math — First term.' },
    { id: 2, title: 'Fee invoice generated', date: '16 Oct 2026, 10:48 AM', message: 'A new fee invoice has been generated: Oct 2026 (Monthly).' },
    { id: 3, title: 'Attendance marked', date: '04 Oct 2026, 08:11 AM', message: 'Attendance marked as Present for 2026-10-04.' },
    { id: 4, title: 'Marks updated', date: '20 Sep 2026, 09:34 PM', message: 'Marks have been saved for Math — First term.' },
    { id: 5, title: 'Payment received', date: '01 Sep 2026, 10:56 PM', message: 'Payment of PKR 2,475 received for Apr fee 4072.' },
    { id: 6, title: 'Payment received', date: '23 Aug 2026, 07:14 PM', message: 'Payment of PKR 2,475 received for Individual fee June.' },
    { id: 7, title: 'Attendance marked', date: '22 Aug 2026, 11:04 AM', message: 'Attendance marked as Present for 2026-08-03.' },
    { id: 8, title: 'Payment received', date: '31 Jul 2026, 11:43 AM', message: 'Payment of PKR 5 received for Fee.' },
    { id: 9, title: 'Payment received', date: '31 Jul 2026, 09:35 AM', message: 'Payment of PKR 4 received for Fee.' },
    { id: 10, title: 'Payment received', date: '31 Jul 2026, 08:37 AM', message: 'Payment of PKR 5 received for Fee.' },
    { id: 11, title: 'Payment received', date: '31 Jul 2026, 01:11 AM', message: 'Payment of PKR 0 received for Fee.' },
    { id: 12, title: 'Attendance marked', date: '31 Jul 2026, 01:09 AM', message: 'Attendance marked as Late for 2026-07-31.' },
    { id: 13, title: 'Attendance marked', date: '31 Jul 2026, 01:09 AM', message: 'Attendance marked as Absent for 2026-07-31.' },
    { id: 14, title: 'Attendance marked', date: '31 Jul 2026, 01:09 AM', message: 'Attendance marked as Present for 2026-07-31.' },
    { id: 15, title: 'Attendance marked', date: '31 Jul 2026, 01:08 AM', message: 'Attendance marked as Absent for 2026-07-31.' }
  ], [])

  // Pick 7: Inbox state (media_1794576401447_67f88411.png)
  // Security constraint: "students superadmin ko message na kr sake bs admin ko hi kre"
  const [inboxSearchText, setInboxSearchText] = useState('')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [chatMessageText, setChatMessageText] = useState('')
  const [showBlockedSuperadminAlert, setShowBlockedSuperadminAlert] = useState(false)
  const [adminChatMessages, setAdminChatMessages] = useState([
    {
      id: 1,
      sender: 'admin',
      senderName: 'Ahmad Ali (School Admin)',
      text: 'Assalam-o-Alaikum! Welcome to the student support desk. Please let us know if you need assistance with classes, fee challans, or attendance.',
      timestamp: '31 Jul 2026, 10:15 AM'
    },
    {
      id: 2,
      sender: 'student',
      senderName: studentName,
      text: 'this is test message',
      timestamp: '31 Jul 2026, 11:40 AM'
    }
  ])

  // Pick 1 & 2: Fee Records State (media_1794578519476_239e30d9.png & media_1794578566056_0fd6a2d7.png)
  const [feeRecordsActiveTab, setFeeRecordsActiveTab] = useState('pending') // 'pending' | 'completed' | 'waivers'
  const [selectedFeeForPayment, setSelectedFeeForPayment] = useState(null)
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState(null)
  const [paymentGateway, setPaymentGateway] = useState('1Link / Online Banking')
  const [isPayingNow, setIsPayingNow] = useState(false)

  // Fee Data matching screenshots
  const [pendingFeeList, setPendingFeeList] = useState([
    {
      id: 'v1',
      title: 'Apr 407 Fee',
      badge: 'Monthly',
      refNo: '2026/886812',
      receiptNo: '11495289',
      progress: 0.0,
      total: 2475,
      paid: 0,
      remaining: 2475,
      type: 'monthly',
      accentColor: 'border-l-red-500'
    },
    {
      id: 'v2',
      title: 'paper fund',
      badge: 'One-Time',
      refNo: '2026/100540',
      receiptNo: '35904307',
      progress: 0.0,
      total: 800,
      paid: 0,
      remaining: 800,
      type: 'monthly',
      accentColor: 'border-l-red-500'
    },
    {
      id: 'v3',
      title: 'Apr 1122',
      badge: 'Monthly',
      refNo: '2026/91581',
      receiptNo: '80833916',
      progress: 0.0,
      total: 2475,
      paid: 0,
      remaining: 2475,
      type: 'monthly',
      accentColor: 'border-l-red-500'
    },
    {
      id: 'v4',
      title: 'Anuall Fund Nursary',
      badge: 'One-Time',
      refNo: '2026/096642',
      receiptNo: '33815784',
      progress: 45.5,
      total: 2000,
      paid: 910,
      remaining: 1090,
      type: 'monthly',
      accentColor: 'border-l-red-500'
    },
    {
      id: 'v5',
      title: 'Oct 2026',
      badge: 'Monthly',
      secondaryBadge: 'Oct 2026',
      refNo: '2026/259289',
      receiptNo: '72666804',
      progress: 0.0,
      total: 2475,
      paid: 0,
      remaining: 2485,
      type: 'monthly',
      accentColor: 'border-l-red-500'
    },
    {
      id: 'v6',
      title: 'Fine',
      badge: 'Individual Payment',
      secondaryBadge: 'Due: 08 Jun 2026',
      refNo: 'IP-000217',
      subTitle: 'Attendance Defaulter Fine',
      session: '2026-2027',
      remaining: 50,
      total: 50,
      paid: 0,
      type: 'charge',
      accentColor: 'border-l-amber-500'
    }
  ])

  const completedFeeList = useMemo(() => [
    { id: 'c1', title: 'Sep 2026 Monthly Tuition', refNo: '2026/718290', receiptNo: '64839211', total: 2475, paid: 2475, date: '01 Sep 2026', status: 'Paid' },
    { id: 'c2', title: 'Individual Fee June', refNo: '2026/651092', receiptNo: '55198203', total: 2475, paid: 2475, date: '23 Aug 2026', status: 'Paid' },
    { id: 'c3', title: 'Jul 2026 Monthly Tuition', refNo: '2026/519382', receiptNo: '48291048', total: 2475, paid: 2475, date: '31 Jul 2026', status: 'Paid' },
    { id: 'c4', title: 'Jun 2026 Monthly Tuition', refNo: '2026/410294', receiptNo: '39102948', total: 2475, paid: 2475, date: '10 Jun 2026', status: 'Paid' },
    { id: 'c5', title: 'May 2026 Monthly Tuition', refNo: '2026/301928', receiptNo: '28190394', total: 2475, paid: 2475, date: '05 May 2026', status: 'Paid' },
    { id: 'c6', title: 'Uniform & Accessories Pack', refNo: '2026/184920', receiptNo: '19203948', total: 1200, paid: 1200, date: '15 Apr 2026', status: 'Paid' },
    { id: 'c7', title: 'Book Pack Nursery Vol 1', refNo: '2026/110293', receiptNo: '10293847', total: 900, paid: 900, date: '10 Apr 2026', status: 'Paid' },
    { id: 'c8', title: 'Term 1 Exam Fee', refNo: '2026/091283', receiptNo: '08192837', total: 500, paid: 500, date: '01 Apr 2026', status: 'Paid' },
    { id: 'c9', title: 'Annual Lab & Activity Fee', refNo: '2026/082736', receiptNo: '07192836', total: 800, paid: 800, date: '20 Mar 2026', status: 'Paid' },
    { id: 'c10', title: 'ID Card & Registration Charge', refNo: '2026/054839', receiptNo: '04829103', total: 500, paid: 500, date: '15 Feb 2026', status: 'Paid' },
    { id: 'c11', title: 'Prospectus & Admission Application', refNo: '2026/019283', receiptNo: '01829384', total: 190, paid: 190, date: '10 Jan 2026', status: 'Paid' }
  ], [])

  const waiversFeeList = useMemo(() => [
    {
      id: 'w1',
      title: 'Sibling Concession & Special Waiver',
      voucherRef: '2026/DISC-001',
      amount: 2350,
      appliedBy: 'Institute Administration (Ahmad Ali)',
      date: '10 Jan 2026',
      notes: '1 line with a discount approved for session 2025-2026'
    }
  ], [])

  // Pick 3: My Account State (media_1794578607569_2caa20b4.png)
  const [accountActiveSubtab, setAccountActiveSubtab] = useState('profile') // 'profile' | 'password'
  const [accountNameValue, setAccountNameValue] = useState(() => studentName)
  const [accountPhotoSelected, setAccountPhotoSelected] = useState(null)
  const [passwordFormData, setPasswordFormData] = useState({ current: '', newPass: '', confirmPass: '' })

  // Quick link highlight state
  const [activeQuickLink, setActiveQuickLink] = useState('fee-records')

  // Save updated name to state and localStorage
  const handleSaveName = (e) => {
    e?.preventDefault()
    const cleanName = editNameInput.trim()
    if (!cleanName) return
    setStudentName(cleanName)
    try {
      localStorage.setItem('sms_student_custom_name', cleanName)
      if (editClassInput.trim()) {
        setStudentClass(editClassInput.trim())
        localStorage.setItem('sms_student_custom_class', editClassInput.trim())
      }
      if (editSectionInput.trim()) {
        setStudentSection(editSectionInput.trim())
        localStorage.setItem('sms_student_custom_section', editSectionInput.trim())
      }
      // Update session storage user payload
      const sessionUser = sessionStorage.getItem('sms_auth_user')
      if (sessionUser) {
        const parsed = JSON.parse(sessionUser)
        parsed.name = cleanName
        if (editClassInput.trim()) parsed.className = editClassInput.trim()
        if (editSectionInput.trim()) parsed.section = editSectionInput.trim()
        sessionStorage.setItem('sms_auth_user', JSON.stringify(parsed))
      }
    } catch {}
    setIsEditNameModalOpen(false)
    toast?.success?.('Profile details updated successfully!') || alert('Details updated!')
  }

  // Pre-fill edit modal when opening
  const openEditModal = () => {
    setEditNameInput(studentName === 'Unknown' ? '' : studentName)
    setEditClassInput(studentClass)
    setEditSectionInput(studentSection)
    setIsEditNameModalOpen(true)
  }

  // Current formatted date
  const todayFormatted = useMemo(() => {
    return 'Friday, 13 Nov 2026'
  }, [])

  // Class Schedule data for today's card
  const todaySchedule = [
    { time: '1:00 PM - 1:30 PM', subject: 'English', teacher: 'Ma\'am Ayesha', room: 'Room 2' },
    { time: '1:30 PM - 2:00 PM', subject: 'Math', teacher: 'Sir Tariq', room: 'Room 2' },
    { time: '3:30 PM - 4:00 PM', subject: 'Play Activity', teacher: 'Activity Supervisor', room: 'Activity Hall' }
  ]

  // Weekly Timetable Grid Data (Matching Screenshot 1, 2 & 3)
  const weeklyTimetableDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const weeklyPeriodSlots = [
    { start: '8:00 AM', end: '8:30 AM', subject: 'English' },
    { start: '8:30 AM', end: '9:00 AM', subject: 'Math' },
    { start: '10:30 AM', end: '11:00 AM', subject: 'Play Activity' }
  ]

  // Flattened "Your week at a glance" schedule (Matching Screenshot 3)
  const weekAtAGlanceItems = useMemo(() => {
    const list = []
    weeklyTimetableDays.forEach(day => {
      weeklyPeriodSlots.forEach(slot => {
        list.push({
          time: `${slot.start} - ${slot.end}`,
          subject: slot.subject,
          day: day
        })
      })
    })
    return list
  }, [])

  // Exam Datesheet Data
  const examDatesheet = [
    {
      date: '01 Dec 2026',
      day: 'Monday',
      time: '09:00 AM - 11:00 AM',
      subject: 'English',
      syllabus: 'Alphabets A-Z, Phonics & Object Identification',
      room: 'Room 2'
    },
    {
      date: '03 Dec 2026',
      day: 'Wednesday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Math',
      syllabus: 'Numbers 1-50, Shapes & Counting',
      room: 'Room 2'
    },
    {
      date: '05 Dec 2026',
      day: 'Friday',
      time: '09:00 AM - 11:00 AM',
      subject: 'Play Activity',
      syllabus: 'Color Identification & Social Activities',
      room: 'Activity Hall'
    }
  ]

  // Announcements list (from screenshots)
  const announcementsList = [
    {
      id: 'ann-1',
      title: 'Summer Holidays',
      date: '13 Jun 2026',
      content: 'Summer vacation starts from 15th June 2026. The institute will reopen on 15th August 2026.'
    },
    {
      id: 'ann-2',
      title: '25 December Holiday!',
      date: '15 Dec 2025',
      content: 'The institute will remain closed on 25th December on account of Quaid-e-Azam Day and Christmas.'
    }
  ]

  // Fee records data (matching screenshot PKR 9,375 pending)
  const feeRecords = [
    {
      id: 'INV-1092',
      challanNo: 'CH-2026-9375',
      month: 'November 2026',
      dueDate: '15 Nov 2026',
      amount: 9375,
      tuition: 8500,
      activity: 875,
      status: 'Pending'
    },
    {
      id: 'INV-1081',
      challanNo: 'CH-2026-8500',
      month: 'October 2026',
      dueDate: '15 Oct 2026',
      amount: 8500,
      tuition: 8500,
      activity: 0,
      status: 'Paid'
    }
  ]

  const triggerBrowserPrint = () => {
    window.print()
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#f4f7fb] text-slate-800'}`}>
      {/* TOP NAVBAR */}
      <header className={`sticky top-0 z-30 h-16 border-b transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } px-4 sm:px-6 flex items-center justify-between shadow-xs`}>
        {/* Left: Apex Logo & Title + Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* APEX BRANDING (Replacing EduDigitize Demo as requested) */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {/* Custom Modern Apex Logo Emblem */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 3L2 21h20L12 3z" fill="rgba(255,255,255,0.2)" />
                <path d="M7 16h10" />
                <path d="M12 7v5" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base leading-tight tracking-tight text-slate-900 dark:text-white">
                Apex School System
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Management System
              </span>
            </div>
          </div>

          {/* Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right Header Icons & Student Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* Bell Icon */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Alerts</span>
                  <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200">
                    <p className="font-semibold">Fee Challan Issued</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">November 2026 tuition voucher of PKR 9,375 is generated.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mail / Message Icon */}
          <button
            type="button"
            onClick={() => setActiveTab('communication')}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Student Profile (Shows 'Unknown' by default with user edit option) */}
          <div
            onClick={openEditModal}
            className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            title="Click to enter or change student name"
          >
            {/* Round Avatar Icon */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {studentName === 'Unknown' ? '?' : studentName.charAt(0).toUpperCase()}
            </div>

            <div className="text-left flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors">
                  {studentName}
                </span>
                <Pencil className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                STUDENT
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* BODY WORKSPACE */}
      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR NAVIGATION (Matching Screenshot 1, 2 & 3) */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-20 w-60 flex-col border-r transition-transform duration-200 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex`}
        >
          <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto text-xs">
            {/* 1. Dashboard */}
            <button
              type="button"
              onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Home className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>Dashboard</span>
              </div>
            </button>

            {/* 2. My Timetable */}
            <button
              type="button"
              onClick={() => { setActiveTab('timetable'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'timetable'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarDays className={`w-4 h-4 ${activeTab === 'timetable' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>My Timetable</span>
              </div>
            </button>

            {/* 3. My Attendance */}
            <button
              type="button"
              onClick={() => { setActiveTab('attendance'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'attendance'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className={`w-4 h-4 ${activeTab === 'attendance' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>My Attendance</span>
              </div>
            </button>

            {/* 4. Assignments */}
            <button
              type="button"
              onClick={() => { setActiveTab('assignments'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'assignments'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className={`w-4 h-4 ${activeTab === 'assignments' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>Assignments</span>
              </div>
            </button>

            {/* 5. Class Resources (Accordion Group matching pick 1 & pick 2) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsResourcesOpen(prev => !prev)
                  if (!['handouts', 'lectures'].includes(activeTab)) {
                    setActiveTab('handouts')
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'handouts' || activeTab === 'lectures' || activeTab === 'resources'
                    ? 'text-[#2563eb] font-semibold dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FolderOpen className={`w-4 h-4 ${['handouts', 'lectures', 'resources'].includes(activeTab) ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                  <span>Class Resources</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isResourcesOpen ? 'rotate-0' : '-rotate-90'} text-slate-400`} />
              </button>

              {isResourcesOpen && (
                <div className="pl-6 pr-1 space-y-0.5">
                  {/* Subitem: Handouts */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('handouts'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                      activeTab === 'handouts' || activeTab === 'resources'
                        ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                    }`}
                  >
                    <FileText className={`w-3.5 h-3.5 ${activeTab === 'handouts' || activeTab === 'resources' ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                    <span>Handouts</span>
                  </button>

                  {/* Subitem: Recorded Lectures */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('lectures'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                      activeTab === 'lectures'
                        ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                    }`}
                  >
                    <PlaySquare className={`w-3.5 h-3.5 ${activeTab === 'lectures' ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                    <span>Recorded Lectures</span>
                  </button>
                </div>
              )}
            </div>

            {/* 6. Report Cards (Pick 3) */}
            <button
              type="button"
              onClick={() => { setActiveTab('report-cards'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'report-cards'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-4 h-4 ${activeTab === 'report-cards' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>Report Cards</span>
              </div>
            </button>

            {/* 7. Announcements (Pick 4) */}
            <button
              type="button"
              onClick={() => { setActiveTab('announcements'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'announcements'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Megaphone className={`w-4 h-4 ${activeTab === 'announcements' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>Announcements</span>
              </div>
            </button>

            {/* 8. Communication (Accordion Group matching pick 5, 6 & 7) */}
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setIsCommunicationOpen(prev => !prev)
                  if (!['notifications', 'inbox'].includes(activeTab)) {
                    setActiveTab('notifications')
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'notifications' || activeTab === 'inbox' || activeTab === 'communication'
                    ? 'text-[#2563eb] font-semibold dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className={`w-4 h-4 ${['notifications', 'inbox', 'communication'].includes(activeTab) ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                  <span>Communication</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isCommunicationOpen ? 'rotate-0' : '-rotate-90'} text-slate-400`} />
              </button>

              {isCommunicationOpen && (
                <div className="pl-6 pr-1 space-y-0.5">
                  {/* Subitem: Notifications (Pick 5 & 6) */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('notifications'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                      activeTab === 'notifications' || activeTab === 'communication'
                        ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                    }`}
                  >
                    <Bell className={`w-3.5 h-3.5 ${activeTab === 'notifications' || activeTab === 'communication' ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                    <span>Notifications</span>
                  </button>

                  {/* Subitem: Inbox (Pick 7) */}
                  <button
                    type="button"
                    onClick={() => { setActiveTab('inbox'); setIsMobileMenuOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                      activeTab === 'inbox'
                        ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                    }`}
                  >
                    <Mail className={`w-3.5 h-3.5 ${activeTab === 'inbox' ? 'text-[#2563eb]' : 'text-slate-400'}`} />
                    <span>Inbox</span>
                  </button>
                </div>
              )}
            </div>

            {/* 9. Fee Records */}
            <button
              type="button"
              onClick={() => { setActiveTab('fees'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'fees'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className={`w-4 h-4 ${activeTab === 'fees' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>Fee Records</span>
              </div>
            </button>

            {/* 10. My Account */}
            <button
              type="button"
              onClick={() => { setActiveTab('account'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <User className={`w-4 h-4 ${activeTab === 'account' ? 'text-[#2563eb] dark:text-blue-300' : 'text-slate-400'}`} />
                <span>My Account</span>
              </div>
            </button>
          </nav>

          {/* Quick Edit Name Prompt in Sidebar if Unknown */}
          {studentName === 'Unknown' && (
            <div className="p-3 m-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
              <span className="block text-[11px] font-bold text-blue-900 dark:text-blue-200 mb-1">
                Student Name: Unknown
              </span>
              <button
                type="button"
                onClick={openEditModal}
                className="w-full py-1 px-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-colors shadow-xs cursor-pointer"
              >
                Enter Your Name
              </button>
            </div>
          )}
        </aside>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-10 bg-slate-900/40 backdrop-blur-xs lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto w-full">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              {/* Top Subheader: "My Dashboard" + Right Action Shortcut Icons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    My Dashboard
                  </h1>
                </div>

                {/* Right Action Icons (Report Card, My Attendance, Assignments, Announcements, Fee Records) */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsReportCardModalOpen(true)}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* WELCOME BANNER */}
              <div className={`p-6 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {studentName}!
                      </h2>
                      <button
                        type="button"
                        onClick={openEditModal}
                        className="text-slate-400 hover:text-blue-600 transition-colors p-1"
                        title="Click to enter/edit student name"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Here's your overview for today.
                    </p>
                    <div className="mt-2.5">
                      <span
                        onClick={openEditModal}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        title="Click to change class"
                      >
                        {studentClass}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{todayFormatted}</span>
                  </div>
                </div>
              </div>

              {/* TODAY'S CLASSES BANNER */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-r from-[#eefbf4] to-[#f4fdf8] dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Today · Friday, 13 Nov</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('timetable')}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Full timetable</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's classes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    3 periods scheduled
                  </p>
                </div>

                {/* Period Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {todaySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.time}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TWO SUMMARY KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Pending Fees */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                        Pending Fees
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          9,375
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        0 invoice(s) · PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. This Month Attendance */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                      <Check className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                        This Month
                      </span>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                          0%
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        0 present · 21 working days
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS SECTION */}
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                  Quick Links
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'fee-records', label: 'Fee Records', icon: Wallet, tab: 'fees' },
                    { id: 'attendance', label: 'My Attendance', icon: Calendar, tab: 'attendance' },
                    { id: 'assignments', label: 'Assignments', icon: BookOpen, tab: 'assignments' },
                    { id: 'timetables', label: 'Timetables', icon: CalendarDays, tab: 'timetable' },
                    { id: 'report-card', label: 'Report Card', icon: FileText, tab: 'report-cards' },
                    { id: 'announcements', label: 'Announcements', icon: Megaphone, tab: 'announcements' }
                  ].map(item => {
                    const Icon = item.icon
                    const isSelected = activeQuickLink === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveQuickLink(item.id)
                          setActiveTab(item.tab)
                        }}
                        className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4f46e5] border-[#4f46e5] text-white shadow-md shadow-indigo-500/20'
                            : isDark
                            ? 'bg-slate-900 border-slate-800 text-slate-700 hover:border-slate-700'
                            : 'bg-white border-slate-200/90 text-slate-700 hover:border-slate-300 shadow-xs'
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-white' : 'text-slate-600 dark:text-slate-400'}`} />
                        <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {item.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* TWO BOTTOM COLUMNS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Left Column: Latest Announcements */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-teal-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Latest Announcements
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {announcementsList.map(ann => (
                      <div
                        key={ann.id}
                        onClick={() => setViewingNotice(ann)}
                        className="py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors cursor-pointer"
                      >
                        <h5 className="text-xs font-bold text-slate-800 dark:text-white">
                          {ann.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                          <Calendar className="w-3 h-3" />
                          <span>{ann.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column: Recent Assignments */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
                }`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Recent Assignments
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('assignments')}
                      className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View all
                    </button>
                  </div>

                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
                    <span className="text-xs text-slate-400">
                      No recent assignments / handouts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY TIMETABLE (Matching Screenshot 1, 2 & 3 Exactly) */}
          {activeTab === 'timetable' && (
            <div className="space-y-4">
              {/* Header Title & Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Timetable
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsReportCardModalOpen(true)}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* SECTION: My class timetable Header */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    My class timetable
                  </h2>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  View your weekly schedule and exam dates in one place.
                </p>
              </div>

              {/* Student Details Pill Card */}
              <div className={`px-4 py-3 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80 shadow-xs'
              } flex items-center gap-3 text-xs`}>
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                  <GraduationCap className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                  <span>{studentName}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <div className="text-slate-600 dark:text-slate-300">
                  Class: <span className="font-bold text-slate-900 dark:text-white">{studentClass}</span>
                </div>
                <span className="text-slate-300 dark:text-slate-600">&bull;</span>
                <div className="text-slate-600 dark:text-slate-300">
                  Section: <span className="font-bold text-slate-900 dark:text-white">{studentSection}</span>
                </div>
              </div>

              {/* TODAY'S CLASSES MINT GREEN CARD */}
              <div className="p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-r from-[#eefbf4] to-[#f4fdf8] dark:from-emerald-950/20 dark:to-teal-950/20 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Today · Friday, 13 Nov</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById('timetable-grid-section')
                      el?.scrollIntoView({ behavior: 'smooth' })
                    }}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                    <span>Full timetable</span>
                  </button>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Today's classes
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    3 periods scheduled
                  </p>
                </div>

                {/* Period Chips */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {todaySchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-medium">{item.time}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{item.subject}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUB-TABS: Weekly Schedule (1) vs Exam Datesheet (1) */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pt-2 pb-0">
                <button
                  type="button"
                  onClick={() => setTimetableSubTab('weekly')}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    timetableSubTab === 'weekly'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Weekly schedule</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    1
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTimetableSubTab('exam')}
                  className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    timetableSubTab === 'exam'
                      ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Exam datesheet</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                    1
                  </span>
                </button>
              </div>

              {/* SUB-TAB CONTENT: WEEKLY SCHEDULE */}
              {timetableSubTab === 'weekly' && (
                <div id="timetable-grid-section" className="space-y-4 pt-1">
                  {/* Top Header of Table: Class Schedule Title + Legend + Print Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {studentClass} Class Schedule &bull; 2026-2027
                      </span>

                      {/* Legend */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs border border-blue-200 bg-white inline-block" />
                          <span>Class period</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-3 h-3 rounded-xs border border-amber-300 bg-[#fff5d6] inline-block" />
                          <span>Today (Friday)</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={triggerBrowserPrint}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors shadow-2xs cursor-pointer w-fit"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </div>

                  {/* TWO-COLUMN LAYOUT: TIMETABLE GRID (LEFT) + YOUR WEEK AT A GLANCE (RIGHT) */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* LEFT 2 COLUMNS: WEEKLY TIMETABLE TABLE */}
                    <div className={`lg:col-span-2 rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } overflow-hidden shadow-xs`}>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300">
                              <th className="py-3 px-4 font-bold border-r border-slate-200 dark:border-slate-800 w-28">
                                Day
                              </th>
                              <th className="py-2.5 px-4 font-bold border-r border-slate-200 dark:border-slate-800 text-center">
                                <div>8:00 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">8:30 AM</div>
                              </th>
                              <th className="py-2.5 px-4 font-bold border-r border-slate-200 dark:border-slate-800 text-center">
                                <div>8:30 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">9:00 AM</div>
                              </th>
                              <th className="py-2.5 px-4 font-bold text-center">
                                <div>10:30 AM</div>
                                <div className="text-[10px] text-slate-400 font-normal">11:00 AM</div>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {weeklyTimetableDays.map(day => {
                              const isToday = day === 'Friday'
                              return (
                                <tr key={day} className="transition-colors">
                                  {/* Day Column (Friday highlighted in yellow as today) */}
                                  <td className={`py-3.5 px-4 font-semibold border-r border-slate-200 dark:border-slate-800 ${
                                    isToday
                                      ? 'bg-[#fff5d6] text-amber-950 font-bold border-l-4 border-l-amber-400'
                                      : 'text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {day}
                                  </td>

                                  {/* Period 1: English */}
                                  <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      English
                                    </div>
                                  </td>

                                  {/* Period 2: Math */}
                                  <td className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-800 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      Math
                                    </div>
                                  </td>

                                  {/* Period 3: Play Activity */}
                                  <td className="py-3.5 px-4 text-center">
                                    <div className="px-3 py-1.5 rounded-lg bg-[#eaf4fb] dark:bg-blue-950/40 text-slate-800 dark:text-blue-200 font-semibold border border-blue-100 dark:border-blue-900/60 inline-block w-full">
                                      Play Activity
                                    </div>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: "YOUR WEEK AT A GLANCE" (Red Box in Screenshot 3) */}
                    <div className={`rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } p-4 shadow-xs flex flex-col justify-between`}>
                      <div>
                        {/* Header with Green List Icon */}
                        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                          <List className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                            Your week at a glance
                          </h3>
                        </div>

                        {/* Chronological List of Classes */}
                        <div className="max-h-[380px] overflow-y-auto space-y-3.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                          {weekAtAGlanceItems.map((item, index) => (
                            <div key={index} className={`pt-2.5 first:pt-0 flex items-start justify-between text-xs`}>
                              {/* Left: Green Bold Time */}
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs w-36 shrink-0">
                                {item.time}
                              </span>

                              {/* Right: Subject Name & Day Subtext */}
                              <div className="text-right">
                                <span className="font-bold text-slate-800 dark:text-white block">
                                  {item.subject}
                                </span>
                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                  {item.day}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                        <span className="text-[11px] text-slate-400">
                          Showing full weekly scheduled periods
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB CONTENT: EXAM DATESHEET */}
              {timetableSubTab === 'exam' && (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Mid-Term Examinations Datesheet · 2026-2027
                      </h3>
                      <p className="text-xs text-slate-500">Official schedule of assessments</p>
                    </div>
                    <button
                      type="button"
                      onClick={triggerBrowserPrint}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 bg-white text-rose-600 text-xs font-semibold hover:bg-rose-50"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Datesheet
                    </button>
                  </div>

                  <div className={`rounded-2xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } overflow-hidden shadow-xs`}>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 font-bold uppercase text-[10px]">
                          <th className="py-3 px-4">Date & Day</th>
                          <th className="py-3 px-4">Exam Time</th>
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Syllabus / Topics</th>
                          <th className="py-3 px-4">Room</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {examDatesheet.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                              {row.date} ({row.day})
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-emerald-600">{row.time}</td>
                            <td className="py-3.5 px-4 font-bold">{row.subject}</td>
                            <td className="py-3.5 px-4 text-slate-500">{row.syllabus}</td>
                            <td className="py-3.5 px-4">{row.room}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MY ATTENDANCE REPORT (Matching Screenshot 1 & 2 Exactly) */}
          {activeTab === 'attendance' && (
            <div className="space-y-4">
              {/* Top Subheader: "My Attendance Report" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Attendance Report
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsReportCardModalOpen(true)}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* Section Header Card */}
              <div className="pt-1">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                    My Attendance Report
                  </h2>
                </div>

                {/* Cyan/Blue Tinted Student Info Bar */}
                <div className="mt-3 p-3 rounded-2xl bg-[#eefbfd] dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/60 flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>{studentName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#2563eb] text-white font-bold text-xs shadow-2xs">
                    Roll: NU1
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#06b6d4] text-white font-bold text-xs shadow-2xs">
                    {studentClass} - {studentSection}
                  </span>
                </div>
              </div>

              {/* FILTERS ROW (4 Select Dropdowns matching Screenshot 1 & 2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. View Filter */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    👁 View
                  </label>
                  <select
                    value={attendanceViewMode}
                    onChange={(e) => setAttendanceViewMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Month calendar">Month calendar</option>
                    <option value="Daily log list">Daily log list</option>
                    <option value="Subject-wise">Subject-wise</option>
                  </select>
                </div>

                {/* 2. Attendance Type */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    ≡ Attendance type
                  </label>
                  <select
                    value={attendanceCategory}
                    onChange={(e) => setAttendanceCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="General (daily)">General (daily)</option>
                    <option value="Subject-wise">Subject-wise</option>
                  </select>
                </div>

                {/* 3. Month */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Month
                  </label>
                  <select
                    value={attendanceSelectedMonth}
                    onChange={(e) => setAttendanceSelectedMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* 4. Year */}
                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                    Year
                  </label>
                  <select
                    value={attendanceSelectedYear}
                    onChange={(e) => setAttendanceSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                  </select>
                </div>
              </div>

              {/* 4 METRIC KPI CARDS (Present, Absent, Attendance %, Working days) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Present */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#10b981] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Present</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.present}</span>
                  </div>
                </div>

                {/* 2. Absent */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#ef4444] text-white flex items-center justify-center shadow-xs">
                    <X className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Absent</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.absent}</span>
                  </div>
                </div>

                {/* 3. Attendance % */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white flex items-center justify-center shadow-xs">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Attendance %</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.percentage}%</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">(Present + Late + Leave) / marked days</span>
                  </div>
                </div>

                {/* 4. Working days */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center gap-3.5`}>
                  <div className="w-10 h-10 rounded-xl bg-[#f97316] text-white flex items-center justify-center shadow-xs">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Working days</span>
                    <span className="text-2xl font-bold text-slate-900 dark:text-white block mt-0.5">{attendanceStats.workingDays}</span>
                  </div>
                </div>
              </div>

              {/* MONTHLY CALENDAR GRID (November 2026 - Exact Match) */}
              <div className={`rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } p-5 shadow-xs space-y-4`}>
                {/* Calendar Title */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {attendanceSelectedMonth} {attendanceSelectedYear}
                  </h3>
                </div>

                {/* Month Calendar Table Grid */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-center border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 bg-[#f8fafc] dark:bg-slate-800/60 w-1/7">Sun</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Mon</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Tue</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Wed</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Thu</th>
                        <th className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 w-1/7">Fri</th>
                        <th className="py-2.5 px-2 bg-[#f0f6fc] dark:bg-blue-950/20 w-1/7">Sat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {/* Week 1: 1 (Sun) to 7 (Sat) */}
                      <tr className="h-20">
                        {/* Sun 1 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">1</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 2 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">2</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 3 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">3</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 4 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">4</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 5 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">5</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 6 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">6</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 7 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">7</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 2: 8 to 14 */}
                      <tr className="h-20">
                        {/* Sun 8 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">8</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 9 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">9</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 10 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">10</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 11 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">11</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 12 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">12</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 13 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">13</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 14 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">14</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 3: 15 to 21 */}
                      <tr className="h-20">
                        {/* Sun 15 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">15</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 16 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">16</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 17 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">17</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 18 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">18</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 19 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">19</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 20 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">20</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 21 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">21</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 4: 22 to 28 */}
                      <tr className="h-20">
                        {/* Sun 22 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">22</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 23 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">23</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Tue 24 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">24</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Wed 25 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">25</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Thu 26 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">26</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Fri 27 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">27</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Sat 28 */}
                        <td className="p-2 bg-[#f0f6fc] dark:bg-blue-950/20 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">28</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                      </tr>

                      {/* Week 5: 29 & 30 */}
                      <tr className="h-20">
                        {/* Sun 29 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 bg-[#fafcff] dark:bg-slate-900/40 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">29</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] uppercase">
                            OFF
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-1">Weekly off</span>
                        </td>
                        {/* Mon 30 */}
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 align-top">
                          <span className="font-bold text-slate-700 dark:text-slate-300 block mb-2">30</span>
                          <div className="w-6 h-6 rounded bg-[#6b7280] text-white flex items-center justify-center font-bold text-xs mx-auto shadow-2xs">
                            -
                          </div>
                        </td>
                        {/* Remaining empty cells */}
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/20" />
                        <td className="p-2 bg-slate-50/50 dark:bg-slate-900/20" />
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BOTTOM LEGEND BAR (All 7 Status Chips matching Screenshot 1 & 2) */}
                <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#10b981] text-white font-bold text-[10px] flex items-center justify-center">P</span>
                    <span className="text-[11px] font-medium">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#f97316] text-white font-bold text-[10px] flex items-center justify-center">L</span>
                    <span className="text-[11px] font-medium">Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#ef4444] text-white font-bold text-[10px] flex items-center justify-center">A</span>
                    <span className="text-[11px] font-medium">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-4 rounded bg-[#06b6d4] text-white font-bold text-[9px] flex items-center justify-center">LV</span>
                    <span className="text-[11px] font-medium">Leave</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#f59e0b] text-white font-bold text-[10px] flex items-center justify-center">H</span>
                    <span className="text-[11px] font-medium">Holiday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-1 py-0.2 rounded bg-slate-200 text-slate-700 font-bold text-[9px]">OFF</span>
                    <span className="text-[11px] font-medium">Weekly off</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded bg-[#6b7280] text-white font-bold text-[10px] flex items-center justify-center">-</span>
                    <span className="text-[11px] font-medium">Not marked</span>
                  </div>
                </div>

                {/* BOTTOM INFO / DISCLAIMER BANNER */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">i</span>
                  <span>
                    No general attendance records found for this month. Try switching to <strong>Subject-wise</strong> if your institution marks attendance per subject.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ASSIGNMENTS (Matching Screenshot media_1794575634893_bd2533fd.png Exactly) */}
          {activeTab === 'assignments' && (
            <div className="space-y-4">
              {/* Top Subheader: "Assignments" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Assignments
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setIsReportCardModalOpen(true)}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT CARD */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs space-y-4`}>

                {/* Section Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Assignments
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    View classwork, notes and study material posted by your teachers
                  </p>
                </div>

                {/* Cyan/Blue Tinted Student Info Bar */}
                <div className="p-3 rounded-2xl bg-[#eefbfd] dark:bg-cyan-950/30 border border-cyan-200/70 dark:border-cyan-800/60 flex flex-wrap items-center gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                    <User className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>{studentName}</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#2563eb] text-white font-bold text-xs shadow-2xs">
                    Roll: NU1
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-[#06b6d4] text-white font-bold text-xs shadow-2xs">
                    {studentClass} - {studentSection}
                  </span>
                </div>

                {/* FILTERS ROW (Subject and Date matching Screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 pb-1">
                  {/* Subject Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        Subject
                      </span>
                    </label>
                    <select
                      value={assignmentSubjectFilter}
                      onChange={(e) => setAssignmentSubjectFilter(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="All subjects">All subjects</option>
                      <option value="English">English</option>
                      <option value="Math">Math</option>
                      <option value="Play Activity">Play Activity</option>
                      <option value="Urdu">Urdu</option>
                      <option value="General Science">General Science</option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Date
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={assignmentDateFilter}
                        onChange={(e) => setAssignmentDateFilter(e.target.value)}
                        placeholder="mm/dd/yyyy"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                      {assignmentDateFilter && (
                        <button
                          type="button"
                          onClick={() => setAssignmentDateFilter('')}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                          title="Clear date filter"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* ASSIGNMENTS TABLE (Exact match to screenshot) */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold bg-slate-50/70 dark:bg-slate-800/60">
                        <th className="py-3 px-4 w-12 text-center">#</th>
                        <th className="py-3 px-4 min-w-[280px]">Title</th>
                        <th className="py-3 px-4 min-w-[120px]">Subject</th>
                        <th className="py-3 px-4 min-w-[130px]">Date</th>
                        <th className="py-3 px-4 min-w-[160px]">Teacher / Instructor</th>
                        <th className="py-3 px-4 w-20 text-center">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAssignments.length > 0 ? (
                        filteredAssignments.map((assignment, index) => (
                          <tr
                            key={assignment.id}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            {/* # */}
                            <td className="py-4 px-4 text-center font-medium text-slate-500 dark:text-slate-400">
                              {index + 1}
                            </td>

                            {/* Title + Subtitle + Image Tag */}
                            <td className="py-4 px-4 align-top">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-900 dark:text-white block text-sm">
                                  {assignment.title}
                                </span>
                                {assignment.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {assignment.description}
                                  </p>
                                )}
                                {assignment.hasAttachment && (
                                  <div className="pt-0.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#06b6d4] text-white font-semibold text-[11px] shadow-2xs">
                                      <Image className="w-3 h-3" />
                                      {assignment.attachmentType || 'Image'}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Subject */}
                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              {assignment.subject}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                              {assignment.date}
                            </td>

                            {/* Teacher / Instructor */}
                            <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                              {assignment.teacher}
                            </td>

                            {/* View Action */}
                            <td className="py-4 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedAssignmentModal(assignment)}
                                className="w-8 h-8 mx-auto rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-xs hover:shadow cursor-pointer"
                                title="View assignment"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400">
                            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="font-medium text-sm text-slate-600 dark:text-slate-300">No assignments found</p>
                            <p className="text-xs text-slate-400 mt-1">Try resetting the subject or date filter</p>
                            {(assignmentSubjectFilter !== 'All subjects' || assignmentDateFilter) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAssignmentSubjectFilter('All subjects')
                                  setAssignmentDateFilter('')
                                }}
                                className="mt-3 px-3 py-1 text-xs rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 font-semibold cursor-pointer"
                              >
                                Reset Filters
                              </button>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CLASS RESOURCES - HANDOUTS (Pick 1 - media_1794575732921_b8b0357e.png) */}
          {(activeTab === 'handouts' || activeTab === 'resources') && (
            <div className="space-y-4">
              {/* Top Subheader: "Handouts" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Handouts
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT CARD */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs space-y-4`}>
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Handouts
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Learning handouts for your classes
                  </p>
                </div>

                {/* Filter Row (Search, Subject, Apply, Reset) */}
                <div className="flex flex-wrap items-end gap-3 text-xs pt-1">
                  <div className="w-full sm:w-64">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={handoutSearchInput}
                      onChange={(e) => setHandoutSearchInput(e.target.value)}
                      placeholder="Title, description or lecturer"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Subject
                    </label>
                    <select
                      value={handoutSubjectInput}
                      onChange={(e) => setHandoutSubjectInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="English">English</option>
                      <option value="Math">Math</option>
                      <option value="Play Activity">Play Activity</option>
                      <option value="Urdu">Urdu</option>
                      <option value="General Science">General Science</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setHandoutAppliedFilters({ search: handoutSearchInput, subject: handoutSubjectInput })}
                    className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Apply
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setHandoutSearchInput('')
                      setHandoutSubjectInput('All')
                      setHandoutAppliedFilters({ search: '', subject: 'All' })
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Table matching screenshot media_1794575732921_b8b0357e.png */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold bg-slate-50/70 dark:bg-slate-800/60">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Lecturer</th>
                        <th className="py-3 px-4">Attachment</th>
                        <th className="py-3 px-4">Updated</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {handoutsList.filter(item => {
                        const mSearch = !handoutAppliedFilters.search || item.title.toLowerCase().includes(handoutAppliedFilters.search.toLowerCase())
                        const mSub = handoutAppliedFilters.subject === 'All' || item.subject === handoutAppliedFilters.subject
                        return mSearch && mSub
                      }).length > 0 ? (
                        handoutsList.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                            <td className="py-3 px-4">{item.class}</td>
                            <td className="py-3 px-4">{item.subject}</td>
                            <td className="py-3 px-4">{item.lecturer}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold">{item.attachment}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-500">{item.updated}</td>
                            <td className="py-3 px-4 text-center">
                              <button className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-xs">Download</button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-14 text-center text-slate-400">
                            No handouts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5B: CLASS RESOURCES - RECORDED LECTURES (Pick 2 - media_1794575827803_05220938.png) */}
          {activeTab === 'lectures' && (
            <div className="space-y-4">
              {/* Top Subheader: "Recorded Lectures" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Recorded Lectures
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN CONTENT CARD */}
              <div className={`p-5 rounded-2xl border transition-all ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs space-y-4`}>
                {/* Header */}
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-900 text-white flex items-center justify-center text-[9px]">
                      <Play className="w-2.5 h-2.5 fill-current" />
                    </div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Recorded Lectures
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Recorded lectures for your classes
                  </p>
                </div>

                {/* Filter Row (Search, Subject, Apply, Reset) */}
                <div className="flex flex-wrap items-end gap-3 text-xs pt-1">
                  <div className="w-full sm:w-64">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      value={lectureSearchInput}
                      onChange={(e) => setLectureSearchInput(e.target.value)}
                      placeholder="Title, notes or lecturer"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="w-full sm:w-48">
                    <label className="block text-slate-600 dark:text-slate-300 font-semibold mb-1">
                      Subject
                    </label>
                    <select
                      value={lectureSubjectInput}
                      onChange={(e) => setLectureSubjectInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="All">All</option>
                      <option value="English">English</option>
                      <option value="Math">Math</option>
                      <option value="Play Activity">Play Activity</option>
                      <option value="Urdu">Urdu</option>
                      <option value="General Science">General Science</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLectureAppliedFilters({ search: lectureSearchInput, subject: lectureSubjectInput })}
                    className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Apply
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLectureSearchInput('')
                      setLectureSubjectInput('All')
                      setLectureAppliedFilters({ search: '', subject: 'All' })
                    }}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                {/* Table matching screenshot media_1794575827803_05220938.png */}
                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-semibold bg-slate-50/70 dark:bg-slate-800/60">
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4">Class</th>
                        <th className="py-3 px-4">Subject</th>
                        <th className="py-3 px-4">Lecturer</th>
                        <th className="py-3 px-4">Updated</th>
                        <th className="py-3 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {lecturesList.length > 0 ? (
                        lecturesList.map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                            <td className="py-3 px-4">{item.class}</td>
                            <td className="py-3 px-4">{item.subject}</td>
                            <td className="py-3 px-4">{item.lecturer}</td>
                            <td className="py-3 px-4 text-slate-500">{item.updated}</td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setSelectedLectureVideo(item)}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white font-medium text-xs flex items-center gap-1 mx-auto"
                              >
                                <Play className="w-3 h-3 fill-current" /> Watch
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-14 text-center text-slate-400">
                            No recorded lectures found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: REPORT CARDS (Pick 3 - media_1794575863429_6166311b.png) */}
          {activeTab === 'report-cards' && (
            <div className="space-y-4">
              {/* Top Subheader: "Select Exam Year" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Select Exam Year
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (showDetailedReportCard) {
                        setShowDetailedReportCard(false)
                      } else {
                        setActiveTab('dashboard')
                      }
                    }}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons (with Report Card active pill) */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* CARD SELECTION VIEW (Exact match to screenshot 3) */}
              {!showDetailedReportCard ? (
                <div className="max-w-md mx-auto my-12">
                  <div className="bg-[#1e293b] text-white px-6 py-4 rounded-t-2xl flex items-center gap-2.5 font-bold text-sm shadow-xs">
                    <Clock className="w-4 h-4 text-slate-300" />
                    <span>Select Result Year</span>
                  </div>

                  <div className={`p-6 rounded-b-2xl border border-t-0 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } space-y-5 text-xs shadow-md`}>
                    <p className="text-slate-500 dark:text-slate-400 text-center">
                      Choose the year to view the student's report card.
                    </p>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1.5">
                        Academic Year:
                      </label>
                      <select
                        value={reportCardSelectedYear}
                        onChange={(e) => setReportCardSelectedYear(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowDetailedReportCard(true)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      View Report Card
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('dashboard')}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 text-center block w-full mt-2 cursor-pointer"
                    >
                      Go back
                    </button>
                  </div>
                </div>
              ) : (
                /* DETAILED OFFICIAL ACADEMIC REPORT CARD */
                <div className={`p-6 sm:p-8 rounded-3xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-sm space-y-6 max-w-3xl mx-auto`}>
                  {/* Report Card Header */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#0b2447] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                        A
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Apex School System</h2>
                        <p className="text-xs text-slate-500">Official Terminal Academic Progress Report · Year {reportCardSelectedYear}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDetailedReportCard(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300 text-xs font-semibold cursor-pointer"
                      >
                        Change Year
                      </button>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
                      <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{studentName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Roll Number</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400 mt-0.5 block">NU1</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Class & Section</span>
                      <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{studentClass} - {studentSection}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Result Status</span>
                      <span className="font-bold text-emerald-600 mt-0.5 block">PASSED (Grade A+)</span>
                    </div>
                  </div>

                  {/* Marks Breakdown Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300">
                          <th className="py-2.5 px-4">Subject</th>
                          <th className="py-2.5 px-4 text-center">Total Marks</th>
                          <th className="py-2.5 px-4 text-center">Obtained Marks</th>
                          <th className="py-2.5 px-4 text-center">Percentage</th>
                          <th className="py-2.5 px-4 text-center">Grade</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { subject: 'English (Phonics & Reading)', total: 100, obtained: 92, grade: 'A+' },
                          { subject: 'Mathematics (Numbers & Shapes)', total: 100, obtained: 88, grade: 'A' },
                          { subject: 'Urdu (Huroof & Words)', total: 100, obtained: 90, grade: 'A+' },
                          { subject: 'General Knowledge & Science', total: 100, obtained: 95, grade: 'A+' },
                          { subject: 'Arts & Creative Activity', total: 100, obtained: 96, grade: 'A+' }
                        ].map((sub, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{sub.subject}</td>
                            <td className="py-3 px-4 text-center text-slate-500">{sub.total}</td>
                            <td className="py-3 px-4 text-center font-bold text-blue-600 dark:text-blue-400">{sub.obtained}</td>
                            <td className="py-3 px-4 text-center">{((sub.obtained / sub.total) * 100).toFixed(0)}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {sub.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-50/70 dark:bg-slate-800/70 font-bold border-t-2 border-slate-300 dark:border-slate-700">
                          <td className="py-3 px-4 text-slate-900 dark:text-white">Overall Total</td>
                          <td className="py-3 px-4 text-center">500</td>
                          <td className="py-3 px-4 text-center text-blue-600 dark:text-blue-400">461</td>
                          <td className="py-3 px-4 text-center">92.2%</td>
                          <td className="py-3 px-4 text-center text-emerald-600">A+</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Teacher Remarks & Signatures */}
                  <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-xs space-y-1">
                    <span className="font-bold text-blue-900 dark:text-blue-200 block">Class Teacher Remarks:</span>
                    <p className="text-slate-600 dark:text-slate-300">
                      "{studentName} shows keen curiosity, exemplary discipline, and excellent handwriting in all exercises. Recommended for the upcoming academic session."
                    </p>
                    <div className="pt-4 flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Instructor: Sana Kosar</span>
                      <span>Principal: Apex School System</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS (Pick 4 - media_1794575902541_cbada2e1.png) */}
          {activeTab === 'announcements' && (
            <div className="space-y-4">
              {/* Top Subheader: "Announcements" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Announcements
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons (with Announcements active pill) */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* SOLID BLUE ANNOUNCEMENTS BANNER (Matching screenshot 4) */}
              <div className="bg-[#2563eb] text-white px-5 py-3.5 rounded-2xl flex items-center gap-2 font-bold text-sm shadow-xs">
                <Megaphone className="w-4 h-4" />
                <span>Announcements</span>
              </div>

              {/* Filter Bar */}
              <div className={`p-4 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } flex flex-wrap items-center gap-3 text-xs shadow-xs`}>
                <div className="flex-1 min-w-[220px]">
                  <input
                    type="text"
                    value={announcementSearchTerm}
                    onChange={(e) => setAnnouncementSearchTerm(e.target.value)}
                    placeholder="Search by title or description..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="w-44">
                  <select
                    value={announcementTypeFilter}
                    onChange={(e) => setAnnouncementTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs cursor-pointer"
                  >
                    <option value="All Types">All Types</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Academic">Academic</option>
                    <option value="General">General</option>
                    <option value="Fee">Fee Notice</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setAppliedAnnouncementFilters({ search: announcementSearchTerm, type: announcementTypeFilter })}
                  className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filter
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAnnouncementSearchTerm('')
                    setAnnouncementTypeFilter('All Types')
                    setAppliedAnnouncementFilters({ search: '', type: 'All Types' })
                  }}
                  className="px-4 py-2 rounded-xl bg-[#475569] hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>

              {/* ANNOUNCEMENT CARDS (Matching Screenshot 4 Exactly) */}
              <div className="space-y-3.5">
                {announcementsDataList.filter(item => {
                  const mSearch = !appliedAnnouncementFilters.search ||
                    item.title.toLowerCase().includes(appliedAnnouncementFilters.search.toLowerCase()) ||
                    item.content.toLowerCase().includes(appliedAnnouncementFilters.search.toLowerCase())
                  const mType = appliedAnnouncementFilters.type === 'All Types' || item.type === appliedAnnouncementFilters.type
                  return mSearch && mType
                }).map(item => (
                  <div
                    key={item.id}
                    className={`border-l-4 border-l-blue-600 rounded-xl p-5 border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } shadow-xs space-y-2.5 transition-all`}
                  >
                    {/* Title + NEW Badge */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                      {item.isNew && (
                        <span className="px-2 py-0.5 rounded-full bg-[#ef4444] text-white font-bold text-[10px] uppercase tracking-wide">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.author}</span>
                      </div>
                      <span>&bull;</span>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.date}</span>
                      </div>
                      <span>&bull;</span>
                      <span className="px-2 py-0.5 rounded bg-[#0284c7] text-white font-semibold text-[10px]">
                        {item.scope}
                      </span>
                      {item.hasAttachment && (
                        <>
                          <span>&bull;</span>
                          <span className="inline-flex items-center gap-1 text-slate-500 text-xs">
                            <Paperclip className="w-3.5 h-3.5" />
                            Has attachment
                          </span>
                        </>
                      )}
                    </div>

                    {/* Content Text */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
                      {item.content}
                    </p>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setViewingNotice(item)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Read More
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: COMMUNICATION - NOTIFICATIONS (Pick 5 & 6 - media_1794576296067_9544c674.png & media_1794576333271_67484292.png) */}
          {(activeTab === 'notifications' || activeTab === 'communication') && (
            <div className="space-y-4">
              {/* Top Subheader: "Notifications" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Notifications
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN NOTIFICATION CENTER CARD (Matching Screenshot 5 & 6) */}
              <div className={`p-5 sm:p-6 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs space-y-4`}>
                {/* Header with Notification Center & Inbox shortcut button */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Notification Center</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inbox')}
                    className="px-3.5 py-1.5 rounded-xl border border-blue-400 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Inbox
                  </button>
                </div>

                {/* EARLIER Section Header */}
                <span className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase">
                  EARLIER
                </span>

                {/* Notifications List (10 on page 1, 5 on page 2) */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fullNotificationsList.slice((notificationPage - 1) * 10, notificationPage * 10).map(item => (
                    <div key={item.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-colors">
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#2563eb] flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {item.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION CONTROLS (Matching Screenshot 6) */}
                <div className="pt-4 flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    disabled={notificationPage === 1}
                    onClick={() => setNotificationPage(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationPage(1)}
                    className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors ${
                      notificationPage === 1
                        ? 'bg-[#2563eb] text-white shadow-2xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    1
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotificationPage(2)}
                    className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center cursor-pointer transition-colors ${
                      notificationPage === 2
                        ? 'bg-[#2563eb] text-white shadow-2xs'
                        : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    2
                  </button>
                  <button
                    type="button"
                    disabled={notificationPage === 2}
                    onClick={() => setNotificationPage(prev => Math.min(2, prev + 1))}
                    className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8B: COMMUNICATION - INBOX (Pick 7 - media_1794576401447_67f88411.png) */}
          {/* USER INSTRUCTION CONSTRAINT: "students superadmin ko message na kr sake bs admin ko hi kre" */}
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {/* Top Subheader: "Inbox" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Inbox
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN INBOX 2-COLUMN CARD (Matching Screenshot 7 Exactly) */}
              <div className={`rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs overflow-hidden`}>
                {/* Header */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Mail className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                    <span>Inbox</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('notifications')}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Notifications
                  </button>
                </div>

                {/* 2-Column Split: Conversations on Left, Chat on Right */}
                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px]">
                  {/* LEFT COLUMN: CONVERSATIONS (w-full md:col-span-4) */}
                  <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 p-4 space-y-3">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CONVERSATIONS
                    </span>

                    {/* Search Bar */}
                    <div className="relative">
                      <input
                        type="text"
                        value={inboxSearchText}
                        onChange={(e) => {
                          const val = e.target.value
                          setInboxSearchText(val)
                          if (val.toLowerCase().includes('superadmin')) {
                            setShowBlockedSuperadminAlert(true)
                          } else {
                            setShowBlockedSuperadminAlert(false)
                          }
                        }}
                        placeholder="Search name..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    {/* SECURITY NOTICE (Superadmin Blocked) */}
                    {showBlockedSuperadminAlert && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-[11px] leading-tight flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                        <span>Students cannot message Superadmin. You can only communicate directly with your School Admin.</span>
                      </div>
                    )}

                    {/* School Admin Conversation Item (Matching Screenshot with Admin constraint) */}
                    <div
                      onClick={() => setSelectedConversation('admin')}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        selectedConversation === 'admin'
                          ? 'bg-[#eef4ff] border-blue-200 dark:bg-blue-950/40 dark:border-blue-900'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          Ahmad Ali
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[9px] uppercase tracking-wider">
                          ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                        this is test message
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        31 Jul 2026, 11:40 AM
                      </span>
                    </div>

                    {/* Security policy pill */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">🔒 Verified Contact Policy:</span>
                      Students are authorized to message School Administration only.
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ACTIVE CHAT OR PLACEHOLDER (md:col-span-8) */}
                  <div className="md:col-span-8 p-6 flex flex-col justify-between">
                    {selectedConversation === 'admin' ? (
                      /* ACTIVE CONVERSATION THREAD */
                      <div className="flex flex-col h-full space-y-4">
                        {/* Conversation Top Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                                Ahmad Ali (School Admin)
                              </h3>
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-bold text-[9px]">
                                ADMIN
                              </span>
                            </div>
                            <span className="text-[11px] text-emerald-600 font-medium">● Online · Direct Helpdesk</span>
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Apex School System
                          </span>
                        </div>

                        {/* Messages Stream */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
                          {adminChatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${msg.sender === 'student' ? 'items-end' : 'items-start'}`}
                            >
                              <div
                                className={`p-3.5 rounded-2xl max-w-sm text-xs leading-relaxed ${
                                  msg.sender === 'student'
                                    ? 'bg-[#2563eb] text-white rounded-br-xs'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                                }`}
                              >
                                {msg.text}
                              </div>
                              <span className="text-[10px] text-slate-400 mt-1 px-1">
                                {msg.timestamp}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Message Input Box */}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            if (!chatMessageText.trim()) return
                            setAdminChatMessages(prev => [
                              ...prev,
                              {
                                id: Date.now(),
                                sender: 'student',
                                senderName: studentName,
                                text: chatMessageText.trim(),
                                timestamp: 'Just now'
                              }
                            ])
                            setChatMessageText('')
                          }}
                          className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={chatMessageText}
                            onChange={(e) => setChatMessageText(e.target.value)}
                            placeholder="Type your message to School Admin..."
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500/20"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* EMPTY CONVERSATION PLACEHOLDER (Exact match to screenshot 7) */
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          Select a conversation
                        </h3>
                        <p className="text-xs text-slate-400">
                          Choose a chat on the left, or send a new message.
                        </p>
                        <p className="text-[11px] text-slate-400 pt-8">
                          Select a conversation or click Send Message.
                        </p>
                        <button
                          type="button"
                          onClick={() => setSelectedConversation('admin')}
                          className="px-4 py-2 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs cursor-pointer transition-colors mt-2"
                        >
                          Message School Admin
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: FEE RECORDS (Pick 1 & 2 - media_1794578519476_239e30d9.png & media_1794578566056_0fd6a2d7.png) */}
          {activeTab === 'fees' && (
            <div className="space-y-4">
              {/* Top Subheader: "Fee Records" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Fee Records
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons (with Fee Records active blue pill) */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eef4ff] text-[#2563eb] font-semibold dark:bg-blue-950/50 dark:text-blue-300 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-[#2563eb] dark:text-blue-300" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* SOLID BLUE STUDENT FEE BANNER (Matching Screenshot 1) */}
              <div className="bg-[#2563eb] text-white px-5 py-3 rounded-2xl flex flex-wrap items-center gap-3 text-xs font-semibold shadow-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <FolderOpen className="w-4 h-4" />
                  <span>Fee Records</span>
                </div>
                <span>&bull;</span>
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{studentName}</span>
                </div>
                <span>&bull;</span>
                <span># Roll: NU1</span>
                <span>&bull;</span>
                <span># ADM: ED/N/2025/16862</span>
                <span>&bull;</span>
                <span>{studentClass} - {studentSection}</span>
              </div>

              {/* 5 SUMMARY KPI CARDS (Matching Screenshot 1 Exactly) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3.5">
                {/* 1. Total Invoices */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Total Invoices</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#2563eb] block mt-1">17</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                    <FileText className="w-4 h-4" />
                  </div>
                </div>

                {/* 2. Pending Balance */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Pending Balance</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#ef4444] block mt-1">PKR 9,375</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>

                {/* 3. Total Paid */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Total Paid</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#10b981] block mt-1">PKR 14,485</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* 4. Completed */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Completed</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#f97316] block mt-1">11</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-500 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>

                {/* 5. Waivers / Discounts */}
                <div className={`col-span-2 sm:col-span-4 lg:col-span-1 p-4 rounded-2xl border transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex items-center justify-between`}>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block">Waivers / Discounts</span>
                    <span className="text-xl sm:text-2xl font-bold text-[#06b6d4] block mt-1">PKR 2,350</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">1 line with a discount</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 flex items-center justify-center">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* TABS SELECTOR (Pending Payments [6], Completed Payments [11], Waiver/Discount [1]) */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pt-2 text-xs">
                <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
                  {/* Tab 1: Pending */}
                  <button
                    type="button"
                    onClick={() => setFeeRecordsActiveTab('pending')}
                    className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      feeRecordsActiveTab === 'pending'
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Pending Payments</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#ef4444] text-white font-bold text-[10px]">
                      {pendingFeeList.length}
                    </span>
                  </button>

                  {/* Tab 2: Completed */}
                  <button
                    type="button"
                    onClick={() => setFeeRecordsActiveTab('completed')}
                    className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      feeRecordsActiveTab === 'completed'
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                    <span>Completed Payments</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#10b981] text-white font-bold text-[10px]">
                      {completedFeeList.length}
                    </span>
                  </button>

                  {/* Tab 3: Waiver / Discount */}
                  <button
                    type="button"
                    onClick={() => setFeeRecordsActiveTab('waivers')}
                    className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      feeRecordsActiveTab === 'waivers'
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Waiver / Discount</span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#06b6d4] text-white font-bold text-[10px]">
                      {waiversFeeList.length}
                    </span>
                  </button>
                </div>

                <div className="flex items-center text-slate-400 text-xs pb-2">
                  <span className="cursor-pointer hover:text-slate-600">▲▼</span>
                </div>
              </div>

              {/* TAB CONTENT: PENDING PAYMENTS (Matching Screenshot 1 & 2) */}
              {feeRecordsActiveTab === 'pending' && (
                <div className="space-y-6">
                  {/* Section 1: Monthly Fee Vouchers */}
                  <div className="space-y-3">
                    <span className="block text-xs text-slate-400 font-medium">
                      Class / monthly fee vouchers (one card per month)
                    </span>

                    {pendingFeeList.filter(v => v.type === 'monthly').map((voucher) => (
                      <div
                        key={voucher.id}
                        className={`border-l-4 border-l-red-500 rounded-2xl p-4 sm:p-5 border ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        } shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
                      >
                        {/* Left Details */}
                        <div className="space-y-1.5 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-slate-400" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {voucher.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                              {voucher.badge}
                            </span>
                            {voucher.secondaryBadge && (
                              <span className="px-2 py-0.5 rounded bg-[#06b6d4] text-white font-semibold text-[10px]">
                                {voucher.secondaryBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            <p># Ref: {voucher.refNo}</p>
                            <p>Receipt: {voucher.receiptNo}</p>
                          </div>
                        </div>

                        {/* Middle: Progress Bar & Financial Breakdown */}
                        <div className="flex-1 max-w-md space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span>Payment Progress</span>
                            <span className="font-bold">{voucher.progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full"
                              style={{ width: `${voucher.progress}%` }}
                            />
                          </div>
                          <div className="grid grid-cols-3 text-center text-xs pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Total</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                PKR {voucher.total.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Paid</span>
                              <span className="font-bold text-emerald-600">
                                PKR {voucher.paid.toLocaleString()}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Remaining balance</span>
                              <span className="font-bold text-red-600">
                                PKR {voucher.remaining.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[150px]">
                          <button
                            type="button"
                            onClick={() => setSelectedFeeForPayment(voucher)}
                            className="w-full py-2 px-4 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Online
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFeeForReceipt(voucher)}
                            className="w-full py-2 px-4 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Section 2: One-time & Individual Charges */}
                  <div className="space-y-3 pt-2">
                    <span className="block text-xs text-slate-400 font-medium">
                      One-time & individual charges (admission, stock, fines, etc.)
                    </span>

                    {pendingFeeList.filter(v => v.type === 'charge').map((charge) => (
                      <div
                        key={charge.id}
                        className={`border-l-4 border-l-amber-500 rounded-2xl p-4 sm:p-5 border ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        } shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4`}
                      >
                        {/* Left Details */}
                        <div className="space-y-1.5 min-w-[200px]">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                              {charge.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-orange-500 text-white font-semibold text-[10px]">
                              {charge.badge}
                            </span>
                            {charge.secondaryBadge && (
                              <span className="px-2 py-0.5 rounded bg-[#06b6d4] text-white font-semibold text-[10px]">
                                {charge.secondaryBadge}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-tight">
                            <p># ID: {charge.refNo}</p>
                            <p>{charge.subTitle}</p>
                          </div>
                        </div>

                        {/* Middle: Due remaining & Year */}
                        <div className="flex-1 max-w-md flex items-center justify-around text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block">Due (remaining)</span>
                            <span className="font-bold text-base text-red-600 block mt-0.5">
                              PKR {charge.remaining}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block">Year/Session</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                              {charge.session}
                            </span>
                          </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[150px]">
                          <button
                            type="button"
                            onClick={() => setSelectedFeeForPayment(charge)}
                            className="w-full py-2 px-4 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Pay Online
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedFeeForReceipt(charge)}
                            className="w-full py-2 px-4 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            Receipt
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: COMPLETED PAYMENTS (11 Records totaling PKR 14,485) */}
              {feeRecordsActiveTab === 'completed' && (
                <div className="space-y-3">
                  <span className="block text-xs text-slate-400 font-medium">
                    Fully cleared fee invoices and historical payments
                  </span>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-600 dark:text-slate-300">
                          <th className="py-3 px-4">Invoice Description</th>
                          <th className="py-3 px-4">Reference No</th>
                          <th className="py-3 px-4">Receipt No</th>
                          <th className="py-3 px-4 text-right">Amount Paid</th>
                          <th className="py-3 px-4">Payment Date</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {completedFeeList.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.title}</td>
                            <td className="py-3 px-4 text-slate-500">{item.refNo}</td>
                            <td className="py-3 px-4 text-slate-500">{item.receiptNo}</td>
                            <td className="py-3 px-4 text-right font-bold text-emerald-600">PKR {item.paid.toLocaleString()}</td>
                            <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{item.date}</td>
                            <td className="py-3 px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold">
                                {item.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedFeeForReceipt(item)}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-300 font-semibold text-xs cursor-pointer"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB CONTENT: WAIVER / DISCOUNT */}
              {feeRecordsActiveTab === 'waivers' && (
                <div className="space-y-3">
                  <span className="block text-xs text-slate-400 font-medium">
                    Approved fee concessions and special scholarships
                  </span>

                  {waiversFeeList.map((w) => (
                    <div
                      key={w.id}
                      className={`border-l-4 border-l-cyan-500 rounded-2xl p-5 border ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                      } shadow-xs space-y-2`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{w.title}</h3>
                        <span className="font-bold text-base text-[#06b6d4]">PKR {w.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span># Voucher: {w.voucherRef}</span>
                        <span>&bull;</span>
                        <span>Authorized by: {w.appliedBy}</span>
                        <span>&bull;</span>
                        <span>Date: {w.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">{w.notes}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 10: MY ACCOUNT (Pick 3 - media_1794578607569_2caa20b4.png) */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {/* Top Subheader: "My Account" + Back Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      My Account
                    </h1>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium mt-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                {/* Right Top Action Icons */}
                <div className="flex items-center gap-3 sm:gap-6 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('report-cards')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>Report Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>My Attendance</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-4 h-4 text-slate-500" />
                    <span>Assignments</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <Megaphone className="w-4 h-4 text-slate-500" />
                    <span>Announcements</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fees')}
                    className="flex flex-col items-center gap-1 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-slate-500" />
                    <span>Fee Records</span>
                  </button>
                </div>
              </div>

              {/* MAIN MY ACCOUNT CARD (Matching Screenshot 3 Exactly) */}
              <div className={`rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs p-6 sm:p-8 space-y-6`}>
                <h2 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  My Account
                </h2>

                {/* Subtabs: Manage Profile & Change Password */}
                <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setAccountActiveSubtab('profile')}
                    className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      accountActiveSubtab === 'profile'
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Manage Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountActiveSubtab('password')}
                    className={`pb-2.5 font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      accountActiveSubtab === 'password'
                        ? 'text-[#2563eb] border-b-2 border-[#2563eb]'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span>Change Password</span>
                  </button>
                </div>

                {/* SUBTAB 1: MANAGE PROFILE (Matching Screenshot 3) */}
                {accountActiveSubtab === 'profile' && (
                  <div className="space-y-6 max-w-2xl">
                    {/* Official Apex Emblem / Avatar */}
                    <div className="w-24 h-24 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-amber-50/20 flex items-center justify-center p-2 overflow-hidden shadow-xs">
                      <div className="w-full h-full rounded-full border-2 border-[#800000] flex flex-col items-center justify-center text-[#800000] text-center p-1">
                        <GraduationCap className="w-5 h-5" />
                        <span className="text-[7px] font-bold uppercase leading-tight mt-0.5">APEX SCHOOL</span>
                      </div>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        if (accountNameValue.trim()) {
                          setStudentName(accountNameValue.trim())
                          try {
                            localStorage.setItem('sms_student_custom_name', accountNameValue.trim())
                          } catch {}
                          alert('Profile photo and student details saved successfully!')
                        }
                      }}
                      className="space-y-4 text-xs"
                    >
                      {/* Name Field */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={accountNameValue}
                          onChange={(e) => setAccountNameValue(e.target.value)}
                          className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/20"
                        />
                      </div>

                      {/* Username Field (Read-only registration ID) */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value="ED/N/2025/16862"
                          readOnly
                          disabled
                          className="w-full max-w-md px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 cursor-not-allowed"
                        />
                      </div>

                      {/* Profile Photo Upload */}
                      <div>
                        <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                          Profile photo
                        </label>
                        <div className="flex items-center gap-3 max-w-md">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                setAccountPhotoSelected(e.target.files[0].name)
                              }
                            }}
                            id="student-photo-upload"
                            className="hidden"
                          />
                          <div className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-500 flex items-center justify-between">
                            <span>{accountPhotoSelected || 'No file selected'}</span>
                            <label
                              htmlFor="student-photo-upload"
                              className="px-3 py-1 rounded-lg bg-[#0284c7] hover:bg-sky-700 text-white font-semibold text-xs cursor-pointer"
                            >
                              Choose File
                            </label>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Accepted: jpeg, png, webp — max 2 MB
                        </p>
                      </div>

                      {/* Upload Photo Button (Matching Coral Red button in screenshot 3) */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          className="px-5 py-2.5 rounded-xl bg-[#ef4444] hover:bg-red-600 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Upload photo
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* SUBTAB 2: CHANGE PASSWORD */}
                {accountActiveSubtab === 'password' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      if (!passwordFormData.newPass || passwordFormData.newPass !== passwordFormData.confirmPass) {
                        alert('New passwords do not match!')
                        return
                      }
                      alert('Student portal password updated successfully!')
                      setPasswordFormData({ current: '', newPass: '', confirmPass: '' })
                    }}
                    className="space-y-4 max-w-md text-xs"
                  >
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordFormData.current}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, current: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordFormData.newPass}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, newPass: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={passwordFormData.confirmPass}
                        onChange={(e) => setPasswordFormData(prev => ({ ...prev, confirmPass: e.target.value }))}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#2563eb] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: ENTER / EDIT STUDENT NAME */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold">
                Student Profile Information
              </h3>
              <button
                type="button"
                onClick={() => setIsEditNameModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="mt-4 space-y-4 text-xs">
              <p className="text-slate-500">
                Enter your student name, class, and section details below:
              </p>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editNameInput}
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder="e.g. Muhammad Ali, Ahmed Khan..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Enrolled Class
                </label>
                <input
                  type="text"
                  value={editClassInput}
                  onChange={(e) => setEditClassInput(e.target.value)}
                  placeholder="e.g. Nursery, Class 1, Class 10..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Section
                </label>
                <input
                  type="text"
                  value={editSectionInput}
                  onChange={(e) => setEditSectionInput(e.target.value)}
                  placeholder="e.g. Super, A, B..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditNameModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT CHALLAN */}
      {selectedChallanForPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-4xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Apex School System - 3-Part Fee Challan
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBrowserPrint}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Challan
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedChallanForPrint(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 border border-slate-300 p-4 rounded-2xl bg-slate-50/50 text-[11px]">
              {['Bank Copy', 'Institute Copy', 'Student Copy'].map((copyTitle, cIdx) => (
                <div key={cIdx} className={`p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between ${cIdx > 0 ? 'border-dashed border-l-slate-300' : ''}`}>
                  <div>
                    <div className="text-center pb-2 border-b border-slate-200">
                      <span className="font-extrabold uppercase text-[10px] text-blue-700 block">
                        Apex School System
                      </span>
                      <h4 className="font-bold text-xs mt-0.5">Management System</h4>
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
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold">{studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Class:</span>
                        <span>{studentClass}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Due Date:</span>
                        <span className="font-bold text-rose-600">{selectedChallanForPrint.dueDate}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 space-y-1">
                      <div className="flex justify-between">
                        <span>Tuition Fee</span>
                        <span>PKR 8,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Activity & Material</span>
                        <span>PKR 875</span>
                      </div>
                      <div className="pt-2 border-t border-slate-300 flex justify-between font-bold text-xs text-slate-900">
                        <span>Total Payable</span>
                        <span>PKR 9,375</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-dashed border-slate-200 text-center">
                    <span className="text-[9px] text-slate-400 block">Bank Officer Signature & Stamp</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedChallanForPrint(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REPORT CARD */}
      {isReportCardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">Student Academic Progress Report</h3>
              <button onClick={() => setIsReportCardModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold">Apex School System</h2>
              <p className="text-xs text-slate-500">Student: {studentName} &bull; Class: {studentClass}</p>
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <p className="font-semibold text-emerald-600">Status: Enrolled in Active Session</p>
                <p className="text-slate-400 mt-1">Official term report card will be published at the end of the term.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW NOTICE / ANNOUNCEMENT */}
      {viewingNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Megaphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">{viewingNotice.title}</h3>
              </div>
              <button onClick={() => setViewingNotice(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              {viewingNotice.author && (
                <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                  <User className="w-3.5 h-3.5" />
                  <span>{viewingNotice.author}</span>
                </div>
              )}
              {viewingNotice.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{viewingNotice.date}</span>
                </div>
              )}
              {viewingNotice.scope && (
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-semibold">
                  {viewingNotice.scope}
                </span>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {viewingNotice.content}
            </div>

            {viewingNotice.hasAttachment && (
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{viewingNotice.attachmentName || 'circular.pdf'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Downloading official circular...')}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingNotice(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RECORDED LECTURE PLAYER */}
      {selectedLectureVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm">{selectedLectureVideo.title}</h3>
                <p className="text-[11px] text-slate-400">{selectedLectureVideo.subject} · {selectedLectureVideo.lecturer}</p>
              </div>
              <button onClick={() => setSelectedLectureVideo(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden flex items-center justify-center">
              <p className="text-xs text-white">Video stream loading for {selectedLectureVideo.title}...</p>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLectureVideo(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY LEAVE */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-sm">Apply for Student Leave</h3>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); alert('Leave submitted!'); setIsLeaveModalOpen(false); }} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Reason</label>
                <input required placeholder="e.g. Sick Leave, Family Wedding" className="w-full px-3 py-2 rounded-xl border border-slate-200" />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Date</label>
                <input type="date" required className="w-full px-3 py-2 rounded-xl border border-slate-200" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold cursor-pointer">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ASSIGNMENT DETAILS (Interactive eye button view) */}
      {selectedAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedAssignmentModal.title}
                  </h3>
                  <span className="text-[11px] text-slate-400">Assignment Details</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges & Meta info */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Subject</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{selectedAssignmentModal.subject}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Date Assigned</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{selectedAssignmentModal.date}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Instructor / Teacher</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{selectedAssignmentModal.teacher}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Class & Section</span>
                <span className="font-bold text-slate-800 dark:text-white mt-0.5 block">{studentClass} - {studentSection}</span>
              </div>
            </div>

            {/* Description & Instructions */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-800 dark:text-slate-200 block">
                Instructions / Homework Task:
              </label>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedAssignmentModal.description || selectedAssignmentModal.instructions || 'Please complete the assigned homework in your notebook.'}
              </div>
            </div>

            {/* Attached file/image preview */}
            {selectedAssignmentModal.hasAttachment && (
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  Attachment Material:
                </label>
                <div className="p-3 rounded-xl border border-cyan-200 dark:border-cyan-800/60 bg-cyan-50/50 dark:bg-cyan-950/20 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500 text-white flex items-center justify-center">
                      <Image className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{selectedAssignmentModal.attachmentName || 'assignment-material.png'}</p>
                      <p className="text-[10px] text-slate-400">Attached image · Click download or preview</p>
                    </div>
                  </div>
                  <a
                    href={selectedAssignmentModal.attachmentUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open Image
                  </a>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedAssignmentModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: PAY FEE ONLINE */}
      {selectedFeeForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm">Pay Fee Online</h3>
              </div>
              <button onClick={() => setSelectedFeeForPayment(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-xs">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Voucher</span>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedFeeForPayment.title}</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-slate-500">Amount Due:</span>
                <span className="text-lg font-bold text-emerald-600">PKR {selectedFeeForPayment.remaining.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentGateway}
                  onChange={(e) => setPaymentGateway(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="1Link / Online Banking">1Link / Online Banking Bill Payment</option>
                  <option value="JazzCash">JazzCash Mobile Account / Voucher</option>
                  <option value="EasyPaisa">EasyPaisa Mobile Wallet</option>
                  <option value="Credit / Debit Card">Credit / Debit Card (Visa / Mastercard)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  Reference Voucher No
                </label>
                <input
                  type="text"
                  readOnly
                  value={selectedFeeForPayment.refNo}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedFeeForPayment(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPayingNow}
                onClick={() => {
                  setIsPayingNow(true)
                  setTimeout(() => {
                    setIsPayingNow(false)
                    setPendingFeeList(prev => prev.filter(v => v.id !== selectedFeeForPayment.id))
                    setSelectedFeeForPayment(null)
                    alert(`Payment of PKR ${selectedFeeForPayment.remaining} for ${selectedFeeForPayment.title} processed successfully via ${paymentGateway}!`)
                  }, 800)
                }}
                className="px-5 py-2 rounded-xl bg-[#16a34a] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {isPayingNow ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OFFICIAL PRINTABLE RECEIPT */}
      {selectedFeeForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm">Official Fee Receipt</h3>
              </div>
              <button onClick={() => setSelectedFeeForReceipt(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* School Receipt Header */}
            <div className="text-center space-y-1 pb-2">
              <h2 className="text-base font-bold text-[#0b2447] dark:text-white">Apex School System</h2>
              <p className="text-[11px] text-slate-500">Student Fee Voucher & Payment Slip</p>
              <span className="text-[10px] text-slate-400">Receipt #: {selectedFeeForReceipt.receiptNo || 'RCP-2026-991'} &bull; Ref: {selectedFeeForReceipt.refNo}</span>
            </div>

            {/* Receipt Particulars Table */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold">{studentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Roll / Admission:</span>
                <span className="font-bold">Roll: NU1 &bull; ADM: ED/N/2025/16862</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-bold">{studentClass} - {studentSection}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Fee Particular:</span>
                <span className="font-bold">{selectedFeeForReceipt.title}</span>
              </div>
              <div className="flex justify-between py-1 text-sm font-bold pt-1">
                <span className="text-slate-700 dark:text-slate-200">Amount:</span>
                <span className="text-emerald-600">PKR {(selectedFeeForReceipt.paid || selectedFeeForReceipt.total || selectedFeeForReceipt.remaining).toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-400 text-center">
              Computer-generated official receipt verified by Apex Finance Desk.
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                type="button"
                onClick={() => setSelectedFeeForReceipt(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer"
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
