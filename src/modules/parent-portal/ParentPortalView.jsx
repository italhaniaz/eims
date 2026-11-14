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
  Paperclip,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Percent,
  Users
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useAppData } from '../../context/AppDataContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../context/ToastContext'

// --- INITIAL 7 CHILDREN DATA (MATCHING EXACT USER SCREENSHOTS) ---
const INITIAL_CHILDREN = [
  {
    id: 'ch-1',
    sn: 1,
    name: 'Muhammad Hamza',
    admissionNo: 'ED/N/2025/91794',
    rollNo: 'CL1-04',
    className: 'Class One',
    section: 'Super',
    sectionFull: 'Class One Super',
    email: 'abc@gmail.com',
    dob: '12 Apr 2019',
    bloodGroup: 'B+',
    gender: 'Male',
    photoType: 'avatar',
    avatarBg: 'bg-blue-600',
    pendingFees: 14200,
    attendancePercent: 90.5,
    attendanceStats: { present: 19, absent: 1, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-101', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/917941', receiptNo: 'RCP-88120', total: 6500, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-102', title: 'Mid-Term Exam Fee', type: 'Term', refNo: '2026/917942', receiptNo: 'RCP-88121', total: 4500, paid: 0, status: 'pending', dueDate: '20 Nov 2026' },
      { id: 'v-103', title: 'Sports & Activity Club Fund', type: 'One-Time', refNo: '2026/917943', receiptNo: 'RCP-88122', total: 3200, paid: 0, status: 'pending', dueDate: '25 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-101', title: 'Monthly Tuition Fee - Oct 2026', type: 'Monthly', refNo: '2026/917800', receiptNo: 'RCP-84210', total: 6500, paid: 6500, status: 'paid', paidDate: '08 Oct 2026', paymentMode: 'Online JazzCash' },
      { id: 'cv-102', title: 'Annual Lab & Library Charges', type: 'Annual', refNo: '2026/917801', receiptNo: 'RCP-84211', total: 5000, paid: 5000, status: 'paid', paidDate: '15 Sep 2026', paymentMode: 'Bank Transfer' }
    ]
  },
  {
    id: 'ch-2',
    sn: 2,
    name: 'Umer Ahmad',
    admissionNo: 'ED/N/2025/90032',
    rollNo: 'NU-18',
    className: 'Nursery',
    section: 'Super',
    sectionFull: 'Nursery Super',
    email: 'umer@gmail.com',
    dob: '05 Aug 2021',
    bloodGroup: 'O+',
    gender: 'Male',
    photoType: 'badge',
    pendingFees: 9375,
    attendancePercent: 0.0,
    attendanceStats: { present: 0, absent: 0, leave: 0, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-201', title: 'Apr 407 Fee', type: 'Monthly', refNo: '2026/886812', receiptNo: '11495289', total: 2475, paid: 0, status: 'pending', dueDate: '10 Nov 2026' },
      { id: 'v-202', title: 'paper fund', type: 'One-Time', refNo: '2026/100540', receiptNo: '35904907', total: 800, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-203', title: 'Apr 1122', type: 'Monthly', refNo: '2026/993182', receiptNo: '77218940', total: 2200, paid: 0, status: 'pending', dueDate: '20 Nov 2026' },
      { id: 'v-204', title: 'Anuall Fund Nursary', type: 'Annual', refNo: '2026/441209', receiptNo: '55018372', total: 1500, paid: 0, status: 'pending', dueDate: '22 Nov 2026' },
      { id: 'v-205', title: 'Oct 2026 Fee Voucher', type: 'Monthly', refNo: '2026/883419', receiptNo: '88390145', total: 1900, paid: 0, status: 'pending', dueDate: '25 Nov 2026' },
      { id: 'v-206', title: 'Defaulter Fine', type: 'Fine', refNo: '2026/300184', receiptNo: '99201844', total: 500, paid: 0, status: 'pending', dueDate: '30 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-201', title: 'Admission Security Deposit', type: 'Admission', refNo: '2025/110291', receiptNo: 'RCP-71029', total: 8500, paid: 8500, status: 'paid', paidDate: '10 Jan 2026', paymentMode: 'Direct Bank Deposit' },
      { id: 'cv-202', title: 'Term 1 Books & Study Kit', type: 'Kit', refNo: '2025/110292', receiptNo: 'RCP-71030', total: 5985, paid: 5985, status: 'paid', paidDate: '18 Jan 2026', paymentMode: 'Online EasyPaisa' }
    ]
  },
  {
    id: 'ch-3',
    sn: 3,
    name: 'Selma Giles',
    admissionNo: 'ED/N/2015/112233',
    rollNo: 'NU-09',
    className: 'Nursery',
    section: 'Super',
    sectionFull: 'Nursery Super',
    email: 'capovyveq@mailinator.com',
    dob: '18 Nov 2021',
    bloodGroup: 'A+',
    gender: 'Female',
    photoType: 'avatar',
    avatarBg: 'bg-emerald-600',
    pendingFees: 11500,
    attendancePercent: 88.0,
    attendanceStats: { present: 18, absent: 2, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-301', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/112233-1', receiptNo: 'RCP-66101', total: 5500, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-302', title: 'Montessori Activity & Daycare Fee', type: 'Activity', refNo: '2026/112233-2', receiptNo: 'RCP-66102', total: 6000, paid: 0, status: 'pending', dueDate: '20 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-301', title: 'Monthly Tuition Fee - Oct 2026', type: 'Monthly', refNo: '2026/112200', receiptNo: 'RCP-62180', total: 5500, paid: 5500, status: 'paid', paidDate: '07 Oct 2026', paymentMode: 'Online Credit Card' }
    ]
  },
  {
    id: 'ch-4',
    sn: 4,
    name: 'Hanna Giles',
    admissionNo: 'ED/N/2015/68511',
    rollNo: 'NU-10',
    className: 'Nursery',
    section: 'Super',
    sectionFull: 'Nursery Super',
    email: 'dawubyca@mailinator.com',
    dob: '18 Nov 2021',
    bloodGroup: 'A+',
    gender: 'Female',
    photoType: 'emblem',
    pendingFees: 11500,
    attendancePercent: 92.5,
    attendanceStats: { present: 19, absent: 1, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-401', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/68511-1', receiptNo: 'RCP-55210', total: 5500, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-402', title: 'Montessori Activity & Daycare Fee', type: 'Activity', refNo: '2026/68511-2', receiptNo: 'RCP-55211', total: 6000, paid: 0, status: 'pending', dueDate: '20 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-401', title: 'Monthly Tuition Fee - Oct 2026', type: 'Monthly', refNo: '2026/68500', receiptNo: 'RCP-51009', total: 5500, paid: 5500, status: 'paid', paidDate: '07 Oct 2026', paymentMode: 'Online Credit Card' }
    ]
  },
  {
    id: 'ch-5',
    sn: 5,
    name: 'Carl Blanchard',
    admissionNo: 'ED/N/2019/29538',
    rollNo: 'NU-25',
    className: 'Nursery',
    section: 'Super',
    sectionFull: 'Nursery Super',
    email: 'tobc@mailinator.com',
    dob: '14 Feb 2021',
    bloodGroup: 'AB+',
    gender: 'Male',
    photoType: 'globe',
    pendingFees: 8900,
    attendancePercent: 83.3,
    attendanceStats: { present: 17, absent: 3, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-501', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/29538-1', receiptNo: 'RCP-44100', total: 5500, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-502', title: 'Transport Van Charges - Nov 2026', type: 'Transport', refNo: '2026/29538-2', receiptNo: 'RCP-44101', total: 3400, paid: 0, status: 'pending', dueDate: '18 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-501', title: 'Monthly Tuition Fee - Oct 2026', type: 'Monthly', refNo: '2026/29500', receiptNo: 'RCP-41289', total: 5500, paid: 5500, status: 'paid', paidDate: '05 Oct 2026', paymentMode: 'JazzCash' }
    ]
  },
  {
    id: 'ch-6',
    sn: 6,
    name: 'MUHAMMAD FAIZAN',
    admissionNo: 'ED/1/2016/20357',
    rollNo: 'CL1-12',
    className: 'Class One',
    section: 'Super',
    sectionFull: 'Class One Super',
    email: 'zulfiqarali786@gmail.com',
    dob: '09 Oct 2019',
    bloodGroup: 'B+',
    gender: 'Male',
    photoType: 'portrait',
    pendingFees: 9421,
    attendancePercent: 97.5,
    attendanceStats: { present: 20, absent: 0, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-601', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/20357-1', receiptNo: 'RCP-33019', total: 6500, paid: 0, status: 'pending', dueDate: '15 Nov 2026' },
      { id: 'v-602', title: 'Computer Lab & Robotics Club Fee', type: 'Lab', refNo: '2026/20357-2', receiptNo: 'RCP-33020', total: 2921, paid: 0, status: 'pending', dueDate: '20 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-601', title: 'Monthly Tuition Fee - Oct 2026', type: 'Monthly', refNo: '2026/20300', receiptNo: 'RCP-29811', total: 6500, paid: 6500, status: 'paid', paidDate: '04 Oct 2026', paymentMode: 'Bank Transfer' }
    ]
  },
  {
    id: 'ch-7',
    sn: 7,
    name: 'Hadi',
    admissionNo: 'ED-2026-287',
    rollNo: '10-A-15',
    className: '10th',
    section: 'Super',
    sectionFull: '10th Super',
    email: 'N/A',
    dob: '22 Mar 2010',
    bloodGroup: 'O-',
    gender: 'Male',
    photoType: 'avatar',
    avatarBg: 'bg-indigo-600',
    pendingFees: 8000,
    attendancePercent: 88.5,
    attendanceStats: { present: 18, absent: 2, leave: 1, workingDays: 21 },
    todayClasses: 'NO CLASSES TODAY',
    todaySubtitle: 'No periods on the timetable today.',
    feeVouchers: [
      { id: 'v-701', title: 'Monthly Tuition Fee - Nov 2026', type: 'Monthly', refNo: '2026/287-1', receiptNo: 'RCP-12001', total: 8000, paid: 0, status: 'pending', dueDate: '15 Nov 2026' }
    ],
    completedVouchers: [
      { id: 'cv-701', title: 'Matric Registration & Board Fee', type: 'Board', refNo: '2026/280-B', receiptNo: 'RCP-09122', total: 7500, paid: 7500, status: 'paid', paidDate: '12 Sep 2026', paymentMode: 'Bank Voucher' }
    ]
  }
]

export default function ParentPortalView() {
  const { user, logout } = useAuth()
  const { isDark, toggleThemeMode } = useTheme()
  const { toast } = useToast()

  // --- PARENT NAME STATE (DEFAULT 'Unknown' AS REQUESTED) ---
  const [parentName, setParentName] = useState(() => {
    try {
      const stored = localStorage.getItem('sms_parent_custom_name')
      if (stored) return stored
      // If user object provides a name that is not generic default
      if (user?.name && user.name !== 'Parent / Guardian' && user.name !== 'Younas Baig') {
        return user.name
      }
    } catch {}
    return 'Unknown'
  })

  // Modal to enter/edit parent name
  const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false)
  const [editNameInput, setEditNameInput] = useState('')

  // Navigation State
  // Tabs: 'dashboard' | 'fees' | 'my-children' | 'attendance' | 'timetable' | 'assignments' | 'announcements' | 'communication' | 'download-app' | 'account'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotifOpen, setIsNotifOpen] = useState(false)

  // Children Database
  const [childrenList, setChildrenList] = useState(INITIAL_CHILDREN)

  // Active child for detailed fee view (null = show all 7 cards as in pick 3 & 4)
  const [selectedChildForFees, setSelectedChildForFees] = useState(null)
  const [feeDetailTab, setFeeDetailTab] = useState('pending') // 'pending' | 'completed' | 'waivers'

  // Action Menu dropdown state in "My Children" table (pick 5)
  // maps childId -> boolean
  const [openActionChildId, setOpenActionChildId] = useState(null)

  // Modals for Child Profile & Report Card (from pick 5 dropdown actions)
  const [selectedChildForProfile, setSelectedChildForProfile] = useState(null)
  const [selectedChildForReportCard, setSelectedChildForReportCard] = useState(null)
  const [reportCardYear, setReportCardYear] = useState('2026')

  // Attendance Tab State (pick 6)
  const [attendanceSelectedChildId, setAttendanceSelectedChildId] = useState('') // empty by default = shows prompt
  const [attendanceViewMode, setAttendanceViewMode] = useState('Month calendar')
  const [attendanceType, setAttendanceType] = useState('General (daily)')
  const [attendanceMonth, setAttendanceMonth] = useState('November')
  const [attendanceYear, setAttendanceYear] = useState('2026')
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [leaveReason, setLeaveReason] = useState('Medical')
  const [leaveStartDate, setLeaveStartDate] = useState('2026-11-16')
  const [leaveEndDate, setLeaveEndDate] = useState('2026-11-17')
  const [leaveNotes, setLeaveNotes] = useState('')

  // Pay Online Modal state
  const [payingVoucher, setPayingVoucher] = useState(null)
  const [payingChild, setPayingChild] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('JazzCash')
  const [paymentPhone, setPaymentPhone] = useState('0300-1234567')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [receiptModalData, setReceiptModalData] = useState(null)

  // Quick Timetable Modal
  const [timetableModalChild, setTimetableModalChild] = useState(null)

  // Communication / Chat State
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'School Administration (Apex School)', text: 'Dear Parent, fee vouchers for November 2026 have been generated. Kindly ensure payment before the due date.', timestamp: '12 Nov 2026, 10:15 AM', isIncoming: true },
    { id: 2, sender: 'Class Teacher (Ms. Sana Kosar)', text: 'Parent-Teacher Meeting is scheduled for Saturday, 28th November. We look forward to meeting you.', timestamp: '13 Nov 2026, 02:40 PM', isIncoming: true },
    { id: 3, sender: 'School Administration (Apex School)', text: 'Winter break circular has been updated on the announcements bulletin.', timestamp: '14 Nov 2026, 09:00 AM', isIncoming: true }
  ])
  const [chatInputText, setChatInputText] = useState('')

  // Notifications List
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Summer Holidays Circular', desc: 'Summer break schedule announced by school board.', time: '13 Jun 2026', read: false },
    { id: 'n2', title: 'November Fee Due', desc: 'Fee vouchers issued for all enrolled children.', time: '10 Nov 2026', read: false },
    { id: 'n3', title: 'Parent-Teacher Conference', desc: 'Upcoming PTM scheduled at Apex Campus.', time: '14 Nov 2026', read: false }
  ])

  // Calculation helpers
  const totalPendingAcrossAllChildren = useMemo(() => {
    return childrenList.reduce((acc, c) => acc + (c.pendingFees || 0), 0)
  }, [childrenList])

  const totalInvoicesAcrossAllChildren = useMemo(() => {
    return childrenList.reduce((acc, c) => acc + (c.feeVouchers ? c.feeVouchers.length : 0), 0)
  }, [childrenList])

  // Save custom parent name
  const handleSaveParentName = () => {
    const trimmed = editNameInput.trim()
    const finalName = trimmed || 'Unknown'
    setParentName(finalName)
    try {
      localStorage.setItem('sms_parent_custom_name', finalName)
    } catch {}
    setIsEditNameModalOpen(false)
    toast?.success?.('Parent name updated successfully!')
  }

  // Handle Pay Online Submit
  const handleConfirmPayment = () => {
    if (!payingVoucher || !payingChild) return
    setIsProcessingPayment(true)

    setTimeout(() => {
      setIsProcessingPayment(false)

      // Move voucher from pending to completed for this child
      setChildrenList(prev => prev.map(ch => {
        if (ch.id !== payingChild.id) return ch
        const updatedPending = ch.feeVouchers.filter(v => v.id !== payingVoucher.id)
        const newCompleted = {
          ...payingVoucher,
          id: 'cv-' + Date.now(),
          status: 'paid',
          paid: payingVoucher.total,
          paidDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          paymentMode: `Online ${paymentMethod} (${paymentPhone})`
        }
        return {
          ...ch,
          pendingFees: Math.max(0, ch.pendingFees - payingVoucher.total),
          feeVouchers: updatedPending,
          completedVouchers: [newCompleted, ...(ch.completedVouchers || [])]
        }
      }))

      // Prepare receipt data
      const receipt = {
        childName: payingChild.name,
        admissionNo: payingChild.admissionNo,
        className: payingChild.className,
        section: payingChild.section,
        voucherTitle: payingVoucher.title,
        receiptNo: payingVoucher.receiptNo || 'RCP-' + Math.floor(100000 + Math.random() * 900000),
        refNo: payingVoucher.refNo,
        amount: payingVoucher.total,
        paymentDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        paymentMethod: paymentMethod,
        transactionId: 'TXN-' + Math.random().toString(36).substring(2, 9).toUpperCase()
      }

      setPayingVoucher(null)
      setReceiptModalData(receipt)
      toast?.success?.(`Payment of PKR ${payingVoucher.total.toLocaleString()} confirmed via ${paymentMethod}!`)
    }, 1000)
  }

  // Handle Leave Submission
  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault()
    setIsLeaveModalOpen(false)
    toast?.success?.(`Leave application for ${leaveReason} submitted to Apex Principal desk.`)
    setLeaveNotes('')
  }

  // Handle Send Message
  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!chatInputText.trim()) return

    const newMsg = {
      id: Date.now(),
      sender: `${parentName} (Parent)`,
      text: chatInputText.trim(),
      timestamp: 'Just now',
      isIncoming: false
    }

    setChatMessages(prev => [...prev, newMsg])
    setChatInputText('')

    // Simulated automated acknowledgment from School Helpdesk
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'School Administration Desk',
          text: `Thank you for your message, ${parentName}. An administrator will review your query and respond shortly.`,
          timestamp: 'Just now',
          isIncoming: true
        }
      ])
    }, 1200)
  }

  // Currently selected child for attendance
  const currentAttendanceChild = useMemo(() => {
    if (!attendanceSelectedChildId) return null
    return childrenList.find(c => c.id === attendanceSelectedChildId) || null
  }, [childrenList, attendanceSelectedChildId])

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f4f7fb] text-slate-800'
    }`}>
      {/* ---------------- TOP NAVBAR (APEX BRANDING) ---------------- */}
      <header className={`sticky top-0 z-40 h-16 border-b transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      } px-4 sm:px-6 flex items-center justify-between shadow-xs`}>
        {/* Left: Apex Logo & Title + Hamburger */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(prev => !prev)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* APEX BRANDING (Replacing EduDigitize Demo as requested) */}
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => {
              setActiveTab('dashboard')
              setSelectedChildForFees(null)
            }}
          >
            {/* Custom Modern Apex Logo Emblem */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 2L2 19h20L12 2z" />
                <path d="M12 9v4" />
                <path d="M12 17h.01" />
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
        </div>

        {/* Right: Notifications, Messages, Dark Mode, Profile (Unknown) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Notification Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="relative p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-rose-500" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {isNotifOpen && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-xl border p-3 z-50 transition-all ${
                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Notifications (3)</span>
                  <button
                    type="button"
                    onClick={() => setIsNotifOpen(false)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Close
                  </button>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          <button
            type="button"
            onClick={() => setActiveTab('communication')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Messages"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Color Mode"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Profile Badge (Unknown - Clickable to edit name) */}
          <div
            onClick={() => {
              setEditNameInput(parentName === 'Unknown' ? '' : parentName)
              setIsEditNameModalOpen(true)
            }}
            className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800 cursor-pointer group"
            title="Click to change your displayed name"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight group-hover:text-blue-600 transition-colors flex items-center gap-1">
                {parentName}
                <Pencil className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                PARENT
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------- MAIN LAYOUT ---------------- */}
      <div className="flex-1 flex overflow-hidden">
        {/* ---------------- SIDEBAR ---------------- */}
        <aside className={`fixed inset-y-0 left-0 z-30 w-60 pt-16 lg:pt-0 transform lg:static lg:translate-x-0 transition-transform duration-200 ease-in-out border-r ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        } ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full flex flex-col justify-between py-4 px-3 overflow-y-auto">
            <div className="space-y-1">
              {/* Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('dashboard')
                  setSelectedChildForFees(null)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* Fee Records */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('fees')
                  setSelectedChildForFees(null)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'fees'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>Fee Records</span>
              </button>

              {/* My Children */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('my-children')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'my-children'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>My Children</span>
              </button>

              {/* Attendance */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('attendance')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'attendance'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Attendance</span>
              </button>

              {/* Timetable */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('timetable')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'timetable'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Timetable</span>
              </button>

              {/* Assignments */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('assignments')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'assignments'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Assignments</span>
              </button>

              {/* Announcements */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('announcements')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'announcements'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Megaphone className="w-4 h-4" />
                <span>Announcements</span>
              </button>

              {/* Communication */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('communication')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'communication'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Communication</span>
                </div>
                <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] font-bold flex items-center justify-center">
                  3
                </span>
              </button>

              {/* Download App */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('download-app')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'download-app'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>Download App</span>
              </button>

              {/* My Account */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('account')
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === 'account'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>My Account</span>
              </button>
            </div>

            {/* Ward count summary in footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-[11px] text-slate-500">
                <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Apex Parent Portal</span>
                </div>
                <span>7 Wards Registered</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ---------------- CONTENT CONTAINER ---------------- */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {/* Top Quick Shortcut Pills (Present on inner pages) */}
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {activeTab === 'dashboard' && 'My Dashboard'}
                {activeTab === 'fees' && (selectedChildForFees ? `Fee Ledger - ${selectedChildForFees.name}` : 'Fee Records')}
                {activeTab === 'my-children' && 'My Children'}
                {activeTab === 'attendance' && 'Attendance Report'}
                {activeTab === 'timetable' && 'Class Timetable'}
                {activeTab === 'assignments' && 'Assignments & Homework'}
                {activeTab === 'announcements' && 'School Announcements'}
                {activeTab === 'communication' && 'School Helpdesk & Communication'}
                {activeTab === 'download-app' && 'Download Mobile App'}
                {activeTab === 'account' && 'My Account & Preferences'}
              </h1>
            </div>

            {/* Quick Navigation Buttons (Pick 1, 3, 5, 6) */}
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
              <button
                type="button"
                onClick={() => setActiveTab('my-children')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'my-children'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>My Children</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('attendance')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'attendance'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Attendance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assignments')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'assignments'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Assignments</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('announcements')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'announcements'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Announcements</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('fees')
                  setSelectedChildForFees(null)
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'fees'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Fee Payments</span>
              </button>
            </div>
          </div>

          {/* ---------------- TAB 1: DASHBOARD (PICK 1 & 2) ---------------- */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Banner: Welcome back, Unknown! */}
              <div className={`p-6 sm:p-7 rounded-2xl border transition-colors relative overflow-hidden shadow-xs ${
                isDark
                  ? 'bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-slate-800'
                  : 'bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white border-blue-100'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Welcome back, {parentName}!</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditNameInput(parentName === 'Unknown' ? '' : parentName)
                          setIsEditNameModalOpen(true)
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit parent display name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Stay updated on your children's progress and activity.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Saturday, 14 Nov 2026</span>
                  </div>
                </div>
              </div>

              {/* Children Schedule Rows (Pick 1 & 2) */}
              <div className="space-y-3">
                {childrenList.map((child) => (
                  <div
                    key={child.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
                    } shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div>
                      {/* Name & Class formatted uppercase like Pick 1 & 2 */}
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                        {child.name.toUpperCase()} · {child.className.toUpperCase()} · {child.section.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Today · Saturday, 14 Nov
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {child.todayClasses}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{child.todaySubtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setTimetableModalChild(child)
                      }}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors self-end sm:self-auto"
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>Full timetable</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* 3 Metrics Cards (Pick 2) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pending Fees */}
                <div
                  onClick={() => {
                    setActiveTab('fees')
                    setSelectedChildForFees(null)
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center text-amber-600">
                      <Hourglass className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">Pending Fees</span>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {totalPendingAcrossAllChildren.toLocaleString()}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {totalInvoicesAcrossAllChildren} invoice(s) · PKR
                      </span>
                    </div>
                  </div>
                </div>

                {/* This Month Attendance */}
                <div
                  onClick={() => setActiveTab('attendance')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">This Month</span>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        14%
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        1 present · 21 working days
                      </span>
                    </div>
                  </div>
                </div>

                {/* My Children */}
                <div
                  onClick={() => setActiveTab('my-children')}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900 flex items-center justify-center text-purple-600">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 font-medium">My Children</span>
                      <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        {childrenList.length}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Registered
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links Section (Pick 2) */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Quick Links
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('my-children')}
                    className="p-4 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center gap-2 shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    <Users className="w-5 h-5" />
                    <span className="text-xs font-semibold">My Children</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('fees')
                      setSelectedChildForFees(null)
                    }}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Wallet className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold">Fee Records</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('attendance')}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-semibold">Attendance</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('assignments')}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <BookOpen className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-semibold">Assignments</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('timetable')}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Clock className="w-5 h-5 text-purple-600" />
                    <span className="text-xs font-semibold">Timetables</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('announcements')}
                    className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Megaphone className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-semibold">Announcements</span>
                  </button>
                </div>
              </div>

              {/* Bottom Split: Latest Announcements + Recent Assignments (Pick 2) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Announcements */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4 text-cyan-600" />
                      <h3 className="text-sm font-bold">Latest Announcements</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('announcements')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
                    <div className="py-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Summer Holidays</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>13 Jun 2026</span>
                      </div>
                    </div>
                    <div className="py-3">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">25 December Holiday!</h4>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>16 Dec 2025</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Assignments */}
                <div className={`p-5 rounded-2xl border ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                } shadow-xs flex flex-col justify-between`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <h3 className="text-sm font-bold">Recent Assignments</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('assignments')}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View all
                    </button>
                  </div>
                  <div className="py-10 text-center flex flex-col items-center justify-center">
                    <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-2 stroke-[1.2]" />
                    <span className="text-xs text-slate-400">
                      No recent assignments / handouts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 2: FEE RECORDS (PICK 3 & 4) ---------------- */}
          {activeTab === 'fees' && (
            <div className="space-y-6">
              {/* If NO child is selected -> Display the 7 Children Cards (Pick 3 & 4) */}
              {!selectedChildForFees ? (
                <>
                  {/* Blue Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-6 h-6" />
                      <div>
                        <h2 className="text-lg font-bold">Fee Records</h2>
                        <p className="text-xs text-blue-100">View fee records for your children</p>
                      </div>
                    </div>
                  </div>

                  {/* Grid of 7 Children Cards (Matching Pick 3 & 4) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {childrenList.map((child) => (
                      <div
                        key={child.id}
                        className={`rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
                          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="p-5">
                          {/* Card Top: Photo & Name */}
                          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                            {/* Avatar representation */}
                            {child.photoType === 'avatar' && (
                              <div className={`w-12 h-12 rounded-full ${child.avatarBg || 'bg-blue-600'} flex items-center justify-center text-white`}>
                                <User className="w-6 h-6" />
                              </div>
                            )}
                            {child.photoType === 'badge' && (
                              <div className="w-12 h-12 rounded-full bg-slate-100 border-2 border-blue-400 p-1 flex items-center justify-center overflow-hidden">
                                <GraduationCap className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                            {child.photoType === 'emblem' && (
                              <div className="w-12 h-12 rounded-full bg-rose-50 border-2 border-[#800000] p-1 flex items-center justify-center text-[#800000]">
                                <Award className="w-6 h-6" />
                              </div>
                            )}
                            {child.photoType === 'globe' && (
                              <div className="w-12 h-12 rounded-full bg-blue-50 border-2 border-indigo-400 p-1 flex items-center justify-center text-indigo-600">
                                <Layers className="w-6 h-6" />
                              </div>
                            )}
                            {child.photoType === 'portrait' && (
                              <div className="w-12 h-12 rounded-full bg-amber-100 border-2 border-amber-500 p-1 flex items-center justify-center text-amber-800 font-bold text-sm">
                                FA
                              </div>
                            )}

                            <div>
                              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                {child.name}
                              </h3>
                              <span className="text-xs text-slate-400 font-mono">
                                # {child.admissionNo}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="py-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-500" />
                              <span>Class: <strong className="text-slate-800 dark:text-slate-200">{child.className}</strong></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Section: <strong className="text-slate-800 dark:text-slate-200">{child.section}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Card Action Button: Full width blue button */}
                        <div className="px-5 pb-5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedChildForFees(child)
                              setFeeDetailTab('pending')
                            }}
                            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                          >
                            <CreditCard className="w-4 h-4" />
                            <span>View Fee Records</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* CHILD SPECIFIC DETAILED FEE LEDGER VIEW */
                <div className="space-y-6">
                  {/* Back button and Child info banner */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedChildForFees(null)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Children</span>
                    </button>
                    <span className="text-xs text-slate-500">
                      Admission No: <strong className="text-slate-800 dark:text-slate-200">{selectedChildForFees.admissionNo}</strong>
                    </span>
                  </div>

                  {/* Header Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 text-white shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded">
                            {selectedChildForFees.className} - {selectedChildForFees.section}
                          </span>
                          <span className="text-xs text-blue-100">Roll: {selectedChildForFees.rollNo}</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold mt-1">
                          {selectedChildForFees.name}
                        </h2>
                        <p className="text-xs text-blue-100 mt-0.5">
                          Apex School System · Session 2026-2027
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-right self-start sm:self-auto">
                        <span className="text-[11px] text-blue-100 block">Pending Balance</span>
                        <span className="text-xl font-extrabold text-white">
                          PKR {selectedChildForFees.pendingFees.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sub-tabs: Pending Payments, Completed Payments, Waivers */}
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                    <button
                      type="button"
                      onClick={() => setFeeDetailTab('pending')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        feeDetailTab === 'pending'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Pending Payments ({selectedChildForFees.feeVouchers?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeeDetailTab('completed')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        feeDetailTab === 'completed'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Completed Payments ({selectedChildForFees.completedVouchers?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFeeDetailTab('waivers')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                        feeDetailTab === 'waivers'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Percent className="w-3.5 h-3.5" />
                      <span>Waivers & Concessions</span>
                    </button>
                  </div>

                  {/* Content for Pending Tab */}
                  {feeDetailTab === 'pending' && (
                    <div className="space-y-4">
                      {selectedChildForFees.feeVouchers && selectedChildForFees.feeVouchers.length > 0 ? (
                        selectedChildForFees.feeVouchers.map(voucher => (
                          <div
                            key={voucher.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                            } shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {voucher.title}
                                </h4>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-400">
                                  {voucher.type}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">
                                # Ref: {voucher.refNo} · Receipt: {voucher.receiptNo}
                              </p>
                              <div className="flex items-center gap-4 text-xs pt-1">
                                <span>Total: <strong>PKR {voucher.total.toLocaleString()}</strong></span>
                                <span className="text-rose-600 font-semibold">Remaining: PKR {voucher.total.toLocaleString()}</span>
                                <span className="text-slate-400">Due: {voucher.dueDate}</span>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 self-end md:self-auto">
                              <button
                                type="button"
                                onClick={() => {
                                  setPayingVoucher(voucher)
                                  setPayingChild(selectedChildForFees)
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Online</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setReceiptModalData({
                                    childName: selectedChildForFees.name,
                                    admissionNo: selectedChildForFees.admissionNo,
                                    className: selectedChildForFees.className,
                                    section: selectedChildForFees.section,
                                    voucherTitle: voucher.title,
                                    receiptNo: voucher.receiptNo,
                                    refNo: voucher.refNo,
                                    amount: voucher.total,
                                    dueDate: voucher.dueDate,
                                    isUnpaid: true
                                  })
                                }}
                                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                              >
                                <Receipt className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
                          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                          <h4 className="font-bold text-slate-700 dark:text-slate-300">All Fees Paid!</h4>
                          <p className="text-xs">There are no pending vouchers for this child.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content for Completed Tab */}
                  {feeDetailTab === 'completed' && (
                    <div className="space-y-4">
                      {selectedChildForFees.completedVouchers && selectedChildForFees.completedVouchers.length > 0 ? (
                        selectedChildForFees.completedVouchers.map(cv => (
                          <div
                            key={cv.id}
                            className={`p-5 rounded-2xl border transition-all ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                            } shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                  {cv.title}
                                </h4>
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  PAID
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 font-mono">
                                # Ref: {cv.refNo} · Receipt: {cv.receiptNo}
                              </p>
                              <div className="flex items-center gap-4 text-xs pt-1">
                                <span className="text-emerald-600 font-bold">Paid: PKR {cv.paid.toLocaleString()}</span>
                                <span className="text-slate-400">Date: {cv.paidDate}</span>
                                <span className="text-slate-400 font-medium">Via {cv.paymentMode}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setReceiptModalData({
                                  childName: selectedChildForFees.name,
                                  admissionNo: selectedChildForFees.admissionNo,
                                  className: selectedChildForFees.className,
                                  section: selectedChildForFees.section,
                                  voucherTitle: cv.title,
                                  receiptNo: cv.receiptNo,
                                  refNo: cv.refNo,
                                  amount: cv.paid,
                                  paymentDate: cv.paidDate,
                                  paymentMethod: cv.paymentMode
                                })
                              }}
                              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold text-xs flex items-center gap-1.5 transition-colors self-end md:self-auto cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print Receipt</span>
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-slate-400">
                          <p className="text-xs">No completed payments recorded yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Content for Waivers Tab */}
                  {feeDetailTab === 'waivers' && (
                    <div className={`p-6 rounded-2xl border ${
                      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    } space-y-4`}>
                      <h4 className="text-sm font-bold">Approved Institutional Waivers & Concessions</h4>
                      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-900 dark:text-purple-300 text-xs space-y-2">
                        <div className="flex items-center justify-between font-bold">
                          <span>Sibling Concession Program</span>
                          <span>PKR 2,350 / Term</span>
                        </div>
                        <p className="text-[11px] text-purple-700 dark:text-purple-400">
                          Granted under Apex School System Family Discount Policy for having multiple wards enrolled.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---------------- TAB 3: MY CHILDREN (PICK 5) ---------------- */}
          {activeTab === 'my-children' && (
            <div className="space-y-6">
              {/* Table Container (Pick 5) */}
              <div className={`rounded-2xl border overflow-hidden ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs`}>
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    My Children
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3 px-4">S/N</th>
                        <th className="py-3 px-4">Photo</th>
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Adm. No</th>
                        <th className="py-3 px-4">Section</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {childrenList.map((child, idx) => (
                        <tr
                          key={child.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3.5 px-4 text-slate-500">{idx + 1}</td>
                          <td className="py-3.5 px-4">
                            {child.photoType === 'avatar' && (
                              <div className={`w-9 h-9 rounded-full ${child.avatarBg || 'bg-blue-600'} flex items-center justify-center text-white`}>
                                <User className="w-4 h-4" />
                              </div>
                            )}
                            {child.photoType === 'badge' && (
                              <div className="w-9 h-9 rounded-full bg-slate-100 border border-blue-400 p-0.5 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                              </div>
                            )}
                            {child.photoType === 'emblem' && (
                              <div className="w-9 h-9 rounded-full bg-rose-50 border border-[#800000] p-0.5 flex items-center justify-center text-[#800000]">
                                <Award className="w-5 h-5" />
                              </div>
                            )}
                            {child.photoType === 'globe' && (
                              <div className="w-9 h-9 rounded-full bg-blue-50 border border-indigo-400 p-0.5 flex items-center justify-center text-indigo-600">
                                <Layers className="w-5 h-5" />
                              </div>
                            )}
                            {child.photoType === 'portrait' && (
                              <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-500 flex items-center justify-center text-amber-800 font-bold text-xs">
                                FA
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {child.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">
                            {child.admissionNo}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            {child.sectionFull}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                            {child.email}
                          </td>
                          <td className="py-3.5 px-4 text-center relative">
                            {/* Action Menu Button (≡-) matching Pick 5 */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionChildId(openActionChildId === child.id ? null : child.id)
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                              title="Actions"
                            >
                              ≡ -
                            </button>

                            {/* DROPDOWN MENU WITH EXACT 2 OPTIONS (HIGHLIGHTED IN RED BOX IN PICK 5):
                                1. View Profile
                                2. Report Card
                            */}
                            {openActionChildId === child.id && (
                              <div className={`absolute right-4 mt-1 w-44 rounded-xl shadow-xl border p-1 z-50 text-left transition-all ${
                                isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                              }`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionChildId(null)
                                    setSelectedChildForProfile(child)
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenActionChildId(null)
                                    setSelectedChildForReportCard(child)
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors cursor-pointer"
                                >
                                  <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Report Card</span>
                                </button>
                              </div>
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

          {/* ---------------- TAB 4: ATTENDANCE (PICK 6) ---------------- */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Form Filter Card (Pick 6) */}
              <div className={`p-5 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } shadow-xs space-y-4`}>
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-bold">Attendance Report</h3>
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  {/* Child Select */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-blue-500" />
                      <span>Child</span>
                    </label>
                    <select
                      value={attendanceSelectedChildId}
                      onChange={(e) => setAttendanceSelectedChildId(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="">Choose a child...</option>
                      {childrenList.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.className} - {c.section})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* View Mode */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                      <Eye className="w-3 h-3 text-emerald-500" />
                      <span>View</span>
                    </label>
                    <select
                      value={attendanceViewMode}
                      onChange={(e) => setAttendanceViewMode(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="Month calendar">Month calendar</option>
                      <option value="Summary list">Summary list</option>
                    </select>
                  </div>

                  {/* Attendance Type */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1.5">
                      <List className="w-3 h-3 text-purple-500" />
                      <span>Attendance type</span>
                    </label>
                    <select
                      value={attendanceType}
                      onChange={(e) => setAttendanceType(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      <option value="General (daily)">General (daily)</option>
                      <option value="Subject wise">Subject wise</option>
                    </select>
                  </div>

                  {/* Month */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Month</label>
                    <select
                      value={attendanceMonth}
                      onChange={(e) => setAttendanceMonth(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  {/* Year */}
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Year</label>
                    <select
                      value={attendanceYear}
                      onChange={(e) => setAttendanceYear(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                    >
                      {['2027', '2026', '2025'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Initial Alert State: If NO child is chosen (Matches Pick 6 Exactly) */}
                {!attendanceSelectedChildId && (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 text-cyan-900 dark:text-cyan-200 text-xs flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-cyan-600 shrink-0" />
                    <span className="font-medium">Please select a child to view attendance.</span>
                  </div>
                )}
              </div>

              {/* Attendance Details: Displayed when a child IS selected */}
              {currentAttendanceChild && (
                <div className="space-y-6">
                  {/* Child Banner */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {currentAttendanceChild.name}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Roll: {currentAttendanceChild.rollNo} · {currentAttendanceChild.className} - {currentAttendanceChild.section}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLeaveModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Apply for Child Leave</span>
                    </button>
                  </div>

                  {/* 4 Summary Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Present</span>
                      <span className="text-xl font-bold text-emerald-600">
                        {currentAttendanceChild.attendanceStats.present}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Absent</span>
                      <span className="text-xl font-bold text-rose-600">
                        {currentAttendanceChild.attendanceStats.absent}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Attendance %</span>
                      <span className="text-xl font-bold text-blue-600">
                        {currentAttendanceChild.attendancePercent}%
                      </span>
                      <span className="text-[9px] text-slate-400 block">(Marked days)</span>
                    </div>

                    <div className="p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <span className="text-[11px] text-slate-400 font-semibold block">Working Days</span>
                      <span className="text-xl font-bold text-amber-600">
                        {currentAttendanceChild.attendanceStats.workingDays}
                      </span>
                    </div>
                  </div>

                  {/* Calendar Grid (November 2026) */}
                  <div className={`p-5 rounded-2xl border ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  } shadow-xs space-y-4`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {attendanceMonth} {attendanceYear} Calendar
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Present
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Absent
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Weekend Off
                        </span>
                      </div>
                    </div>

                    {/* 7 Days Grid */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="font-bold py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500">
                          {d}
                        </div>
                      ))}

                      {/* Day Cells 1 through 30 */}
                      {Array.from({ length: 30 }, (_, i) => {
                        const dayNum = i + 1
                        const isWeekend = (dayNum % 7 === 1) || (dayNum % 7 === 0)
                        const isPresentDay = !isWeekend && dayNum <= 14 && currentAttendanceChild.attendanceStats.present > 0

                        return (
                          <div
                            key={dayNum}
                            className={`p-2 rounded-xl border min-h-[64px] flex flex-col items-center justify-between transition-colors ${
                              isWeekend
                                ? 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400'
                                : isPresentDay
                                ? 'bg-emerald-50/40 border-emerald-200 dark:border-emerald-950/60 dark:bg-emerald-950/20'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span className="text-xs font-semibold">{dayNum}</span>
                            {isWeekend ? (
                              <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-500">
                                OFF
                              </span>
                            ) : isPresentDay ? (
                              <span className="text-[9px] font-bold uppercase px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                                P
                              </span>
                            ) : (
                              <span className="text-[9px] text-slate-300">-</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---------------- TAB 5: TIMETABLE ---------------- */}
          {activeTab === 'timetable' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } space-y-4`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <h3 className="text-base font-bold">Class Timetables & Routine</h3>
                    <p className="text-xs text-slate-500">Daily period schedule and upcoming exam datesheets.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {childrenList.map(c => (
                    <div
                      key={c.id}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="text-xs font-bold">{c.name}</h4>
                        <span className="text-[11px] text-slate-400">{c.className} - {c.section}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setTimetableModalChild(c)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>View Schedule</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 6: ASSIGNMENTS ---------------- */}
          {activeTab === 'assignments' && (
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-6`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold">Assignments & Study Coursework</h3>
                  <p className="text-xs text-slate-500">Review homework posted by faculty teachers.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                      English
                    </span>
                    <h4 className="text-xs font-bold mt-1">First Assignment & Handwriting Practice</h4>
                    <p className="text-[11px] text-slate-400">Instructor: Sana Kosar · Due: 20 Nov 2026</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                    Completed
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      Mathematics
                    </span>
                    <h4 className="text-xs font-bold mt-1">Number Counting & Shapes Worksheet</h4>
                    <p className="text-[11px] text-slate-400">Instructor: Tariq Mehmood · Due: 22 Nov 2026</p>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg">
                    Pending
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 7: ANNOUNCEMENTS ---------------- */}
          {activeTab === 'announcements' && (
            <div className={`p-6 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-6`}>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <Megaphone className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold">School Circulars & Official Notices</h3>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Summer Holidays</h4>
                    <span className="text-xs text-slate-400">13 Jun 2026</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Summer vacation for all pre-primary, primary, and secondary grades will commence from 15th June to 15th August 2026. Detailed holiday homework packs have been shared with all students.
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">25 December Holiday!</h4>
                    <span className="text-xs text-slate-400">16 Dec 2025</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Apex School System will remain closed on 25th December on account of Quaid-e-Azam Day & Christmas celebrations. Normal classes resume on the next working day.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 8: COMMUNICATION ---------------- */}
          {activeTab === 'communication' && (
            <div className={`rounded-2xl border overflow-hidden flex flex-col h-[600px] ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } shadow-xs`}>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold">Apex School Administration & Teachers</h3>
                    <span className="text-[10px] text-emerald-600 font-medium">● Verified Helpdesk</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">Direct In-App Messenger</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatMessages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[80%] ${msg.isIncoming ? 'self-start' : 'self-end items-end ml-auto'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5">{msg.sender} · {msg.timestamp}</span>
                    <div className={`p-3 rounded-2xl text-xs ${
                      msg.isIncoming
                        ? isDark ? 'bg-slate-800 text-slate-100' : 'bg-slate-100 text-slate-800'
                        : 'bg-blue-600 text-white'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInputText}
                  onChange={(e) => setChatInputText(e.target.value)}
                  placeholder="Type your message to school administration..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* ---------------- TAB 9: DOWNLOAD APP ---------------- */}
          {activeTab === 'download-app' && (
            <div className={`p-8 rounded-2xl border text-center ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4 max-w-xl mx-auto`}>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Apex Parent Mobile App</h3>
              <p className="text-xs text-slate-500">
                Receive instant push notifications for attendance, fee vouchers, and exam results directly on your smartphone.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <div className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-800">
                  <span>Google Play</span>
                </div>
                <div className="px-4 py-2.5 rounded-xl bg-black text-white text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-slate-800">
                  <span>App Store</span>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- TAB 10: MY ACCOUNT ---------------- */}
          {activeTab === 'account' && (
            <div className={`p-6 sm:p-8 rounded-2xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } space-y-6 max-w-2xl`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold">Parent Account & Particulars</h3>
                  <p className="text-xs text-slate-500">Manage guardian contact information and alert preferences.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditNameInput(parentName === 'Unknown' ? '' : parentName)
                    setIsEditNameModalOpen(true)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Pencil className="w-3 h-3" />
                  <span>Edit Name</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block">Full Name</span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{parentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Account Role</span>
                  <span className="font-bold text-sm text-emerald-600">Registered Parent / Guardian</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Email Address</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">parent@schoolms.com</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Primary Mobile</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">+92-300-1234567</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Linked Children</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">7 Wards Active</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">School Campus</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">Apex School System</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ---------------- MODAL 1: EDIT PARENT NAME (NAME UNKNOWN BY DEFAULT) ---------------- */}
      {isEditNameModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold">Edit Parent Display Name</h3>
              <button
                type="button"
                onClick={() => setIsEditNameModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Default is set to <strong>Unknown</strong> as requested. You can enter your personalized guardian name below.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Parent Name
              </label>
              <input
                type="text"
                value={editNameInput}
                onChange={(e) => setEditNameInput(e.target.value)}
                placeholder="e.g. Younas Baig, Tariq Ali..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setParentName('Unknown')
                  try {
                    localStorage.setItem('sms_parent_custom_name', 'Unknown')
                  } catch {}
                  setIsEditNameModalOpen(false)
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Reset to Unknown
              </button>

              <button
                type="button"
                onClick={handleSaveParentName}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 2: VIEW PROFILE (PICK 5 DROPDOWN OPTION 1) ---------------- */}
      {selectedChildForProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Child Profile Particulars</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChildForProfile(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {selectedChildForProfile.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedChildForProfile.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  Adm: {selectedChildForProfile.admissionNo} · Roll: {selectedChildForProfile.rollNo}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  {selectedChildForProfile.className} ({selectedChildForProfile.section})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                <span className="font-semibold">{selectedChildForProfile.gender}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                <span className="font-semibold">{selectedChildForProfile.bloodGroup}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                <span className="font-semibold">{selectedChildForProfile.dob}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Email</span>
                <span className="font-semibold font-mono text-[11px]">{selectedChildForProfile.email}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Registered Guardian</span>
                <span className="font-semibold">{parentName}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Institute</span>
                <span className="font-semibold">Apex School System</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedChildForProfile(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 3: REPORT CARD (PICK 5 DROPDOWN OPTION 2) ---------------- */}
      {selectedChildForReportCard && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl rounded-2xl border p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold">Official Terminal Progress Report</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChildForReportCard(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* School Header */}
            <div className="text-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold text-blue-700 dark:text-blue-400">Apex School System</h2>
              <p className="text-xs text-slate-500">Academic Progress & Marksheet · Session 2026</p>
              <div className="mt-2 text-xs font-semibold">
                Student: <span className="text-slate-900 dark:text-white font-bold">{selectedChildForReportCard.name}</span> | Adm: {selectedChildForReportCard.admissionNo} | Class: {selectedChildForReportCard.className} - {selectedChildForReportCard.section}
              </div>
            </div>

            {/* Marks Table */}
            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/60 font-semibold text-slate-500">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Total Marks</th>
                    <th className="py-2.5 px-3">Obtained Marks</th>
                    <th className="py-2.5 px-3">Percentage</th>
                    <th className="py-2.5 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-2 px-3 font-semibold">English Language</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 font-bold text-blue-600">94</td>
                    <td className="py-2 px-3">94%</td>
                    <td className="py-2 px-3 font-bold text-emerald-600">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Mathematics</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 font-bold text-blue-600">92</td>
                    <td className="py-2 px-3">92%</td>
                    <td className="py-2 px-3 font-bold text-emerald-600">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Urdu Literature</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 font-bold text-blue-600">89</td>
                    <td className="py-2 px-3">89%</td>
                    <td className="py-2 px-3 font-bold text-blue-600">A</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">General Knowledge / Science</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 font-bold text-blue-600">95</td>
                    <td className="py-2 px-3">95%</td>
                    <td className="py-2 px-3 font-bold text-emerald-600">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Arts & Physical Activity</td>
                    <td className="py-2 px-3">100</td>
                    <td className="py-2 px-3 font-bold text-blue-600">91</td>
                    <td className="py-2 px-3">91%</td>
                    <td className="py-2 px-3 font-bold text-emerald-600">A+</td>
                  </tr>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 font-bold">
                    <td className="py-2.5 px-3">Grand Total</td>
                    <td className="py-2.5 px-3">500</td>
                    <td className="py-2.5 px-3 text-emerald-600">461</td>
                    <td className="py-2.5 px-3 text-emerald-600">92.2%</td>
                    <td className="py-2.5 px-3 text-emerald-600">A+ (Distinction)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300">Teacher Remarks:</span>
              <p className="text-slate-500 italic">
                "Outstanding academic performance and exemplary conduct in classroom activities. Keep up the brilliant efforts!"
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Report Card</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedChildForReportCard(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 4: PAY ONLINE CHECKOUT ---------------- */}
      {payingVoucher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold">Online Fee Payment</h3>
              </div>
              <button
                type="button"
                onClick={() => setPayingVoucher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Student:</span>
                <strong className="text-slate-800 dark:text-slate-200">{payingChild?.name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Voucher:</span>
                <span className="font-semibold">{payingVoucher.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Voucher Ref:</span>
                <span className="font-mono">{payingVoucher.refNo}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-bold">Payable Amount:</span>
                <span className="font-extrabold text-emerald-600 text-base">
                  PKR {payingVoucher.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-500">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['JazzCash', 'EasyPaisa', 'Debit/Card'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      paymentMethod === m
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Account / Mobile Number
              </label>
              <input
                type="text"
                value={paymentPhone}
                onChange={(e) => setPaymentPhone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPayingVoucher(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleConfirmPayment}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Confirm PKR {payingVoucher.total.toLocaleString()}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 5: OFFICIAL RECEIPT PRINT SLIP ---------------- */}
      {receiptModalData && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold">Official Payment Receipt</h3>
              <button
                type="button"
                onClick={() => setReceiptModalData(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-blue-700 dark:text-blue-400">Apex School System</h2>
              <p className="text-[11px] text-slate-400">Student Fee Voucher & Payment Slip</p>
              <span className="text-[10px] text-slate-400 font-mono">
                Receipt #: {receiptModalData.receiptNo} · Ref: {receiptModalData.refNo}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="font-bold">{receiptModalData.childName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Admission No:</span>
                <span className="font-mono">{receiptModalData.admissionNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class & Section:</span>
                <span>{receiptModalData.className} - {receiptModalData.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Voucher Description:</span>
                <span className="font-semibold">{receiptModalData.voucherTitle}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-sm">
                <span className="font-bold">Total Amount:</span>
                <span className="font-extrabold text-blue-600">PKR {receiptModalData.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-400">Payment Status:</span>
                <span className="font-bold text-emerald-600">{receiptModalData.isUnpaid ? 'PENDING' : 'PAID & VERIFIED'}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 text-center">
              Computer-generated official receipt verified by Apex Finance Desk.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                type="button"
                onClick={() => setReceiptModalData(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 6: APPLY FOR CHILD LEAVE ---------------- */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold">Apply for Child Leave</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsLeaveModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Leave Reason</label>
                <select
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                >
                  <option value="Medical">Medical / Sickness</option>
                  <option value="Family Function">Family Event / Function</option>
                  <option value="Urgent Personal Work">Urgent Personal Work</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    value={leaveStartDate}
                    onChange={(e) => setLeaveStartDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    value={leaveEndDate}
                    onChange={(e) => setLeaveEndDate(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Explanation Notes</label>
                <textarea
                  rows="3"
                  value={leaveNotes}
                  onChange={(e) => setLeaveNotes(e.target.value)}
                  placeholder="Kindly excuse my ward's absence due to medical recovery..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL 7: FULL TIMETABLE MODAL ---------------- */}
      {timetableModalChild && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-xl rounded-2xl border p-6 space-y-4 shadow-2xl ${
            isDark ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold">{timetableModalChild.name}'s Weekly Timetable</h3>
                <span className="text-xs text-slate-400">{timetableModalChild.className} - {timetableModalChild.section}</span>
              </div>
              <button
                type="button"
                onClick={() => setTimetableModalChild(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Monday to Thursday</span>
                  <p className="text-[11px] text-slate-400">08:00 AM - 01:30 PM</p>
                </div>
                <span className="text-[11px] font-semibold text-blue-600">6 Periods Scheduled</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Friday</span>
                  <p className="text-[11px] text-slate-400">08:00 AM - 12:30 PM (Half Day)</p>
                </div>
                <span className="text-[11px] font-semibold text-emerald-600">4 Periods Scheduled</span>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <span className="font-bold text-slate-500">Saturday & Sunday</span>
                  <p className="text-[11px] text-slate-400">No classes scheduled</p>
                </div>
                <span className="text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  WEEKEND OFF
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setTimetableModalChild(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold"
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
