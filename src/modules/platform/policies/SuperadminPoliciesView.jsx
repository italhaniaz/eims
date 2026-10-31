import React, { useState } from 'react'
import { 
  ShieldCheck, 
  FileText, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  Lock, 
  Share2, 
  CheckCircle2, 
  Download, 
  History,
  Users,
  Eye,
  Check,
  Plus
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminPoliciesView = ({ activeTab = 'academic', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'academic'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Policy versions
  const [policies] = useState([
    { id: 'POL-ACAD-01', title: 'Uniform Academic Progression & Promotion Policy', version: 'v3.2', effectiveDate: '2026-08-01', status: 'Published (Enforced)', target: 'All Wings' },
    { id: 'POL-FEE-02', title: 'Fee Refund, Security Deposit & Waiver Directive', version: 'v2.8', effectiveDate: '2026-07-15', status: 'Published (Enforced)', target: 'All Campuses' },
    { id: 'POL-SAFE-03', title: 'Child Protection, Anti-Bullying & Digital Safety Code', version: 'v4.0', effectiveDate: '2026-09-01', status: 'Published (Enforced)', target: 'Students, Staff & Parents' },
    { id: 'POL-DISC-04', title: 'Campus Code of Conduct & Electronic Device Protocol', version: 'v2.1', effectiveDate: '2026-08-15', status: 'Published (Enforced)', target: 'Senior & College Wings' }
  ])

  // Acknowledgment tracking
  const [acknowledgments] = useState([
    { group: 'Teaching Faculty & HODs', total: 171, signed: 168, rate: '98.2%', status: 'Compliant' },
    { group: 'Administrative Staff', total: 64, signed: 62, rate: '96.8%', status: 'Compliant' },
    { group: 'Enrolled Parents (Digital App Sign-off)', total: 3420, signed: 3180, rate: '93.0%', status: 'In Progress' }
  ])

  const tabsConfig = [
    { key: 'academic', label: 'Academic Policies', icon: FileText },
    { key: 'fees', label: 'Fee & Refund Policies', icon: DollarSign },
    { key: 'attendance', label: 'Attendance & Leave Policies', icon: Clock },
    { key: 'discipline', label: 'Discipline & Code of Conduct', icon: AlertTriangle },
    { key: 'privacy', label: 'Data Privacy & Child Safety', icon: Lock },
    { key: 'publish', label: 'Policy Versions & Publish', icon: Share2 },
    { key: 'acknowledgment', label: 'Acknowledgment Tracking', icon: Users }
  ]

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Platform Legal & Policy Custodian</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Policies & Governance Codes
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Formulate, version-control, and mandate digital policy sign-offs across all campus leadership, faculty, and student bodies.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Policy editor initiated')}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>Draft New Policy</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
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
                    ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30' 
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

      {/* Tab 6: Policy Versions & Publish */}
      {effectiveTab === 'publish' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Active Policy Registry & Version Control</h3>
            <p className="text-xs text-slate-500">Universal policies ratified by the central educational board</p>
          </div>
          <div className="divide-y divide-slate-100">
            {policies.map(p => (
              <div key={p.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">{p.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700">{p.version}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Scope: <b>{p.target}</b> &bull; Effective Since: {p.effectiveDate}</p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Acknowledgment Tracking */}
      {effectiveTab === 'acknowledgment' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900">Digital Policy Acknowledgment Index</h3>
          <p className="text-xs text-slate-500">Tracks digital signatures affirming code of conduct and safety guidelines</p>
          <div className="space-y-4 pt-2">
            {acknowledgments.map((a, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-800">
                  <span>{a.group}</span>
                  <span className="text-purple-700">{a.rate} ({a.signed} / {a.total} Signed)</span>
                </div>
                <div className="w-full bg-slate-200 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all" style={{ width: a.rate }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}


      {/* Category Policy Viewer & Editor */}
      {['academic', 'fees', 'attendance', 'discipline', 'privacy'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base capitalize">{effectiveTab} Official Directive Suite</h3>
              <p className="text-xs text-slate-500">Standard operating policies active across all affiliated campus branches.</p>
            </div>
            <button
              onClick={() => toast?.success?.(`Initiated new ${effectiveTab} policy directive draft`)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Policy Revision</span>
            </button>
          </div>

          <div className="space-y-4">
            {(
              effectiveTab === 'academic' ? [
                { id: 'POL-AC-01', title: 'Minimum Examination Eligibility Attendance Threshold', ver: 'v3.2', scope: 'All Wings', summary: 'Students must maintain minimum 75% verified biometric attendance in every registered subject to sit for annual Board / University examinations.' },
                { id: 'POL-AC-02', title: 'Grading Curve & Relative Normalization Directive', ver: 'v2.0', scope: 'College & University Wings', summary: 'Standardized GPA relative grading curve guidelines to ensure parity across campus branches and affiliated colleges.' }
              ] : effectiveTab === 'fees' ? [
                { id: 'POL-FE-01', title: 'Withdrawal & Security Deposit Refund Schedule', ver: 'v2.4', scope: 'All Campuses', summary: 'Advance security deposit refundable within 30 days of issuance of formal School Leaving Certificate (SLC).' },
                { id: 'POL-FE-02', title: 'Hardship Concession & Sibling Discount Governance', ver: 'v1.9', scope: 'School Wing', summary: 'Sibling discounts apply automatically at 25% for 2nd enrolled child and 50% for 3rd enrolled child.' }
              ] : effectiveTab === 'attendance' ? [
                { id: 'POL-AT-01', title: 'Unexcused Absence (AWOL) & Strike-Off Policy', ver: 'v3.0', scope: 'All Campuses', summary: 'Absence of 6 consecutive days without written parent notice results in formal strike-off notice from campus register.' },
                { id: 'POL-AT-02', title: 'Faculty Biometric Verification & Duty Leave Norms', ver: 'v2.1', scope: 'Staff & Faculty', summary: 'Daily thumbprint/face scan required prior to 08:15 AM PKT. Three late arrivals equivalent to half-day casual leave.' }
              ] : effectiveTab === 'discipline' ? [
                { id: 'POL-DS-01', title: 'Zero-Tolerance Anti-Bullying & Cyber Safety Code', ver: 'v4.0', scope: 'All Campuses', summary: 'Strict prohibition of physical or digital harassment. Immediate referral to central disciplinary hearing committee.' },
                { id: 'POL-DS-02', title: 'Examination Hall Integrity & Malpractice Sanctions', ver: 'v2.8', scope: 'College & University', summary: 'Possession of unauthorized electronic devices during examination results in paper cancellation and 1-year board debarment.' }
              ] : [
                { id: 'POL-PR-01', title: 'Child Data Protection & Biometric Minimization Policy', ver: 'v3.1', scope: 'GDPR / PECRA Aligned', summary: 'All facial recognition and biometric scan templates encrypted with AES-256 at rest. Never shared with third parties.' },
                { id: 'POL-PR-02', title: 'Student Media & Online Publication Consent Guidelines', ver: 'v2.0', scope: 'Parental Consent Required', summary: 'Annual parental media release agreement mandatory prior to publishing student images in prospectuses or digital portals.' }
              ]
            ).map((pol) => (
              <div key={pol.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{pol.id}</span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{pol.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">{pol.ver}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{pol.scope}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{pol.summary}</p>
                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Enforcement: Immediate &bull; Legally Binding</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toast?.info?.(`Viewing full text for ${pol.id}`)}
                      className="text-purple-700 font-bold hover:underline cursor-pointer"
                    >
                      Read Full Directive
                    </button>
                    &bull;
                    <button
                      onClick={() => toast?.success?.(`Editing ${pol.id}`)}
                      className="text-slate-600 font-bold hover:underline cursor-pointer"
                    >
                      Edit Directive
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperadminPoliciesView
