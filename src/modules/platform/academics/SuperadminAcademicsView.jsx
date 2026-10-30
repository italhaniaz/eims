import React, { useState } from 'react'
import { 
  GraduationCap, 
  Calendar, 
  School, 
  Building2, 
  Layers, 
  BookOpen, 
  Award, 
  Clock, 
  RotateCcw, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ChevronRight,
  Filter,
  ArrowRight,
  Check
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminAcademicsView = ({ activeTab = 'sessions', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'sessions'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Academic sessions state
  const [sessions, setSessions] = useState([
    { id: 'SES-2026', name: 'Academic Session 2026-2027', term: 'Full Year', startDate: '2026-08-15', endDate: '2027-06-30', status: 'Active (Current)', wings: 'All Wings (School, College, Uni)' },
    { id: 'SES-2025', name: 'Academic Session 2025-2026', term: 'Terminal Phase', startDate: '2025-08-15', endDate: '2026-06-30', status: 'Archived', wings: 'All Wings' },
    { id: 'SES-2027', name: 'Academic Session 2027-2028', term: 'Draft Planned', startDate: '2027-08-15', endDate: '2028-06-30', status: 'Planned', wings: 'All Wings' }
  ])

  // School structure
  const [schoolClasses] = useState([
    { grade: 'Grade 10', wing: 'Secondary Wing', sections: ['A (Lily)', 'B (Tulip)', 'C (Rose)'], capacity: 105, curStudents: 98, passingThreshold: '40%' },
    { grade: 'Grade 9', wing: 'Secondary Wing', sections: ['A', 'B', 'C', 'D'], capacity: 140, curStudents: 132, passingThreshold: '40%' },
    { grade: 'Grade 8', wing: 'Middle Wing', sections: ['A', 'B', 'C'], capacity: 105, curStudents: 101, passingThreshold: '33%' },
    { grade: 'Grade 5', wing: 'Primary Wing', sections: ['A', 'B'], capacity: 70, curStudents: 66, passingThreshold: '33%' }
  ])

  // College structure
  const [collegePrograms] = useState([
    { program: 'F.Sc Pre-Medical', years: 'Part-I & Part-II', groups: ['Morning Group Alpha', 'Morning Group Beta'], labRequirement: 'Physics, Chem, Bio', capacity: 160 },
    { program: 'F.Sc Pre-Engineering', years: 'Part-I & Part-II', groups: ['Morning Group Eng-1', 'Eng-2'], labRequirement: 'Physics, Chemistry, Computer', capacity: 120 },
    { program: 'ICS (Computer Science)', years: 'Part-I & Part-II', groups: ['ICS-A (Math)', 'ICS-B (Stats)'], labRequirement: 'Modern Computer Lab', capacity: 140 },
    { program: 'I.Com (Commerce)', years: 'Part-I & Part-II', groups: ['I.Com Alpha'], labRequirement: 'Accounting Workshop', capacity: 80 }
  ])

  // University structure
  const [uniFaculties] = useState([
    { faculty: 'Faculty of Computing & Information Technology', depts: ['Computer Science', 'Software Engineering', 'Artificial Intelligence'], semesters: '8 Semesters (4 Years)', creditHours: 134 },
    { faculty: 'Faculty of Business & Management Sciences', depts: ['Business Administration', 'Accounting & Finance'], semesters: '8 Semesters', creditHours: 130 },
    { faculty: 'Faculty of Social Sciences & Humanities', depts: ['English Literature', 'Psychology', 'Education'], semesters: '8 Semesters', creditHours: 126 }
  ])

  const tabsConfig = [
    { key: 'sessions', label: 'Sessions & Calendars', icon: Calendar },
    { key: 'school-struct', label: 'School Structure', icon: School },
    { key: 'college-struct', label: 'College Structure', icon: Layers },
    { key: 'university-struct', label: 'University Structure', icon: Building2 },
    { key: 'curriculum', label: 'Subjects & Curriculum Templates', icon: BookOpen },
    { key: 'grading', label: 'Grading Schemes', icon: Award },
    { key: 'timetable', label: 'Timetable Rules & Room Allocation', icon: Clock },
    { key: 'rollover', label: 'Academic Year Rollover', icon: RotateCcw }
  ]

  const triggerRolloverSimulation = () => {
    toast?.success?.('Academic Year Rollover verification completed! Student progression schemas are compliant.')
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Academic Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Academic Hierarchy & Frameworks
            </h1>
            <p className="text-sm text-purple-200 mt-1 max-w-2xl leading-relaxed">
              Standardize multi-wing curricula, academic calendars, school/college/university divisions, and rollover policies.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Central academic session configuration dialog opened')}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg hover:shadow-purple-500/25 transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Academic Session</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/80 shadow-2xs overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map(tab => {
            const Icon = tab.icon
            const active = effectiveTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabSwitch(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  active 
                    ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Sessions & Calendars */}
      {effectiveTab === 'sessions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Central Term</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">2026-2027 Regular</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">Current term active across all affiliated campuses</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructional Days</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">214 Days</h3>
              <p className="text-xs text-purple-600 font-medium mt-1">Compliant with National Education Policy (Min 200)</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Windows</span>
              <h3 className="text-xl font-bold text-slate-800 mt-1">Midterms & Finals Synced</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Dec 2026 / May 2027</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Configured Academic Sessions</h3>
                <p className="text-xs text-slate-500">Universal session timeline applied across all school, college, and university wings</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
                  <tr>
                    <th className="p-4">Session Code</th>
                    <th className="p-4">Session Name</th>
                    <th className="p-4">Term Phase</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Target Wings</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sessions.map(s => (
                    <tr key={s.id} className="hover:bg-purple-50/30 transition-colors">
                      <td className="p-4 font-mono font-semibold text-purple-700">{s.id}</td>
                      <td className="p-4 font-bold text-slate-900">{s.name}</td>
                      <td className="p-4">{s.term}</td>
                      <td className="p-4 text-slate-500">{s.startDate} to {s.endDate}</td>
                      <td className="p-4">{s.wings}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          s.status.includes('Active') ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'Planned' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: School Structure */}
      {effectiveTab === 'school-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="text-base font-bold text-slate-900">Standard School Wing Architecture</h3>
            <p className="text-xs text-slate-500 mt-0.5">Defines Classes, Sections (Capacities), and Passing Grade thresholds for Elementary & Secondary</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {schoolClasses.map((sc, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{sc.grade}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">{sc.wing}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {sc.sections.map((sec, j) => (
                      <span key={j} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-700 font-medium">
                        Section {sec}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                    <span>Enrolled: <b>{sc.curStudents}</b> / {sc.capacity}</span>
                    <span className="text-purple-700 font-semibold">Min Passing: {sc.passingThreshold}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: College Structure */}
      {effectiveTab === 'college-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="text-base font-bold text-slate-900">College & Higher Secondary Programs</h3>
            <p className="text-xs text-slate-500 mt-0.5">Standard BISE intermediate 2-year programs with laboratory & practical requirements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              {collegePrograms.map((cp, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{cp.program}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">{cp.years}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Lab Requirements: <span className="font-medium text-slate-700">{cp.labRequirement}</span></p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {cp.groups.map((grp, j) => (
                      <span key={j} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-xs text-slate-700">
                        {grp}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs text-slate-500 flex justify-between">
                    <span>Total Seat Allocation: <b>{cp.capacity}</b> seats</span>
                    <span className="text-emerald-600 font-medium">BISE Registered</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: University Structure */}
      {effectiveTab === 'university-struct' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6">
            <h3 className="text-base font-bold text-slate-900">Higher Education & University Faculty Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">Degree programs, HEC semester guidelines, faculties, and credit hours</p>
            <div className="space-y-4 mt-5">
              {uniFaculties.map((uf, i) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200/70 bg-white shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-600" />
                      {uf.faculty}
                    </span>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                      {uf.creditHours} Total Credit Hours
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {uf.depts.map((d, j) => (
                      <span key={j} className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
                        Dept. of {d}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Scheme: <span className="text-slate-800 font-medium">{uf.semesters}</span> • Grading: HEC 4.00 CGPA Scale
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Subjects & Curriculum */}
      {effectiveTab === 'curriculum' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Central Curriculum Templates</h3>
          <p className="text-xs text-slate-500">National Curriculum Council (NCC) and Cambridge syllabus templates deployed across campuses</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { title: 'National Single Curriculum (Primary)', subjects: 'English, Urdu, Islamiat, Math, General Science', gradeRange: 'Grade 1 - 5', code: 'CUR-NSC-P' },
              { title: 'Federal / Punjab Secondary Scheme', subjects: 'Physics, Chemistry, Biology / Computer, Pak Studies', gradeRange: 'Grade 9 - 10', code: 'CUR-FB-SEC' },
              { title: 'Cambridge IGCSE & O-Levels', subjects: 'Mathematics 4024, English 1123, Physics 5054', gradeRange: 'O1, O2, O3', code: 'CUR-CIE-OL' }
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <span className="text-[11px] font-mono font-bold text-purple-700">{c.code}</span>
                <h4 className="font-bold text-slate-900 text-sm mt-1">{c.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Scope: <b>{c.gradeRange}</b></p>
                <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded border border-slate-100">{c.subjects}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Grading Schemes */}
      {effectiveTab === 'grading' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Platform Standard Grading Scales</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">School & College Percentage Scale (BISE)</h4>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-semibold"><span>A+ (Exceptional)</span><span>80% and above</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>A (Excellent)</span><span>70% to 79%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>B (Very Good)</span><span>60% to 69%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>C (Good)</span><span>50% to 59%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>D (Passing)</span><span>40% to 49%</span></div>
                <div className="flex justify-between py-1 text-rose-600 font-bold"><span>F (Fail)</span><span>Below 40%</span></div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <h4 className="font-bold text-slate-900 text-sm">University 4.00 CGPA Scale (HEC Standard)</h4>
              <div className="mt-3 space-y-1 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60 font-semibold"><span>A (4.00 GPA)</span><span>85% - 100%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>A- (3.67 GPA)</span><span>80% - 84%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>B+ (3.33 GPA)</span><span>75% - 79%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>B (3.00 GPA)</span><span>71% - 74%</span></div>
                <div className="flex justify-between py-1 border-b border-slate-200/60"><span>C (2.00 GPA)</span><span>61% - 64%</span></div>
                <div className="flex justify-between py-1 text-rose-600 font-bold"><span>F (0.00 GPA)</span><span>Below 50%</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Timetable Rules */}
      {effectiveTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Universal Timetable Rules & Room Allocation Constraints</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-purple-50/40">
              <span className="text-xs text-purple-700 font-bold">Period Duration</span>
              <h4 className="text-lg font-bold text-slate-800 mt-1">45 Minutes</h4>
              <p className="text-xs text-slate-500 mt-1">Standard period length across all secondary wings</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-purple-50/40">
              <span className="text-xs text-purple-700 font-bold">Max Teacher Load</span>
              <h4 className="text-lg font-bold text-slate-800 mt-1">5 Periods / Day</h4>
              <p className="text-xs text-slate-500 mt-1">Prevents faculty burnout and timetable clash</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-100 bg-purple-50/40">
              <span className="text-xs text-purple-700 font-bold">Recess & Prayer Window</span>
              <h4 className="text-lg font-bold text-slate-800 mt-1">1:00 PM - 1:45 PM</h4>
              <p className="text-xs text-slate-500 mt-1">Mandatory synchronized Zuhr prayer & lunch break</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 8: Rollover */}
      {effectiveTab === 'rollover' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900">Academic Year Rollover Engine</h3>
              <p className="text-xs text-slate-500">Promotes successful students to the next grade/semester while retaining alumni and detention records</p>
            </div>
            <button
              onClick={triggerRolloverSimulation}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-sm shadow-purple-600/30"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Simulate Rollover Audit</span>
            </button>
          </div>
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 text-xs text-amber-900 leading-relaxed">
            <b>Rollover Guardrail:</b> Automatic progression only applies to students with cleared fee accounts and passing exam marks. Defaulters will be held in provisional registration until fee clearance is authenticated.
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminAcademicsView
