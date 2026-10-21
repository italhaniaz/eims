import React, { useState } from 'react'
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Edit2, 
  Printer, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Award, 
  Receipt, 
  UserCheck, 
  ExternalLink,
  Building2,
  FileCheck,
  AlertCircle
} from 'lucide-react'

export const StaffProfileDrawer = ({
  isOpen,
  onClose,
  staffMember,
  onEdit,
  onPrintIdCard,
  onPrintPaySlip,
  onPrintAppointmentLetter,
  onOpenLeaveModal,
  onResumeDuty
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!isOpen || !staffMember) return null

  const isTeaching = staffMember.category !== 'Non-Teaching'
  const isVisiting = staffMember.employmentType === 'Visiting / Adjunct'

  // Calculations for Salary
  const basicSalary = Number(staffMember.basicSalary || 0)
  const allowance = Number(staffMember.allowance || 0)
  const deductions = Number(staffMember.deductions || 0)
  const netSalary = staffMember.netSalary || (basicSalary + allowance - deductions)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Active Duty</span>
      case 'On Leave':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>On Leave</span>
      case 'Suspended':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>Suspended</span>
      case 'Resigned / Left':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Resigned</span>
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status || 'Active'}</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Drawer Header */}
          <div className="p-6 bg-slate-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4 pr-12">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border-2 border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-inner">
                {staffMember.photoUrl ? (
                  <img src={staffMember.photoUrl} alt={staffMember.name} className="w-full h-full object-cover" />
                ) : (
                  staffMember.name?.charAt(0) || 'E'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-400/10 border border-emerald-400/30 text-emerald-300 font-bold">
                    {staffMember.empId}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                    {staffMember.category || 'Teaching'}
                  </span>
                  {staffMember.level && (
                    <span className="text-xs px-2 py-0.5 rounded bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 capitalize font-medium">
                      {staffMember.level}
                    </span>
                  )}
                  {getStatusBadge(staffMember.status)}
                </div>

                <h2 className="text-xl font-bold tracking-tight text-white truncate">
                  {staffMember.name}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
                  <span className="font-semibold text-emerald-400">{staffMember.designation || 'Faculty Member'}</span>
                  <span>•</span>
                  <span>{staffMember.department || 'General'} Department</span>
                </p>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onEdit(staffMember)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => onPrintIdCard(staffMember)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <span>Print ID Card</span>
              </button>
              <button
                onClick={() => onPrintPaySlip(staffMember)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                <Receipt className="w-3.5 h-3.5 text-amber-400" />
                <span>Pay Slip</span>
              </button>
              <button
                onClick={() => onPrintAppointmentLetter(staffMember)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Appointment Letter</span>
              </button>
              {staffMember.status === 'On Leave' ? (
                <button
                  onClick={() => onResumeDuty(staffMember)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors ml-auto shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resume Duty</span>
                </button>
              ) : (
                <button
                  onClick={() => onOpenLeaveModal(staffMember)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-colors ml-auto"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Assign Leave</span>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-1 overflow-x-auto text-xs font-semibold text-slate-600 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Overview & Bio
            </button>
            <button
              onClick={() => setActiveTab('workload')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'workload'
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Workload & Duties
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'leaves'
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Attendance & Leaves
            </button>
            <button
              onClick={() => setActiveTab('payroll')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'payroll'
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Compensation
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'documents'
                  ? 'border-emerald-600 text-emerald-700 font-bold bg-white'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              Documents & HR
            </button>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* TAB 1: OVERVIEW & BIO */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Personal Information */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Personal Dossier</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Father / Husband Name</span>
                      <strong className="text-slate-800 font-medium">{staffMember.fatherHusbandName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">National CNIC</span>
                      <strong className="text-slate-800 font-mono font-medium">{staffMember.cnic || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Date of Birth & Age</span>
                      <strong className="text-slate-800 font-medium">
                        {staffMember.dob || '—'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Gender</span>
                      <strong className="text-slate-800 font-medium capitalize">{staffMember.gender || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Blood Group</span>
                      <span className="inline-block px-2 py-0.5 rounded font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        {staffMember.bloodGroup || '—'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Marital Status</span>
                      <strong className="text-slate-800 font-medium">{staffMember.maritalStatus || 'Single'}</strong>
                    </div>
                  </div>
                </div>

                {/* Contact & Address */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Contact Information</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Official Mobile / Call</span>
                      <strong className="text-slate-800 font-mono">{staffMember.phone || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">WhatsApp Number</span>
                      <strong className="text-slate-800 font-mono">{staffMember.whatsapp || staffMember.phone || '—'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Email Address</span>
                      <strong className="text-slate-800">{staffMember.email || '—'}</strong>
                    </div>
                    <div className="pt-2 border-t border-slate-200/80">
                      <span className="text-slate-500 block mb-1">Residential Address</span>
                      <strong className="text-slate-800 font-medium block">
                        {staffMember.address ? `${staffMember.address}, ${staffMember.city || 'Lahore'}` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Emergency Contact</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Contact Person</span>
                      <strong className="text-slate-800 font-medium">{staffMember.emergencyName || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Relationship</span>
                      <strong className="text-slate-800 font-medium">{staffMember.emergencyRelation || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Emergency Phone</span>
                      <strong className="text-slate-800 font-mono font-medium">{staffMember.emergencyPhone || '—'}</strong>
                    </div>
                  </div>
                </div>

                {/* Qualifications & Career */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Academic Qualifications & Experience</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Highest Degree</span>
                      <strong className="text-slate-800 font-medium">{staffMember.highestDegree || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Major / Specialization</span>
                      <strong className="text-slate-800 font-medium">{staffMember.majorSubject || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Graduating University</span>
                      <strong className="text-slate-800 font-medium">{staffMember.university || '—'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Prior Experience</span>
                      <strong className="text-slate-800 font-medium">
                        {staffMember.experienceYears ? `${staffMember.experienceYears} Years` : '—'}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: WORKLOAD & DUTIES */}
            {activeTab === 'workload' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {isTeaching ? (
                  <>
                    {/* Class Teacher Allocation */}
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                            Primary Class Teacher Assignment
                          </span>
                          <p className="text-xs text-slate-600 mt-0.5">
                            In-charge of daily attendance, parent meetings, and gradebook
                          </p>
                        </div>
                        {staffMember.isClassTeacher ? (
                          <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-sm">
                            ★ Class {staffMember.classTeacherClass} - {staffMember.classTeacherSection || 'A'}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-lg bg-slate-200 text-slate-600 font-semibold text-xs">
                            Not a Class Teacher
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Assigned Courses & Subjects */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>Assigned Subjects & Timetable Classes</span>
                      </h3>

                      {staffMember.subjects && staffMember.subjects.length > 0 ? (
                        <div className="space-y-2">
                          {staffMember.subjects.map((sub, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white">
                              <div className="flex items-center gap-3">
                                <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                  {idx + 1}
                                </span>
                                <div>
                                  <strong className="text-slate-900 text-xs block">{sub.name || sub}</strong>
                                  <span className="text-[11px] text-slate-500">
                                    {sub.classes ? `Classes: ${sub.classes}` : (sub.targetClass || 'All Sections')}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-100 text-slate-700">
                                {sub.periods ? `${sub.periods} Periods/Wk` : `${sub.creditHours || 3} Credit Hrs`}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
                          <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <p className="text-xs font-medium text-slate-600">No specific subjects assigned yet.</p>
                          <p className="text-[11px] text-slate-400">Click "Edit Profile" to allocate courses and periods.</p>
                        </div>
                      )}
                    </div>

                    {/* Weekly Workload Stats */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[11px] text-slate-500 block">Weekly Workload</span>
                        <strong className="text-base font-bold text-slate-800">
                          {staffMember.weeklyPeriods || staffMember.weeklyCreditHours || 18} {staffMember.level === 'university' ? 'Cr. Hrs' : 'Periods'}
                        </strong>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[11px] text-slate-500 block">Max Permitted</span>
                        <strong className="text-base font-bold text-slate-800">
                          {staffMember.level === 'university' ? '12 Cr. Hrs' : '26 Periods'}
                        </strong>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                        <span className="text-[11px] text-slate-500 block">Status</span>
                        <span className="inline-block mt-0.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Optimal Load
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Non-Teaching Duty Roster */
                  <div className="space-y-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Assigned Branch / Unit</span>
                        <strong className="text-slate-800">{staffMember.department || 'Administration'}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Daily Work Shift</span>
                        <strong className="text-slate-800">07:30 AM – 03:00 PM (Regular Day)</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Reporting Supervisor</span>
                        <strong className="text-slate-800">{staffMember.reportingSupervisor || 'Chief Administrative Officer'}</strong>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block mb-2">Primary Duties & Responsibilities</span>
                      <p className="text-xs text-slate-600 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                        {staffMember.duties || 'Maintain departmental operational standards, coordinate inventory/logistics, support daily administrative tasks and resolve faculty queries.'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ATTENDANCE & LEAVES */}
            {activeTab === 'leaves' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Active Leave Notification if On Leave */}
                {staffMember.status === 'On Leave' && (
                  <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                        <div>
                          <strong className="text-xs font-bold text-amber-900 block">Currently On Official Leave</strong>
                          <span className="text-[11px] text-amber-700">
                            {staffMember.leaveInfo?.startDate} to {staffMember.leaveInfo?.endDate} ({staffMember.leaveInfo?.leaveType || 'Casual Leave'})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onResumeDuty(staffMember)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-colors"
                      >
                        Resume Duty
                      </button>
                    </div>

                    <div className="pt-2 border-t border-amber-200/80 text-xs text-amber-900 grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-amber-700 block text-[11px]">Proxy Substitute:</span>
                        <strong>{staffMember.leaveInfo?.substituteTeacherName || 'Assigned Faculty Member'}</strong>
                      </div>
                      <div>
                        <span className="text-amber-700 block text-[11px]">Reason:</span>
                        <strong>{staffMember.leaveInfo?.reason || 'Urgent Domestic Affairs'}</strong>
                      </div>
                      <div className="col-span-2">
                        <span className="text-amber-700 block text-[11px]">Handover Directives:</span>
                        <p className="italic text-amber-800">{staffMember.leaveInfo?.handoverNotes || 'Supervise daily class lectures and course curriculum.'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Leave Balances Cards */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Annual Leave Balances</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 block">Casual Leaves</span>
                      <strong className="text-base font-bold text-slate-800">10 / 12</strong>
                      <span className="text-[10px] text-emerald-600 block">2 Taken</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 block">Medical / Sick</span>
                      <strong className="text-base font-bold text-slate-800">8 / 8</strong>
                      <span className="text-[10px] text-slate-400 block">0 Taken</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                      <span className="text-[11px] text-slate-500 block">Earned / Annual</span>
                      <strong className="text-base font-bold text-slate-800">15 / 15</strong>
                      <span className="text-[10px] text-slate-400 block">0 Taken</span>
                    </div>
                  </div>
                </div>

                {/* Quick Leave Action Button */}
                {staffMember.status !== 'On Leave' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div>
                      <strong className="text-xs font-bold text-emerald-900 block">Need to record approved leave?</strong>
                      <p className="text-[11px] text-emerald-700">Assign proxy substitution to ensure uninterrupted class schedule.</p>
                    </div>
                    <button
                      onClick={() => onOpenLeaveModal(staffMember)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      Assign Leave & Proxy
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: COMPENSATION */}
            {activeTab === 'payroll' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Package Card */}
                <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-sm">
                  <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                        Monthly Salary Structure
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Currency: PKR (Pakistani Rupee)</span>
                    </div>
                    <button
                      onClick={() => onPrintPaySlip(staffMember)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Pay Slip</span>
                    </button>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Items */}
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Basic Pay:</span>
                        <strong className="font-mono text-slate-800">Rs. {basicSalary.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Allowances (Conveyance & Medical):</span>
                        <strong className="font-mono text-slate-800">Rs. {allowance.toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100 text-rose-600">
                        <span>Statutory Deductions (Tax & PF):</span>
                        <strong className="font-mono">- Rs. {deductions.toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Net highlight */}
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Net Take-Home Pay</span>
                        <span className="text-[10px] text-emerald-600">Direct electronic transfer</span>
                      </div>
                      <div className="text-right">
                        <strong className="font-mono text-2xl font-black text-emerald-800">
                          Rs. {netSalary.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    {/* Bank Account */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Disbursement IBAN</span>
                        <strong className="font-mono text-slate-800">{staffMember.bankAccount || 'PK72HABB000192837465'}</strong>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800">
                        Verified Bank Transfer
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: DOCUMENTS & HR */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Checklist */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>Compliance & Document Verification Checklist</span>
                  </h3>
                  <div className="space-y-2">
                    {[
                      { label: 'CNIC Photocopy / Smart Card', verified: staffMember.docCnic ?? true },
                      { label: 'Degree Certificates & Transcripts', verified: staffMember.docDegrees ?? true },
                      { label: 'Previous Experience & Relieving Letters', verified: staffMember.docExperience ?? true },
                      { label: 'Signed Employment Contract / Agreement', verified: staffMember.docContract ?? true },
                      { label: 'Police Verification / Background Clearance', verified: staffMember.docPolice ?? false },
                      { label: 'Passport Size Photographs (2 Nos.)', verified: staffMember.docPhotos ?? true }
                    ].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white text-xs">
                        <div className="flex items-center gap-2.5">
                          {doc.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                          )}
                          <span className={doc.verified ? 'font-medium text-slate-800' : 'text-slate-500'}>
                            {doc.label}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          doc.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {doc.verified ? 'Verified & On File' : 'Pending Submission'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HR Dates */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Tenure & Contract Timeline</span>
                  </h3>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block mb-0.5">Date of Joining</span>
                      <strong className="text-slate-800 font-medium">{staffMember.joiningDate || '2026-08-15'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Employment Type</span>
                      <strong className="text-slate-800 font-medium">{staffMember.employmentType || 'Permanent / Regular'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Contract Renewal Date</span>
                      <strong className="text-slate-800 font-medium">2027-08-14 (Annual Review)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Probation Status</span>
                      <strong className="text-emerald-700 font-medium">Completed / Confirmed</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">
              Staff Dossier • {staffMember.empId}
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded-lg transition-colors"
            >
              Close Dossier
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default StaffProfileDrawer
