import React, { useState } from 'react'
import { 
  Megaphone, 
  Mail, 
  Calendar, 
  AlertOctagon, 
  History, 
  MessageSquare, 
  Send, 
  PhoneCall, 
  CheckCircle2, 
  Sparkles,
  Download
} from 'lucide-react'
import { useToast } from '../../../context/ToastContext'

export const SuperadminCommunicationView = ({ activeTab = 'announcements', onTabChange = () => {} }) => {
  const { toast } = useToast()
  const [currentTab, setCurrentTab] = useState(activeTab)
  const effectiveTab = currentTab || activeTab || 'announcements'

  const handleTabSwitch = (tabKey) => {
    setCurrentTab(tabKey)
    onTabChange(tabKey)
  }

  // Announcements state
  const [announcements] = useState([
    { id: 'ANN-901', title: 'Winter Vacation 2026 Notification', audience: 'All Campuses (Parents, Students, Faculty)', publishDate: '2026-10-25', status: 'Published', channels: 'Portal Banner, SMS, App Push' },
    { id: 'ANN-902', title: 'National Day of Iqbal Observance', audience: 'All Campuses', publishDate: '2026-10-20', status: 'Published', channels: 'Portal Notice' },
    { id: 'ANN-903', title: 'Midterm Examination Schedule Release', audience: 'Secondary & College Wings', publishDate: '2026-10-15', status: 'Published', channels: 'SMS & WhatsApp PDF' }
  ])

  // Notification templates
  const [templates] = useState([
    { name: 'Fee Challan Due Date Reminder', channel: 'SMS & WhatsApp', triggers: '3 days prior to due date', sample: 'Dear Parent, fee challan for {STUDENT_NAME} of Rs. {AMOUNT} is due on {DATE}. Pay via 1Bill consumer {CONSUMER_NO}.' },
    { name: 'Absence Alert (Unexcused)', channel: 'SMS', triggers: 'Daily at 9:15 AM', sample: 'Alert: {STUDENT_NAME} has been marked absent today without approved leave at {CAMPUS_NAME}.' },
    { name: 'Official Term Result Published', channel: 'WhatsApp & Email', triggers: 'Post superadmin result freeze', sample: 'Dear Parent, terminal results for {STUDENT_NAME} have been announced. View DMC: {VERIFY_URL}.' }
  ])

  const tabsConfig = [
    { key: 'announcements', label: 'Platform Announcements', icon: Megaphone },
    { key: 'templates', label: 'Notification Templates (Email/SMS/WhatsApp)', icon: Mail },
    { key: 'circulars', label: 'Circulars & Event Calendar', icon: Calendar },
    { key: 'broadcast', label: 'Emergency Broadcast', icon: AlertOctagon },
    { key: 'logs', label: 'Communication Logs', icon: History }
  ]

  const handleTriggerEmergencyBroadcast = () => {
    toast?.success?.('Emergency broadcast test pulse dispatched! 3,420 device recipients queued.')
  }

  return (
    <div className="p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/10 mb-2">
              <Megaphone className="w-3.5 h-3.5 text-purple-300" />
              <span>Super Administrator • Omnichannel Communications</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Communications & Notification Hub
            </h1>
            <p className="text-sm text-purple-100 mt-1 max-w-2xl leading-relaxed">
              Dispatch cross-campus circulars, manage WhatsApp & SMS gateway templates, and trigger high-priority emergency broadcasts.
            </p>
          </div>
          <button 
            onClick={() => toast?.info?.('New network-wide broadcast composer opened')}
            className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer self-start md:self-auto shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Compose Announcement</span>
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

      {/* Tab 1: Announcements */}
      {effectiveTab === 'announcements' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Platform-Wide Active Announcements</h3>
            <p className="text-xs text-slate-500">Notices displayed on web portals and delivered to student mobile apps</p>
          </div>
          <div className="divide-y divide-slate-100">
            {announcements.map(a => (
              <div key={a.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-purple-700">{a.id}</span>
                    <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">Audience: <b>{a.audience}</b> &bull; Channels: <b>{a.channels}</b></p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Published on {a.publishDate}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 self-start sm:self-auto">
                  {a.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Notification Templates */}
      {effectiveTab === 'templates' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((t, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200/60">{t.channel}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-2">{t.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">Trigger: <b>{t.triggers}</b></p>
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 font-mono leading-relaxed">
                    {t.sample}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Emergency Broadcast */}
      {effectiveTab === 'broadcast' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Red Alert Emergency Flash Broadcast</h3>
              <p className="text-xs text-slate-500">Overrides do-not-disturb filters to deliver urgent weather, security, or holiday closure alerts</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-3">
            <p>
              <b>Caution:</b> Triggering an emergency broadcast will immediately dispatch bulk SMS via Pakistan Telecom Authority (PTA) shortcode <b>8583</b> to all 3,420 registered parent phone numbers.
            </p>
            <button
              onClick={handleTriggerEmergencyBroadcast}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-rose-600/30 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Simulate Emergency Flash Broadcast</span>
            </button>
          </div>
        </div>
      )}


      {/* Tab 3: Official Circulars */}
      {effectiveTab === 'circulars' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Official Cross-Campus Circulars &amp; Directives</h3>
              <p className="text-xs text-slate-500">Centrally signed administrative orders, public holiday announcements, and exam schedules.</p>
            </div>
            <button
              onClick={() => toast?.success?.('Drafted new official circular')}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <span>Issue New Circular</span>
            </button>
          </div>

          <div className="space-y-3">
            {[
              { id: 'CIR-2026-041', title: 'Winter Break & Smog Advisory Notification', date: 'Oct 2026', scope: 'All Punjab Campuses', status: 'Published' },
              { id: 'CIR-2026-039', title: 'Annual Sports Gala Schedule & Inter-Wing Matches', date: 'Oct 2026', scope: 'All Campuses', status: 'Published' },
              { id: 'CIR-2026-037', title: 'Federal Board (FBISE) Examination Registration Final Call', date: 'Sep 2026', scope: 'College Wing', status: 'Archived' }
            ].map((c, i) => (
              <div key={i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">{c.id}</span>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{c.title}</h4>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Scope: {c.scope} &bull; Published: {c.date}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold self-start sm:self-center">
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Gateway Delivery Logs */}
      {effectiveTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Real-Time Telecom &amp; Email Delivery Ledger</h3>
              <p className="text-xs text-slate-500">PTA Handset DLR receipts, WhatsApp Business delivery blue-ticks, and bounce telemetry.</p>
            </div>
            <div className="text-xs text-slate-600 font-mono">
              Gateway Credits: <strong className="text-purple-700">42,850 SMS Left</strong>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Message ID &amp; Type</th>
                  <th className="py-3 px-4">Recipient</th>
                  <th className="py-3 px-4">Campus &amp; Event</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">DLR Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { id: 'MSG-SMS-9921', type: 'SMS (Telenor)', to: '0300-4829101', campus: 'Beaconhouse High', event: 'Fee Due Reminder', time: 'Just now', dlr: 'Delivered (DLR 0)' },
                  { id: 'MSG-WA-8812', type: 'WhatsApp API', to: '0321-9988771', campus: 'City School Senior', event: 'Result Gazette Card', time: '5m ago', dlr: 'Read by Parent' },
                  { id: 'MSG-EML-4410', type: 'Email (SMTP)', to: 'admin@lgs.edu.pk', campus: 'Lahore Grammar', event: 'Payroll Batch Approval', time: '12m ago', dlr: 'Delivered (250 OK)' }
                ].map((l, i) => (
                  <tr key={i} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono">{l.id}</div>
                      <span className="text-[10px] text-purple-700 font-semibold">{l.type}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">{l.to}</td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 font-medium">{l.campus}</div>
                      <span className="text-[10px] text-slate-400">{l.event}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{l.time}</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                        {l.dlr}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}

export default SuperadminCommunicationView
