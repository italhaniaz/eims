import React, { useState } from 'react'
import { 
  Award, 
  FileText, 
  CheckCircle2, 
  QrCode, 
  FileCheck, 
  ExternalLink, 
  Search, 
  Check, 
  X, 
  Download,
  Eye,
  ShieldCheck,
  FileBadge
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminCertificatesView = ({ activeTab = 'templates', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'templates'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Issuance approval requests
  const [certApprovals, setCertApprovals] = useState([
    { id: 'CRT-REQ-801', student: 'Daniyal Qureshi', roll: 'LGS-044', campus: 'Lahore Grammar Model Town', certType: 'School Leaving Certificate (SLC)', clearanceStatus: 'All Dues & Library Cleared', requestedDate: '2026-10-28', status: 'Pending Approval' },
    { id: 'CRT-REQ-802', student: 'Hiba Nadeem', roll: 'BHS-912', campus: 'Beaconhouse Central High', certType: 'Provisional Character Certificate', clearanceStatus: 'Hostel & Fee Cleared', requestedDate: '2026-10-27', status: 'Approved' }
  ])

  // Issued certificates register
  const [issuedCerts] = useState([
    { serial: 'SLC-2026-0041', student: 'Ammar Sheikh', type: 'School Leaving Certificate', date: '2026-10-24', campus: 'Beaconhouse Central High', qrHash: '8a9b2c3d4e5f...', verificationStatus: 'Verified' },
    { serial: 'BON-2026-0189', student: 'Khadija Imran', type: 'Bonafide Student Certificate', date: '2026-10-22', campus: 'City School Senior Branch', qrHash: '1a2b3c4d5e6f...', verificationStatus: 'Verified' },
    { serial: 'CHR-2026-0092', student: 'Usman Ghani', type: 'Character Certificate', date: '2026-10-18', campus: 'Lahore Grammar Model Town', qrHash: '9f8e7d6c5b4a...', verificationStatus: 'Verified' }
  ])

  const tabsConfig = [
    { key: 'templates', label: 'Certificate Templates', icon: FileText },
    { key: 'dmc', label: 'DMC / Transcript Templates ↗', icon: FileBadge },
    { key: 'approvals', label: 'Issuance Approvals', icon: CheckCircle2, badge: certApprovals.filter(c => c.status === 'Pending Approval').length },
    { key: 'numbering', label: 'Numbering & QR Rules', icon: QrCode },
    { key: 'register', label: 'Issued Certificates Register', icon: FileCheck },
    { key: 'portal', label: 'Public Verification Portal Settings', icon: ShieldCheck }
  ]

  const handleApproveCert = (id) => {
    setCertApprovals(prev => prev.map(c => c.id === id ? { ...c, status: 'Approved' } : c))
    toast?.success?.(`Certificate issuance ${id} approved. Digital cryptographic seal applied.`)
  }

  const handleRejectCert = (id) => {
    setCertApprovals(prev => prev.map(c => c.id === id ? { ...c, status: 'Rejected' } : c))
    toast?.info?.(`Certificate request ${id} rejected.`)
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-yellow-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-amber-200 border border-white/10 mb-2">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Super Administrator • Platform Credential Authority</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Certificates & Official Credentials
            </h1>
            <p className="text-sm text-amber-100 mt-1 max-w-2xl leading-relaxed">
              Standardized certificate templates, cryptographic QR verification, character certificates, and public verification portal.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('Certificate template editor initialized')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Award className="w-4 h-4" />
            <span>Design New Template</span>
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
                    ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {Boolean(tab.badge) && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${active ? 'bg-white text-amber-900' : 'bg-amber-100 text-amber-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Certificate Templates */}
      {effectiveTab === 'templates' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Character Certificate', code: 'TPL-CHR-01', desc: 'Standard moral conduct statement for college/university admissions' },
              { name: 'Bonafide Student Certificate', code: 'TPL-BON-02', desc: 'Official student status verification for passport / embassy visa' },
              { name: 'School Leaving Certificate (SLC)', code: 'TPL-SLC-03', desc: 'Mandatory transfer credential with clearance record & conduct note' },
              { name: 'Provisional Degree / Diploma', code: 'TPL-PRV-04', desc: 'Terminal completion certificate prior to convocation' }
            ].map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[11px] font-bold text-amber-700">{t.code}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-1">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">{t.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
                  <span className="flex items-center gap-1 cursor-pointer hover:underline" onClick={() => toast?.info(`Previewing ${t.name} template`)}>
                    <Eye className="w-3.5 h-3.5" /> Preview PDF
                  </span>
                  <span className="text-slate-400 font-normal">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: DMC / Transcripts Link */}
      {effectiveTab === 'dmc' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Detailed Marks Certificate (DMC) & Transcripts</h3>
              <p className="text-xs text-slate-500">DMC templates and official marks tabulation transcripts are unified under Examination Governance</p>
            </div>
            <a 
              href="#sa-exams-transcripts"
              className="px-4 py-2 rounded-xl bg-purple-600 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-purple-600/30"
            >
              <span>Open Examinations Transcript Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 leading-relaxed">
            All semester-wise and annual board transcript designs, security micro-print borders, and controller signatures are maintained centrally in the Examinations module.
          </div>
        </div>
      )}

      {/* Tab 3: Approvals */}
      {effectiveTab === 'approvals' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Certificate Issuance Approvals</h3>
            <p className="text-xs text-slate-500">Requires institutional clearance from Accounts, Library, and Campus Principal</p>
          </div>
          <div className="divide-y divide-slate-100">
            {certApprovals.map(c => (
              <div key={c.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-700">{c.id}</span>
                    <span className="font-bold text-slate-900 text-sm">{c.student} ({c.roll})</span>
                    <span className="text-xs text-slate-500">• {c.campus}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{c.certType}</p>
                  <p className="text-xs text-emerald-600 font-medium">✓ {c.clearanceStatus}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {c.status === 'Pending Approval' ? (
                    <>
                      <button 
                        onClick={() => handleApproveCert(c.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 hover:bg-emerald-500 cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Authorize Issuance</span>
                      </button>
                      <button 
                        onClick={() => handleRejectCert(c.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-xs flex items-center gap-1.5 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      {c.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Register */}
      {effectiveTab === 'register' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900">Master Issued Credentials Register</h3>
              <p className="text-xs text-slate-500">Tamper-evident register of every credential printed with unique QR hash</p>
            </div>
            <button 
              onClick={() => toast?.info?.('Issued credentials ledger exported to CSV')}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Register</span>
            </button>
          </div>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50/75 border-b border-slate-100 text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Serial Number</th>
                <th className="p-4">Student</th>
                <th className="p-4">Certificate Type</th>
                <th className="p-4">Issuance Date</th>
                <th className="p-4">Campus</th>
                <th className="p-4">Cryptographic Hash</th>
                <th className="p-4">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {issuedCerts.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-4 font-mono font-bold text-amber-800">{c.serial}</td>
                  <td className="p-4 font-bold text-slate-900">{c.student}</td>
                  <td className="p-4">{c.type}</td>
                  <td className="p-4 text-slate-500">{c.date}</td>
                  <td className="p-4">{c.campus}</td>
                  <td className="p-4 font-mono text-[11px] text-slate-400">{c.qrHash}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {c.verificationStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Fallback for other tabs */}
      {['numbering', 'portal'].includes(effectiveTab) && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <h3 className="font-bold text-slate-900 capitalize">{effectiveTab} Configuration</h3>
          <p className="text-xs text-slate-500">Public verification URL allows employers and foreign embassies to verify credentials in real-time.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
            Public portal endpoint: <span className="font-mono text-purple-700 font-bold">https://verify.eims-edu.pk/credential/[QR_HASH]</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default SuperadminCertificatesView
