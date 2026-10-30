import React, { useState, useMemo } from 'react'
import { 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  Lock, 
  Unlock, 
  CheckSquare, 
  RefreshCw, 
  FileBadge, 
  Search, 
  CheckCircle2, 
  Clock, 
  Download, 
  Award, 
  Check, 
  X, 
  Eye, 
  Printer,
  Sparkles
} from 'lucide-react'
import { useAppData } from '../../../context/AppDataContext'
import { useToast } from '../../../context/ToastContext'

export const SuperadminExaminationsResultsView = ({ activeTab = 'policies', onTabChange = () => {} }) => {
  const { exams = [], institutes = [] } = useAppData()
  const { toast } = useToast()

  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'policies'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // 1. Result Publish / Freeze Status per Campus Wing
  const [freezeStatuses, setFreezeStatuses] = useState([
    { id: 'FRZ-01', campus: 'Beaconhouse Central High', wing: 'High School Wing', examTerm: 'Midterm Examination 2026', isFrozen: true, published: true, approvedBy: 'Super Administrator' },
    { id: 'FRZ-02', campus: 'Beaconhouse Central High', wing: 'Middle Wing', examTerm: 'Midterm Examination 2026', isFrozen: false, published: false, approvedBy: 'Pending Lock' },
    { id: 'FRZ-03', campus: 'City School Senior Branch', wing: 'College Wing', examTerm: 'Pre-Board Terminal Exams', isFrozen: true, published: true, approvedBy: 'Super Administrator' },
    { id: 'FRZ-04', campus: 'Lahore Grammar Model Town', wing: 'Primary Wing', examTerm: 'First Term Assessment', isFrozen: false, published: false, approvedBy: 'Under Audit' }
  ])

  // 2. Grade Change & Re-checking Approvals
  const [gradeApprovals, setGradeApprovals] = useState([
    { id: 'GRD-101', student: 'Mustafa Kamal', roll: 'BHS-042', subject: 'Mathematics (Advanced)', campus: 'Beaconhouse Central High', originalMarks: 64, requestedMarks: 72, reason: 'Re-totaling error in Section B Q4', status: 'Pending Approval' },
    { id: 'GRD-102', student: 'Sarah Tariq', roll: 'TCS-112', subject: 'Physics Practical', campus: 'City School Senior Branch', originalMarks: 18, requestedMarks: 22, reason: 'Lab attendance marks reconciled', status: 'Approved' }
  ])

  // 3. Wing-wise pass percentage overview
  const wingPassMetrics = [
    { wing: 'Elementary & Primary Wing', totalExaminees: 450, passPercentage: '98.2%', topGpa: '4.00 (A+)', status: 'Outstanding' },
    { wing: 'Middle School Wing', totalExaminees: 380, passPercentage: '94.6%', topGpa: '3.95 (A+)', status: 'High' },
    { wing: 'Secondary / High School Wing', totalExaminees: 320, passPercentage: '91.8%', topGpa: '3.92 (A+)', status: 'Standard' },
    { wing: 'College & Higher Secondary Wing', totalExaminees: 240, passPercentage: '89.4%', topGpa: '3.88 (A+)', status: 'Moderate' }
  ]

  const tabsConfig = [
    { key: 'policies', label: 'Exam Policies & Datesheet Rules', icon: FileText },
    { key: 'results-wing', label: 'Results Overview (Wing-wise)', icon: BarChart3 },
    { key: 'publish-freeze', label: 'Result Publish / Freeze', icon: Lock, badge: freezeStatuses.filter(f => !f.isFrozen).length },
    { key: 'grade-approvals', label: 'Grade Change & Re-checking Approvals', icon: CheckSquare, badge: gradeApprovals.filter(g => g.status === 'Pending Approval').length },
    { key: 'supplementary', label: 'Supplementary Exams', icon: RefreshCw },
    { key: 'transcripts', label: 'DMC / Transcript Templates', icon: FileBadge },
    { key: 'reports', label: 'Examination Reports', icon: FileSpreadsheet }
  ]

  const handleToggleFreeze = (id) => {
    setFreezeStatuses(prev => prev.map(f => {
      if (f.id === id) {
        const nextFrozen = !f.isFrozen
        toast?.success?.(`${f.campus} (${f.wing}) results ${nextFrozen ? 'FROZEN & LOCKED' : 'UNFROZEN for corrections'}.`)
        return { ...f, isFrozen: nextFrozen, approvedBy: nextFrozen ? 'Super Administrator' : 'Unlocked by Superadmin' }
      }
      return f
    }))
  }

  const handleApproveGradeChange = (id) => {
    setGradeApprovals(prev => prev.map(g => g.id === id ? { ...g, status: 'Approved' } : g))
    toast?.success?.(`Grade change request ${id} authorized. New mark updated in master academic gazette.`)
  }

  const handleExportMasterGazette = () => {
    try {
      const headers = ['Approval_ID', 'Student_Name', 'Roll_No', 'Campus', 'Subject', 'Original_Marks', 'Requested_Marks', 'Status', 'Justification']
      const rows = gradeApprovals.map(g => [
        `"${g.id}"`,
        `"${g.student}"`,
        `"${g.roll}"`,
        `"${g.campus}"`,
        `"${g.subject}"`,
        g.originalMarks,
        g.requestedMarks,
        `"${g.status}"`,
        `"${(g.reason || '').replace(/"/g, '""')}"`
      ])

      const wingRows = wingPassMetrics.map(w => [
        `"WING_SUMMARY"`,
        `"${w.wing}"`,
        `"${w.totalExaminees} Examinees"`,
        `"Platform Network"`,
        `"Pass: ${w.passPercentage}"`,
        `""`,
        `""`,
        `"${w.status}"`,
        `"Top GPA: ${w.topGpa}"`
      ])

      const csvContent = [headers.join(','), ...wingRows.map(r => r.join(',')), ...rows.map(r => r.join(','))].join('\n')
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `examinations_master_gazette_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast?.success?.('Master Examination Gazette CSV generated and downloaded.')
    } catch {
      toast?.error?.('Failed to generate gazette export.')
    }
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Award className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Examination Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Examinations & Results Governance
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Standardize grading scales, central datesheet guidelines, result freeze lockouts, and official transcripts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportMasterGazette}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export Master Gazette</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-2xs overflow-x-auto dark-scroll">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabsConfig.map((t) => {
            const Icon = t.icon
            const isActive = effectiveTab === t.key
            return (
              <button
                key={t.key}
                onClick={() => handleTabSwitch(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{t.label}</span>
                {t.badge !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-purple-700 text-purple-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 1. EXAM POLICIES & DATESHEET RULES */}
      {effectiveTab === 'policies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-900 block border-b border-slate-100 pb-2">
                Standard Platform Grading Scale
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-emerald-700">A+ (Exceptional):</span>
                  <span>90% to 100% (GPA 4.00)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-purple-700">A (Distinction):</span>
                  <span>80% to 89% (GPA 3.70)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-blue-700">B (Merit):</span>
                  <span>70% to 79% (GPA 3.00)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-amber-700">C (Pass):</span>
                  <span>50% to 69% (GPA 2.00)</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="font-bold text-rose-700">F (Fail / Retake):</span>
                  <span>Below 50% (GPA 0.00)</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
              <span className="font-bold text-xs text-slate-900 block border-b border-slate-100 pb-2">
                Central Examination Directives
              </span>
              <ul className="space-y-2 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                  <span><strong>Datesheet Uniformity:</strong> Central core subjects (Math, English, Science) must be tested on identical calendar dates across all sister campuses.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                  <span><strong>Question Paper Secrecy:</strong> Papers are sealed by central exam controller 48 hours prior to paper schedule.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-600 mt-1.5 shrink-0"></span>
                  <span><strong>Minimum 75% Attendance:</strong> Students with attendance below 75% require Superadmin waiver to receive examination admit card.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESULTS OVERVIEW (WING-WISE) */}
      {effectiveTab === 'results-wing' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wingPassMetrics.map((w, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
                <span className="font-bold text-xs text-slate-900 block">{w.wing}</span>
                <div className="text-2xl font-bold font-mono text-purple-700">{w.passPercentage}</div>
                <div className="text-[11px] text-slate-500">Examinees: <strong className="text-slate-800">{w.totalExaminees}</strong></div>
                <div className="text-[11px] text-emerald-700 font-bold">Top GPA: {w.topGpa}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. RESULT PUBLISH / FREEZE */}
      {effectiveTab === 'publish-freeze' && (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200/80 p-4 rounded-2xl flex items-center justify-between text-xs text-purple-900">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <strong>Central Result Freeze Safeguard:</strong> Once a campus result is frozen by Superadmin, school teachers and institute admins cannot alter student marks without formal re-checking approval.
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Campus & Wing</th>
                  <th className="py-3.5 px-4">Exam Term</th>
                  <th className="py-3.5 px-4">Portal Publication</th>
                  <th className="py-3.5 px-4">Audit Status</th>
                  <th className="py-3.5 px-4 text-right">Lock / Freeze Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {freezeStatuses.map(frz => (
                  <tr key={frz.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{frz.campus}</div>
                      <span className="text-[10px] text-purple-700 font-bold">{frz.wing}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">{frz.examTerm}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        frz.published ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {frz.published ? 'Public on Parent App' : 'Draft Only'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">{frz.approvedBy}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleToggleFreeze(frz.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1.5 ${
                          frz.isFrozen
                            ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        {frz.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span>{frz.isFrozen ? 'Unlock for Edits' : 'Freeze & Lock Result'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. GRADE CHANGE & RE-CHECKING APPROVALS */}
      {effectiveTab === 'grade-approvals' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Approval ID & Student</th>
                  <th className="py-3.5 px-4">Subject & Campus</th>
                  <th className="py-3.5 px-4 text-center">Marks Change</th>
                  <th className="py-3.5 px-4">Justification Note</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {gradeApprovals.map(grd => (
                  <tr key={grd.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{grd.student}</div>
                      <span className="font-mono text-[10px] text-slate-400">{grd.id} • {grd.roll}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{grd.subject}</div>
                      <span className="text-[10px] text-slate-400">{grd.campus}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      <span className="text-slate-400 line-through mr-1.5">{grd.originalMarks}</span>
                      <strong className="text-emerald-700 font-bold text-sm">➔ {grd.requestedMarks}</strong>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{grd.reason}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        grd.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {grd.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {grd.status !== 'Approved' ? (
                        <button
                          type="button"
                          onClick={() => handleApproveGradeChange(grd.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. SUPPLEMENTARY EXAMS */}
      {effectiveTab === 'supplementary' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900">Supplementary & Compartment Policy Directives</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Students failing in up to 2 subjects are eligible for supplementary examinations scheduled 45 days after regular result declaration. Passing marks in supplementary retain original course credits.
          </p>
        </div>
      )}

      {/* 6. DMC / TRANSCRIPT TEMPLATES */}
      {effectiveTab === 'transcripts' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Official Detailed Marks Certificate (DMC) & Transcript Templates</h3>
          <p className="text-xs text-slate-500">Configure central security watermarks, high-resolution QR verification code positioning, and official registrar signatures.</p>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700">
            [Template Active] Official Board-Compliant Transcripts with Dynamic Wing Logo & Digital Hash Verification.
          </div>
        </div>
      )}

      {/* 7. EXAMINATION REPORTS */}
      {effectiveTab === 'reports' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Overall Platform Pass Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-700">93.5%</div>
            <p className="text-[11px] text-slate-400">1,390 students examined across all network campuses.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Board Merit Positions</span>
            <div className="text-2xl font-bold font-mono text-purple-700">14 Positions</div>
            <p className="text-[11px] text-slate-400">Achieved in Matriculation and Intermediate Board Exams.</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Re-checking Accuracy</span>
            <div className="text-2xl font-bold font-mono text-indigo-700">99.8%</div>
            <p className="text-[11px] text-slate-400">Minimal grade adjustments post central paper re-totaling.</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminExaminationsResultsView
