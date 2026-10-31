import React, { useState, useMemo } from 'react'
import { 
  Award, 
  Printer, 
  Lock, 
  Unlock, 
  School, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Filter, 
  Users, 
  TrendingUp,
  X,
  Sliders,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react'
import Modal from '../../components/common/Modal'
import { detectProgramLevel } from '../../constants/academicLevels'
import { useToast } from '../../context/ToastContext'

export const MeritListGazetteModal = ({
  isOpen,
  onClose,
  leads = [],
  currentInstitute,
  activeSession = '2026-2027',
  availableClasses = [],
  onUpdateLead,
  isAdmin = true
}) => {
  const { toast } = useToast()

  // Selected Class & Session Filters inside Gazette
  const [targetClass, setTargetClass] = useState('ALL')
  const [selectedSession, setSelectedSession] = useState(activeSession)

  // Configurable Weightages: Test %, Interview %, Previous Academic % (Default: 50%, 20%, 30%)
  const [weightTest, setWeightTest] = useState(50)
  const [weightInterview, setWeightInterview] = useState(20)
  const [weightAcademic, setWeightAcademic] = useState(30)
  const [showConfig, setShowConfig] = useState(false)

  // Configurable Seat Limit per Class (Default 20 seats)
  const [seatLimit, setSeatLimit] = useState(20)
  const [passThreshold, setPassThreshold] = useState(50)

  // Auto-inherit Central Merit Policy from Platform Governance
  useEffect(() => {
    try {
      const storedPolicies = localStorage.getItem('edu_sms_merit_policies')
      if (storedPolicies) {
        const parsed = JSON.parse(storedPolicies)
        const level = targetClass !== 'ALL' ? detectProgramLevel(targetClass) : 'school'
        const matched = parsed.find(p => {
          const w = (p.wing || '').toLowerCase()
          if (level === 'college' && (w.includes('college') || w.includes('higher'))) return true
          if (level === 'university' && (w.includes('university') || w.includes('undergraduate'))) return true
          if (level === 'school' && (w.includes('school') || w.includes('primary') || w.includes('middle'))) return true
          return false
        }) || parsed[0]

        if (matched) {
          if (matched.testWeight) setWeightTest(Number(matched.testWeight))
          if (matched.interviewWeight) setWeightInterview(Number(matched.interviewWeight))
          if (matched.pastAcademicWeight) setWeightAcademic(Number(matched.pastAcademicWeight))
          if (matched.minPercentage) setPassThreshold(Number(matched.minPercentage))
        }
      }
    } catch (e) {
      console.warn('Could not load central merit policies', e)
    }
  }, [targetClass])

  // Gazette Publication Lock State (stored in localStorage per class & session)
  const lockStorageKey = `merit_locked_${currentInstitute?.id || 'inst'}_${selectedSession}_${targetClass}`
  const [isPublishedLocked, setIsPublishedLocked] = useState(() => {
    try {
      return localStorage.getItem(lockStorageKey) === 'true'
    } catch {
      return false
    }
  })

  // Toggle Publish & Lock
  const handleToggleLock = () => {
    if (!isAdmin) {
      toast.error('Only Administrators have permission to publish or unlock the official Merit Gazette.')
      return
    }

    const nextState = !isPublishedLocked
    setIsPublishedLocked(nextState)
    try {
      localStorage.setItem(lockStorageKey, String(nextState))
    } catch {}

    if (nextState) {
      toast.success(`Official Merit Gazette for ${targetClass === 'ALL' ? 'All Classes' : targetClass} is now PUBLISHED & LOCKED.`)
    } else {
      toast.info(`Merit Gazette unlocked for administrative adjustments.`)
    }
  }

  // Filter leads that have completed entrance evaluations or scores
  const evaluatedCandidates = useMemo(() => {
    return leads.filter(lead => {
      // Session match
      if (lead.academicSession && lead.academicSession !== selectedSession) return false
      // Class match
      if (targetClass !== 'ALL' && lead.gradeApplied !== targetClass) return false
      return true
    })
  }, [leads, selectedSession, targetClass])

  // Ranked applicants calculation with tie-breakers
  const rankedApplicants = useMemo(() => {
    const list = evaluatedCandidates.map(candidate => {
      const sc = candidate.scorecard || {}
      
      // Test score percentage (0-100)
      let testPct = 0
      if (sc.percentage) {
        testPct = parseFloat(String(sc.percentage).replace('%', '')) || 0
      } else if (sc.totalMarks !== undefined) {
        testPct = Math.round((Number(sc.totalMarks) / 300) * 100)
      } else if (candidate.testMarks !== undefined) {
        testPct = Number(candidate.testMarks)
      }

      // Interview score percentage (0-100)
      let interviewPct = 0
      if (sc.interviewMarks !== undefined) {
        interviewPct = Number(sc.interviewMarks)
      } else if (candidate.interviewMarks !== undefined) {
        interviewPct = Number(candidate.interviewMarks)
      } else {
        // Fallback or estimated from test
        interviewPct = testPct > 0 ? Math.min(100, Math.round(testPct * 0.95)) : 0
      }

      // Previous academic score percentage (0-100)
      let prevPct = 0
      if (candidate.previousMarksPct) {
        prevPct = Number(candidate.previousMarksPct)
      } else if (candidate.matricMarks) {
        const matches = candidate.matricMarks.match(/(\d+)\s*\/\s*(\d+)/)
        if (matches) {
          prevPct = Math.round((Number(matches[1]) / Number(matches[2])) * 100)
        } else {
          prevPct = parseFloat(candidate.matricMarks) || 75
        }
      } else {
        prevPct = 75
      }

      // Calculate Weighted Total Score
      const totalWeight = (Number(weightTest) + Number(weightInterview) + Number(weightAcademic)) || 100
      const weightedTotal = Math.round(
        ((testPct * Number(weightTest)) + 
         (interviewPct * Number(weightInterview)) + 
         (prevPct * Number(weightAcademic))) / totalWeight
      )

      // Age calculation for tie-breaking
      let birthDateVal = 0
      if (candidate.dob) {
        birthDateVal = new Date(candidate.dob).getTime()
      }

      return {
        ...candidate,
        testPct,
        interviewPct,
        prevPct,
        weightedTotal,
        birthDateVal
      }
    })

    // Sorting with tie-break rules:
    // 1. Higher weighted total first
    // 2. Higher entrance test score first
    // 3. Older age first (earlier birthDateVal)
    list.sort((a, b) => {
      if (b.weightedTotal !== a.weightedTotal) {
        return b.weightedTotal - a.weightedTotal
      }
      if (b.testPct !== a.testPct) {
        return b.testPct - a.testPct
      }
      return a.birthDateVal - b.birthDateVal
    })

    // Assign Rank and Merit Status
    let currentRank = 1
    return list.map((item) => {
      const isAbsent = item.resultStatus === 'Absent' || item.stage === 'Lost'
      const isPassed = !isAbsent && item.weightedTotal >= passThreshold
      
      let meritStatus = 'Not Selected'
      if (isAbsent) {
        meritStatus = 'Absent'
      } else if (isPassed) {
        if (currentRank <= seatLimit) {
          meritStatus = 'Selected (Merit)'
        } else {
          meritStatus = `Waitlisted (WL #${currentRank - seatLimit})`
        }
      } else {
        meritStatus = 'Not Selected (Below Cutoff)'
      }

      const assignedRank = isAbsent ? '—' : currentRank
      if (!isAbsent) currentRank += 1

      return {
        ...item,
        rank: assignedRank,
        meritStatus,
        isPassed
      }
    })
  }, [evaluatedCandidates, weightTest, weightInterview, weightAcademic, seatLimit, passThreshold])

  // Move Waitlisted candidate to Offer
  const handlePromoteCandidate = async (candidate) => {
    if (isPublishedLocked) {
      toast.error('Merit List is locked. Unlock gazette to make adjustments.')
      return
    }
    if (onUpdateLead) {
      await onUpdateLead(candidate.id, {
        stage: 'Offer Issued',
        meritSelectedDate: new Date().toISOString().split('T')[0]
      })
      toast.success(`Candidate ${candidate.studentName} promoted to "Offer Issued" stage!`)
    }
  }

  // Summary counts
  const totalSelected = rankedApplicants.filter(a => a.meritStatus?.includes('Selected')).length
  const totalWaitlisted = rankedApplicants.filter(a => a.meritStatus?.includes('Waitlisted')).length
  const totalBelow = rankedApplicants.filter(a => a.meritStatus?.includes('Not Selected') || a.meritStatus === 'Absent').length

  // CSV Export of Gazette
  const exportGazetteCSV = () => {
    if (rankedApplicants.length === 0) {
      toast.warning('No applicants in this gazette to export.')
      return
    }
    const headers = ['Rank', 'Applicant Name', 'Phone', 'Grade/Program', 'Test %', 'Interview %', 'Prev Academic %', 'Weighted Total %', 'Merit Status']
    const rows = rankedApplicants.map(a => [
      `"${a.rank}"`,
      `"${a.studentName || ''}"`,
      `"${a.parentPhone || ''}"`,
      `"${a.gradeApplied || ''}"`,
      `"${a.testPct}%"`,
      `"${a.interviewPct}%"`,
      `"${a.prevPct}%"`,
      `"${a.weightedTotal}%"`,
      `"${a.meritStatus}"`
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `merit_gazette_${targetClass}_${selectedSession}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Merit Gazette CSV exported.')
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Entrance Exam Merit & Selection Gazette"
      maxWidth="max-w-5xl"
    >
      <div className="space-y-4">
        {/* Top Control Bar: Class, Session, Lock & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs print:hidden">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Class Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Filter Class</label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-800"
              >
                <option value="ALL">All Classes / Programs</option>
                {availableClasses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Session Filter */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Academic Session</label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white text-slate-800"
              >
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027 (Current)</option>
                <option value="2027-2028">2027-2028</option>
              </select>
            </div>

            {/* Seat Limit Quota */}
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">Seats Quota</label>
              <input
                type="number"
                min="1"
                max="500"
                value={seatLimit}
                onChange={(e) => setSeatLimit(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 px-2 py-1.5 rounded-lg border border-slate-300 font-bold bg-white text-center"
              />
            </div>

            {/* Weightage Config Toggle */}
            <button
              type="button"
              onClick={() => setShowConfig(prev => !prev)}
              className="mt-3.5 px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>Weightage ({weightTest}% : {weightInterview}% : {weightAcademic}%)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Publish & Lock Button */}
            <button
              type="button"
              onClick={handleToggleLock}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isPublishedLocked 
                  ? 'bg-rose-50 text-rose-700 border border-rose-300 hover:bg-rose-100' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
              }`}
              title={isPublishedLocked ? "Unlock Merit Gazette (Admin only)" : "Publish & Lock Official Merit Gazette"}
            >
              {isPublishedLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Gazette Locked</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-white" />
                  <span>Publish & Lock</span>
                </>
              )}
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={exportGazetteCSV}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            {/* Print Gazette */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Gazette (A4)</span>
            </button>
          </div>
        </div>

        {/* Weightage Config Dropdown Panel */}
        {showConfig && (
          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs animate-in fade-in duration-150 print:hidden">
            <div>
              <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">Entrance Test Weight %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={weightTest}
                onChange={(e) => setWeightTest(Number(e.target.value))}
                className="w-full px-2 py-1 rounded border border-amber-300 font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">Interview Weight %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={weightInterview}
                onChange={(e) => setWeightInterview(Number(e.target.value))}
                className="w-full px-2 py-1 rounded border border-amber-300 font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">Previous Result Weight %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={weightAcademic}
                onChange={(e) => setWeightAcademic(Number(e.target.value))}
                className="w-full px-2 py-1 rounded border border-amber-300 font-bold bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-amber-900 mb-1">Passing Cutoff %</label>
              <input
                type="number"
                min="30"
                max="90"
                value={passThreshold}
                onChange={(e) => setPassThreshold(Number(e.target.value))}
                className="w-full px-2 py-1 rounded border border-amber-300 font-bold bg-white"
              />
            </div>
          </div>
        )}

        {/* Lock Banner if published */}
        {isPublishedLocked && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span><strong>OFFICIALLY LOCKED:</strong> This merit gazette is finalized and certified. Further edits to scores are disabled.</span>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={handleToggleLock}
                className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer ml-2"
              >
                Unlock Gazette
              </button>
            )}
          </div>
        )}

        {/* Stat KPI Badges */}
        <div className="grid grid-cols-3 gap-3 print:hidden">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Selected by Merit</span>
              <span className="text-xl font-black text-emerald-950 font-mono">{totalSelected} / {seatLimit} Seats</span>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 opacity-60" />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Waiting List</span>
              <span className="text-xl font-black text-amber-950 font-mono">{totalWaitlisted} Candidates</span>
            </div>
            <Users className="w-6 h-6 text-amber-600 opacity-60" />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Below Cutoff / Absent</span>
              <span className="text-xl font-black text-slate-800 font-mono">{totalBelow} Candidates</span>
            </div>
            <TrendingUp className="w-6 h-6 text-slate-400 opacity-60" />
          </div>
        </div>

        {/* Printable Gazette Sheet (A4 Layout) */}
        <div id="printable-merit-gazette" className="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 space-y-4 print:border-none print:p-0">
          {/* Gazette Letterhead */}
          <div className="text-center border-b pb-4">
            <School className="w-9 h-9 text-amber-700 mx-auto mb-1" />
            <h2 className="text-lg font-black uppercase tracking-wider text-slate-900">
              {currentInstitute?.name || 'CAMPUS ACADEMIC SYSTEM'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Board of Entrance Examinations & Admissions Committee
            </p>
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-xs font-bold text-amber-900 uppercase tracking-widest">
              <span>OFFICIAL SELECTION MERIT GAZETTE • SESSION {selectedSession}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-4">
              <span><strong>Class / Tier:</strong> {targetClass === 'ALL' ? 'General Merit Across All Classes' : targetClass}</span>
              <span><strong>Available Seats:</strong> {seatLimit}</span>
              <span><strong>Formula:</strong> Test ({weightTest}%) + Interview ({weightInterview}%) + Academics ({weightAcademic}%)</span>
            </div>
          </div>

          {/* Table */}
          {rankedApplicants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold uppercase text-[10px]">
                    <th className="py-2.5 px-3 text-center w-12">Rank</th>
                    <th className="py-2.5 px-3">Candidate Name</th>
                    <th className="py-2.5 px-3">Class Applied</th>
                    <th className="py-2.5 px-2 text-center">Test ({weightTest}%)</th>
                    <th className="py-2.5 px-2 text-center">Interview ({weightInterview}%)</th>
                    <th className="py-2.5 px-2 text-center">Prev Academic ({weightAcademic}%)</th>
                    <th className="py-2.5 px-3 text-center bg-amber-50/50">Weighted Total</th>
                    <th className="py-2.5 px-3 text-center">Merit Status</th>
                    <th className="py-2.5 px-3 text-right print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rankedApplicants.map((applicant, index) => {
                    const isSelected = applicant.meritStatus?.includes('Selected')
                    const isWaitlist = applicant.meritStatus?.includes('Waitlisted')

                    return (
                      <tr 
                        key={applicant.id || index}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-emerald-50/30 font-medium' : isWaitlist ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-block w-6 h-6 rounded-full text-center leading-6 font-mono font-bold text-xs ${
                            isSelected 
                              ? 'bg-emerald-600 text-white' 
                              : isWaitlist 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-slate-100 text-slate-500'
                          }`}>
                            {applicant.rank}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{applicant.studentName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {applicant.parentPhone} • Guardian: {applicant.parentName || '—'}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {applicant.gradeApplied}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                          {applicant.testPct}%
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                          {applicant.interviewPct}%
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                          {applicant.prevPct}%
                        </td>
                        <td className="py-2.5 px-3 text-center bg-amber-50/50">
                          <span className="font-mono font-black text-sm text-slate-900">
                            {applicant.weightedTotal}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isSelected 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isWaitlist 
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            <span>{applicant.meritStatus}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right print:hidden">
                          {isWaitlist && (
                            <button
                              type="button"
                              onClick={() => handlePromoteCandidate(applicant)}
                              disabled={isPublishedLocked}
                              className="px-2 py-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-[10px] font-bold rounded cursor-pointer"
                              title="Promote waitlisted candidate to offer"
                            >
                              Offer Seat
                            </button>
                          )}
                          {isSelected && applicant.stage !== 'Offer Issued' && applicant.stage !== 'Enrolled' && (
                            <button
                              type="button"
                              onClick={() => handlePromoteCandidate(applicant)}
                              disabled={isPublishedLocked}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-[10px] font-bold rounded cursor-pointer"
                              title="Issue formal admission offer letter"
                            >
                              Issue Offer
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="font-bold text-slate-600">No Evaluated Applicants Found</p>
              <p className="text-xs mt-0.5">Record entrance test scores for leads in this class/session to generate the official ranked merit list.</p>
            </div>
          )}

          {/* Official Signatures for Print */}
          <div className="pt-8 flex items-end justify-between text-xs text-slate-500 border-t mt-6">
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span>Controller of Examinations</span>
            </div>
            <div>
              <div className="w-36 border-b border-slate-400 mb-1"></div>
              <span>Convener Admissions</span>
            </div>
            <div className="text-right">
              <div className="w-44 border-b-2 border-slate-800 mb-1 ml-auto"></div>
              <strong className="text-slate-900">Head of Institute / Principal</strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            Close Gazette
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default MeritListGazetteModal
