import React, { useState, useMemo } from 'react'
import { 
  GraduationCap, 
  Users, 
  Receipt, 
  CalendarCheck, 
  UserPlus, 
  CreditCard, 
  Clock, 
  ArrowUpRight, 
  School, 
  BookOpen,
  Award, 
  Sparkles, 
  Star, 
  Plus, 
  AlertTriangle,
  PhoneCall,
  MessageSquare,
  Calendar,
  X
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import { CampusSetupWizard } from '../../components/common/CampusSetupWizard'
import { useAppData } from '../../context/AppDataContext'
import { useToast } from '../../context/ToastContext'
import { normalizeClassSections, detectProgramLevel } from '../../constants/academicLevels'
import { getInstituteTierConfig, filterClassesByInstituteTier, isClassAllowedForTier } from '../../utils/tierGating'

export const InstituteDashboard = ({ currentInstitute, onRouteChange }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { 
    students = [], 
    teachers = [], 
    fees = [], 
    notices = [],
    classes = [], 
    activeProgramLevel, 
    programLevels = [],
    sendCommunicationBlast,
    logAuditEvent
  } = useAppData()

  const { toast } = useToast()

  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false)
  const urgentNotice = notices.find(n => 
    (n.category === 'Urgent' || n.priority === 'Urgent' || n.pinned) &&
    (!n.instituteId || n.instituteId === currentInstitute?.id)
  )

  const activeLevelObj = programLevels.find(l => l.id === activeProgramLevel)

  const instClasses = useMemo(() => {
    return filterClassesByInstituteTier(classes, currentInstitute)
  }, [classes, currentInstitute])

  const instStudents = useMemo(() => {
    return students.filter(s => {
      if (currentInstitute?.id && s.instituteId !== currentInstitute.id) return false
      return isClassAllowedForTier(s.className, currentInstitute)
    })
  }, [students, currentInstitute])

  const instTeachers = teachers.filter(t => !currentInstitute?.id || t.instituteId === currentInstitute.id)
  const instFees = fees.filter(f => !currentInstitute?.id || f.instituteId === currentInstitute.id)

  const displayedClasses = useMemo(() => {
    if (!activeProgramLevel || activeProgramLevel === 'all') return instClasses
    return instClasses.filter(c => {
      const cLevel = c.programLevel || detectProgramLevel(c.name)
      return cLevel === activeProgramLevel
    })
  }, [instClasses, activeProgramLevel])

  const paidFeesCount = instFees.filter(f => f.status === 'Paid').length
  const feeRate = instFees.length > 0 ? Math.round((paidFeesCount / instFees.length) * 100) : 0

  // Interactive Live Action Handlers
  const handleTriggerAbsentSms = () => {
    const count = instStudents.length > 0 ? Math.min(instStudents.length, 6) : 6
    if (sendCommunicationBlast) {
      sendCommunicationBlast({
        title: 'Daily Unexcused Absence SMS Alert',
        channel: 'SMS Gateway',
        audience: 'Parents of Absent Students',
        recipientsCount: count,
        message: `Alert from ${currentInstitute?.name || 'School Campus'}: Your ward was marked absent today without prior approved leave. Please contact the school office.`
      })
    }
    if (logAuditEvent) {
      logAuditEvent(`Broadcasted Absentee SMS blast to ${count} parent phone numbers`, 'Attendance Supervisor', 'Success')
    }
    toast?.success?.(`Absentee SMS alert broadcasted to ${count} parent phone numbers via SMS Gateway!`)
  }

  // Dynamically adapt header title and section tag to the selected school wing
  const getBannerDetails = () => {
    const campusName = currentInstitute?.name || 'Main School Campus'
    const campusCode = currentInstitute?.code || 'SCH-001'
    const campusAddress = currentInstitute?.address || 'Central District'

    switch (activeProgramLevel) {
      case 'preschool':
        return {
          icon: Sparkles,
          iconColor: 'text-pink-300',
          sectionTag: 'Pre-School / Early Years (Playgroup - KG)',
          mainTitle: `${campusName} • Early Years Wing`,
          description: `Tier: Playgroup, Nursery, Prep & KG • Foundation Learning • ${campusCode}-PRE`,
          badgeText: 'Pre-School',
          badgeColor: 'bg-pink-500/20 text-pink-200 border-pink-400/30'
        }
      case 'elementary':
        return {
          icon: BookOpen,
          iconColor: 'text-purple-300',
          sectionTag: 'Elementary School Section (Grade 1 - 8)',
          mainTitle: `${campusName} • Elementary School Wing`,
          description: `Tier: Grades 1 to 8 • Primary (1-5) & Middle (6-8) Foundation • ${campusCode}-ELEM`,
          badgeText: 'Elementary Level',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        }
      case 'secondary':
        return {
          icon: Award,
          iconColor: 'text-blue-400',
          sectionTag: 'Secondary School Section (Grade 9 - 10)',
          mainTitle: `${campusName} • Secondary High School`,
          description: `Tier: Grades 9 & 10 • Matriculation (SSC) & Cambridge O-Levels • ${campusCode}-SEC`,
          badgeText: 'Secondary Level',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        }
      default:
        return {
          icon: School,
          iconColor: 'text-emerald-400',
          sectionTag: 'School Administrative Center',
          mainTitle: campusName,
          description: `Registration Code: ${campusCode} • ${campusAddress} • School Portal (K-10)`,
          badgeText: tierConfig.portalTypeLabel || 'School Portal (K-10)',
          badgeColor: 'bg-white/10 text-slate-300 border-white/20'
        }
    }
  }

  const banner = getBannerDetails()
  const BannerIcon = banner.icon

  return (
    <div className="p-3.5 sm:p-5 md:p-6 space-y-4 sm:space-y-5 max-w-7xl mx-auto">
      {/* Critical Emergency Broadcast Banner */}
      {urgentNotice && !isNoticeDismissed && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in border border-rose-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-black/30 text-amber-200">
                  SCHOOL DIRECTIVE • URGENT BROADCAST
                </span>
                <span className="text-xs text-white/80">{urgentNotice.date}</span>
              </div>
              <h3 className="text-sm font-bold mt-0.5 leading-snug">{urgentNotice.title}</h3>
              <p className="text-xs text-white/90 line-clamp-1 mt-0.5">{urgentNotice.content}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onRouteChange('inst-notices')}
              className="px-3.5 py-1.5 bg-white text-rose-900 rounded-lg text-xs font-bold hover:bg-white/90 transition-all shadow-sm"
            >
              View Directive
            </button>
            <button
              onClick={() => setIsNoticeDismissed(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
              title="Dismiss Alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic School Header Banner with Hero Gradient */}
      <div 
        className="rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 relative overflow-hidden border border-white/20"
        style={{ background: 'var(--hero-gradient)' }}
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${banner.iconColor}`}>
              <BannerIcon className="w-4 h-4" />
              <span>{banner.sectionTag}</span>
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${banner.badgeColor}`}>
              {banner.badgeText}
            </span>
          </div>
          <h1 className="text-2xl font-bold mt-1.5 tracking-tight text-white flex items-center gap-2">
            <span>{banner.mainTitle}</span>
          </h1>
          <p className="text-xs text-purple-200/80 mt-1">
            {banner.description}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <button
            onClick={() => onRouteChange('inst-students')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-600/30 transition-all duration-150 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>
          <button
            onClick={() => onRouteChange('inst-fees')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 transition-all duration-150 flex items-center gap-1.5 active:scale-[0.98]"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Generate Fee Challan</span>
          </button>
        </div>
      </div>

      {/* School Campus Setup Wizard */}
      <CampusSetupWizard currentInstitute={currentInstitute} onRouteChange={onRouteChange} />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={instStudents.length}
          color="purple"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.shortTitle}` : (instStudents.length > 0 ? `+${instStudents.length} active` : '0 active')}
          badgePositive={instStudents.length > 0}
          icon={GraduationCap}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-students')}
          onView={() => onRouteChange('inst-students')}
          viewTooltip="View All School Students"
          onAdd={() => onRouteChange('inst-students')}
          addTooltip="Enroll New Student"
        />
        <StatCard
          title="Teachers & Staff"
          value={instTeachers.length}
          color="blue"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.code} Staff` : (instTeachers.length > 0 ? 'Staff Assigned' : '0 registered')}
          badgePositive={instTeachers.length > 0}
          icon={Users}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-teachers')}
          onView={() => onRouteChange('inst-teachers')}
          viewTooltip="View School Teachers Directory"
          onAdd={() => onRouteChange('inst-teachers')}
          addTooltip="Add Teacher"
        />
        <StatCard
          title="Fee Collection Rate"
          value={instFees.length > 0 ? `${feeRate}%` : '0.0%'}
          color="indigo"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.code} Fees` : (instFees.length > 0 ? `${paidFeesCount}/${instFees.length} Paid` : '0%')}
          badgePositive={paidFeesCount > 0}
          icon={Receipt}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-fees')}
          onView={() => onRouteChange('inst-fees')}
          viewTooltip="View Fee Records"
          onAdd={() => onRouteChange('inst-fees')}
          addTooltip="Generate Fee Challan"
        />
        <StatCard
          title="Daily Attendance"
          value={instStudents.length > 0 ? '96.4%' : '0.0%'}
          color="amber"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.code} Log` : (instStudents.length > 0 ? 'Good' : '0%')}
          badgePositive={instStudents.length > 0}
          icon={CalendarCheck}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-attendance')}
          onView={() => onRouteChange('inst-attendance')}
          viewTooltip="View Attendance Register"
          onAdd={() => onRouteChange('inst-attendance')}
          addTooltip="Mark Attendance"
        />
      </div>

      {/* SCHOOL TACTICAL INTELLIGENCE COMMAND STRIP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Absentee Sentinel & Parent SMS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Daily Attendance Sentinel
              </span>
              <PhoneCall className="w-4 h-4 text-rose-500" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">14 Students Absent Today</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Unexcused absence recorded across Elementary and Secondary classes. Parents require notification.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">96.4% Present</span>
            <button
              type="button"
              onClick={handleTriggerAbsentSms}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Send SMS to Parents</span>
            </button>
          </div>
        </div>

        {/* Card 2: Class Diary & Homework Tracker */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Daily Homework Routine
              </span>
              <BookOpen className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">8 of 10 Classes Diary Published</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Grade 4 and Grade 7 class teachers are pending daily homework upload review.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-600 font-semibold">80% Submitted</span>
            <button
              type="button"
              onClick={() => onRouteChange('inst-learning')}
              className="px-3 py-1.5 bg-[#f5eeff] hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>Review Diaries →</span>
            </button>
          </div>
        </div>

        {/* Card 3: Upcoming PTM Scheduler */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Parent Engagement
              </span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1">Term PTM: Nov 15, 2026</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              First Term Parent-Teacher meeting schedule dispatched. 84 parent appointment confirmations received.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-blue-700 font-semibold">Morning 09:00 AM</span>
            <button
              type="button"
              onClick={() => onRouteChange('inst-notices')}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>View PTM Agenda →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Classes & Sections Directory */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Classes & Sections Directory
              </h2>
              {activeProgramLevel !== 'all' && (
                <span className="text-[11px] font-semibold text-purple-700 bg-[#f5eeff] px-2 py-0.5 rounded-full border border-purple-200">
                  {activeLevelObj?.shortTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              School-customized sections (e.g. Super Section, Section A, B, Star Section, Morning/Evening batches)
            </p>
          </div>

          <button
            onClick={() => onRouteChange('inst-classes')}
            className="px-3.5 py-1.5 bg-[#f5eeff] hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage All Classes & Sections</span>
          </button>
        </div>

        {displayedClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedClasses.map(cls => {
              const secList = normalizeClassSections(cls)
              const cLevel = cls.programLevel || detectProgramLevel(cls.name)
              return (
                <div 
                  key={cls.id}
                  className="p-4 rounded-xl border border-slate-200/70 bg-slate-50/60 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white text-slate-500 border border-slate-200">
                          {cLevel}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-medium text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {secList.length} Sections
                      </span>
                    </div>

                    {/* Section Badges */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {secList.map((sec, sIdx) => {
                        const isSuper = sec.name.toLowerCase().includes('super') || sec.name.toLowerCase().includes('star')
                        return (
                          <span
                            key={sec.id || sIdx}
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 border ${
                              isSuper 
                                ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold' 
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {isSuper && <Star className="w-3 h-3 text-amber-500 fill-amber-400" />}
                            <span>{sec.name}</span>
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      Class Teacher: <strong className="text-slate-600 font-medium">{cls.classTeacher || 'Assigned Teacher'}</strong>
                    </span>
                    <button
                      onClick={() => onRouteChange('inst-classes')}
                      className="text-purple-600 hover:underline font-semibold"
                    >
                      Configure →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-8 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
            <BookOpen className="w-8 h-8 text-slate-300" />
            <p className="text-xs font-semibold text-slate-700">No classes configured for this school yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Click below to setup and configure active grades and sections for this school campus.
            </p>
            <button
              onClick={() => onRouteChange('inst-classes')}
              className="mt-1 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure Classes & Sections</span>
            </button>
          </div>
        )}
      </div>

      {/* Two Columns: Recent Student Admissions & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Recent Student Admissions
              </h2>
              <p className="text-xs text-slate-400">Newly enrolled students in this school</p>
            </div>
            {instStudents.length > 0 && (
              <button
                onClick={() => onRouteChange('inst-students')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                View Directory →
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {instStudents.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Student Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Fee Status</th>
                    <th className="px-4 py-3">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {instStudents.slice(0, 5).map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700">{std.rollNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{std.name}</td>
                      <td className="px-4 py-3 text-slate-600">{std.className} ({std.section})</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          std.feeStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {std.feeStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">{std.attendanceRate || '95%'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <GraduationCap className="w-8 h-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-700">0 Students Enrolled in This School</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click the button below to admit your first student and begin tracking attendance and grades.
                </p>
                <button
                  onClick={() => onRouteChange('inst-students')}
                  className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  Admit First Student
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations (Contextual Shortcuts) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">School Operations</h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shortcuts</span>
          </div>

          {/* Shortcut 1: Attendance */}
          <button
            onClick={() => onRouteChange('inst-attendance')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white transition-all duration-150 text-xs font-semibold text-slate-700 text-left border border-slate-200/70 hover:border-emerald-400 hover:shadow-sm group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Mark Daily Attendance</p>
                <p className="text-[11px] text-slate-400 font-normal">Active section roll call</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>

          {/* Shortcut 2: Fees & Billing */}
          <button
            onClick={() => onRouteChange('inst-fees')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white transition-all duration-150 text-xs font-semibold text-slate-700 text-left border border-slate-200/70 hover:border-blue-400 hover:shadow-sm group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-600 group-hover:text-white">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">3-Part Fee Challan</p>
                <p className="text-[11px] text-slate-400 font-normal">Print official bank vouchers</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>

          {/* Shortcut 3: Timetable */}
          <button
            onClick={() => onRouteChange('inst-timetable')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white transition-all duration-150 text-xs font-semibold text-slate-700 text-left border border-slate-200/70 hover:border-amber-400 hover:shadow-sm group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-colors group-hover:bg-amber-500 group-hover:text-white">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Class Timetable Matrix</p>
                <p className="text-[11px] text-slate-400 font-normal">Weekly periods & routine</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>

          {/* Shortcut 4: Teachers */}
          <button
            onClick={() => onRouteChange('inst-teachers')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white transition-all duration-150 text-xs font-semibold text-slate-700 text-left border border-slate-200/70 hover:border-purple-400 hover:shadow-sm group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Teachers & School Staff</p>
                <p className="text-[11px] text-slate-400 font-normal">Teachers directory & classes</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default InstituteDashboard
