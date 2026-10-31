import React, { useState, useEffect } from 'react'
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Sparkles, 
  School,
  Building2, 
  Layers, 
  Users, 
  GraduationCap, 
  Receipt, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  Award,
  Zap
} from 'lucide-react'
import { useAppData } from '../../context/AppDataContext'
import { getInstituteTierConfig } from '../../utils/tierGating'

export const CampusSetupWizard = ({ currentInstitute, onRouteChange }) => {
  const tierConfig = getInstituteTierConfig(currentInstitute)
  const { 
    classes = [], 
    teachers = [], 
    students = [], 
    fees = [],
    institutes = [] 
  } = useAppData()

  // Local storage collapse preference so user's choice persists
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('edu_sms_setup_wizard_collapsed') === 'true'
    } catch (e) {
      return false
    }
  })

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev
      try {
        localStorage.setItem('edu_sms_setup_wizard_collapsed', String(next))
      } catch (e) {}
      return next
    })
  }

  // Filter current campus records
  const instClasses = classes.filter(c => !c.instituteId || c.instituteId === currentInstitute?.id)
  const instTeachers = teachers.filter(t => !t.instituteId || t.instituteId === currentInstitute?.id)
  const instStudents = students.filter(s => !s.instituteId || s.instituteId === currentInstitute?.id)
  const instFees = fees.filter(f => !f.instituteId || f.instituteId === currentInstitute?.id)

  const steps = [
    {
      id: 'step-inst',
      title: tierConfig.isUniversityOnly ? 'University Campus Profile' : tierConfig.isCollegeOnly ? 'College Campus Profile' : 'Campus Profile & Registration',
      subTitle: 'Profile, Code & Affiliation',
      description: currentInstitute?.name 
        ? `Registered: ${currentInstitute.name} (${currentInstitute.code || 'Main'})`
        : 'Register your institute branch, code, and board affiliation',
      isCompleted: Boolean(currentInstitute?.name),
      actionLabel: 'View Campus',
      action: () => onRouteChange('inst-program-levels'),
      icon: tierConfig.isUniversityOnly ? GraduationCap : tierConfig.isCollegeOnly ? Building2 : School,
      color: 'emerald'
    },
    {
      id: 'step-classes',
      title: tierConfig.terminology.classes,
      subTitle: tierConfig.isUniversityOnly ? 'Programs & Semester Batches' : tierConfig.isCollegeOnly ? 'Disciplines & Study Streams' : 'Grades, Streams & Sections',
      description: instClasses.length > 0 
        ? `${instClasses.length} ${tierConfig.terminology.classes} configured with active rosters`
        : (tierConfig.isUniversityOnly 
            ? 'Set up 4-Year BS degree programs (BSCS, BSSE, BBA) with semester batches'
            : tierConfig.isCollegeOnly 
            ? 'Set up intermediate disciplines (FSc Pre-Med, Pre-Eng, ICS) with lab batches' 
            : 'Set up classes from Primary to Matric with Super Sections and room numbers'),
      isCompleted: instClasses.length > 0,
      actionLabel: instClasses.length > 0 ? `Manage ${tierConfig.terminology.classUnit}s` : `Setup ${tierConfig.terminology.classUnit}s`,
      action: () => onRouteChange('inst-classes'),
      icon: tierConfig.isUniversityOnly ? Award : tierConfig.isCollegeOnly ? Building2 : Layers,
      color: 'blue'
    },
    {
      id: 'step-faculty',
      title: tierConfig.isUniversityOnly ? 'Professors & Faculty Roster' : tierConfig.isCollegeOnly ? 'Lecturers & College Faculty' : 'Faculty & Teachers Roster',
      subTitle: 'Faculty & Department Staff',
      description: instTeachers.length > 0
        ? `${instTeachers.length} Teaching faculty members assigned`
        : 'Register teaching faculty, subject specializations & phone contacts',
      isCompleted: instTeachers.length > 0,
      actionLabel: instTeachers.length > 0 ? 'Faculty Directory' : (tierConfig.isUniversityOnly ? 'Add Professors' : tierConfig.isCollegeOnly ? 'Add Lecturers' : 'Add Teachers'),
      action: () => onRouteChange('inst-teachers'),
      icon: Users,
      color: 'indigo'
    },
    {
      id: 'step-students',
      title: tierConfig.isUniversityOnly ? 'Undergraduate Admissions & Intake' : tierConfig.isCollegeOnly ? 'College Admissions & Merit Lists' : 'Student Admissions & Enrollment',
      subTitle: 'Enrollment & Student Records',
      description: instStudents.length > 0
        ? `${instStudents.length} Students enrolled with official dossiers and ID records`
        : 'Admit students into classes & sections with full dossiers and ID cards',
      isCompleted: instStudents.length > 0,
      actionLabel: instStudents.length > 0 ? 'Student Roster' : (tierConfig.isUniversityOnly ? 'Intake Students' : tierConfig.isCollegeOnly ? 'Admit Students' : 'Admit Students'),
      action: () => onRouteChange('inst-students'),
      icon: GraduationCap,
      color: 'purple'
    },
    {
      id: 'step-fees',
      title: tierConfig.isUniversityOnly ? 'Tuition Dues & Semester Invoices' : 'Fee Structure & Monthly Challans',
      subTitle: 'Fee Structure & Challans',
      description: instFees.length > 0
        ? `${instFees.length} Fee challan records active with collection status`
        : 'Generate monthly bank challans, concessions & collect payments',
      isCompleted: instFees.length > 0,
      actionLabel: instFees.length > 0 ? 'Fee Counter' : (tierConfig.isUniversityOnly ? 'Issue Invoices' : 'Issue Challans'),
      action: () => onRouteChange('inst-fees'),
      icon: Receipt,
      color: 'amber'
    }
  ]

  const completedCount = steps.filter(s => s.isCompleted).length
  const progressPercent = Math.round((completedCount / steps.length) * 100)
  const isAllComplete = completedCount === steps.length

  // First pending step for auto-guidance
  const nextPendingStep = steps.find(s => !s.isCompleted)

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
            isAllComplete 
              ? 'bg-emerald-500 text-white' 
              : 'bg-purple-600 text-white'
          }`}>
            {isAllComplete ? <Award className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Campus Setup & Onboarding Guide
              </h3>
              <span className="text-[10px] text-slate-400 font-medium">
                (Foundation Checklist)
              </span>
              {isAllComplete ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>100% Operational</span>
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5eeff] text-purple-700 border border-purple-200 font-mono">
                  {completedCount}/{steps.length} Steps
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isAllComplete 
                ? 'All foundational school modules are configured! Your campus is operating with active records.'
                : `Next Recommended Step: ${nextPendingStep?.title || 'Complete your setup'}`
              }
            </p>
          </div>
        </div>

        {/* Progress Badge & Collapse Trigger */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-32 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/60">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  isAllComplete ? 'bg-emerald-500' : 'bg-purple-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {progressPercent}%
            </span>
          </div>

          <button
            type="button"
            onClick={toggleCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
            title={isCollapsed ? "Expand Setup Guide" : "Minimize Setup Guide"}
          >
            <span className="text-[11px] hidden sm:inline">{isCollapsed ? 'Show Checklist' : 'Hide'}</span>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Step-by-Step Cards Grid */}
      {!isCollapsed && (
        <div className="mt-4 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isNext = !step.isCompleted && step.id === nextPendingStep?.id

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between relative overflow-hidden ${
                    step.isCompleted
                      ? 'bg-slate-50/70 border-emerald-200/80 hover:bg-slate-50'
                      : isNext
                        ? 'bg-white border-purple-500 shadow-sm ring-2 ring-purple-500/10'
                        : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {isNext && (
                    <div className="absolute top-0 right-0 left-0 h-0.5 bg-purple-600"></div>
                  )}

                  <div>
                    {/* Top Row: Step Index & Status Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                          step.isCompleted 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : isNext 
                              ? 'bg-[#f5eeff] text-purple-800'
                              : 'bg-slate-100 text-slate-600'
                        }`}>
                          Step {index + 1}
                        </span>
                      </div>
                      
                      {step.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <Circle className={`w-4 h-4 ${isNext ? 'text-purple-600 animate-pulse' : 'text-slate-300'}`} />
                      )}
                    </div>

                    {/* Step Title & Urdu Subtitle */}
                    <h4 className="text-xs font-bold text-slate-800 leading-tight flex items-center gap-1">
                      <Icon className="w-3.5 h-3.5 opacity-70 shrink-0" />
                      <span className="truncate">{step.title}</span>
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {step.subTitle}
                    </p>

                    {/* Description */}
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={step.action}
                      className={`w-full py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                        step.isCompleted
                          ? 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                          : isNext
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{step.actionLabel}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom Guidance Footer for Layman Users */}
          <div className="p-2.5 bg-[#f5eeff]/60 border border-purple-100/80 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>
                <strong>Setup Tip:</strong> Follow the steps in order from left to right. Once classes are configured, attendance and fee challans activate automatically.
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
              <span>Shortcuts: Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-bold text-slate-700">Ctrl + K</kbd> to search any student or module</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CampusSetupWizard
