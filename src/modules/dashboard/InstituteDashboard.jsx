import React, { useState } from 'react'
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
  CheckCircle2, 
  BookOpen,
  Award,
  Building2,
  Sparkles,
  Star,
  Plus,
  AlertTriangle,
  X
} from 'lucide-react'
import StatCard from '../../components/common/StatCard'
import { BillingService } from '../../services/billingService'
import { CampusSetupWizard } from '../../components/common/CampusSetupWizard'
import { useAppData } from '../../context/AppDataContext'
import { normalizeClassSections, detectProgramLevel } from '../../constants/academicLevels'
import { getInstituteTierConfig } from '../../utils/tierGating'

export const InstituteDashboard = ({ currentInstitute, onRouteChange }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { 
    institutes = [],
    students = [], 
    teachers = [], 
    fees = [], 
    notices = [],
    classes = [],
    activeProgramLevel, 
    setActiveProgramLevel, 
    activeWing = 'all',
    setActiveWing,
    programLevels = [] 
  } = useAppData()

  const [isRenewalDismissed, setIsRenewalDismissed] = useState(() => {
    return typeof window !== 'undefined' && sessionStorage.getItem(`dismiss_renewal_${currentInstitute?.id}`) === 'true'
  })

  const subscription = BillingService.getSubscriptionForInstitute(currentInstitute?.id)

  const [isNoticeDismissed, setIsNoticeDismissed] = useState(false)
  const urgentNotice = notices.find(n => 
    (n.category === 'Urgent' || n.priority === 'Urgent' || n.pinned) &&
    (!n.instituteId || n.instituteId === currentInstitute?.id)
  )

  const activeLevelObj = programLevels.find(l => l.id === activeProgramLevel)

  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
  const instTeachers = teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  const instFees = fees.filter(f => !f.instituteId || f.instituteId === currentInstitute?.id)

  const paidFeesCount = instFees.filter(f => f.status === 'Paid').length
  const feeRate = instFees.length > 0 ? Math.round((paidFeesCount / instFees.length) * 100) : 0

  // Dynamically adapt header title and section tag to the selected academic tier
  const getBannerDetails = () => {
    const campusName = currentInstitute?.name || 'Main Campus'
    const campusCode = currentInstitute?.code || 'SCH-001'
    const campusAddress = currentInstitute?.address || 'Central District'

    switch (activeProgramLevel) {
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
      case 'higher-secondary':
        return {
          icon: GraduationCap,
          iconColor: 'text-indigo-400',
          sectionTag: 'Higher Secondary Section (Grade 11 - 12)',
          mainTitle: `${campusName} • Higher Secondary College`,
          description: `Tier: Grades 11 & 12 • Intermediate (HSSC: F.Sc, ICS, I.Com) & A-Levels • ${campusCode}-HSSC`,
          badgeText: 'Higher Secondary',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        }
      case 'college':
        return {
          icon: Building2,
          iconColor: 'text-amber-400',
          sectionTag: 'College Degree Section (Associate Degrees)',
          mainTitle: `${campusName} • Degree College Wing`,
          description: `Tier: Semesters 1 to 4 • Associate Degree Programs (ADP) & DAE Diplomas • ${campusCode}-COL`,
          badgeText: 'College Level',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        }
      case 'university':
        return {
          icon: Sparkles,
          iconColor: 'text-purple-400',
          sectionTag: 'Undergraduate Degree Programs (BS / Honors)',
          mainTitle: `${campusName} • Undergraduate Faculty Center`,
          description: `Tier: Undergraduate Higher Education • 4-Year BS Honors Degree Programs • ${campusCode}-UG`,
          badgeText: 'Undergraduate Level',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        }
      default:
        return {
          icon: tierConfig.isUniversityOnly ? GraduationCap : tierConfig.isCollegeOnly ? Building2 : School,
          iconColor: tierConfig.isUniversityOnly ? 'text-purple-300' : tierConfig.isCollegeOnly ? 'text-amber-300' : 'text-emerald-400',
          sectionTag: tierConfig.isUniversityOnly 
            ? 'University Academic Center' 
            : tierConfig.isCollegeOnly 
            ? 'College Administrative Center' 
            : 'Campus Administrative Center',
          mainTitle: campusName,
          description: `Registration Code: ${campusCode} • ${campusAddress} • ${tierConfig.portalTypeLabel}`,
          badgeText: tierConfig.portalTypeLabel,
          badgeColor: 'bg-white/10 text-slate-300 border-white/20'
        }
    }
  }

  const banner = getBannerDetails()
  const BannerIcon = banner.icon

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
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
                  CAMPUS DIRECTIVE • URGENT BROADCAST
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

      {/* Subscription Renewal Warning Banner (5 or 2 days deadline alert) */}
      {subscription && subscription.isApproachingDeadline && !isRenewalDismissed && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/90 to-amber-100/70 border border-amber-200/90 rounded-2xl p-4 text-amber-900 shadow-xs flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                  Subscription Renewal Reminder
                </span>
                <span className="text-xs font-bold text-amber-800">
                  Due in {subscription.daysRemaining} days ({subscription.renewalDate})
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1">
                Your <strong>{subscription.planName || 'Campus Plan'}</strong> billing cycle is approaching renewal. All campus modules, student attendance, fees, and grading remain fully active without interruption.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsRenewalDismissed(true)
              sessionStorage.setItem(`dismiss_renewal_${currentInstitute?.id}`, 'true')
            }}
            className="w-8 h-8 rounded-lg text-amber-700 hover:text-amber-950 hover:bg-amber-200/60 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Waived Month Courtesy Banner (Super Admin Override) */}
      {subscription && subscription.isWaived && (
        <div className="bg-emerald-50/90 border border-emerald-200/80 rounded-2xl p-3.5 px-4 text-emerald-900 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-medium">
              <strong>Complimentary Billing Cycle:</strong> Platform fees for this cycle have been waived by Super Admin ({subscription.waiveReason || 'Promotional Courtesy'}). Next billing date: {subscription.renewalDate}.
            </span>
          </div>
        </div>
      )}

      {/* Grace Period Extension Banner (Super Admin Override) */}
      {subscription && subscription.extendedUntil && !subscription.isWaived && (
        <div className="bg-blue-50/90 border border-blue-200/80 rounded-2xl p-3.5 px-4 text-blue-900 shadow-2xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs font-medium">
              <strong>Grace Period Active:</strong> Payment due date has been extended until <strong>{subscription.extendedUntil}</strong>. All campus operations remain fully active.
            </span>
          </div>
        </div>
      )}

      {/* Dynamic Campus & Academic Tier Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 border border-purple-800/40 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-purple-950/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-200 relative overflow-hidden">
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

      {/* Layman-Friendly Interactive Campus Setup Wizard */}
      <CampusSetupWizard currentInstitute={currentInstitute} onRouteChange={onRouteChange} />

      {/* KPI Cards - Real dynamic calculations with Show all + Eye + Add actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title={tierConfig.isUniversityOnly ? "Enrolled Students" : tierConfig.isCollegeOnly ? "College Students" : "Total Students"}
          value={instStudents.length}
          color="purple"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.shortTitle}` : (instStudents.length > 0 ? `+${instStudents.length} active` : '0 active')}
          badgePositive={instStudents.length > 0}
          icon={GraduationCap}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-students')}
          onView={() => onRouteChange('inst-students')}
          viewTooltip={tierConfig.isUniversityOnly ? "View Enrolled Students" : tierConfig.isCollegeOnly ? "View College Students" : "View All Campus Students"}
          onAdd={() => onRouteChange('inst-students')}
          addTooltip={tierConfig.isUniversityOnly ? "Intake New Student" : tierConfig.isCollegeOnly ? "Admit Student" : "Enroll New Student"}
        />
        <StatCard
          title={tierConfig.isUniversityOnly ? "Professors & Faculty" : tierConfig.isCollegeOnly ? "Lecturers & Faculty" : "Faculty & Staff"}
          value={instTeachers.length}
          color="blue"
          badge={activeProgramLevel !== 'all' ? `${activeLevelObj?.code} Staff` : (instTeachers.length > 0 ? 'Staff Assigned' : '0 registered')}
          badgePositive={instTeachers.length > 0}
          icon={tierConfig.isUniversityOnly ? Award : tierConfig.isCollegeOnly ? Building2 : Users}
          showActions={true}
          showAllText="Show all"
          onShowAll={() => onRouteChange('inst-teachers')}
          onView={() => onRouteChange('inst-teachers')}
          viewTooltip="View Campus Faculty Directory"
          onAdd={() => onRouteChange('inst-teachers')}
          addTooltip={tierConfig.isUniversityOnly ? "Add Faculty" : tierConfig.isCollegeOnly ? "Add Lecturer" : "Add Teacher"}
        />
        <StatCard
          title={tierConfig.isUniversityOnly ? "Tuition Fee Realization" : "Fee Collection Rate"}
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
          addTooltip={tierConfig.isUniversityOnly ? "Generate Semester Invoice" : "Generate Fee Challan"}
        />
        <StatCard
          title={tierConfig.isUniversityOnly ? "Course Attendance" : "Daily Attendance"}
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

      {/* Classes & Custom Sections Directory (Flexible Super Section, Section A, B, etc.) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <BookOpen className="w-5 h-5 text-purple-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {tierConfig.terminology.classes} Directory
              </h2>
              {activeProgramLevel !== 'all' && (
                <span className="text-[11px] font-semibold text-purple-700 bg-[#f5eeff] px-2 py-0.5 rounded-full border border-purple-200">
                  {activeLevelObj?.shortTitle}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {tierConfig.isUniversityOnly 
                ? 'University degree programs, semester cohorts and credit batches'
                : tierConfig.isCollegeOnly
                ? 'College intermediate streams (FSc Pre-Med, Pre-Engg, ICS, I.Com) and study batches'
                : 'School-customized sections (e.g. Super Section, Section A, B, Star Section, Morning/Evening batches)'}
            </p>
          </div>

          <button
            onClick={() => onRouteChange('inst-classes')}
            className="px-3.5 py-1.5 bg-[#f5eeff] hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage All {tierConfig.terminology.classes}</span>
          </button>
        </div>

        {classes.filter(c => {
          const matchesCampus = 
            !c.instituteId || 
            !currentInstitute?.id || 
            c.instituteId === currentInstitute.id || 
            ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') &&
             (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) ||
            (institutes || []).length <= 1
          if (!matchesCampus) return false
          const cLevel = c.programLevel || detectProgramLevel(c.name)
          if (!tierConfig.isLevelAllowed(cLevel)) return false
          if (activeProgramLevel === 'all') return true
          return cLevel === activeProgramLevel || detectProgramLevel(c.name) === activeProgramLevel
        }).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.filter(c => {
              const matchesCampus = 
                !c.instituteId || 
                !currentInstitute?.id || 
                c.instituteId === currentInstitute.id || 
                ((c.instituteId === 'inst-1' || c.instituteId === 'inst-default') &&
                 (currentInstitute.id === 'inst-1' || currentInstitute.id === 'inst-default')) ||
                (institutes || []).length <= 1
              if (!matchesCampus) return false
              if (activeProgramLevel === 'all') return true
              const cLevel = c.programLevel || detectProgramLevel(c.name)
              return cLevel === activeProgramLevel || detectProgramLevel(c.name) === activeProgramLevel
            }).map(cls => {
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
                    <span>Teacher: <strong className="text-slate-600 font-medium">{cls.classTeacher || 'Assigned Staff'}</strong></span>
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
            <p className="text-xs font-semibold text-slate-700">No classes configured for this tier yet</p>
            <p className="text-[11px] text-slate-400 max-w-sm">
              Every school names sections differently. Click below to add your school's classes and assign custom sections (Super Section, Section A, B, etc.).
            </p>
            <button
              onClick={() => onRouteChange('inst-classes')}
              className="mt-1 px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Configure {tierConfig.terminology.classes}</span>
            </button>
          </div>
        )}
      </div>

      {/* Two Columns: Recent Student Admissions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Admissions */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Recent Student Admissions</h2>
              <p className="text-xs text-slate-400">Newly enrolled students in this campus</p>
            </div>
            {instStudents.length > 0 && (
              <button
                onClick={() => onRouteChange('inst-students')}
                className="text-xs font-semibold text-purple-600 hover:text-purple-700"
              >
                View All Students →
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            {instStudents.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class & Section</th>
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
                <p className="text-sm font-semibold text-slate-700">0 Students Enrolled in This Campus</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Click the "New Admission" button to enroll your first student and begin tracking attendance and grades.
                </p>
                <button
                  onClick={() => onRouteChange('inst-students')}
                  className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  Enroll First Student
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Operations */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/70 shadow-[0_2px_12px_rgba(0,0,0,0.03)] space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-bold text-slate-800">Campus Operations</h2>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Shortcuts</span>
          </div>

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

          <button
            onClick={() => onRouteChange('inst-teachers')}
            className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50/80 hover:bg-white transition-all duration-150 text-xs font-semibold text-slate-700 text-left border border-slate-200/70 hover:border-purple-400 hover:shadow-sm group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center transition-colors group-hover:bg-purple-600 group-hover:text-white">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-slate-800">Faculty & Staff</p>
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
